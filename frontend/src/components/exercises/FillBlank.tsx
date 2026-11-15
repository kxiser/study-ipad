import React, { useState } from 'react';
import { FillBlankExercise } from '../../types.js';
import { SpeechButton } from '../SpeechButton.js';
import { fireSuccessConfetti } from '../ConfettiCelebration.js';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, PenLine, LayoutGrid } from 'lucide-react';
import { validateWrittenAnswer, ValidationResult } from '../../utils/answerValidator.js';

interface Props {
  exercise: FillBlankExercise;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export const FillBlank: React.FC<Props> = ({ exercise, onAnswer, onNext }) => {
  const [chosenWord, setChosenWord] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [inputMode, setInputMode] = useState<'chips' | 'written'>('chips');
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // Resiliencia pedagógica: si textWithBlank viene vacío o solo contiene el hueco sin palabras
  const rawText = exercise.textWithBlank || '';
  const textWithoutBlank = rawText.replace(/(?:___|\[\.\.\.\])/g, '').trim();

  let safeTextWithBlank = rawText;
  if (textWithoutBlank.length < 5) {
    if (exercise.explanation && exercise.explanation.length > 15) {
      const expClean = exercise.explanation.replace(/^[¡!¿?A-Za-z\s]+!/i, '').trim();
      safeTextWithBlank = `Completa la lección: ___ . (${expClean})`;
    } else {
      safeTextWithBlank = `Completa la afirmación con la palabra adecuada: ___ .`;
    }
  }

  // Dividir texto por '___' o '[...]'
  const parts = safeTextWithBlank.split(/(?:___|\[\.\.\.\])/);
  if (parts.length === 1) {
    parts.push('');
  }

  const handleWordClick = (word: string) => {
    if (hasAnswered) return;
    setChosenWord(word);
  };

  const handleResetWord = () => {
    if (hasAnswered) return;
    setChosenWord('');
  };

  const handleCheck = () => {
    if (!chosenWord.trim() || hasAnswered) return;

    const res = validateWrittenAnswer(chosenWord, exercise.correctAnswer, exercise.options);
    setValidation(res);
    setHasAnswered(true);

    if (res.isCorrect) {
      fireSuccessConfetti();
    }
    onAnswer(res.isCorrect);
  };

  const isCorrect = validation?.isCorrect ?? false;

  return (
    <div className="space-y-6">
      {/* Selector de Modo */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          ¿Cómo prefieres completar?
        </span>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          <button
            type="button"
            onClick={() => setInputMode('chips')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
              inputMode === 'chips'
                ? 'bg-magic-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Elegir fichas</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('written')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
              inputMode === 'written'
                ? 'bg-magic-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Escribir la palabra ✍️</span>
          </button>
        </div>
      </div>

      {/* Oración con el hueco */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-magic-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-magic-600">
            Completa la palabra que falta
          </span>
          <SpeechButton
            text={
              chosenWord
                ? `${parts[0]} ${chosenWord} ${parts[1] || ''}`
                : `Completa la palabra que falta en esta frase: ${exercise.textWithBlank}`
            }
            size="sm"
          />
        </div>

        <div className="text-xl md:text-2xl font-black text-slate-800 leading-loose flex flex-wrap items-center gap-2">
          <span>{parts[0]}</span>

          {/* El Hueco en blanco interactivo */}
          {inputMode === 'chips' ? (
            <button
              type="button"
              onClick={handleResetWord}
              disabled={hasAnswered || !chosenWord}
              className={`min-w-[140px] px-4 py-2 rounded-2xl border-2 font-black transition-all inline-flex items-center justify-center gap-2 ${
                hasAnswered
                  ? isCorrect
                    ? 'bg-mint-100 border-mint-500 text-emerald-900 ring-4 ring-mint-200'
                    : 'bg-bubble-100 border-bubble-400 text-rose-900'
                  : chosenWord
                  ? 'bg-magic-100 border-magic-500 text-magic-900 shadow-md animate-scale-up'
                  : 'bg-amber-50 border-dashed border-amber-300 text-amber-600 shadow-inner'
              }`}
            >
              <span>{chosenWord || '¿ Qué palabra ?'}</span>
              {chosenWord && !hasAnswered && (
                <RotateCcw className="w-4 h-4 text-magic-500 hover:rotate-180 transition-transform" />
              )}
            </button>
          ) : (
            <input
              type="text"
              value={chosenWord}
              onChange={e => setChosenWord(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCheck();
              }}
              disabled={hasAnswered}
              placeholder="escribe aquí..."
              className={`min-w-[160px] max-w-[240px] px-4 py-2 rounded-2xl border-3 text-lg sm:text-xl font-black outline-none transition-all shadow-inner ${
                hasAnswered
                  ? isCorrect
                    ? 'bg-mint-100 border-mint-500 text-emerald-900 ring-4 ring-mint-200'
                    : 'bg-bubble-100 border-bubble-400 text-rose-900 ring-4 ring-rose-200'
                  : 'bg-white border-magic-400 focus:border-magic-600 focus:ring-4 focus:ring-magic-200 text-slate-900'
              }`}
            />
          )}

          <span>{parts[1] || ''}</span>
        </div>
      </div>

      {/* MODO FICHAS: Fichas de palabras para elegir */}
      {inputMode === 'chips' && !hasAnswered && (
        <div>
          <p className="text-sm font-bold text-slate-500 mb-3 text-center">
            Toca una palabra para colocarla en el hueco:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {exercise.options.map((word, idx) => {
              const isSelected = chosenWord === word;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={hasAnswered}
                  onClick={() => handleWordClick(word)}
                  className={`px-6 py-4 rounded-2xl border-2 font-black text-lg md:text-xl shadow-sm transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? 'bg-magic-600 text-white border-magic-600 shadow-magic-300 scale-105'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-magic-50 hover:border-magic-300'
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Botón Comprobar */}
      {!hasAnswered && chosenWord.trim() && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleCheck}
            className="px-8 py-4 rounded-3xl bg-gradient-to-r from-mint-500 to-emerald-600 hover:from-mint-600 hover:to-emerald-700 text-white font-black text-lg shadow-lg shadow-mint-200 transition-all active:scale-95 flex items-center gap-2 animate-bounce"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>¡Comprobar Respuesta!</span>
          </button>
        </div>
      )}

      {/* Explicación y botón siguiente */}
      {hasAnswered && (
        <div className="bg-magic-50 border-2 border-magic-200 rounded-3xl p-5 md:p-6 shadow-sm animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs font-black uppercase tracking-wider text-magic-600">
              {isCorrect ? '¡Fantástico acierto!' : '¡Buen intento! Vamos a repasar:'}
            </span>
            <p className="text-slate-700 font-bold text-base md:text-lg mt-1">
              {validation?.spellingTip || exercise.explanation}
            </p>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-magic-600 to-indigo-600 hover:from-magic-500 hover:to-indigo-500 text-white font-black text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            <span>Siguiente</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
