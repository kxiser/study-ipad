/**
 * Síntesis de voz con Web Speech API
 * Diseñado especialmente para iPad/Safari con voz en español (es-ES / es-MX)
 */
export function speakText(text: string, onEnd?: () => void): void {
  if (!('speechSynthesis' in window)) {
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
  const spanishVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Monica') || v.name.includes('Jorge') || v.name.includes('Paulina') || v.name.includes('Natural') || v.name.includes('Siri')));
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
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
