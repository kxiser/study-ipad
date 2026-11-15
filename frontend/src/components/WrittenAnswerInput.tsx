import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Lightbulb, Keyboard, CheckCircle2, XCircle, Mic, MicOff } from 'lucide-react';
import { validateWrittenAnswer, ValidationResult } from '../utils/answerValidator.js';
import { sounds } from '../utils/soundEffects.js';
import { startListening, stopListening, isSpeechRecognitionSupported } from '../services/speech.js';

interface WrittenAnswerInputProps {
  correctAnswer: string;
  options?: string[];
  placeholder?: string;
  disabled?: boolean;
  onValidate: (result: ValidationResult) => void;
  onSwitchToOptions?: () => void;
}

export const WrittenAnswerInput: React.FC<WrittenAnswerInputProps> = ({
  correctAnswer,
  options = [],
  placeholder = 'Escribe o dicta tu respuesta...',
  disabled = false,
  onValidate,
  onSwitchToOptions
}) => {
  const [text, setText] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const stopListeningRef = useRef<(() => void) | null>(null);
  const micSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    setText('');
    setHasSubmitted(false);
    setShowHint(false);
    setResult(null);
    setIsListening(false);
    if (stopListeningRef.current) {
      stopListeningRef.current();
      stopListeningRef.current = null;
    }

    // Enfocar el input suavemente si no es táctil forzado
    if (inputRef.current && !disabled) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }

    return () => {
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
    };
  }, [correctAnswer, disabled]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled || hasSubmitted || !text.trim()) return;

    if (isListening && stopListeningRef.current) {
      stopListeningRef.current();
      setIsListening(false);
    }

    const res = validateWrittenAnswer(text, correctAnswer, options);
    setResult(res);
    setHasSubmitted(true);

    if (res.isCorrect) {
      sounds.playMatchSound();
    } else {
      sounds.playWobbleSound();
    }

    onValidate(res);
  };

  const handleToggleMic = () => {
    if (disabled || hasSubmitted) return;

    if (isListening) {
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
      setIsListening(false);
      sounds.playPopSound();
    } else {
      sounds.playPopSound();
      setIsListening(true);
      const stop = startListening(
        (transcript, isFinal) => {
          setText(transcript);
          if (isFinal && transcript.trim()) {
            setIsListening(false);
          }
        },
        (err) => {
          console.warn('Voice error:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
      stopListeningRef.current = stop;
    }
  };

  // Pista pedagógica: primera letra o longitud
  const firstLetter = correctAnswer.trim().charAt(0).toUpperCase();

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Entrada de texto táctil grande para iPad con botón de micrófono integrado */}
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400 pointer-events-none">
            <Keyboard className="w-6 h-6" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={disabled || hasSubmitted}
            placeholder={isListening ? '🎙️ Escuchando... Di tu respuesta...' : placeholder}
            autoCapitalize="sentences"
            autoCorrect="off"
            spellCheck="false"
            className={`w-full pl-13 pr-36 py-4 sm:py-5 text-lg sm:text-2xl font-black rounded-3xl border-3 shadow-lg transition-all outline-none ${
              isListening
                ? 'bg-rose-50 border-rose-400 text-rose-950 ring-4 ring-rose-200 animate-pulse'
                : hasSubmitted
                ? result?.isCorrect
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-4 ring-emerald-300'
                  : 'bg-rose-50 border-rose-500 text-rose-950 ring-4 ring-rose-200'
                : 'bg-white border-magic-300 text-slate-900 focus:border-magic-500 focus:ring-4 focus:ring-magic-200'
            }`}
          />

          {/* Botones a la derecha: Micrófono y Enviar / Feedback */}
          <div className="absolute right-2 flex items-center gap-1.5 sm:gap-2">
            {/* Botón de Dictado por Voz (Web Speech Recognition) */}
            {!hasSubmitted && micSupported && (
              <button
                type="button"
                onClick={handleToggleMic}
                disabled={disabled}
                title={isListening ? 'Detener micrófono' : 'Dictar por voz'}
                aria-label="Dictar por voz"
                className={`p-2.5 sm:p-3 rounded-2xl transition-all active:scale-95 border-2 flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-bounce shadow-md shadow-rose-300'
                    : 'bg-slate-100 hover:bg-magic-100 text-slate-600 hover:text-magic-600 border-slate-200 hover:border-magic-300'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            {!hasSubmitted ? (
              <button
                type="submit"
                disabled={disabled || !text.trim()}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-magic-600 to-indigo-600 hover:from-magic-500 hover:to-indigo-500 active:scale-95 disabled:opacity-40 disabled:scale-100 text-white font-black text-sm sm:text-base rounded-2xl shadow-md transition-all flex items-center gap-2"
              >
                <span>Listo</span>
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <div className="pr-3">
                {result?.isCorrect ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-500 animate-pulse" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pista y cambio a modo opciones */}
        {!hasSubmitted && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              {!showHint ? (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-all"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>¿Necesitas una pista?</span>
                </button>
              ) : (
                <span className="text-xs sm:text-sm font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1 animate-fade-in">
                  💡 Empieza por la letra: <strong>"{firstLetter}"</strong> ({correctAnswer.length} letras)
                </span>
              )}

              {isListening && (
                <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse flex items-center gap-1">
                  🎙️ ¡Habla ahora! Di tu respuesta en voz alta
                </span>
              )}
            </div>

            {onSwitchToOptions && (
              <button
                type="button"
                onClick={onSwitchToOptions}
                className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-all ml-auto"
              >
                🔘 Ver las 4 opciones
              </button>
            )}
          </div>
        )}

        {/* Feedback de ortografía o corrección */}
        {hasSubmitted && result?.spellingTip && (
          <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{result.spellingTip}</span>
          </div>
        )}
      </form>
    </div>
  );
};
