import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode2, Sparkles, BookOpen, Layers } from 'lucide-react';

export const SystemPromptPlayground: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const systemInstructionsText = `Sos un asistente experto en catalogación bibliográfica y curaduría de libros. Tu tarea es analizar imágenes de libros (que pueden ser tapas, lomos, contratapas o solapas) y extraer de forma precisa sus metadatos principales.

REGLAS DE PROCESAMIENTO:
1. Analizá el texto visible mediante OCR y combiná tu conocimiento previo para identificar el libro exacto.
2. Si la foto muestra únicamente el lomo o una contratapa con texto parcial, inferí el título y autor correspondientes de forma precisa.
3. Para el ISBN: busca un código de barras o la secuencia numérica de 10 o 13 dígitos. Si no es visible en la imagen pero lográs identificar el libro con total certeza, completalo o devolvé un string vacío "" si hay ambigüedad.
4. Idioma: Identificá el idioma principal del texto del libro en código ISO o nombre corto (ej. "Español", "Inglés", "Japonés").
5. Devolvé ÚNICAMENTE la estructura JSON requerida, sin bloques de código Markdown extra ni texto introductorio.`;

  const jsonSchemaText = `{
  "type": "object",
  "properties": {
    "titulo": {
      "type": "string",
      "description": "Título completo del libro"
    },
    "autor": {
      "type": "string",
      "description": "Nombre del autor o autores"
    },
    "isbn": {
      "type": "string",
      "description": "ISBN-13 o ISBN-10 sin guiones ni espacios (ej: 9789500768000)"
    },
    "editorial": {
      "type": "string",
      "description": "Nombre de la editorial"
    },
    "anio": {
      "type": "string",
      "description": "Año de edición o publicación visible/inferido"
    },
    "idioma": {
      "type": "string",
      "description": "Idioma principal del libro"
    },
    "confianza_deteccion": {
      "type": "string",
      "enum": ["alta", "media", "baja"],
      "description": "Nivel de certeza en la identificación del libro basado en la nitidez y los datos visibles de la foto"
    }
  },
  "required": [
    "titulo",
    "autor",
    "isbn",
    "editorial",
    "anio",
    "idioma",
    "confianza_deteccion"
  ]
}`;

  const userPromptText = `Analizá la imagen adjunta del libro y extraé los metadatos bibliográficos según el esquema JSON definido.`;

  const nodeSdkSnippet = `// Implementación moderna con @google/genai y gemini-3.8-flash (Server-Side)
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { "User-Agent": "aistudio-build" } }
});

export async function catalogarLibro(base64Image: string, mimeType = "image/jpeg") {
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: {
      parts: [
        { text: "Analizá la imagen adjunta del libro y extraé los metadatos bibliográficos según el esquema JSON definido." },
        {
          inlineData: {
            mimeType,
            data: base64Image.replace(/^data:image\\/\\w+;base64,/, "")
          }
        }
      ]
    },
    config: {
      systemInstruction: \`Sos un asistente experto en catalogación bibliográfica y curaduría de libros...\`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titulo: { type: Type.STRING },
          autor: { type: Type.STRING },
          isbn: { type: Type.STRING },
          editorial: { type: Type.STRING },
          anio: { type: Type.STRING },
          idioma: { type: Type.STRING },
          confianza_deteccion: {
            type: Type.STRING,
            enum: ["alta", "media", "baja"]
          }
        },
        required: ["titulo", "autor", "isbn", "editorial", "anio", "idioma", "confianza_deteccion"]
      }
    }
  });

  return JSON.parse(response.text!);
}`;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Overview Card */}
      <div className="p-6 rounded-2xl bg-[#12151e] border border-amber-900/30 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-amber-400">
          <Terminal className="w-5 h-5" />
          <h2 className="font-serif-book font-bold text-lg sm:text-xl text-zinc-100">
            Especificación del Prompt & Esquema Estructurado
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400">
          Esta aplicación está configurada con las instrucciones exactas para Google AI Studio y el
          SDK oficial de Gemini. A continuación tenés todos los bloques listos para copiar y usar en
          tu propio proyecto.
        </p>
      </div>

      {/* 1. System Instructions */}
      <div className="rounded-2xl bg-[#12151e] border border-zinc-800 overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 bg-[#0e1017] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              1. System Instructions (Instrucciones del Sistema)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(systemInstructionsText, 'sys')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            {copiedKey === 'sys' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Bloque</span>
              </>
            )}
          </button>
        </div>
        <div className="p-5 font-mono-code text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed bg-[#0a0c12]/60">
          {systemInstructionsText}
        </div>
      </div>

      {/* 2. JSON Schema */}
      <div className="rounded-2xl bg-[#12151e] border border-zinc-800 overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 bg-[#0e1017] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              2. JSON Schema / Output Format (Configuración de Respuesta)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(jsonSchemaText, 'schema')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            {copiedKey === 'schema' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Esquema</span>
              </>
            )}
          </button>
        </div>
        <div className="p-5 font-mono-code text-xs text-amber-200/90 whitespace-pre-wrap bg-[#0a0c12]/60 overflow-x-auto">
          {jsonSchemaText}
        </div>
      </div>

      {/* 3. User Prompt */}
      <div className="rounded-2xl bg-[#12151e] border border-zinc-800 overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 bg-[#0e1017] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              3. User Prompt (Prompt de Usuario / Trigger)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(userPromptText, 'user')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            {copiedKey === 'user' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Prompt</span>
              </>
            )}
          </button>
        </div>
        <div className="p-5 font-mono-code text-xs text-zinc-300 bg-[#0a0c12]/60">
          {userPromptText}
        </div>
      </div>

      {/* 4. Full Server Implementation */}
      <div className="rounded-2xl bg-[#12151e] border border-zinc-800 overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 bg-[#0e1017] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              4. Integración Servidor (Node.js + @google/genai SDK)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(nodeSdkSnippet, 'sdk')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            {copiedKey === 'sdk' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>
        <div className="p-5 font-mono-code text-xs text-purple-200/90 whitespace-pre-wrap bg-[#0a0c12]/60 overflow-x-auto">
          {nodeSdkSnippet}
        </div>
      </div>
    </div>
  );
};
