import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Lightbulb, Keyboard, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { validateWrittenAnswer, ValidationResult } from '../utils/answerValidator.js';
import { sounds } from '../utils/soundEffects.js';

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
  placeholder = 'Escribe tu respuesta aquí...',
  disabled = false,
  onValidate,
  onSwitchToOptions
}) => {
  const [text, setText] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText('');
    setHasSubmitted(false);
    setShowHint(false);
    setResult(null);
    // Enfocar el input suavemente
    if (inputRef.current && !disabled) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [correctAnswer, disabled]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled || hasSubmitted || !text.trim()) return;

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

  // Pista pedagógica: primera letra o longitud
  const firstLetter = correctAnswer.trim().charAt(0).toUpperCase();

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Entrada de texto táctil grande para iPad */}
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
            placeholder={placeholder}
            autoCapitalize="sentences"
            autoCorrect="off"
            spellCheck="false"
            className={`w-full pl-13 pr-28 py-4 sm:py-5 text-lg sm:text-2xl font-black rounded-3xl border-3 shadow-lg transition-all outline-none ${
              hasSubmitted
                ? result?.isCorrect
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-4 ring-emerald-300'
                  : 'bg-rose-50 border-rose-500 text-rose-950 ring-4 ring-rose-200'
                : 'bg-white border-magic-300 text-slate-900 focus:border-magic-500 focus:ring-4 focus:ring-magic-200'
            }`}
          />

          {/* Botón Comprobar integrado en la derecha */}
          {!hasSubmitted ? (
            <button
              type="submit"
              disabled={disabled || !text.trim()}
              className="absolute right-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-magic-600 to-indigo-600 hover:from-magic-500 hover:to-indigo-500 active:scale-95 disabled:opacity-40 disabled:scale-100 text-white font-black text-sm sm:text-base rounded-2xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Listo</span>
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <div className="absolute right-4">
              {result?.isCorrect ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-500 animate-pulse" />
              )}
            </div>
          )}
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
