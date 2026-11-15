import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Star, Trophy, Zap, Shield, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { completeStudySession } from '../../services/api.js';
import { VERIFIED_FACTS } from '../../utils/questionReformulator.js';
import { ExerciseItem } from '../../types.js';

interface Monster {
  id: string;
  name: string;
  emoji: string;
  x: number;
  defeated: boolean;
  question: string;
  topic: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
}

interface PlatformerRpgGameProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

const WORLD_WIDTH = 1400;
const CANVAS_HEIGHT = 330;
const GROUND_Y = 240; // Nivel del suelo
const GRAVITY = 0.85;
const JUMP_FORCE = -15;
const SPEED = 5.5;

export const PlatformerRpgGame: React.FC<PlatformerRpgGameProps> = ({
  exercises = [],
  title = 'La Leyenda de Chispa',
  onBack,
  onStarsEarned
}) => {
  // Estado reactivo para la UI
  const [renderPos, setRenderPos] = useState({ x: 60, y: GROUND_Y, isGrounded: true, facingRight: true });
  const [walkFrame, setWalkFrame] = useState(0);
  const [cameraX, setCameraX] = useState(0);

  // Batalla RPG
  const [activeBattleMonster, setActiveBattleMonster] = useState<Monster | null>(null);
  const [spellCastAnimation, setSpellCastAnimation] = useState(false);
  const [battleFeedback, setBattleFeedback] = useState<string | null>(null);

  // Estrellas y monedas
  const [starsCollected, setStarsCollected] = useState(0);
  const [coins, setCoins] = useState<Array<{ id: number; x: number; y: number; collected: boolean }>>([
    { id: 1, x: 180, y: 190, collected: false },
    { id: 2, x: 260, y: 150, collected: false },
    { id: 3, x: 480, y: 160, collected: false },
    { id: 4, x: 540, y: 160, collected: false },
    { id: 5, x: 800, y: 190, collected: false },
    { id: 6, x: 1050, y: 160, collected: false },
    { id: 7, x: 1120, y: 160, collected: false }
  ]);

  // Plataformas flotantes estilo Mario
  const platforms: Platform[] = [
    { id: 1, x: 230, y: 180, width: 100 },
    { id: 2, x: 460, y: 190, width: 120 },
    { id: 3, x: 740, y: 185, width: 110 },
    { id: 4, x: 1030, y: 185, width: 120 }
  ];

  // Monstruos en el camino
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Estado mutable de físicas de Chispa (evita cierres obsoletos en requestAnimationFrame)
  const physicsRef = useRef({
    x: 60,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    isGrounded: true,
    facingRight: true,
    walkCycle: 0
  });

  // Controles de entrada
  const inputRef = useRef({
    left: false,
    right: false,
    jumpRequested: false
  });

  // Inicializar juego y preguntas de los guardianes
  const initGame = useCallback(() => {
    const facts = [...VERIFIED_FACTS].sort(() => Math.random() - 0.5).slice(0, 3);
    const monsterTemplates = [
      { name: 'Duende de las Cumbres', emoji: '🧌', x: 380 },
      { name: 'Golem de la Tierra', emoji: '🗿', x: 710 },
      { name: 'Dragón de las Aguas', emoji: '🐉', x: 1020 }
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
    physicsRef.current = {
      x: 60,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      isGrounded: true,
      facingRight: true,
      walkCycle: 0
    };
    inputRef.current = { left: false, right: false, jumpRequested: false };
    setActiveBattleMonster(null);
    setSpellCastAnimation(false);
    setBattleFeedback(null);
    setStarsCollected(0);
    setCoins([
      { id: 1, x: 180, y: 190, collected: false },
      { id: 2, x: 260, y: 150, collected: false },
      { id: 3, x: 480, y: 160, collected: false },
      { id: 4, x: 540, y: 160, collected: false },
      { id: 5, x: 800, y: 190, collected: false },
      { id: 6, x: 1050, y: 160, collected: false },
      { id: 7, x: 1120, y: 160, collected: false }
    ]);
    setHasWon(false);
    setShowCelebration(false);
    setRenderPos({ x: 60, y: GROUND_Y, isGrounded: true, facingRight: true });
    setCameraX(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Acción directa de Salto (¡Funciona siempre, tanto en táctil como en teclado!)
  const triggerJump = useCallback(() => {
    if (activeBattleMonster || hasWon) return;
    const p = physicsRef.current;
    if (p.isGrounded) {
      p.vy = JUMP_FORCE;
      p.isGrounded = false;
      sounds.playPopSound();
    }
  }, [activeBattleMonster, hasWon]);

  // Teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) inputRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) inputRef.current.right = true;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        triggerJump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) inputRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) inputRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerJump]);

  // Bucle de Física y Animación de 60 FPS con requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      if (!activeBattleMonster && !hasWon) {
        const p = physicsRef.current;

        // 1. Movimiento Horizontal
        if (inputRef.current.left) {
          p.x = Math.max(20, p.x - SPEED);
          p.facingRight = false;
          p.walkCycle = (p.walkCycle + 0.2) % 4;
        } else if (inputRef.current.right) {
          p.x = Math.min(WORLD_WIDTH - 60, p.x + SPEED);
          p.facingRight = true;
          p.walkCycle = (p.walkCycle + 0.2) % 4;
        } else {
          p.walkCycle = 0;
        }

        // 2. Gravedad y Movimiento Vertical
        p.vy += GRAVITY;
        p.y += p.vy;

        // 3. Colisión con plataformas flotantes
        let onPlatform = false;
        for (const plat of platforms) {
          // Si cae sobre la plataforma desde arriba
          if (
            p.x + 25 >= plat.x &&
            p.x - 25 <= plat.x + plat.width &&
            p.y >= plat.y &&
            p.y - p.vy <= plat.y + 12 &&
            p.vy >= 0
          ) {
            p.y = plat.y;
            p.vy = 0;
            p.isGrounded = true;
            onPlatform = true;
            break;
          }
        }

        // 4. Colisión con el suelo
        if (!onPlatform) {
          if (p.y >= GROUND_Y) {
            p.y = GROUND_Y;
            p.vy = 0;
            p.isGrounded = true;
          } else {
            p.isGrounded = false;
          }
        }

        // 5. Recoger monedas en el camino
        setCoins(prevCoins => {
          let updated = false;
          const newCoins = prevCoins.map(coin => {
            if (!coin.collected && Math.abs(coin.x - p.x) < 32 && Math.abs(coin.y - (p.y - 20)) < 36) {
              sounds.playPopSound();
              setStarsCollected(s => s + 1);
              updated = true;
              return { ...coin, collected: true };
            }
            return coin;
          });
          return updated ? newCoins : prevCoins;
        });

        // 6. Detección de Encuentro con Monstruo
        const nearbyMonster = monsters.find(m => !m.defeated && Math.abs(m.x - p.x) < 55);
        if (nearbyMonster) {
          sounds.playWobbleSound();
          setActiveBattleMonster(nearbyMonster);
          inputRef.current.left = false;
          inputRef.current.right = false;
        }

        // 7. Llegada a la Meta (Castillo Dorado)
        if (p.x >= WORLD_WIDTH - 120 && monsters.every(m => m.defeated)) {
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

        // Actualizar renderizado y cámara suave (centrada en Chispa)
        setRenderPos({
          x: p.x,
          y: p.y,
          isGrounded: p.isGrounded,
          facingRight: p.facingRight
        });
        setWalkFrame(Math.floor(p.walkCycle));

        // Cámara scroller que sigue al jugador
        const targetCamX = Math.max(0, Math.min(WORLD_WIDTH - 580, p.x - 220));
        setCameraX(prev => prev + (targetCamX - prev) * 0.12);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeBattleMonster, hasWon, monsters, onStarsEarned]);

  // Lanzar Hechizo Mágico en Batalla RPG
  const handleCastSpell = (option: string) => {
    if (!activeBattleMonster) return;

    if (option === activeBattleMonster.correctAnswer) {
      sounds.playMatchSound();
      setSpellCastAnimation(true);
      setBattleFeedback(`¡Poder Desatado! ⚡ ${activeBattleMonster.explanation}`);

      setTimeout(() => {
        setMonsters(prev =>
          prev.map(m => (m.id === activeBattleMonster.id ? { ...m, defeated: true } : m))
        );
        setStarsCollected(s => s + 3);
        setSpellCastAnimation(false);
        setActiveBattleMonster(null);
        setBattleFeedback(null);
        // Avanzar a Chispa un poco para pasar al monstruo
        physicsRef.current.x += 70;
      }, 1200);
    } else {
      sounds.playWobbleSound();
      setBattleFeedback(`¡El monstruo resiste! Esa no era la respuesta correcta. ¡Elige otro poder!`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 animate-fade-in space-y-3 select-none">
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

        {/* Gemas y Monstruos Derrotados */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-2xl font-black text-amber-950 text-xs sm:text-sm shadow-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-spin-slow" />
            <span>{starsCollected} Gemas</span>
          </div>

          <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-2xl font-black text-purple-900 text-xs">
            <Shield className="w-4 h-4 text-purple-600" />
            <span>{monsters.filter(m => m.defeated).length}/{monsters.length} Vencidos</span>
          </div>
        </div>

        <button
          onClick={initGame}
          title="Reiniciar aventura"
          className="p-2.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold active:scale-95 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* MUNDO 2D VIVO Y ANIMADO (ESTILO MARIO / ZELDA) */}
      <div className="relative bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 rounded-4xl p-0 shadow-2xl border-4 border-magic-400 overflow-hidden mx-auto h-[330px] w-full max-w-[660px] touch-none">
        {/* Capa 1 de Fondo: Sol brillante y Nubes con Parallax */}
        <div
          style={{ transform: `translateX(${-cameraX * 0.25}px)` }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Sol con rayos giratorios */}
          <div className="absolute top-4 left-20 w-16 h-16 rounded-full bg-amber-300 shadow-2xl flex items-center justify-center animate-spin-slow opacity-90 border-4 border-amber-200">
            ☀️
          </div>
          {/* Nubes flotantes en varias posiciones */}
          <div className="absolute top-6 left-60 text-4xl opacity-80 animate-pulse">☁️</div>
          <div className="absolute top-12 left-280 text-3xl opacity-75">☁️</div>
          <div className="absolute top-8 left-550 text-5xl opacity-80">☁️</div>
          <div className="absolute top-14 left-850 text-4xl opacity-70">☁️</div>
          <div className="absolute top-6 left-1150 text-5xl opacity-85">☁️</div>

          {/* Montañas majestuosas en la lejanía */}
          <div className="absolute bottom-20 left-40 text-7xl opacity-30">⛰️</div>
          <div className="absolute bottom-20 left-480 text-8xl opacity-35">🏔️</div>
          <div className="absolute bottom-20 left-900 text-7xl opacity-30">⛰️</div>
        </div>

        {/* Capa 2: Mundo del Juego interactivo (Mundo con scroll dinámico) */}
        <div
          style={{ transform: `translateX(${-cameraX}px)` }}
          className="absolute inset-0 will-change-transform"
        >
          {/* Suelo decorado de hierba y roca */}
          <div
            style={{ top: GROUND_Y + 36 }}
            className="absolute left-0 w-[1400px] h-24 bg-gradient-to-b from-emerald-600 via-emerald-700 to-amber-950 border-t-6 border-emerald-400 shadow-inner"
          >
            {/* Flores y hierba mecidas por el viento */}
            <div className="absolute -top-4 left-40 text-base animate-bounce">🌸</div>
            <div className="absolute -top-4 left-150 text-base">🌼</div>
            <div className="absolute -top-4 left-320 text-base">🌷</div>
            <div className="absolute -top-4 left-620 text-base animate-pulse">🌻</div>
            <div className="absolute -top-4 left-880 text-base">🌸</div>
            <div className="absolute -top-4 left-1180 text-base">🌼</div>
          </div>

          {/* Plataformas Flotantes (¡Chispa puede saltar sobre ellas!) */}
          {platforms.map(plat => (
            <div
              key={plat.id}
              style={{
                left: plat.x,
                top: plat.y + 36,
                width: plat.width
              }}
              className="absolute h-6 bg-gradient-to-b from-emerald-500 via-amber-800 to-amber-950 border-t-4 border-emerald-300 rounded-xl shadow-lg flex items-center justify-around px-2"
            >
              <span className="text-[10px]">🌿</span>
              <span className="text-[9px] font-black text-amber-200">🧱</span>
              <span className="text-[10px]">🌿</span>
            </div>
          ))}

          {/* Monedas y Gemas Doradas Flotantes */}
          {coins.map(c =>
            !c.collected ? (
              <div
                key={c.id}
                style={{ left: c.x, top: c.y }}
                className="absolute text-2xl animate-bounce drop-shadow-lg text-amber-300"
              >
                ⭐
              </div>
            ) : null
          )}

          {/* Monstruos Guardianes en el camino */}
          {monsters.map(m => (
            <div
              key={m.id}
              style={{ left: m.x, top: GROUND_Y - 14 }}
              className="absolute flex flex-col items-center"
            >
              {m.defeated ? (
                <div className="flex flex-col items-center animate-fade-out opacity-40">
                  <span className="text-xl">✨</span>
                  <span className="text-[9px] font-bold text-slate-500">Derrotado</span>
                </div>
              ) : (
                <div className="flex flex-col items-center animate-bounce">
                  {/* Aura mágica palpitante */}
                  <div className="absolute -inset-2 bg-rose-500/20 rounded-full blur-sm animate-ping pointer-events-none" />
                  <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap border border-rose-300">
                    {m.name}
                  </span>
                  <span className="text-4xl drop-shadow-xl select-none">{m.emoji}</span>
                </div>
              )}
            </div>
          ))}

          {/* Meta Final: El Gran Castillo Dorado */}
          <div
            style={{ left: WORLD_WIDTH - 120, top: GROUND_Y - 60 }}
            className="absolute flex flex-col items-center animate-pulse"
          >
            <span className="text-[11px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 px-2.5 py-0.5 rounded-full shadow-lg mb-1 border border-amber-200">
              ¡Castillo Dorado! 👑
            </span>
            <span className="text-6xl drop-shadow-2xl">🏰</span>
          </div>

          {/* Sombra en el suelo de Chispa (se encoge al saltar) */}
          <div
            style={{
              left: renderPos.x + 8,
              top: GROUND_Y + 30,
              transform: `scale(${renderPos.isGrounded ? 1 : 0.6})`,
              opacity: renderPos.isGrounded ? 0.35 : 0.15
            }}
            className="absolute w-8 h-2.5 bg-black rounded-full transition-transform duration-100 pointer-events-none"
          />

          {/* PERSONAJE PROTAGONISTA: CHISPA CON ANIMACIONES VIVAS */}
          <div
            style={{
              left: renderPos.x,
              top: renderPos.y - 12,
              transform: `scaleX(${renderPos.facingRight ? 1 : -1})`
            }}
            className="absolute flex flex-col items-center will-change-transform"
          >
            {/* Efecto de Hechizo Mágico si acierta */}
            {spellCastAnimation && (
              <div className="absolute -top-10 -right-8 text-3xl animate-ping text-amber-300 drop-shadow-lg z-30">
                ⚡✨
              </div>
            )}

            {/* Chispa con Sprite SVG detallado y animado */}
            <div
              className={`relative flex items-center justify-center transition-transform ${
                !renderPos.isGrounded
                  ? '-rotate-6 scale-110' // Animación de Salto
                  : walkFrame % 2 === 1
                  ? 'translate-y-[-3px]' // Animación de Pasos
                  : 'translate-y-0'
              }`}
            >
              {/* Cuerpo del Dragón Chispa */}
              <div className="relative text-4xl drop-shadow-xl select-none">
                🐉
              </div>
              {/* Espada mágica / Vara de luz */}
              <div className="absolute -right-2 top-1 text-sm animate-pulse">
                🪄
              </div>
            </div>

            {/* Polvo al caminar */}
            {renderPos.isGrounded && walkFrame > 0 && (
              <span className="absolute -bottom-2 -left-2 text-[10px] opacity-70 animate-ping">
                💨
              </span>
            )}
          </div>
        </div>

        {/* Guía en pantalla al inicio */}
        {renderPos.x < 130 && (
          <div className="absolute bottom-14 left-4 bg-white/95 text-slate-800 px-3 py-1.5 rounded-2xl text-xs font-black shadow-lg border border-magic-300 animate-bounce">
            👉 ¡Avanza a la derecha y salta las plataformas!
          </div>
        )}
      </div>

      {/* PANTALLA DE BATALLA RPG (Si encuentra a un monstruo guardián) */}
      {activeBattleMonster && (
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 rounded-3xl p-4 sm:p-5 border-4 border-amber-400 shadow-2xl text-white space-y-3.5 animate-scale-up text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-4xl animate-bounce">{activeBattleMonster.emoji}</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  Duelo Mágico • {activeBattleMonster.topic}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  ¡{activeBattleMonster.name} te bloquea el paso!
                </h3>
              </div>
            </div>

            <SpeechButton text={activeBattleMonster.question} size="sm" />
          </div>

          <p className="text-sm sm:text-base font-bold text-amber-100 bg-white/10 p-3 rounded-2xl border border-white/15">
            «{activeBattleMonster.question}»
          </p>

          {/* Opciones de Hechizo con Respuestas Verificadas */}
          <div className="space-y-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Elige tu poder para derrotarlo:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activeBattleMonster.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCastSpell(opt)}
                  className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-700 to-purple-800 hover:from-amber-500 hover:to-orange-600 border-2 border-indigo-400 hover:border-amber-300 font-black text-xs sm:text-sm text-center shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-white"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
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

      {/* CONTROLES TÁCTILES GIGANTES PARA IPAD (IZQUIERDA, DERECHA Y SALTO) */}
      {!activeBattleMonster && !hasWon && (
        <div className="flex items-center justify-between px-3 pt-2 max-w-xl mx-auto">
          {/* Pad Izquierda / Derecha con eventos touch inmediatos */}
          <div className="flex items-center gap-4">
            <button
              onPointerDown={() => (inputRef.current.left = true)}
              onPointerUp={() => (inputRef.current.left = false)}
              onPointerCancel={() => (inputRef.current.left = false)}
              className="w-18 h-16 sm:w-20 sm:h-18 rounded-3xl bg-slate-100 hover:bg-slate-200 border-3 border-slate-300 text-slate-800 font-black text-2xl active:scale-90 shadow-lg flex items-center justify-center touch-none select-none"
            >
              ◀️
            </button>

            <button
              onPointerDown={() => (inputRef.current.right = true)}
              onPointerUp={() => (inputRef.current.right = false)}
              onPointerCancel={() => (inputRef.current.right = false)}
              className="w-18 h-16 sm:w-20 sm:h-18 rounded-3xl bg-slate-100 hover:bg-slate-200 border-3 border-slate-300 text-slate-800 font-black text-2xl active:scale-90 shadow-lg flex items-center justify-center touch-none select-none"
            >
              ▶️
            </button>
          </div>

          {/* Botón de Salto Gigante con respuesta instantánea */}
          <button
            onPointerDown={triggerJump}
            className="w-28 h-18 sm:w-32 sm:h-20 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-white font-black text-lg shadow-xl border-4 border-amber-200 active:scale-90 flex flex-col items-center justify-center gap-0.5 touch-none select-none"
          >
            <span className="text-2xl leading-none">⬆️</span>
            <span className="text-xs tracking-wider uppercase drop-shadow">SALTAR</span>
          </button>
        </div>
      )}

      {/* MODAL DE VICTORIA FINAL */}
      {hasWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-4xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-4 border-amber-400">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-slate-800">¡Héroe del Conocimiento!</h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              Has derrotado a los guardianes del saber y alcanzado el Castillo Dorado. ¡Chispa te premia con 5 Estrellas Mágicas!
            </p>

            <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-xl py-1">
              <Star className="w-6 h-6 fill-amber-400" />
              <span>+5 Estrellas Mágicas</span>
            </div>

            <button
              onClick={initGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm active:scale-95 transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2"
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
