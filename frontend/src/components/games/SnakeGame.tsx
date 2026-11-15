import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Heart, Star, Trophy, Sparkles, Volume2 } from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { Mascot } from '../Mascot.js';
import { completeStudySession } from '../../services/api.js';
import { VERIFIED_FACTS } from '../../utils/questionReformulator.js';
import { ExerciseItem } from '../../types.js';

interface Point {
  x: number;
  y: number;
}

interface FoodItem {
  id: string;
  text: string;
  isCorrect: boolean;
  x: number;
  y: number;
  color: string;
}

interface SnakeGameProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

const GRID_SIZE = 16;
const TICK_SPEED = 240; // ms por movimiento (amable para 8 años)

export const SnakeGame: React.FC<SnakeGameProps> = ({
  exercises = [],
  title = 'La Serpiente Sabia',
  onBack,
  onStarsEarned
}) => {
  // Estado del juego
  const [snake, setSnake] = useState<Point[]>([
    { x: 8, y: 8 },
    { x: 8, y: 9 },
    { x: 8, y: 10 }
  ]);
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const [nextDirection, setNextDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [currentFactIdx, setCurrentFactIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Lista de misiones extraídas de hechos verificados
  const missions = VERIFIED_FACTS;
  const currentMission = missions[currentFactIdx % missions.length];

  // Generar comidas en posiciones libres del tablero
  const spawnFoods = (factIndex: number, currentSnake: Point[]) => {
    const fact = missions[factIndex % missions.length];
    const occupied = new Set(currentSnake.map(p => `${p.x},${p.y}`));

    const getRandomFreePos = (): Point => {
      let pt: Point;
      let tries = 0;
      do {
        pt = {
          x: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
          y: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1
        };
        tries++;
      } while (occupied.has(`${pt.x},${pt.y}`) && tries < 100);
      occupied.add(`${pt.x},${pt.y}`);
      return pt;
    };

    const newFoods: FoodItem[] = [];

    // Comida correcta
    const correctPos = getRandomFreePos();
    newFoods.push({
      id: `food-correct-${factIndex}`,
      text: fact.correctAnswer,
      isCorrect: true,
      x: correctPos.x,
      y: correctPos.y,
      color: 'bg-emerald-500 border-emerald-300 text-white'
    });

    // 2 Comidas distractoras
    fact.distractors.slice(0, 2).forEach((dist, idx) => {
      const pos = getRandomFreePos();
      newFoods.push({
        id: `food-dist-${factIndex}-${idx}`,
        text: dist,
        isCorrect: false,
        x: pos.x,
        y: pos.y,
        color: idx === 0 ? 'bg-amber-500 border-amber-300 text-white' : 'bg-rose-500 border-rose-300 text-white'
      });
    });

    setFoods(newFoods);
  };

  // Inicializar juego
  const restartGame = () => {
    const initialSnake: Point[] = [
      { x: 8, y: 8 },
      { x: 8, y: 9 },
      { x: 8, y: 10 }
    ];
    setSnake(initialSnake);
    setDirection('UP');
    setNextDirection('UP');
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setHasWon(false);
    setIsPaused(false);
    setFeedback(null);
    setShowCelebration(false);
    setCurrentFactIdx(0);
    spawnFoods(0, initialSnake);
  };

  useEffect(() => {
    restartGame();
  }, []);

  // Control táctil o por teclado (flechas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code) && direction !== 'DOWN') setNextDirection('UP');
      if (['ArrowDown', 'KeyS'].includes(e.code) && direction !== 'UP') setNextDirection('DOWN');
      if (['ArrowLeft', 'KeyA'].includes(e.code) && direction !== 'RIGHT') setNextDirection('LEFT');
      if (['ArrowRight', 'KeyD'].includes(e.code) && direction !== 'LEFT') setNextDirection('RIGHT');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Bucle principal del juego
  useEffect(() => {
    if (isPaused || isGameOver || hasWon) return;

    const timer = setInterval(() => {
      setDirection(nextDirection);

      setSnake(prevSnake => {
        const head = prevSnake[0];
        let newHead: Point = { ...head };

        if (nextDirection === 'UP') newHead.y -= 1;
        if (nextDirection === 'DOWN') newHead.y += 1;
        if (nextDirection === 'LEFT') newHead.x -= 1;
        if (nextDirection === 'RIGHT') newHead.x += 1;

        // Envoltura pacman en los bordes para que los niños no se choquen frustrantemente
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;

        // Comprobar colisión con comida
        const eatenIndex = foods.findIndex(f => f.x === newHead.x && f.y === newHead.y);

        if (eatenIndex !== -1) {
          const eatenFood = foods[eatenIndex];

          if (eatenFood.isCorrect) {
            // ¡Comida correcta! Crece la serpiente
            sounds.playMatchSound();
            setScore(s => s + 10);
            setFeedback(`¡Ñam! ¡Correcto! ${currentMission.explanation}`);

            const nextFact = currentFactIdx + 1;
            if (nextFact >= 5) {
              // Victoria de la partida
              sounds.playVictorySound();
              setShowCelebration(true);
              setHasWon(true);
              const stars = 5;
              completeStudySession({
                sessionType: 'review',
                durationSeconds: 45,
                totalQuestions: 5,
                correctAnswers: 5,
                starsEarned: stars
              }).catch(() => {});
              if (onStarsEarned) onStarsEarned(stars);
            } else {
              setCurrentFactIdx(nextFact);
              const updatedSnake = [newHead, ...prevSnake];
              spawnFoods(nextFact, updatedSnake);
              return updatedSnake;
            }
          } else {
            // Comida incorrecta
            sounds.playWobbleSound();
            setFeedback(`¡Ups! "${eatenFood.text}" no era lo correcto. ¡Sigue buscando!`);
            setLives(l => {
              const remaining = l - 1;
              if (remaining <= 0) {
                setIsGameOver(true);
              }
              return remaining;
            });
          }
        }

        // Movimiento normal (desplaza cabeza y retira cola)
        return [newHead, ...prevSnake.slice(0, -1)];
      });
    }, TICK_SPEED);

    return () => clearInterval(timer);
  }, [nextDirection, isPaused, isGameOver, hasWon, foods, currentFactIdx]);

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 animate-fade-in space-y-4 select-none">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra Superior */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        {/* Vidas y Puntuación */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-2xl">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-transform ${
                  i < lives ? 'text-rose-500 fill-rose-500 scale-100' : 'text-slate-300 scale-75'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-sunny-100 border border-sunny-300 px-3 py-1.5 rounded-2xl font-black text-amber-950 text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{score} pts</span>
          </div>
        </div>

        <button
          onClick={() => setIsPaused(p => !p)}
          className="p-2.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold active:scale-95 shadow-sm"
        >
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </button>
      </div>

      {/* Tarjeta de Misión Didáctica */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-3xl p-4 text-white shadow-lg border-2 border-emerald-300 flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐍</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full">
                Misión {currentFactIdx + 1} de 5
              </span>
              <span className="text-xs font-bold text-emerald-100">{currentMission.topic}</span>
            </div>
            <h3 className="text-sm sm:text-base font-black mt-0.5 leading-snug">
              {currentMission.directQuestion}
            </h3>
          </div>
        </div>

        <div className="shrink-0 hidden sm:block">
          <SpeechButton text={currentMission.directQuestion} size="md" />
        </div>
      </div>

      {/* TABLERO DE JUEGO GRID */}
      <div className="relative bg-slate-900 rounded-4xl p-3 shadow-2xl border-4 border-emerald-400 overflow-hidden mx-auto aspect-square max-w-[420px]">
        {/* Cuadrícula */}
        <div
          className="grid gap-1 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
          }}
        >
          {[...Array(GRID_SIZE * GRID_SIZE)].map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);

            // ¿Es cabeza de la serpiente?
            const isHead = snake[0].x === x && snake[0].y === y;
            // ¿Es cuerpo de la serpiente?
            const snakeSegmentIndex = snake.findIndex((p, i) => i > 0 && p.x === x && p.y === y);
            const isBody = snakeSegmentIndex !== -1;

            // ¿Hay comida aquí?
            const food = foods.find(f => f.x === x && f.y === y);

            return (
              <div
                key={idx}
                className="relative rounded-lg flex items-center justify-center transition-all"
              >
                {/* Cabeza de la serpiente */}
                {isHead && (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-lg border border-emerald-200 flex items-center justify-center text-xs animate-pulse">
                    👀
                  </div>
                )}

                {/* Cuerpo de la serpiente */}
                {isBody && (
                  <div
                    style={{
                      opacity: Math.max(0.4, 1 - snakeSegmentIndex * 0.08)
                    }}
                    className="w-full h-full bg-emerald-500 rounded-xl border border-emerald-400/50"
                  />
                )}

                {/* Comida flotante con texto */}
                {food && (
                  <div
                    className={`absolute -inset-1 z-20 rounded-xl p-1 flex items-center justify-center text-center font-black text-[9px] sm:text-[10px] leading-none shadow-md border-2 animate-bounce cursor-pointer ${food.color}`}
                  >
                    <span>{food.text}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback flotante */}
        {feedback && (
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/95 text-white p-2.5 rounded-2xl border border-emerald-400 text-xs font-bold text-center shadow-lg animate-fade-in">
            {feedback}
          </div>
        )}
      </div>

      {/* CONTROLES TÁCTILES D-PAD GIGANTES PARA IPAD */}
      <div className="flex flex-col items-center justify-center gap-1.5 pt-1">
        <button
          onClick={() => {
            if (direction !== 'DOWN') setNextDirection('UP');
            sounds.playPopSound();
          }}
          className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-emerald-100 border-2 border-slate-300 hover:border-emerald-400 font-black text-2xl active:scale-90 shadow-md text-slate-700 flex items-center justify-center"
        >
          ⬆️
        </button>

        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              if (direction !== 'RIGHT') setNextDirection('LEFT');
              sounds.playPopSound();
            }}
            className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-emerald-100 border-2 border-slate-300 hover:border-emerald-400 font-black text-2xl active:scale-90 shadow-md text-slate-700 flex items-center justify-center"
          >
            ⬅️
          </button>

          <button
            onClick={() => {
              if (direction !== 'UP') setNextDirection('DOWN');
              sounds.playPopSound();
            }}
            className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-emerald-100 border-2 border-slate-300 hover:border-emerald-400 font-black text-2xl active:scale-90 shadow-md text-slate-700 flex items-center justify-center"
          >
            ⬇️
          </button>

          <button
            onClick={() => {
              if (direction !== 'LEFT') setNextDirection('RIGHT');
              sounds.playPopSound();
            }}
            className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-emerald-100 border-2 border-slate-300 hover:border-emerald-400 font-black text-2xl active:scale-90 shadow-md text-slate-700 flex items-center justify-center"
          >
            ➡️
          </button>
        </div>
      </div>

      {/* MODAL DE VICTORIA O FIN DE PARTIDA */}
      {(hasWon || isGameOver) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-4xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-4 border-emerald-400">
            {hasWon ? (
              <>
                <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
                <h3 className="text-2xl font-black text-slate-800">¡Serpiente Sabia!</h3>
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  ¡Has comido solo las respuestas correctas de todos los temas! Chispa te premia con 5 Estrellas Mágicas.
                </p>
                <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-xl py-1">
                  <Star className="w-6 h-6 fill-amber-400" />
                  <span>+5 Estrellas</span>
                </div>
              </>
            ) : (
              <>
                <span className="text-5xl block animate-bounce">🍎</span>
                <h3 className="text-2xl font-black text-slate-800">¡Casi lo consigues!</h3>
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  ¡No te preocupes! Repasa con Chispa y vuelve a intentarlo para conseguir todas las estrellas.
                </p>
              </>
            )}

            <button
              onClick={restartGame}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm active:scale-95 transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar de nuevo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
