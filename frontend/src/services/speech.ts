/**
 * Servicios de Voz con Web Speech API
 * Diseñado especialmente para iPad / Safari / Chrome con acento en español (es-ES)
 * Incluye Síntesis de voz (lectura) y Reconocimiento de voz (micrófono)
 */

/**
 * Detecta si el texto está en inglés para utilizar pronunciación y voz nativa en inglés
 */
export function isEnglishText(text: string): boolean {
  const englishWords = /\b(the|is|are|was|were|and|in|on|at|to|for|with|what|which|who|where|why|how|true|false|choose|select|order|match|living|non-living|things|animals|plants|mammals|birds|fish|reptiles|amphibians|vertebrates|invertebrates|body|bones|skeleton|leaves|roots|stem|flower|fruit|seed|energy|water|air|earth|sun|planet|food|herbivore|carnivore|omnivore|habitat|environment|science|awesome|remember|spot|great)\b/i;
  const matches = (text.match(new RegExp(englishWords, 'gi')) || []).length;
  // Si tiene palabras clave en inglés y no contiene caracteres exclusivos en español
  const hasSpanishMarks = /[áéíóúñ¿¡]/i.test(text);
  return matches >= 2 || (matches >= 1 && !hasSpanishMarks);
}

export function speakText(text: string, onEnd?: () => void, forcedLang?: 'es' | 'en'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis no disponible en este navegador');
    if (onEnd) onEnd();
    return;
  }

  // Cancelar locución previa
  window.speechSynthesis.cancel();

  const isEnglish = forcedLang === 'en' || (forcedLang !== 'es' && isEnglishText(text));

  // Limpiar texto de símbolos extraños adaptado al idioma
  const cleanText = isEnglish
    ? text.replace(/___/g, 'blank').replace(/\[\.\.\.\]/g, 'blank')
    : text.replace(/___/g, 'hueco en blanco').replace(/\[\.\.\.\]/g, 'hueco en blanco');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = isEnglish ? 0.88 : 0.9; // Pausado para máxima claridad auditiva en niños
  utterance.pitch = 1.05; // Tono alegre y cálido

  const voices = window.speechSynthesis.getVoices();

  if (isEnglish) {
    utterance.lang = 'en-GB';
    const englishVoice = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Karen') || v.name.includes('Serena') || v.name.includes('Oliver') || v.name.includes('Natural') || v.name.includes('Siri'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }
  } else {
    utterance.lang = 'es-ES';
    const spanishVoice = voices.find(v =>
      v.lang.startsWith('es') &&
      (v.name.includes('Monica') || v.name.includes('Jorge') || v.name.includes('Paulina') || v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Helena'))
    ) || voices.find(v => v.lang.startsWith('es'));

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ==========================================
// RECONOCIMIENTO DE VOZ (MICRÓFONO PARA IPAD)
// ==========================================

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

let activeRecognition: any = null;

export function startListening(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (err: any) => void,
  onEnd?: () => void
): () => void {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError(new Error('Reconocimiento de voz no soportado'));
    return () => {};
  }

  try {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    activeRecognition = recognition;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const text = (finalTranscript || interimTranscript).trim();
      onResult(text, Boolean(finalTranscript));
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition event error:', event.error);
      if (onError) onError(event);
    };

    recognition.onend = () => {
      activeRecognition = null;
      if (onEnd) onEnd();
    };

    recognition.start();

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
      activeRecognition = null;
    };
  } catch (err) {
    console.warn('Error starting speech recognition:', err);
    if (onError) onError(err);
    return () => {};
  }
}

export function stopListening(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (e) {}
    activeRecognition = null;
  }
}
