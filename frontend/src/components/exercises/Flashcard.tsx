import React, { useState } from 'react';
import { FlashcardExercise } from '../../types.js';
import { SpeechButton } from '../SpeechButton.js';
import { fireSuccessConfetti } from '../ConfettiCelebration.js';
import { RotateCw, Sparkles, Check, ArrowRight, Lightbulb } from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';

interface Props {
  exercise: FlashcardExercise;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export const Flashcard: React.FC<Props> = ({ exercise, onAnswer, onNext }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleFlip = () => {
    sounds.playFlipSound();
    setIsFlipped(!isFlipped);
  };

  const handleSelfGrade = (knewIt: boolean) => {
    if (hasAnswered) return;
    setHasAnswered(true);

    if (knewIt) {
      fireSuccessConfetti();
      sounds.playMatchSound();
    } else {
      sounds.playWobbleSound();
    }
    onAnswer(knewIt);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <span className="text-xs font-black uppercase tracking-wider text-magic-600 bg-magic-50 px-3.5 py-1.5 rounded-full border border-magic-200 inline-block shadow-sm">
          Tarjeta Mágica de Repaso
        </span>
        <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1.5">
          Toca la tarjeta para voltearla y ver la respuesta
        </p>
      </div>

      {/* Tarjeta con efecto 3D real sin inversión de texto */}
      <div
        onClick={handleFlip}
        className="cursor-pointer min-h-[300px] md:min-h-[340px] perspective-1000 select-none relative"
      >
        <div
          className={`relative w-full min-h-[300px] md:min-h-[340px] transition-transform duration-600 ease-in-out transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* CARA A: ANVERSO (PREGUNTA) */}
          <div className="absolute inset-0 backface-hidden rounded-4xl p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-magic-600 via-indigo-600 to-purple-700 border-4 border-magic-400 text-white shadow-2xl">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/20 text-white shadow-sm border border-white/30 flex items-center gap-1.5">
                <span>❓</span>
                <span>Pregunta</span>
              </span>

              <div onClick={e => e.stopPropagation()}>
                <SpeechButton
                  text={exercise.front}
                  size="sm"
                  className="!bg-white/20 !text-white !border-white/30 hover:!bg-white/30"
                />
              </div>
            </div>

            {/* Contenido Central */}
            <div className="my-auto py-4 text-center px-2">
              <span className="text-4xl sm:text-5xl mb-3 block">💡</span>
              <p className="text-2xl sm:text-3xl font-black leading-snug tracking-tight text-white drop-shadow-sm">
                {exercise.front}
              </p>
            </div>

            {/* Pie */}
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black text-white/80 bg-black/10 py-2 rounded-2xl">
              <RotateCw className="w-4 h-4 animate-spin-slow" />
              <span>Toca en cualquier parte para girar</span>
            </div>
          </div>

          {/* CARA B: REVERSO (RESPUESTA Y EXPLICACIÓN) */}
          {/* Al tener rotate-y-180 pre-aplicado, cuando el contenedor gira 180°, esta cara queda orientada exactamente de frente */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-4xl p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-amber-50 via-white to-sunny-100 border-4 border-amber-300 text-slate-800 shadow-2xl">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-200 text-amber-950 shadow-sm border border-amber-300 flex items-center gap-1.5">
                <span>✨</span>
                <span>Respuesta correcta</span>
              </span>

              <div onClick={e => e.stopPropagation()}>
                <SpeechButton
                  text={`${exercise.back}. ${exercise.tip ? `Truco: ${exercise.tip}` : ''}`}
                  size="sm"
                />
              </div>
            </div>

            {/* Contenido Central */}
            <div className="my-auto py-4 text-center px-2 space-y-3">
              <span className="text-4xl sm:text-5xl mb-1 block">🎯</span>
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-snug">
                {exercise.back}
              </p>

              {exercise.tip && (
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-950 px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold border border-amber-300 shadow-sm">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Truco para recordar: <strong>{exercise.tip}</strong></span>
                </div>
              )}
            </div>

            {/* Pie */}
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-slate-500 bg-slate-100 py-2 rounded-2xl">
              <RotateCw className="w-4 h-4" />
              <span>Toca para volver a ver la pregunta</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de autoevaluación cuando la tarjeta está girada */}
      {isFlipped && !hasAnswered && (
        <div className="space-y-3 animate-fade-in text-center pt-2">
          <p className="text-sm font-black text-slate-700">
            ¿Te acordabas de la respuesta?
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => handleSelfGrade(false)}
              className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm active:scale-95 transition-all border-2 border-slate-200 flex items-center justify-center gap-2"
            >
              <span>Necesito repasarlo</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelfGrade(true)}
              className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm active:scale-95 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>¡Me la sabía!</span>
            </button>
          </div>
        </div>
      )}

      {/* Botón Siguiente cuando ya se autoevaluó */}
      {hasAnswered && (
        <div className="flex justify-end pt-2 animate-fade-in">
          <button
            type="button"
            onClick={onNext}
            className="px-6 py-3.5 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-magic-300 active:scale-95 transition-all"
          >
            <span>Siguiente pregunta</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
