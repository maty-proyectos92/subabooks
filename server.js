import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "35mb" }));
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
const DEFAULT_SYSTEM_INSTRUCTION = `Sos un asistente experto en catalogaci\xF3n bibliogr\xE1fica y curadur\xEDa de libros. Tu tarea es analizar im\xE1genes de libros (que pueden ser tapas, lomos, contratapas o solapas) y extraer de forma precisa sus metadatos principales.

REGLAS DE PROCESAMIENTO:
1. Analiz\xE1 el texto visible mediante OCR y combin\xE1 tu conocimiento previo para identificar el libro exacto.
2. Si la foto muestra \xFAnicamente el lomo o una contratapa con texto parcial, infer\xED el t\xEDtulo y autor correspondientes de forma precisa.
3. Para el ISBN: busca un c\xF3digo de barras o la secuencia num\xE9rica de 10 o 13 d\xEDgitos. Si no es visible en la imagen pero logr\xE1s identificar el libro con total certeza, completalo o devolv\xE9 un string vac\xEDo "" si hay ambig\xFCedad.
4. Idioma: Identific\xE1 el idioma principal del texto del libro en c\xF3digo ISO o nombre corto (ej. "Espa\xF1ol", "Ingl\xE9s", "Japon\xE9s").
5. Devolv\xE9 \xDANICAMENTE la estructura JSON requerida, sin bloques de c\xF3digo Markdown extra ni texto introductorio.`;
const DEFAULT_USER_PROMPT = "Analiz\xE1 la imagen adjunta del libro y extra\xE9 los metadatos bibliogr\xE1ficos seg\xFAn el esquema JSON definido.";
app.post("/api/catalog-book", async (req, res) => {
  try {
    const { image, mimeType = "image/jpeg", customPrompt, systemInstructionOverride } = req.body;
    if (!image) {
      res.status(400).json({ error: "Falta la imagen en base64 para procesar." });
      return;
    }
    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: "GEMINI_API_KEY no est\xE1 configurada en las variables de entorno del servidor."
      });
      return;
    }
    let cleanBase64 = image;
    let detectedMime = mimeType;
    if (image.startsWith("data:")) {
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
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titulo: {
            type: Type.STRING,
            description: "T\xEDtulo completo del libro"
          },
          autor: {
            type: Type.STRING,
            description: "Nombre del autor o autores"
          },
          isbn: {
            type: Type.STRING,
            description: "ISBN-13 o ISBN-10 sin guiones ni espacios (ej: 9789500768000)"
          },
          editorial: {
            type: Type.STRING,
            description: "Nombre de la editorial"
          },
          anio: {
            type: Type.STRING,
            description: "A\xF1o de edici\xF3n o publicaci\xF3n visible/inferido"
          },
          idioma: {
            type: Type.STRING,
            description: "Idioma principal del libro"
          },
          confianza_deteccion: {
            type: Type.STRING,
            enum: ["alta", "media", "baja"],
            description: "Nivel de certeza en la identificaci\xF3n del libro basado en la nitidez y los datos visibles de la foto"
          },
          sinopsis: {
            type: Type.STRING,
            description: "Breve sinopsis o descripci\xF3n tem\xE1tica del libro"
          },
          genero: {
            type: Type.STRING,
            description: "G\xE9nero literario o materias tem\xE1ticas (ej: Novela, Realismo M\xE1gico, Ensayo, Ciencia Ficci\xF3n)"
          },
          tipo_captura: {
            type: Type.STRING,
            enum: ["tapa", "lomo", "contratapa", "solapa", "otra"],
            description: "Tipo de toma visible en la fotograf\xEDa"
          }
        },
        required: [
          "titulo",
          "autor",
          "isbn",
          "editorial",
          "anio",
          "idioma",
          "confianza_deteccion"
        ]
      }
    };
    const contents = {
      parts: [
        {
          text: promptText
        },
        {
          inlineData: {
            mimeType: detectedMime,
            data: cleanBase64
          }
        }
      ]
    };
    const candidateModels = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-flash-latest"];
    let lastError = null;
    let response = null;
    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: requestConfig
        });
        if (response && response.text) {
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} temporarily unavailable or errored, attempting fallback...`, err?.message || err);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
    if (!response || !response.text) {
      throw lastError || new Error("No se pudo obtener respuesta del modelo.");
    }
    const textOutput = response.text?.trim() || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(textOutput);
    } catch (parseErr) {
      const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No se pudo analizar la respuesta JSON del modelo.");
      }
    }
    res.json({
      success: true,
      data: parsedData,
      rawOutput: textOutput
    });
  } catch (error) {
    console.error("Error al procesar la imagen del libro:", error);
    res.status(500).json({
      error: error?.message || "Ocurri\xF3 un error inesperado al catalogar el libro con Gemini."
    });
  }
});
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: "gemini-3.8-flash"
  });
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BiblioScan server running on http://0.0.0.0:${PORT} (${isProduction ? "production" : "development"})`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
