import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, ImageData, SYSTEM_PROMPT_8_YEARS_OLD } from './types.js';
import { ExerciseSet } from '../schemas/exercise.schema.js';
import { parseAndValidateExerciseSet } from './validate.js';
import { config } from '../config.js';

export class ClaudeProvider implements AIProvider {
  readonly name = 'Claude (Anthropic)';
  private client: Anthropic;

  constructor() {
    if (!config.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY no está configurada en el archivo .env');
    }
    this.client = new Anthropic({
      apiKey: config.anthropicApiKey
    });
  }

  async generateExercisesFromImages(images: ImageData[], subjectHint?: string, language?: string): Promise<ExerciseSet> {
    const model = config.anthropicModel;

    const contentItems: Anthropic.MessageCreateParams['messages'][0]['content'] = images.map(img => {
      let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
      if (img.mimeType.includes('png')) mediaType = 'image/png';
      else if (img.mimeType.includes('webp')) mediaType = 'image/webp';
      else if (img.mimeType.includes('gif')) mediaType = 'image/gif';

      return {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: img.buffer.toString('base64')
        }
      };
    });

    const userPrompt = `Por favor, analiza las páginas del libro adjuntas y genera un pack de 5 a 8 ejercicios variados para una niña de 8 años en formato JSON.${
      subjectHint ? ` Asignatura de referencia sugerida: ${subjectHint}.` : ''
    }`;

    contentItems.push({
      type: 'text',
      text: userPrompt
    });

    // Intento 1
    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: contentItems
      }
    ];

    const response = await this.client.messages.create({
      model,
      max_tokens: 4000,
      system: SYSTEM_PROMPT_8_YEARS_OLD,
      messages
    });

    const responseText = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as Anthropic.TextBlock).text)
      .join('\n');

    const firstCheck = parseAndValidateExerciseSet(responseText);
    if (firstCheck.success) {
      return firstCheck.data;
    }

    // Reintento si falló la validación
    console.warn(`[ClaudeProvider] Validación falló en el 1er intento: ${firstCheck.error}. Reintentando...`);

    const retryMessages: Anthropic.MessageParam[] = [
      ...messages,
      {
        role: 'assistant',
        content: responseText
      },
      {
        role: 'user',
        content: `El JSON anterior no fue válido debido al siguiente error: ${firstCheck.error}. Por favor, corrige el error y devuelve ÚNICAMENTE el objeto JSON válido corregido sin ningún texto adicional.`
      }
    ];

    const retryResponse = await this.client.messages.create({
      model,
      max_tokens: 4000,
      system: SYSTEM_PROMPT_8_YEARS_OLD,
      messages: retryMessages
    });

    const retryText = retryResponse.content
      .filter(block => block.type === 'text')
      .map(block => (block as Anthropic.TextBlock).text)
      .join('\n');

    const secondCheck = parseAndValidateExerciseSet(retryText);
    if (secondCheck.success) {
      return secondCheck.data;
    }

    throw new Error(`Fallo definitivo al generar ejercicios con Claude tras reintento: ${secondCheck.error}`);
  }
}
