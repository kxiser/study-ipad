import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Heart, Star, Trophy, Sparkles, Volume2 } from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { completeStudySession } from '../../services/api.js';
import { VERIFIED_FACTS } from '../../utils/questionReformulator.js';
import { ExerciseItem } from '../../types.js';

interface Point {
  x: number;
  y: number;
}

interface FoodItem {
  id: string;
  letter: 'A' | 'B' | 'C';
  text: string;
  isCorrect: boolean;
  x: number;
  y: number;
  colorName: string;
  emoji: string;
  badgeBg: string;
}

interface SnakeGameProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

const GRID_SIZE = 14;
const TICK_SPEED = 210; // ms por paso (ritmo agradable para 8 años)

export const SnakeGame: React.FC<SnakeGameProps> = ({
  exercises = [],
  title = 'La Serpiente Sabia',
  onBack,
  onStarsEarned
}) => {
  // Estado de la serpiente
  const [snake, setSnake] = useState<Point[]>([
    { x: 7, y: 7 },
    { x: 7, y: 8 },
    { x: 7, y: 9 }
  ]);
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const nextDirRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [currentFactIdx, setCurrentFactIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Referencias para el touch swipe y joystick
  const boardTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number } | null>(null);
  const [joystickKnob, setJoystickKnob] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState(false);

  const missions = VERIFIED_FACTS;
  const currentMission = missions[currentFactIdx % missions.length];

  // Cambiar dirección con validación anti-retroceso
  const changeDirection = useCallback((newDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    setDirection(prev => {
      if (newDir === 'UP' && prev !== 'DOWN') {
        nextDirRef.current = 'UP';
        return 'UP';
      }
      if (newDir === 'DOWN' && prev !== 'UP') {
        nextDirRef.current = 'DOWN';
        return 'DOWN';
      }
      if (newDir === 'LEFT' && prev !== 'RIGHT') {
        nextDirRef.current = 'LEFT';
        return 'LEFT';
      }
      if (newDir === 'RIGHT' && prev !== 'LEFT') {
        nextDirRef.current = 'RIGHT';
        return 'RIGHT';
      }
      return prev;
    });
  }, []);

  // Generar las 3 comidas (A, B, C) con diseño nítido y coordenadas libres
  const spawnFoods = useCallback((factIndex: number, currentSnake: Point[]) => {
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

    // Crear lista de 3 opciones aleatorizadas
    const rawOptions = [
      { text: fact.correctAnswer, isCorrect: true },
      { text: fact.distractors[0] || 'Opción 1', isCorrect: false },
      { text: fact.distractors[1] || 'Opción 2', isCorrect: false }
    ].sort(() => Math.random() - 0.5);

    const letters: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];
    const emojis = ['🍎', '🫐', '🍊'];
    const bgs = ['bg-rose-500 border-rose-300', 'bg-indigo-500 border-indigo-300', 'bg-amber-500 border-amber-300'];

    const newFoods: FoodItem[] = rawOptions.map((opt, idx) => {
      const pos = getRandomFreePos();
      return {
        id: `food-${factIndex}-${idx}`,
        letter: letters[idx],
        text: opt.text,
        isCorrect: opt.isCorrect,
        x: pos.x,
        y: pos.y,
        colorName: opt.isCorrect ? 'correct' : 'distractor',
        emoji: emojis[idx],
        badgeBg: bgs[idx]
      };
    });

    setFoods(newFoods);
  }, [missions]);

  // Reiniciar juego
  const restartGame = useCallback(() => {
    const initialSnake: Point[] = [
      { x: 7, y: 7 },
      { x: 7, y: 8 },
      { x: 7, y: 9 }
    ];
    setSnake(initialSnake);
    setDirection('UP');
    nextDirRef.current = 'UP';
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setHasWon(false);
    setIsPaused(false);
    setFeedback(null);
    setShowCelebration(false);
    setCurrentFactIdx(0);
    spawnFoods(0, initialSnake);
  }, [spawnFoods]);

  useEffect(() => {
    restartGame();
  }, [restartGame]);

  // Controles de teclado físico para iPad o Mac
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) changeDirection('UP');
      if (['ArrowDown', 'KeyS'].includes(e.code)) changeDirection('DOWN');
      if (['ArrowLeft', 'KeyA'].includes(e.code)) changeDirection('LEFT');
      if (['ArrowRight', 'KeyD'].includes(e.code)) changeDirection('RIGHT');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection]);

  // Detección de Swipes táctiles sobre el tablero (deslizar el dedo en iPad)
  const handleBoardTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      boardTouchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleBoardTouchEnd = (e: React.TouchEvent) => {
    if (!boardTouchStartRef.current || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - boardTouchStartRef.current.x;
    const dy = endY - boardTouchStartRef.current.y;
    boardTouchStartRef.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Mínimo umbral para considerar swipe
    if (Math.max(absDx, absDy) < 20) return;

    if (absDx > absDy) {
      // Horizontal
      if (dx > 0) changeDirection('RIGHT');
      else changeDirection('LEFT');
    } else {
      // Vertical
      if (dy > 0) changeDirection('DOWN');
      else changeDirection('UP');
    }
    sounds.playPopSound();
  };

  // Joystick virtual táctil interactivo
  const handleJoystickStart = (clientX: number, clientY: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    joystickCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    setIsDraggingJoystick(true);
    updateJoystickPosition(clientX, clientY);
  };

  const updateJoystickPosition = (clientX: number, clientY: number) => {
    if (!joystickCenterRef.current) return;
    const dx = clientX - joystickCenterRef.current.x;
    const dy = clientY - joystickCenterRef.current.y;
    const distance = Math.hypot(dx, dy);
    const maxRadius = 38; // radio máximo de la palanca

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(distance, maxRadius);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setJoystickKnob({ x: knobX, y: knobY });

    // Determinar dirección basada en ángulo si el dedo se aleja más de 12px
    if (distance > 12) {
      const deg = (angle * 180) / Math.PI;
      if (deg >= -45 && deg <= 45) {
        changeDirection('RIGHT');
      } else if (deg > 45 && deg <= 135) {
        changeDirection('DOWN');
      } else if (deg < -45 && deg >= -135) {
        changeDirection('UP');
      } else {
        changeDirection('LEFT');
      }
    }
  };

  const handleJoystickEnd = () => {
    setIsDraggingJoystick(false);
    setJoystickKnob({ x: 0, y: 0 });
    joystickCenterRef.current = null;
  };

  // Bucle de movimiento continuo
  useEffect(() => {
    if (isPaused || isGameOver || hasWon) return;

    const timer = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const dir = nextDirRef.current;
        let newHead: Point = { x: head.x, y: head.y };

        if (dir === 'UP') newHead.y -= 1;
        if (dir === 'DOWN') newHead.y += 1;
        if (dir === 'LEFT') newHead.x -= 1;
        if (dir === 'RIGHT') newHead.x += 1;

        // Envolvente Pac-Man por los bordes (sin muerte frustrante)
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;

        // Choque con el propio cuerpo
        const selfCollision = prevSnake.some((p, i) => i > 0 && p.x === newHead.x && p.y === newHead.y);
        if (selfCollision) {
          sounds.playWobbleSound();
          setFeedback('¡Cuidado! No te muerdas la cola 🐍');
          return prevSnake;
        }

        // ¿Come algo?
        const foodIdx = foods.findIndex(f => f.x === newHead.x && f.y === newHead.y);
        if (foodIdx !== -1) {
          const eatenFood = foods[foodIdx];

          if (eatenFood.isCorrect) {
            // ¡Correcto!
            sounds.playMatchSound();
            setScore(s => s + 20);
            setFeedback(`¡Excelente! "${eatenFood.text}" es correcto ✨`);

            const nextFact = currentFactIdx + 1;
            if (nextFact >= 5) {
              setHasWon(true);
              setShowCelebration(true);
              sounds.playVictorySound();
              const stars = 5;
              completeStudySession({
                sessionType: 'new',
                durationSeconds: 60,
                totalQuestions: 5,
                correctAnswers: 5,
                starsEarned: stars
              }).catch(() => {});
              if (onStarsEarned) onStarsEarned(stars);
              return [newHead, ...prevSnake];
            } else {
              setCurrentFactIdx(nextFact);
              const updatedSnake = [newHead, ...prevSnake];
              spawnFoods(nextFact, updatedSnake);
              return updatedSnake;
            }
          } else {
            // Distractor
            sounds.playWobbleSound();
            setFeedback(`¡Ups! "${eatenFood.text}" no es la correcta. ¡Busca la buena!`);
            setLives(l => {
              const remaining = l - 1;
              if (remaining <= 0) {
                setIsGameOver(true);
              }
              return remaining;
            });
          }
        }

        return [newHead, ...prevSnake.slice(0, -1)];
      });
    }, TICK_SPEED);

    return () => clearInterval(timer);
  }, [isPaused, isGameOver, hasWon, foods, currentFactIdx, onStarsEarned, spawnFoods]);

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-3 animate-fade-in space-y-3 select-none">
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

          <div className="flex items-center gap-1.5 bg-sunny-100 border border-sunny-300 px-3 py-1.5 rounded-2xl font-black text-amber-950 text-sm shadow-sm">
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

      {/* Misión Didáctica */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-3.5 text-white shadow-lg border-2 border-emerald-400 flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce">🐍</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/25 px-2.5 py-0.5 rounded-full">
                Misión {currentFactIdx + 1} de 5
              </span>
              <span className="text-xs font-bold text-emerald-100">{currentMission.topic}</span>
            </div>
            <h3 className="text-sm sm:text-base font-black mt-0.5 leading-tight text-white drop-shadow-sm">
              {currentMission.directQuestion}
            </h3>
          </div>
        </div>

        <div className="shrink-0 hidden sm:block">
          <SpeechButton text={currentMission.directQuestion} size="md" />
        </div>
      </div>

      {/* Tarjetas de Opciones Claras (Leyenda para que no haya bolas raras ni dudas) */}
      <div className="grid grid-cols-3 gap-2">
        {foods.map((food) => (
          <div
            key={food.id}
            className={`p-2 rounded-2xl border-2 flex items-center gap-2 shadow-sm text-left ${
              food.letter === 'A'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : food.letter === 'B'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <span className="text-xl">{food.emoji}</span>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase opacity-60 block">Manzana {food.letter}</span>
              <span className="text-xs font-black truncate block leading-tight">{food.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* TABLERO DE JUEGO (Con soporte para Swipe táctil directo en iPad) */}
      <div
        onTouchStart={handleBoardTouchStart}
        onTouchEnd={handleBoardTouchEnd}
        className="relative bg-slate-950 rounded-4xl p-2.5 shadow-2xl border-4 border-emerald-400 overflow-hidden mx-auto aspect-square max-w-[390px] touch-none"
      >
        {/* Patrón de césped sutil */}
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

            const isHead = snake[0].x === x && snake[0].y === y;
            const snakeSegmentIndex = snake.findIndex((p, i) => i > 0 && p.x === x && p.y === y);
            const isBody = snakeSegmentIndex !== -1;
            const food = foods.find(f => f.x === x && f.y === y);

            return (
              <div
                key={idx}
                className="relative rounded-lg flex items-center justify-center bg-slate-900/60"
              >
                {/* Cabeza de la serpiente */}
                {isHead && (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-green-400 to-emerald-600 rounded-2xl shadow-lg border-2 border-emerald-200 flex items-center justify-center text-xs animate-pulse z-20">
                    <span className="drop-shadow">👀</span>
                  </div>
                )}

                {/* Segmentos del cuerpo de la serpiente */}
                {isBody && (
                  <div
                    style={{
                      opacity: Math.max(0.4, 1 - snakeSegmentIndex * 0.07),
                      transform: `scale(${Math.max(0.75, 1 - snakeSegmentIndex * 0.02)})`
                    }}
                    className="w-full h-full bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl border border-emerald-400/60 shadow-sm z-10"
                  />
                )}

                {/* Comida flotante como manzana brillante con su letra clara */}
                {food && (
                  <div className="absolute -inset-1.5 z-30 flex flex-col items-center justify-center animate-bounce">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-white text-xs shadow-xl border-2 ${food.badgeBg}`}
                    >
                      <span>{food.emoji}</span>
                    </div>
                    <span className="text-[9px] font-black bg-black/80 text-white px-1.5 rounded-full -mt-1 shadow-md">
                      {food.letter}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback flotante */}
        {feedback && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 text-white p-2.5 rounded-2xl border-2 border-emerald-400 text-xs font-black text-center shadow-2xl animate-fade-in z-40">
            {feedback}
          </div>
        )}
      </div>

      {/* CONTROLES TÁCTILES: JOYSTICK VIRTUAL + D-PAD TOUCH PARA IPAD */}
      <div className="flex items-center justify-around max-w-sm mx-auto pt-2">
        {/* Joystick Virtual interactivo */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Joystick Táctil
          </span>
          <div
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                handleJoystickStart(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
              }
            }}
            onTouchMove={(e) => {
              if (isDraggingJoystick && e.touches.length > 0) {
                updateJoystickPosition(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handleJoystickEnd}
            onMouseDown={(e) => handleJoystickStart(e.clientX, e.clientY, e.currentTarget)}
            onMouseMove={(e) => {
              if (isDraggingJoystick) updateJoystickPosition(e.clientX, e.clientY);
            }}
            onMouseUp={handleJoystickEnd}
            onMouseLeave={handleJoystickEnd}
            className="w-24 h-24 rounded-full bg-gradient-to-b from-slate-200 to-slate-300 border-4 border-slate-400 shadow-inner relative flex items-center justify-center cursor-pointer touch-none active:border-emerald-500"
          >
            {/* Indicadores de dirección en el borde */}
            <span className="absolute top-1 text-[10px] font-bold text-slate-500">▲</span>
            <span className="absolute bottom-1 text-[10px] font-bold text-slate-500">▼</span>
            <span className="absolute left-1.5 text-[10px] font-bold text-slate-500">◀</span>
            <span className="absolute right-1.5 text-[10px] font-bold text-slate-500">▶</span>

            {/* Palanca / Pomo central móvil */}
            <div
              style={{
                transform: `translate(${joystickKnob.x}px, ${joystickKnob.y}px)`,
                transition: isDraggingJoystick ? 'none' : 'transform 0.15s ease-out'
              }}
              className="w-12 h-12 rounded-full bg-gradient-to-b from-emerald-400 to-teal-600 border-3 border-white shadow-xl flex items-center justify-center text-white text-base font-black pointer-events-none"
            >
              🐍
            </div>
          </div>
        </div>

        {/* Deslizar directamente con el dedo en el tablero o usar toques rápidos */}
        <div className="text-left bg-emerald-50 border border-emerald-200 p-3 rounded-2xl max-w-[170px] space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-800 block">✨ Modo Táctil iPad</span>
          <p className="text-[11px] font-bold text-emerald-950 leading-tight">
            • Usa la palanca <br />
            • O desliza el dedo en el tablero hacia donde quieras que vaya.
          </p>
        </div>
      </div>

      {/* MODAL DE VICTORIA O FIN DE PARTIDA */}
      {(hasWon || isGameOver) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-4xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-4 border-emerald-400">
            {hasWon ? (
              <>
                <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
                <h3 className="text-2xl font-black text-slate-800">¡Serpiente Sabia!</h3>
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  ¡Has comido todas las respuestas correctas sin equivocarte! Has ganado 5 Estrellas Mágicas.
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
                  ¡No pasa nada! Recuerda que puedes volver a intentarlo y guiar a la serpiente hacia la respuesta correcta.
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
