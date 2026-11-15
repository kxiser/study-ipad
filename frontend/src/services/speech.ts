/**
 * Servicios de Voz con Web Speech API
 * Diseñado especialmente para iPad / Safari / Chrome con acento en español (es-ES)
 * Incluye Síntesis de voz (lectura) y Reconocimiento de voz (micrófono)
 */

export function speakText(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis no disponible en este navegador');
    if (onEnd) onEnd();
    return;
  }

  // Cancelar locución previa
  window.speechSynthesis.cancel();

  // Limpiar texto de símbolos extraños como ___
  const cleanText = text.replace(/___/g, 'hueco en blanco').replace(/\[\.\.\.\]/g, 'hueco en blanco');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'es-ES';
  utterance.rate = 0.9; // Ligeramente pausado para comprensión infantil
  utterance.pitch = 1.05; // Tono alegre y cálido

  // Intentar seleccionar voz natural en español si está disponible
  const voices = window.speechSynthesis.getVoices();
  const spanishVoice = voices.find(v =>
    v.lang.startsWith('es') &&
    (v.name.includes('Monica') || v.name.includes('Jorge') || v.name.includes('Paulina') || v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Helena'))
  );
  if (spanishVoice) {
    utterance.voice = spanishVoice;
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
