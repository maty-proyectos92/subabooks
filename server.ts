import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase JSON body limit for high-resolution base64 book photos
app.use(express.json({ limit: '35mb' }));

// Initialize Google Gen AI client with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_SYSTEM_INSTRUCTION = `Sos un asistente experto en catalogación bibliográfica y curaduría de libros. Tu tarea es analizar imágenes de libros (que pueden ser tapas, lomos, contratapas o solapas) y extraer de forma precisa sus metadatos principales.

REGLAS DE PROCESAMIENTO:
1. Analizá el texto visible mediante OCR y combiná tu conocimiento previo para identificar el libro exacto.
2. Si la foto muestra únicamente el lomo o una contratapa con texto parcial, inferí el título y autor correspondientes de forma precisa.
3. Para el ISBN: busca un código de barras o la secuencia numérica de 10 o 13 dígitos. Si no es visible en la imagen pero lográs identificar el libro con total certeza, completalo o devolvé un string vacío "" si hay ambigüedad.
4. Idioma: Identificá el idioma principal del texto del libro en código ISO o nombre corto (ej. "Español", "Inglés", "Japonés").
5. Devolvé ÚNICAMENTE la estructura JSON requerida, sin bloques de código Markdown extra ni texto introductorio.`;

const DEFAULT_USER_PROMPT = 'Analizá la imagen adjunta del libro y extraé los metadatos bibliográficos según el esquema JSON definido.';

// API Route: Catalog a book from base64 image
app.post('/api/catalog-book', async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, mimeType = 'image/jpeg', customPrompt, systemInstructionOverride } = req.body;

    if (!image) {
      res.status(400).json({ error: 'Falta la imagen en base64 para procesar.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY no está configurada en las variables de entorno del servidor.',
      });
      return;
    }

    // Clean base64 string if it contains data URI prefix
    let cleanBase64 = image;
    let detectedMime = mimeType;
    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        detectedMime = match[1];
        cleanBase64 = match[2];
      }
    }

    const promptText = customPrompt?.trim() || DEFAULT_USER_PROMPT;
    const systemInstruction = systemInstructionOverride?.trim() || DEFAULT_SYSTEM_INSTRUCTION;

    const requestConfig = {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titulo: {
            type: Type.STRING,
            description: 'Título completo del libro',
          },
          autor: {
            type: Type.STRING,
            description: 'Nombre del autor o autores',
          },
          isbn: {
            type: Type.STRING,
            description: 'ISBN-13 o ISBN-10 sin guiones ni espacios (ej: 9789500768000)',
          },
          editorial: {
            type: Type.STRING,
            description: 'Nombre de la editorial',
          },
          anio: {
            type: Type.STRING,
            description: 'Año de edición o publicación visible/inferido',
          },
          idioma: {
            type: Type.STRING,
            description: 'Idioma principal del libro',
          },
          confianza_deteccion: {
            type: Type.STRING,
            enum: ['alta', 'media', 'baja'],
            description: 'Nivel de certeza en la identificación del libro basado en la nitidez y los datos visibles de la foto',
          },
          sinopsis: {
            type: Type.STRING,
            description: 'Breve sinopsis o descripción temática del libro',
          },
          genero: {
            type: Type.STRING,
            description: 'Género literario o materias temáticas (ej: Novela, Realismo Mágico, Ensayo, Ciencia Ficción)',
          },
          tipo_captura: {
            type: Type.STRING,
            enum: ['tapa', 'lomo', 'contratapa', 'solapa', 'otra'],
            description: 'Tipo de toma visible en la fotografía',
          },
        },
        required: [
          'titulo',
          'autor',
          'isbn',
          'editorial',
          'anio',
          'idioma',
          'confianza_deteccion',
        ],
      },
    };

    const contents = {
      parts: [
        {
          text: promptText,
        },
        {
          inlineData: {
            mimeType: detectedMime,
            data: cleanBase64,
          },
        },
      ],
    };

    // Try primary model and fall back if temporary 503 high demand spike occurs
    const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
    let lastError: any = null;
    let response: any = null;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: requestConfig,
        });
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} temporarily unavailable or errored, attempting fallback...`, err?.message || err);
        // Short pause before next attempt
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('No se pudo obtener respuesta del modelo.');
    }

    const textOutput = response.text?.trim() || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(textOutput);
    } catch (parseErr) {
      // In case of surrounding markdown formatting or minor syntax glitch
      const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No se pudo analizar la respuesta JSON del modelo.');
      }
    }

    res.json({
      success: true,
      data: parsedData,
      rawOutput: textOutput,
    });
  } catch (error: any) {
    console.error('Error al procesar la imagen del libro:', error);
    res.status(500).json({
      error: error?.message || 'Ocurrió un error inesperado al catalogar el libro con Gemini.',
    });
  }
});

// API Route: Health check and status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BiblioScan server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
