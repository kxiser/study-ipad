import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Sparkles, Star, Trophy, Heart, Zap, Shield, Volume2, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { Mascot } from '../Mascot.js';
import { completeStudySession } from '../../services/api.js';
import { VERIFIED_FACTS } from '../../utils/questionReformulator.js';
import { ExerciseItem } from '../../types.js';

interface Monster {
  id: string;
  name: string;
  emoji: string;
  x: number; // posición X en el mundo (0 a 1200)
  defeated: boolean;
  question: string;
  topic: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

interface PlatformerRpgGameProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

const WORLD_WIDTH = 1300;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 340;
const GROUND_Y = 270;

export const PlatformerRpgGame: React.FC<PlatformerRpgGameProps> = ({
  exercises = [],
  title = 'La Leyenda de Chispa',
  onBack,
  onStarsEarned
}) => {
  // Posición y física de Chispa en el mundo 2D
  const [playerX, setPlayerX] = useState(60);
  const [playerY, setPlayerY] = useState(GROUND_Y);
  const [velocityY, setVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const [walkFrame, setWalkFrame] = useState(0);

  // Estado de batalla RPG
  const [activeBattleMonster, setActiveBattleMonster] = useState<Monster | null>(null);
  const [spellCastAnimation, setSpellCastAnimation] = useState(false);
  const [battleFeedback, setBattleFeedback] = useState<string | null>(null);

  // Monedas / Estrellas recogidas en el camino
  const [starsCollected, setStarsCollected] = useState(0);
  const [coinsInWorld, setCoinsInWorld] = useState<Array<{ id: number; x: number; y: number; collected: boolean }>>([
    { id: 1, x: 180, y: 230, collected: false },
    { id: 2, x: 230, y: 210, collected: false },
    { id: 3, x: 500, y: 220, collected: false },
    { id: 4, x: 800, y: 230, collected: false },
    { id: 5, x: 1100, y: 210, collected: false }
  ]);

  // Lista de monstruos/guardianes en el camino
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Teclas pulsadas
  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false
  });

  // Inicializar monstruos con preguntas verificadas
  const initGame = () => {
    const facts = [...VERIFIED_FACTS].sort(() => Math.random() - 0.5).slice(0, 3);
    const monsterTemplates = [
      { name: 'Duende de las Montañas', emoji: '🧌', x: 340 },
      { name: 'Golem de las Llanuras', emoji: '🗿', x: 680 },
      { name: 'Guardián de los Océanos', emoji: '🐉', x: 990 }
    ];

    const generated: Monster[] = facts.map((fact, idx) => {
      const template = monsterTemplates[idx];
      const opts = [fact.correctAnswer, ...fact.distractors.slice(0, 2)].sort(() => Math.random() - 0.5);
      return {
        id: `monster-${idx}`,
        name: template.name,
        emoji: template.emoji,
        x: template.x,
        defeated: false,
        question: fact.directQuestion,
        topic: fact.topic,
        correctAnswer: fact.correctAnswer,
        options: opts,
        explanation: fact.explanation
      };
    });

    setMonsters(generated);
    setPlayerX(60);
    setPlayerY(GROUND_Y);
    setVelocityY(0);
    setIsJumping(false);
    setActiveBattleMonster(null);
    setSpellCastAnimation(false);
    setBattleFeedback(null);
    setStarsCollected(0);
    setCoinsInWorld([
      { id: 1, x: 180, y: 230, collected: false },
      { id: 2, x: 230, y: 210, collected: false },
      { id: 3, x: 500, y: 220, collected: false },
      { id: 4, x: 800, y: 230, collected: false },
      { id: 5, x: 1100, y: 210, collected: false }
    ]);
    setHasWon(false);
    setShowCelebration(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) keysRef.current.jump = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) keysRef.current.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Bucle de física 2D del mundo (60 fps)
  useEffect(() => {
    if (activeBattleMonster || hasWon) return;

    const interval = setInterval(() => {
      // 1. Movimiento Horizontal
      if (keysRef.current.left) {
        setPlayerX(x => Math.max(20, x - 5));
        setFacingRight(false);
        setWalkFrame(f => (f + 1) % 4);
      } else if (keysRef.current.right) {
        setPlayerX(x => Math.min(WORLD_WIDTH - 40, x + 5));
        setFacingRight(true);
        setWalkFrame(f => (f + 1) % 4);
      }

      // 2. Salto y Gravedad
      if (keysRef.current.jump && !isJumping) {
        setVelocityY(-13);
        setIsJumping(true);
        sounds.playPopSound();
      }

      setPlayerY(y => {
        const nextY = y + velocityY;
        if (nextY >= GROUND_Y) {
          setVelocityY(0);
          setIsJumping(false);
          return GROUND_Y;
        }
        return nextY;
      });

      setVelocityY(v => (v < 12 ? v + 1 : v)); // Gravedad

      // 3. Recoger monedas en el camino
      setCoinsInWorld(coins =>
        coins.map(c => {
          if (!c.collected && Math.abs(c.x - playerX) < 30 && Math.abs(c.y - playerY) < 35) {
            sounds.playPopSound();
            setStarsCollected(s => s + 1);
            return { ...c, collected: true };
          }
          return c;
        })
      );

      // 4. Detectar encuentro con monstruo no derrotado
      const nearbyMonster = monsters.find(m => !m.defeated && Math.abs(m.x - playerX) < 45);
      if (nearbyMonster) {
        sounds.playWobbleSound();
        setActiveBattleMonster(nearbyMonster);
      }

      // 5. Llegada al Castillo Dorado (Meta final)
      if (playerX >= WORLD_WIDTH - 80 && monsters.every(m => m.defeated)) {
        sounds.playVictorySound();
        setShowCelebration(true);
        setHasWon(true);
        const stars = 5;
        completeStudySession({
          sessionType: 'new',
          durationSeconds: 60,
          totalQuestions: monsters.length,
          correctAnswers: monsters.length,
          starsEarned: stars
        }).catch(() => {});
        if (onStarsEarned) onStarsEarned(stars);
      }
    }, 1000 / 45);

    return () => clearInterval(interval);
  }, [playerX, playerY, velocityY, isJumping, activeBattleMonster, monsters, hasWon]);

