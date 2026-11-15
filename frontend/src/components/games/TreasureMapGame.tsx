import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Star, Trophy, Lock, CheckCircle2, Play } from 'lucide-react';
import { ExerciseItem } from '../../types.js';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { Mascot } from '../Mascot.js';
import { completeStudySession } from '../../services/api.js';

interface LevelNode {
  id: number;
  name: string;
  world: string;
  bgClass: string;
  questionsNeeded: number;
}

const LEVELS: LevelNode[] = [
  { id: 1, name: 'Bosque de las Preguntas', world: 'Mundo Verde', bgClass: 'from-emerald-400 to-teal-500', questionsNeeded: 2 },
  { id: 2, name: 'Río de las Matemáticas', world: 'Aguas Claras', bgClass: 'from-sky-400 to-blue-500', questionsNeeded: 2 },
  { id: 3, name: 'Montaña del Saber', world: 'Alturas Mágicas', bgClass: 'from-indigo-400 to-purple-500', questionsNeeded: 2 },
  { id: 4, name: 'Cueva de los Secretos', world: 'Tierra Profunda', bgClass: 'from-amber-400 to-orange-500', questionsNeeded: 2 },
  { id: 5, name: 'Valle de las Estrellas', world: 'Cielo Estrellado', bgClass: 'from-pink-400 to-rose-500', questionsNeeded: 2 },
  { id: 6, name: 'Castillo del Tesoro Final', world: 'La Gran Fortaleza', bgClass: 'from-yellow-400 to-amber-600', questionsNeeded: 3 }
];

