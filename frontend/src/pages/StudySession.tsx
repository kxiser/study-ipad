import React, { useState, useEffect } from 'react';
import { ExerciseSet, ExerciseItem } from '../types.js';
import { MultipleChoice } from '../components/exercises/MultipleChoice.js';
import { TrueFalse } from '../components/exercises/TrueFalse.js';
import { FillBlank } from '../components/exercises/FillBlank.js';
import { Ordering } from '../components/exercises/Ordering.js';
import { Matching } from '../components/exercises/Matching.js';
import { Flashcard } from '../components/exercises/Flashcard.js';
import { Mascot } from '../components/Mascot.js';
import { fireBigVictoryConfetti, fireSuccessConfetti } from '../components/ConfettiCelebration.js';
import { submitExerciseAnswer, completeStudySession } from '../services/api.js';
import { Star, Trophy, Home, RotateCcw, ArrowRight, Flame, Sparkles, Gift } from 'lucide-react';
import { EducationalIllustration } from '../components/EducationalIllustration.js';
import { StickerAlbumModal, unlockRandomSticker, StickerItem } from '../components/StickerAlbumModal.js';
import { sounds } from '../utils/soundEffects.js';

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
  // Barajar dinámicamente las preguntas para que nunca se repita el mismo orden
  const [exercises] = useState<ExerciseItem[]>(() => {
    return [...exerciseSet.exercises].sort(() => Math.random() - 0.5);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [mascotMessage, setMascotMessage] = useState('¡Concéntrate y lee con calma, tú puedes!');
  const [earnedSticker, setEarnedSticker] = useState<StickerItem | null>(null);
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);

  const currentExercise = exercises[currentIndex];
  const progressPercent = Math.round(((currentIndex + (isCompleted ? 1 : 0)) / exercises.length) * 100);

  const handleExerciseAnswer = async (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
      const nextCombo = comboCount + 1;
      setComboCount(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);

      if (nextCombo >= 3) {
        sounds.playVictorySound();
        setMascotMessage(`🔥 ¡INCREÍBLE! ¡Llevas ${nextCombo} aciertos seguidos! ¡Imparable!`);
      } else if (nextCombo === 2) {
        sounds.playMatchSound();
        setMascotMessage('⚡ ¡Racha de 2 aciertos! ¡Sigue a este ritmo!');
      } else {
        setMascotMessage('¡Súper bien! ¡Gran respuesta!');
      }
    } else {
      setComboCount(0);
      setMascotMessage('¡Casi! No te preocupes, de los fallos se aprende mucho.');
    }

    // Registrar en SRS en background
    if (currentExercise && currentExercise.id) {
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
      const bonusStars = maxCombo >= 3 ? 5 : maxCombo >= 2 ? 2 : 0;
      const earnedStars = Math.max(5, (correctAnswersCount * 3) + bonusStars);

      // Si ha conseguido buena nota o racha, desbloquear sobre de cromos sorpresa
      if (correctAnswersCount >= Math.ceil(exercises.length * 0.6) || maxCombo >= 3) {
        const newSticker = unlockRandomSticker();
        if (newSticker) {
          setEarnedSticker(newSticker);
        }
      }

      setIsCompleted(true);
      fireBigVictoryConfetti();
      sounds.playVictorySound();

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

  // Texto representativo para la ilustración visual automática
  const currentPromptText = (currentExercise as any)?.question ||
    (currentExercise as any)?.statement ||
    (currentExercise as any)?.textWithBlank ||
    (currentExercise as any)?.front ||
    exerciseSet.title;

  // Pantalla de Victoria / Finalización
  if (isCompleted) {
    const bonusStars = maxCombo >= 3 ? 5 : maxCombo >= 2 ? 2 : 0;
    const earnedStars = Math.max(5, (correctAnswersCount * 3) + bonusStars);
    const perfectScore = correctAnswersCount === exercises.length;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center space-y-6 animate-scale-up">
        <div className="bg-white rounded-4xl p-6 sm:p-10 shadow-2xl border-4 border-sunny-300 relative overflow-hidden space-y-6">
          {/* Fondo destellos */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-sunny-100 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-magic-100 rounded-full blur-2xl pointer-events-none" />

          <div className="w-24 h-24 bg-gradient-to-br from-sunny-300 to-amber-500 text-amber-950 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-200 animate-bounce">
            <Trophy className="w-12 h-12" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-magic-600 bg-magic-100 px-3.5 py-1 rounded-full inline-block">
              {sessionType === 'review' ? '¡Repaso Completado!' : '¡Misión Superada!'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800">
              {perfectScore ? '¡Puntuación Perfecta!' : '¡Enhorabuena, Campeona!'}
            </h2>
            <p className="text-slate-600 font-bold text-sm sm:text-base">
              Has completado "{exerciseSet.title}".
            </p>
          </div>

          {/* Marcadores de Estrellas y Racha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            <div className="flex items-center gap-3 bg-sunny-50 border-2 border-sunny-200 rounded-3xl p-4 shadow-sm text-left">
              <Star className="w-9 h-9 fill-amber-400 text-amber-500 shrink-0 animate-spin-slow" />
              <div>
                <span className="text-xl sm:text-2xl font-black text-amber-900">+{earnedStars}</span>
                <span className="block text-xs font-bold text-amber-700">Estrellas ganadas</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-rose-50 border-2 border-rose-200 rounded-3xl p-4 shadow-sm text-left">
              <Flame className="w-9 h-9 fill-rose-500 text-rose-500 shrink-0" />
              <div>
                <span className="text-xl sm:text-2xl font-black text-rose-900">Racha x{maxCombo}</span>
                <span className="block text-xs font-bold text-rose-700">Mejor racha de aciertos</span>
              </div>
            </div>
          </div>

          {/* PREMIO ESPECIAL: SOBRE DE CROMOS SORPRESA */}
          {earnedSticker && (
            <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-3xl p-5 text-white shadow-xl space-y-3 animate-pulse border-2 border-amber-300">
              <div className="flex items-center justify-center gap-2">
                <Gift className="w-6 h-6 text-white" />
                <span className="font-black text-base uppercase tracking-wider">¡HAS GANADO UN CROMO MÁGICO!</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold opacity-95">
                Por tu gran concentración y aciertos, desbloqueas: <strong>"{earnedSticker.name}"</strong>
              </p>
              <button
                type="button"
                onClick={() => setIsAlbumOpen(true)}
                className="py-3 px-6 rounded-2xl bg-white text-amber-950 font-black text-sm shadow-md hover:bg-amber-50 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Abrir Álbum y Ver Cromo {earnedSticker.emoji}</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </button>
            </div>
          )}

          {/* Mascota celebrando */}
          <div className="flex justify-center pt-2">
            <Mascot
              mascotType={mascotType}
              mood="celebrating"
              size="md"
              message={perfectScore ? '¡Eres un genio del estudio! ¡Te lo has sabido todo!' : '¡Cada día avanzas más! ¡Sigue jugando y aprendiendo!'}
            />
          </div>

          {/* Botones de acción final */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={onFinish}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-magic-300 active:scale-95 transition-all"
            >
              <Home className="w-5 h-5" />
              <span>Volver al Inicio</span>
            </button>
          </div>
        </div>

        {/* Modal de Álbum de Cromos */}
        <StickerAlbumModal
          isOpen={isAlbumOpen}
          onClose={() => setIsAlbumOpen(false)}
          newStickerRevealed={earnedSticker}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 md:py-6 space-y-5 animate-fade-in">
      {/* Barra superior de progreso y combo */}
      <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-magic-100 space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-600">
          <span className="flex items-center gap-1.5 text-magic-700">
            <span>📚 Pregunta {currentIndex + 1} de {exercises.length}</span>
          </span>

          <div className="flex items-center gap-2">
            {/* Indicador de Combo en Vivo */}
            {comboCount >= 2 && (
              <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>¡COMBO x{comboCount}!</span>
              </span>
            )}

            <span className="text-magic-600 bg-magic-50 px-2.5 py-1 rounded-full border border-magic-200">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Barra de progreso visual con degradado */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-magic-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Ilustración Visual Didáctica del Concepto */}
      <EducationalIllustration
        text={currentPromptText}
        subject={exerciseSet.subject}
      />

      {/* Mascota con mensaje de ánimo adaptativo */}
      <div className="flex justify-center">
        <Mascot
          mascotType={mascotType}
          mood={comboCount >= 2 ? 'celebrating' : 'thinking'}
          size="sm"
          message={mascotMessage}
        />
      </div>

      {/* Renderizado interactivo del tipo de ejercicio actual */}
      <div className="transition-all duration-200">
        {currentExercise && currentExercise.type === 'multiple_choice' && (
          <MultipleChoice
            key={currentExercise.id || currentIndex}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onNext={handleNext}
          />
        )}

        {currentExercise && currentExercise.type === 'true_false' && (
          <TrueFalse
            key={currentExercise.id || currentIndex}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onNext={handleNext}
          />
        )}

        {currentExercise && currentExercise.type === 'fill_blank' && (
          <FillBlank
            key={currentExercise.id || currentIndex}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onNext={handleNext}
          />
        )}

        {currentExercise && currentExercise.type === 'ordering' && (
          <Ordering
            key={currentExercise.id || currentIndex}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onNext={handleNext}
          />
        )}

        {currentExercise && currentExercise.type === 'matching' && (
          <Matching
            key={currentExercise.id || currentIndex}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onNext={handleNext}
          />
        )}

        {currentExercise && currentExercise.type === 'flashcard' && (
          <Flashcard
            key={currentExercise.id || currentIndex}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onNext={handleNext}
          />
        )}
      </div>

      {/* Botón flotante para salir si lo desea */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onFinish}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Guardar y salir de la sesión
        </button>
      </div>
    </div>
  );
};