  // Ejecución de Hechizo Mágico en Batalla
  const handleCastSpell = (option: string) => {
    if (!activeBattleMonster) return;

    if (option === activeBattleMonster.correctAnswer) {
      // ¡Hechizo mágico super efectivo!
      sounds.playMatchSound();
      setSpellCastAnimation(true);
      setBattleFeedback(`¡Poder Desatado! ⚡ ${activeBattleMonster.explanation}`);

      setTimeout(() => {
        // Derrotar al monstruo y transformarlo en polvo de estrellas
        setMonsters(prev =>
          prev.map(m => (m.id === activeBattleMonster.id ? { ...m, defeated: true } : m))
        );
        setStarsCollected(s => s + 2);
        setSpellCastAnimation(false);
        setActiveBattleMonster(null);
        setBattleFeedback(null);
        // Avanzar a Chispa un poco para no re-colisionar
        setPlayerX(x => x + 60);
      }, 1300);
    } else {
      // Hechizo fallido
      sounds.playWobbleSound();
      setBattleFeedback(`¡Casi! Ese hechizo no tuvo efecto. El monstruo te pide recordar: ¡prueba otro poder!`);
    }
  };

  // Posición de la cámara en el mundo (sigue a Chispa de forma suave)
  const cameraX = Math.max(0, Math.min(WORLD_WIDTH - CANVAS_WIDTH, playerX - CANVAS_WIDTH / 2));

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 animate-fade-in space-y-4 select-none">
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

        {/* Monedas mágicas y Progreso */}
        <div className="flex items-center gap-2 bg-sunny-100 border border-sunny-300 px-3.5 py-1.5 rounded-2xl font-black text-amber-950 text-sm shadow-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-spin-slow" />
          <span>{starsCollected} Gemas</span>
        </div>

