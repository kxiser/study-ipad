import React, { useState } from 'react';
import { FlashcardExercise } from '../../types.js';
import { SpeechButton } from '../SpeechButton.js';
import { fireSuccessConfetti } from '../ConfettiCelebration.js';
import { RotateCw, Sparkles, Check, ArrowRight } from 'lucide-react';

interface Props {
  exercise: FlashcardExercise;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export const Flashcard: React.FC<Props> = ({ exercise, onAnswer, onNext }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSelfGrade = (knewIt: boolean) => {
    if (hasAnswered) return;
    setHasAnswered(true);

    if (knewIt) {
      fireSuccessConfetti();
    }
    onAnswer(knewIt);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <span className="text-xs font-black uppercase tracking-wider text-magic-600">
          Tarjeta Mágica de Repaso
        </span>
        <p className="text-xs text-slate-400 mt-0.5">Toca la tarjeta para ver el reverso</p>
      </div>

      {/* Tarjeta con efecto 3D */}
      <div
        onClick={handleFlip}
        className="cursor-pointer min-h-[260px] md:min-h-[300px] perspective-1000 select-none"
      >
        <div
          className={`w-full h-full min-h-[260px] md:min-h-[300px] rounded-4xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 transform shadow-xl border-4 ${
            isFlipped
              ? 'bg-gradient-to-br from-sunny-100 via-white to-sunny-50 border-sunny-300 rotate-y-180'
              : 'bg-gradient-to-br from-magic-500 via-magic-600 to-indigo-600 border-magic-400 text-white'
          }`}
        >
          {/* Encabezado de la tarjeta */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                isFlipped ? 'bg-sunny-200 text-amber-900' : 'bg-white/20 text-white'
              }`}
            >
              {isFlipped ? '✨ Reverso / Respuesta' : '❓ Anverso / Pregunta'}
            </span>

            <SpeechButton
              text={isFlipped ? exercise.back : exercise.front}
              size="sm"
              className={isFlipped ? '' : '!bg-white/20 !text-white !border-white/30'}
            />
          </div>

          {/* Contenido Central */}
          <div className="my-auto py-4 text-center">
            {isFlipped ? (
              <div className="space-y-3">
                <p className="text-xl md:text-2xl font-black text-slate-800 leading-snug">
                  {exercise.back}
                </p>
                {exercise.tip && (
                  <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-xl text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Truco: {exercise.tip}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-2xl md:text-3xl font-black leading-snug">
                {exercise.front}
              </p>
            )}
          </div>

          {/* Pie de la tarjeta */}
          <div className="flex items-center justify-center gap-2 text-xs font-bold opacity-80">
            <RotateCw className="w-4 h-4 animate-spin-slow" />
            <span>Toca para {isFlipped ? 'ver la pregunta' : 'girar la tarjeta'}</span>
          </div>
        </div>
      </div>

      {/* Botones de autoevaluación cuando está girada */}
      {isFlipped && !hasAnswered && (
        <div className="space-y-3 animate-fade-in text-center">
          <p className="text-sm font-bold text-slate-600">¿Te lo sabías bien?</p>
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={() => handleSelfGrade(false)}
              className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-base transition-all active:scale-95"
            >
              Casi, repasémoslo luego
            </button>
            <button
              type="button"
              onClick={() => handleSelfGrade(true)}
              className="px-8 py-3.5 rounded-2xl bg-mint-500 hover:bg-mint-600 text-white font-black text-base shadow-lg shadow-mint-200 flex items-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>¡Me lo sabía!</span>
            </button>
          </div>
        </div>
      )}

      {/* Botón siguiente tras responder */}
      {hasAnswered && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onNext}
            className="px-10 py-4 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-magic-300 active:scale-95 transition-all"
          >
            <span>Siguiente</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
