import { AIProvider, ImageData, SYSTEM_PROMPT_8_YEARS_OLD } from './types.js';
import { ExerciseSet } from '../schemas/exercise.schema.js';
import { parseAndValidateExerciseSet } from './validate.js';
import { config } from '../config.js';

export class OllamaProvider implements AIProvider {
  readonly name = 'Ollama (Local Vision)';
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = config.ollamaBaseUrl.replace(/\/$/, '');
    this.model = config.ollamaModel;
  }

  async generateExercisesFromImages(images: ImageData[], subjectHint?: string): Promise<ExerciseSet> {
    const base64Images = images.map(img => img.buffer.toString('base64'));

    const userPrompt = `${SYSTEM_PROMPT_8_YEARS_OLD}\n\nPor favor, analiza las fotos del libro adjuntas y devuelve el JSON con los ejercicios para una niña de 8 años.${
      subjectHint ? ` Asignatura orientativa: ${subjectHint}.` : ''
    }\nRecuerda: DEVUELVE SÓLO JSON VÁLIDO.`;

    const messages = [
      {
        role: 'user',
        content: userPrompt,
        images: base64Images
      }
    ];

    // Intento 1
    const rawResponse = await this.callOllama(messages);
    const firstCheck = parseAndValidateExerciseSet(rawResponse);

    if (firstCheck.success) {
      return firstCheck.data;
    }

    console.warn(`[OllamaProvider] Primer intento falló validación: ${firstCheck.error}. Reintentando...`);

    // Intento 2 con feedback del error
    const retryMessages = [
      ...messages,
      {
        role: 'assistant',
        content: rawResponse
      },
      {
        role: 'user',
        content: `El JSON anterior falló con este error: ${firstCheck.error}. Corrige el formato y devuelve ÚNICAMENTE el JSON válido sin texto adicional.`
      }
    ];

    const retryResponse = await this.callOllama(retryMessages);
    const secondCheck = parseAndValidateExerciseSet(retryResponse);

    if (secondCheck.success) {
      return secondCheck.data;
    }

    throw new Error(`Fallo definitivo al generar ejercicios con Ollama tras reintento: ${secondCheck.error}`);
  }

  private async callOllama(messages: any[]): Promise<string> {
    const url = `${this.baseUrl}/api/chat`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
          options: {
            temperature: 0.2
          }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ollama respondió con status ${res.status}: ${errorText}`);
      }

      const json: any = await res.json();
      return json?.message?.content || '';
    } catch (err: any) {
      throw new Error(`Error de conexión con Ollama en ${url}: ${err.message}. Asegúrate de que Ollama esté corriendo con 'ollama run ${this.model}'.`);
    }
  }
}