        <button
          onClick={initGame}
          title="Reiniciar aventura"
          className="p-2.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold active:scale-95 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* PANTALLA DE JUEGO 2D (CANVAS SCROLLER ESTILO MARIO / ZELDA) */}
      <div className="relative bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 rounded-4xl p-0 shadow-2xl border-4 border-magic-400 overflow-hidden mx-auto h-[340px] w-full max-w-[640px]">
        {/* Nubes y Montañas de fondo (Parallax) */}
        <div
          style={{ transform: `translateX(${-cameraX * 0.3}px)` }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Montañas y nubes lejanas */}
          <div className="absolute top-8 left-40 text-4xl opacity-80 animate-pulse">☁️</div>
          <div className="absolute top-12 left-260 text-3xl opacity-80">☁️</div>
          <div className="absolute top-6 left-600 text-4xl opacity-80">☁️</div>
          <div className="absolute top-10 left-900 text-4xl opacity-80">☁️</div>
          <div className="absolute bottom-16 left-80 text-6xl opacity-30">⛰️</div>
          <div className="absolute bottom-16 left-480 text-6xl opacity-30">⛰️</div>
          <div className="absolute bottom-16 left-850 text-6xl opacity-30">⛰️</div>
        </div>

        {/* Mundo interactivo que se desplaza con la cámara */}
        <div
          style={{ transform: `translateX(${-cameraX}px)` }}
          className="absolute inset-0 transition-transform duration-75"
        >
          {/* Suelo de hierba verde */}
          <div
            style={{ top: GROUND_Y + 36 }}
            className="absolute left-0 w-[1300px] h-20 bg-gradient-to-b from-emerald-600 via-emerald-700 to-amber-900 border-t-4 border-emerald-400"
          >
            {/* Flores decorativas en el camino */}
            <div className="absolute -top-4 left-60 text-lg">🌸</div>
            <div className="absolute -top-4 left-220 text-lg">🌼</div>
            <div className="absolute -top-4 left-420 text-lg">🌷</div>
            <div className="absolute -top-4 left-760 text-lg">🌻</div>
            <div className="absolute -top-4 left-940 text-lg">🌸</div>
          </div>

          {/* Monedas / Gemas flotantes */}
          {coinsInWorld.map(c =>
            !c.collected ? (
              <div
                key={c.id}
                style={{ left: c.x, top: c.y }}
                className="absolute text-xl animate-bounce text-amber-300 drop-shadow-md"
              >
                ⭐
              </div>
            ) : null
          )}

          {/* Monstruos / Guardianes en el camino */}
          {monsters.map(m => (
            <div
              key={m.id}
              style={{ left: m.x, top: GROUND_Y - 10 }}
              className="absolute flex flex-col items-center"
            >
              {m.defeated ? (
                <span className="text-2xl animate-fade-out opacity-60">✨</span>
              ) : (
                <div className="flex flex-col items-center animate-bounce">
                  <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-sm mb-1 whitespace-nowrap">
                    {m.name}
                  </span>
                  <span className="text-4xl drop-shadow-lg">{m.emoji}</span>
                </div>
              )}
            </div>
          ))}

          {/* Meta Final: El Gran Castillo Dorado de Chispa */}
          <div
            style={{ left: WORLD_WIDTH - 120, top: GROUND_Y - 70 }}
            className="absolute flex flex-col items-center animate-pulse"
          >
            <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full shadow-md mb-1">
              ¡Castillo del Saber!
            </span>
            <span className="text-6xl drop-shadow-2xl">🏰</span>
          </div>

          {/* Personaje: Chispa caminando o saltando */}
          <div
            style={{
              left: playerX,
              top: playerY - 10,
              transform: `scaleX(${facingRight ? 1 : -1})`
            }}
            className="absolute flex flex-col items-center transition-all duration-75"
          >
            {/* Animación de ataque si lanza un hechizo */}
            {spellCastAnimation && (
              <div className="absolute -top-6 -right-10 text-2xl animate-ping text-amber-400">
                ⚡✨
              </div>
            )}
            <div className="w-12 h-12 flex items-center justify-center drop-shadow-lg">
              <span className="text-4xl">🐉</span>
            </div>
          </div>
        </div>

        {/* Indicador de ayuda al inicio */}
        {playerX < 120 && (
          <div className="absolute bottom-14 left-4 bg-white/90 text-slate-800 px-3 py-1.5 rounded-2xl text-xs font-black shadow-md border border-magic-200 animate-bounce">
            👉 ¡Avanza hacia la derecha para explorar!
          </div>
        )}
      </div>