interface TreasureMapGameProps {
  exercises: ExerciseItem[];
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

export const TreasureMapGame: React.FC<TreasureMapGameProps> = ({
  exercises,
  onBack,
  onStarsEarned
}) => {
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [activeLevel, setActiveLevel] = useState<LevelNode | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState<Array<{ q: string; opts: string[]; ans: string }>>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [showLevelEndModal, setShowLevelEndModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Cargar progreso del mapa desde localStorage
  useEffect(() => {
    try {
      const savedLevel = localStorage.getItem('study_adventure_unlocked_level');
      if (savedLevel) setUnlockedLevel(parseInt(savedLevel, 10));

      const savedStars = localStorage.getItem('study_adventure_stars');
      if (savedStars) setLevelStars(JSON.parse(savedStars));
    } catch {}
  }, []);

  const saveProgress = (newUnlocked: number, newStarsMap: Record<number, number>) => {
    setUnlockedLevel(newUnlocked);
    setLevelStars(newStarsMap);
    localStorage.setItem('study_adventure_unlocked_level', newUnlocked.toString());
    localStorage.setItem('study_adventure_stars', JSON.stringify(newStarsMap));
  };

  const startLevel = (lvl: LevelNode) => {
    if (lvl.id > unlockedLevel) return;

    // Preparar preguntas para el nivel
    const pool: Array<{ q: string; opts: string[]; ans: string }> = [];
    exercises.forEach(e => {
      if (e.type === 'multiple_choice' && (e as any).question && (e as any).options) {
        pool.push({
          q: e.question,
          opts: [...e.options].sort(() => Math.random() - 0.5),
          ans: e.correctAnswer
        });
      } else if (e.type === 'fill_blank' && (e as any).textWithBlank && (e as any).options) {
        pool.push({
          q: e.textWithBlank.replace('___', '______'),
          opts: [...e.options].sort(() => Math.random() - 0.5),
          ans: e.correctAnswer
        });
      }
    });

    if (pool.length < 3) {
      pool.push(
        { q: '¿Qué animal es invertebrado?', opts: ['El caracol', 'El perro', 'El delfín'], ans: 'El caracol' },
        { q: '¿Cuál es el resultado de 6 × 3?', opts: ['18', '15', '20', '12'], ans: '18' },
        { q: '¿Qué es una meseta?', opts: ['Una llanura alta y elevada', 'Un río muy largo', 'Un volcán apagado'], ans: 'Una llanura alta y elevada' },
        { q: '¿Cuántos océanos bañan nuestro planeta?', opts: ['5 océanos', '3 océanos', '10 océanos'], ans: '5 océanos' }
      );
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, lvl.questionsNeeded);
    setActiveQuestions(shuffled);
    setQuizIndex(0);
    setCorrectCount(0);
    setActiveLevel(lvl);
    setShowLevelEndModal(false);
  };

  const norm = (s: string) => (s || '').trim().toLowerCase().replace(/[\.\,\!]$/, '');

  const handleAnswer = (selected: string) => {
    const currentQ = activeQuestions[quizIndex];
    const isCorrect = norm(selected) === norm(currentQ.ans);

    if (isCorrect) {
      sounds.playMatchSound();
      setCorrectCount(c => c + 1);
    } else {
      sounds.playWobbleSound();
    }

    if (quizIndex + 1 < activeQuestions.length) {
      setQuizIndex(i => i + 1);
    } else {
      // Fin del nivel
      setTimeout(() => {
        finishLevel(isCorrect ? correctCount + 1 : correctCount);
      }, 500);
    }
  };

  const finishLevel = (finalScore: number) => {
    if (!activeLevel) return;

    sounds.playVictorySound();
    setShowCelebration(true);

    const starsEarned = finalScore >= activeLevel.questionsNeeded ? 3 : finalScore > 0 ? 2 : 1;
    const newStarsMap = { ...levelStars, [activeLevel.id]: Math.max(levelStars[activeLevel.id] || 0, starsEarned) };

    let newUnlocked = unlockedLevel;
    if (activeLevel.id === unlockedLevel && unlockedLevel < LEVELS.length) {
      newUnlocked = unlockedLevel + 1;
    }

    saveProgress(newUnlocked, newStarsMap);

    completeStudySession({
      sessionType: 'review',
      durationSeconds: 40,
      totalQuestions: activeLevel.questionsNeeded,
      correctAnswers: finalScore,
      starsEarned
    }).catch(() => {});
    if (onStarsEarned) onStarsEarned(starsEarned);

    setShowLevelEndModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 animate-fade-in space-y-6">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a Juegos</span>
        </button>

        <span className="inline-block bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs md:text-sm px-4 py-1.5 rounded-full">
          🗺️ El Camino del Tesoro
        </span>
      </div>

      {/* Mapa sinuoso de aventura */}
      <div className="bg-gradient-to-b from-amber-50 via-emerald-50 to-sky-50 rounded-4xl border-3 border-emerald-200 p-6 md:p-10 shadow-lg relative overflow-hidden">
        <div className="text-center mb-8 space-y-1">
          <h3 className="text-2xl md:text-3xl font-black text-slate-800">Mapa de Exploración Mágica</h3>
          <p className="text-xs md:text-sm font-semibold text-slate-500">
            Avanza casilla a casilla con Chispa hasta conquistar el Castillo del Tesoro.
          </p>
        </div>

        {/* Camino con los niveles */}
        <div className="flex flex-col items-center gap-8 md:gap-10 relative">
          {LEVELS.map((lvl, idx) => {
            const isUnlocked = lvl.id <= unlockedLevel;
            const isCurrent = lvl.id === unlockedLevel;
            const stars = levelStars[lvl.id] || 0;
            // Alternar izquierda / centro / derecha para crear curva
            const alignClass = idx % 3 === 0 ? 'md:translate-x-12' : idx % 3 === 1 ? 'md:-translate-x-12' : 'translate-x-0';

            return (
              <div key={lvl.id} className={`flex flex-col items-center relative transition-transform ${alignClass}`}>
                {/* Chispa encima de la casilla actual */}
                {isCurrent && (
                  <div className="absolute -top-14 z-20 animate-bounce">
                    <Mascot size="sm" mood="happy" message="¡Vamos aquí!" />
                  </div>
                )}

                {/* Casilla interactiva */}
                <button
                  onClick={() => startLevel(lvl)}
                  disabled={!isUnlocked}
                  className={`w-48 sm:w-56 p-4 rounded-3xl shadow-lg border-4 transition-all duration-200 flex items-center justify-between gap-3 text-left active:scale-95 ${
                    isUnlocked
                      ? `bg-gradient-to-r ${lvl.bgClass} border-white text-white shadow-md hover:scale-105 cursor-pointer`
                      : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-75'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center font-black text-xl shrink-0">
                    {isUnlocked ? lvl.id : <Lock className="w-5 h-5 text-slate-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider block opacity-90 truncate">
                      {lvl.world}
                    </span>
                    <h4 className="font-black text-sm leading-tight truncate">
                      {lvl.name}
                    </h4>
                    {/* Estrellas conseguidas */}
                    {isUnlocked && (
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3].map(s => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= stars ? 'fill-amber-300 text-amber-300' : 'text-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal interactivo de Preguntas del Nivel */}
      {activeLevel && !showLevelEndModal && activeQuestions[quizIndex] && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl p-6 md:p-8 max-w-md w-full border-4 border-magic-400 shadow-2xl text-center space-y-5 animate-scale-up">
            <div className="flex items-center justify-between text-xs font-black text-magic-600 bg-magic-50 px-3 py-1.5 rounded-full border border-magic-200">
              <span>{activeLevel.name}</span>
              <span>Reto {quizIndex + 1} de {activeQuestions.length}</span>
            </div>

            <h4 className="text-xl font-black text-slate-800 leading-snug">
              {activeQuestions[quizIndex].q}
            </h4>

            <div className="space-y-2 text-left">
              {activeQuestions[quizIndex].opts.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-400 font-bold text-slate-700 text-sm text-left active:scale-98 transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nivel Completado */}
      {showLevelEndModal && activeLevel && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl p-8 max-w-sm w-full border-4 border-emerald-400 shadow-2xl text-center space-y-5 animate-scale-up">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Trophy className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-800">¡Nivel Superado!</h3>
              <p className="text-slate-600 font-bold text-sm">
                Has completado {activeLevel.name}.
              </p>
            </div>

            <div className="bg-sunny-50 border-2 border-sunny-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-amber-800 font-black text-lg">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500 animate-bounce" />
              <span>+{levelStars[activeLevel.id] || 3} Estrellas ganadas</span>
            </div>

            <button
              onClick={() => {
                setShowLevelEndModal(false);
                setActiveLevel(null);
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-md active:scale-95 transition-all"
            >
              Continuar en el Mapa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
