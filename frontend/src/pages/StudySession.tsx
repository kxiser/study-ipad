import React, { useState, useEffect } from 'react';
import { ExerciseSet, ExerciseItem } from '../types.js';
import { MultipleChoice } from '../components/exercises/MultipleChoice.js';
import { TrueFalse } from '../components/exercises/TrueFalse.js';
import { FillBlank } from '../components/exercises/FillBlank.js';
import { Ordering } from '../components/exercises/Ordering.js';
import { Matching } from '../components/exercises/Matching.js';
import { Flashcard } from '../components/exercises/Flashcard.js';
import { Mascot } from '../components/Mascot.js';
import { fireBigVictoryConfetti } from '../components/ConfettiCelebration.js';
import { submitExerciseAnswer, completeStudySession } from '../services/api.js';
import { Star, Trophy, Home, RotateCcw, ArrowRight } from 'lucide-react';

interface StudySessionProps {
  unitId?: string;
  exerciseSet: ExerciseSet;
  mascotType?: string;
  onFinish: () => void;
  sessionType?: 'new' | 'review';
}

export const StudySession: React.FC<StudySessionProps> = ({
  unitId,
  exerciseSet,
  mascotType = 'chispa',
  onFinish,
  sessionType = 'new'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [mascotMessage, setMascotMessage] = useState('¡Concéntrate y lee con calma, tú puedes!');

  const exercises = exerciseSet.exercises;
  const currentExercise = exercises[currentIndex];
  const progressPercent = Math.round(((currentIndex + (isCompleted ? 1 : 0)) / exercises.length) * 100);

  const handleExerciseAnswer = async (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
      setMascotMessage('¡Súper bien! ¡Qué gran respuesta!');
    } else {
      setMascotMessage('¡Casi! No te preocupes, de los errores se aprende.');
    }

    // Registrar en SRS en background
    if (currentExercise.id) {
      submitExerciseAnswer(currentExercise.id, isCorrect);
    }
  };

  const handleNext = async () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex(prev => prev + 1);
      setMascotMessage('¡Siguiente reto! A por todas.');
    } else {
      // Sesión terminada
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      const earnedStars = Math.max(5, correctAnswersCount * 3);

      setIsCompleted(true);
      fireBigVictoryConfetti();

      await completeStudySession({
        unitId,
        sessionType,
        durationSeconds,
        totalQuestions: exercises.length,
        correctAnswers: correctAnswersCount,
        starsEarned: earnedStars
      });
    }
  };

  // Pantalla de Victoria / Finalización
  if (isCompleted) {
    const earnedStars = Math.max(5, correctAnswersCount * 3);
    const perfectScore = correctAnswersCount === exercises.length;

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-8 animate-scale-up">
        <div className="bg-white rounded-4xl p-8 md:p-12 shadow-2xl border-4 border-sunny-300 relative overflow-hidden">
          {/* Fondo destellos */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-sunny-100 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-magic-100 rounded-full blur-2xl" />

          <div className="relative space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-sunny-300 to-amber-500 text-amber-950 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-200">
              <Trophy className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-magic-600 bg-magic-100 px-3 py-1 rounded-full">
                {sessionType === 'review' ? '¡Repaso Completado!' : '¡Misión Superada!'}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800">
                {perfectScore ? '¡Puntuación Perfecta!' : '¡Enhorabuena, Campeona!'}
              </h2>
              <p className="text-slate-600 font-bold text-base md:text-lg">
                Has completado "{exerciseSet.title}".
              </p>
            </div>

            {/* Estrellas ganadas */}
            <div className="flex items-center justify-center gap-3 bg-sunny-50 border-2 border-sunny-200 rounded-2xl p-4 max-w-xs mx-auto">
              <Star className="w-9 h-9 fill-amber-400 text-amber-500 animate-spin-slow" />
              <div className="text-left">
                <span className="text-2xl font-black text-amber-900">+{earnedStars} Estrellas</span>
                <span className="block text-xs font-bold text-amber-700">¡Sumadas a tu marcador!</span>
              </div>
            </div>

            {/* Resumen de aciertos */}
            <div className="text-sm font-black text-slate-500">
              Aciertos: {correctAnswersCount} de {exercises.length} preguntas
            </div>

            {/* Mascota celebrando */}
            <div className="flex justify-center pt-2">
              <Mascot
                mascotType={mascotType}
                mood="celebrating"
                size="md"
                message={perfectScore ? '¡Eres increíble! ¡Te lo sabes todo!' : '¡Cada día lo haces mejor! ¡Sigue así!'}
              />
            </div>

            {/* Botones */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={onFinish}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-magic-300 active:scale-95 transition-all"
              >
                <Home className="w-5 h-5" />
                <span>Volver al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Encabezado y Barra de Progreso */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              {exerciseSet.subject}
            </span>
            <h1 className="text-lg md:text-xl font-black text-slate-800 line-clamp-1">
              {exerciseSet.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-magic-50 border border-magic-200 px-3.5 py-1.5 rounded-full text-magic-700 font-black text-sm">
            <span>Pregunta {currentIndex + 1} de {exercises.length}</span>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-magic-500 to-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Mascota con mensaje dinámico */}
      <div className="flex justify-start">
        <Mascot
          mascotType={mascotType}
          mood="happy"
          size="sm"
          message={mascotMessage}
        />
      </div>

      {/* Renderizado interactivo del tipo de ejercicio actual */}
      <div className="transition-all duration-200">
        {currentExercise.type === 'multiple_choice' && (
          <MultipleChoice
            key={currentExercise.id || currentIndex}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onNext={handleNext}
          />
        )}

        {currentExercise.type === 'true_false' && (
          <TrueFalse
            key={currentExercise.id || currentIndex}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onNext={handleNext}
          />
        )}

        {currentExercise.type === 'fill_blank' && (
          <FillBlank
            key={currentExercise.id || currentIndex}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onNext={handleNext}
          />
        )}

        {currentExercise.type === 'ordering' && (
          <Ordering
            key={currentExercise.id || currentIndex}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onNext={handleNext}
          />
        )}

        {currentExercise.type === 'matching' && (
          <Matching
            key={currentExercise.id || currentIndex}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onNext={handleNext}
          />
        )}

        {currentExercise.type === 'flashcard' && (
          <Flashcard
            key={currentExercise.id || currentIndex}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  );
};
