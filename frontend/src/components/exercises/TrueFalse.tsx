import React, { useState } from 'react';
import { TrueFalseExercise } from '../../types.js';
import { SpeechButton } from '../SpeechButton.js';
import { fireSuccessConfetti } from '../ConfettiCelebration.js';
import { ThumbsUp, ThumbsDown, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  exercise: TrueFalseExercise;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export const TrueFalse: React.FC<Props> = ({ exercise, onAnswer, onNext }) => {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelect = (val: boolean) => {
    if (hasAnswered) return;
    setSelected(val);
    setHasAnswered(true);

    const isCorrect = val === exercise.isTrue;
    if (isCorrect) {
      fireSuccessConfetti();
    }
    onAnswer(isCorrect);
  };

  return (
    <div className="space-y-6">
      {/* Afirmación */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-magic-100 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-magic-600 block mb-2">
            ¿Es Verdadero o Falso?
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-snug">
            {exercise.statement}
          </h2>
        </div>
        <SpeechButton text={`¿Es verdadero o falso? ${exercise.statement}`} size="md" />
      </div>

      {/* Dos botones gigantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Verdadero */}
        <button
          type="button"
          disabled={hasAnswered}
          onClick={() => handleSelect(true)}
          className={`min-h-[110px] md:min-h-[130px] p-6 rounded-3xl border-4 text-xl md:text-2xl font-black flex items-center justify-center gap-4 transition-all duration-200 active:scale-95 shadow-md ${
            hasAnswered
              ? exercise.isTrue
                ? 'bg-mint-100 border-mint-500 text-emerald-900 ring-4 ring-mint-300'
                : selected === true
                ? 'bg-bubble-100 border-bubble-400 text-rose-900 opacity-70'
                : 'bg-slate-50 border-slate-200 opacity-40'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-400'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center text-emerald-600">
            <ThumbsUp className="w-8 h-8" />
          </div>
          <span>¡VERDADERO!</span>
        </button>

        {/* Falso */}
        <button
          type="button"
          disabled={hasAnswered}
          onClick={() => handleSelect(false)}
          className={`min-h-[110px] md:min-h-[130px] p-6 rounded-3xl border-4 text-xl md:text-2xl font-black flex items-center justify-center gap-4 transition-all duration-200 active:scale-95 shadow-md ${
            hasAnswered
              ? !exercise.isTrue
                ? 'bg-mint-100 border-mint-500 text-emerald-900 ring-4 ring-mint-300'
                : selected === false
                ? 'bg-bubble-100 border-bubble-400 text-rose-900 opacity-70'
                : 'bg-slate-50 border-slate-200 opacity-40'
              : 'bg-bubble-50 border-bubble-300 text-rose-900 hover:bg-bubble-100 hover:border-bubble-400'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center text-rose-600">
            <ThumbsDown className="w-8 h-8" />
          </div>
          <span>¡FALSO!</span>
        </button>
      </div>

      {/* Explicación y botón siguiente */}
      {hasAnswered && (
        <div className="bg-magic-50 border-2 border-magic-200 rounded-3xl p-5 md:p-6 shadow-sm animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs font-black uppercase tracking-wider text-magic-600">
              {selected === exercise.isTrue ? '¡Genial! Has acertado:' : '¡Atención a este detalle!:'}
            </span>
            <p className="text-slate-700 font-bold text-base md:text-lg mt-1">
              {exercise.explanation}
            </p>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-magic-300 active:scale-95 transition-all shrink-0"
          >
            <span>Siguiente</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
