import { AIProvider, ImageData, TopicPromptOptions, SYSTEM_PROMPT_8_YEARS_OLD } from './types.js';
import { ExerciseSet } from '../schemas/exercise.schema.js';
import { parseAndValidateExerciseSet } from './validate.js';
import { config } from '../config.js';

export class GeminiProvider implements AIProvider {
  readonly name = 'Google Gemini Flash (Opción Gratuita / Ultra Barata)';
  private apiKey: string;
  private model: string;
  private fallbackModel: string = 'gemini-3.5-flash-lite';

  constructor() {
    if (!config.geminiApiKey) {
      throw new Error('GEMINI_API_KEY no está configurada en el archivo .env');
    }
    this.apiKey = config.geminiApiKey;
    this.model = config.geminiModel || 'gemini-3-flash-preview';
  }

  async generateExercisesFromImages(images: ImageData[], subjectHint?: string): Promise<ExerciseSet> {
    const parts: any[] = images.map(img => ({
      inline_data: {
        mime_type: img.mimeType,
        data: img.buffer.toString('base64')
      }
    }));

    const promptText = `${SYSTEM_PROMPT_8_YEARS_OLD}\n\nAnaliza las páginas del libro adjuntas y crea una sesión didáctica de 5 a 8 ejercicios para una niña de 8 años en formato JSON.${
      subjectHint ? ` Materia orientativa: ${subjectHint}.` : ''
    }\nResponde EXCLUSIVAMENTE con el objeto JSON.`;

    parts.push({ text: promptText });

    const contents = [
      {
        role: 'user',
        parts
      }
    ];

    // Intento 1
    const rawResponse = await this.callGeminiWithFallback(contents);
    const firstCheck = parseAndValidateExerciseSet(rawResponse);

    if (firstCheck.success) {
      return firstCheck.data;
    }

    console.warn(`[GeminiProvider] Primer intento falló validación: ${firstCheck.error}. Reintentando con corrección...`);

    const retryContents = [
      ...contents,
      {
        role: 'model',
        parts: [{ text: rawResponse }]
      },
      {
        role: 'user',
        parts: [{ text: `El JSON anterior tuvo este error de validación: ${firstCheck.error}. Corrige el formato y devuelve ÚNICAMENTE el JSON válido corregido sin texto adicional.` }]
      }
    ];

    const retryResponse = await this.callGeminiWithFallback(retryContents);
    const secondCheck = parseAndValidateExerciseSet(retryResponse);

    if (secondCheck.success) {
      return secondCheck.data;
    }

    throw new Error(`Fallo definitivo al generar ejercicios con Gemini tras reintento: ${secondCheck.error}`);
  }

  async generateExercisesFromTopic(options: TopicPromptOptions): Promise<ExerciseSet> {
    const age = options.ageYears || 8;
    const promptText = `${SYSTEM_PROMPT_8_YEARS_OLD}

Eres el profesor de Samantha (niña de ${age} años, en educación primaria de Madrid, España).
Genera una unidad didáctica completa, divertida y motivadora con entre 6 y 8 ejercicios sobre el tema: "${options.topic}".
${options.subjectHint ? `Materia: ${options.subjectHint}.` : ''}
${options.encyclopediaContext ? `Información enciclopédica de referencia (Vikidia/Wikipedia):\n"""\n${options.encyclopediaContext.substring(0, 2500)}\n"""` : ''}

REQUISITOS OBLIGATORIOS:
- Enunciados claros y entretenidos adecuados para ${age} años.
- Preguntas con datos curiosos y pedagógicos reales.
- El objeto JSON DEBE incluir: "title", "subject", "summary", "estimatedMinutes", y "exercises".
- Para "multiple_choice": 4 opciones y "correctAnswer" exacta.
- Para "true_false": "statement", "isTrue", "explanation".
- Para "fill_blank": "textWithBlank" con '___', "options", "correctAnswer".
- Para "ordering": 3 o 4 pasos ordenados cronológica o lógicamente en "items".
- Para "matching": 3 o 4 parejas en "pairs" con "left" y "right".
- Responde EXCLUSIVAMENTE con el objeto JSON válido.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: promptText }]
      }
    ];

    const rawResponse = await this.callGeminiWithFallback(contents);
    const firstCheck = parseAndValidateExerciseSet(rawResponse);

    if (firstCheck.success) {
      return firstCheck.data;
    }

    console.warn(`[GeminiProvider Topic] Primer intento falló validación: ${firstCheck.error}. Reintentando...`);

    const retryContents = [
      ...contents,
      { role: 'model', parts: [{ text: rawResponse }] },
      { role: 'user', parts: [{ text: `El JSON anterior tuvo este error de validación: ${firstCheck.error}. Corrige el formato y devuelve ÚNICAMENTE el JSON válido.` }] }
    ];

    const retryResponse = await this.callGeminiWithFallback(retryContents);
    const secondCheck = parseAndValidateExerciseSet(retryResponse);

    if (secondCheck.success) {
      return secondCheck.data;
    }

    throw new Error(`Fallo al generar ejercicios del tema con Gemini tras reintento: ${secondCheck.error}`);
  }

  private async callGeminiWithFallback(contents: any[]): Promise<string> {
    try {
      return await this.callGemini(this.model, contents);
    } catch (err: any) {
      // Si hay error 503 de alta demanda temporal o error de modelo, intentar con el modelo alternativo
      if (err.message && (err.message.includes('503') || err.message.includes('high demand') || err.message.includes('404'))) {
        console.warn(`[GeminiProvider] ${this.model} devolvió 503/alta demanda. Intentando con modelo alternativo ${this.fallbackModel}...`);
        await new Promise(r => setTimeout(r, 1000));
        return await this.callGemini(this.fallbackModel, contents);
      }
      throw err;
    }
  }

  private async callGemini(modelName: string, contents: any[]): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.2
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API respondió error ${res.status}: ${errText}`);
    }

    const data: any = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts
      ?.filter((p: any) => Boolean(p.text))
      ?.map((p: any) => p.text)
      ?.join('\n');

    if (!text) {
      throw new Error(`Gemini no devolvió texto en la respuesta: ${JSON.stringify(data)}`);
    }

    return text;
  }
}