      {/* PANTALLA DE BATALLA RPG (Si encuentra un monstruo) */}
      {activeBattleMonster && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-5 border-4 border-amber-400 shadow-2xl text-white space-y-4 animate-scale-up text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{activeBattleMonster.emoji}</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  Encuentro RPG • {activeBattleMonster.topic}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  {activeBattleMonster.name} te desafía:
                </h3>
              </div>
            </div>

            <SpeechButton text={activeBattleMonster.question} size="sm" />
          </div>

          <p className="text-sm sm:text-base font-bold text-amber-100 bg-white/10 p-3 rounded-2xl border border-white/10">
            «{activeBattleMonster.question}»
          </p>

          {/* Botones de Hechizos Mágicos (Respuestas) */}
          <div className="space-y-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
              ⚡ Elige tu poder mágico para vencer al monstruo:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activeBattleMonster.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCastSpell(opt)}
                  className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-600 to-purple-700 hover:from-amber-500 hover:to-orange-600 border-2 border-indigo-400 hover:border-amber-300 font-black text-xs sm:text-sm text-center shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-white"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {battleFeedback && (
            <div className="bg-amber-400 text-amber-950 p-2.5 rounded-2xl text-xs font-black text-center animate-fade-in shadow-md">
              {battleFeedback}
            </div>
          )}
        </div>
      )}

      {/* CONTROLES TÁCTILES GIGANTES PARA IPAD */}
      {!activeBattleMonster && !hasWon && (
        <div className="flex items-center justify-between px-4 pt-1">
          {/* Botones Izquierda / Derecha */}
          <div className="flex items-center gap-3">
            <button
              onTouchStart={() => (keysRef.current.left = true)}
              onTouchEnd={() => (keysRef.current.left = false)}
              onMouseDown={() => (keysRef.current.left = true)}
              onMouseUp={() => (keysRef.current.left = false)}
              className="w-18 h-16 sm:w-20 sm:h-18 rounded-3xl bg-slate-100 hover:bg-magic-100 border-3 border-slate-300 text-slate-800 font-black text-2xl active:scale-90 shadow-lg flex items-center justify-center"
            >
              ⬅️
            </button>

            <button
              onTouchStart={() => (keysRef.current.right = true)}
              onTouchEnd={() => (keysRef.current.right = false)}
              onMouseDown={() => (keysRef.current.right = true)}
              onMouseUp={() => (keysRef.current.right = false)}
              className="w-18 h-16 sm:w-20 sm:h-18 rounded-3xl bg-slate-100 hover:bg-magic-100 border-3 border-slate-300 text-slate-800 font-black text-2xl active:scale-90 shadow-lg flex items-center justify-center"
            >
              ➡️
            </button>
          </div>

          {/* Botón de Salto Gigante */}
          <button
            onTouchStart={() => (keysRef.current.jump = true)}
            onTouchEnd={() => (keysRef.current.jump = false)}
            onMouseDown={() => (keysRef.current.jump = true)}
            onMouseUp={() => (keysRef.current.jump = false)}
            className="w-24 h-16 sm:w-28 sm:h-18 rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-base shadow-xl border-3 border-amber-300 active:scale-90 flex items-center justify-center gap-1.5"
          >
            <span>⬆️ Saltar</span>
          </button>
        </div>
      )}

      {/* MODAL DE VICTORIA FINAL EN EL CASTILLO */}
      {hasWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-4xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-4 border-amber-400">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-slate-800">¡Héroe del Conocimiento!</h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              Has derrotado a todos los guardianes usando tus poderes mágicos y has llegado al Castillo Dorado. ¡Chispa te entrega 5 Estrellas Mágicas!
            </p>

            <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-xl py-1">
              <Star className="w-6 h-6 fill-amber-400" />
              <span>+5 Estrellas Mágicas</span>
            </div>

            <button
              onClick={initGame}
              className="w-full py-3.5 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-sm active:scale-95 transition-all shadow-md shadow-magic-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar otra aventura 2D</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
