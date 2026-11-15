import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Star, Trophy, Zap, Shield, RotateCcw, Volume2, Sparkles, Flame, HelpCircle, Users } from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { CharacterSelectorModal } from '../CharacterSelectorModal.js';
import { getSelectedCharacter, PlayableCharacter } from '../../utils/characters.js';
import { completeStudySession } from '../../services/api.js';
import { getDynamicGameQuestions, GameQuestion } from '../../utils/questionReformulator.js';
import { ExerciseItem } from '../../types.js';

interface MysteryBlock {
  id: number;
  x: number;
  y: number;
  hit: boolean;
  bouncing: boolean;
  type: 'star' | 'coin';
}

interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  type: 'grass' | 'brick' | 'cloud';
}

interface Enemy {
  id: number;
  name: string;
  emoji: string;
  x: number;
  startX: number;
  endX: number;
  vx: number;
  y: number;
  defeated: boolean;
  squashed: boolean;
  question: GameQuestion;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  emoji?: string;
  life: number;
}

interface PlatformerRpgGameProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

const WORLD_WIDTH = 1900;
const CANVAS_HEIGHT = 330;
const GROUND_Y = 240;
const GRAVITY = 0.85;
const JUMP_FORCE = -15;
const SPEED = 5.2;

export const PlatformerRpgGame: React.FC<PlatformerRpgGameProps> = ({
  exercises = [],
  title = 'La Leyenda de Chispa',
  onBack,
  onStarsEarned
}) => {
  // Estado para la UI y la cámara
  const [renderPos, setRenderPos] = useState({ x: 60, y: GROUND_Y, isGrounded: true, facingRight: true });
  const [walkFrame, setWalkFrame] = useState(0);
  const [cameraX, setCameraX] = useState(0);

  // Personaje Jugable Seleccionado
  const [hero, setHero] = useState<PlayableCharacter>(getSelectedCharacter());
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);

  // Modo Super Chispa (Power-Up de estrella / fuego)
  const [isSuperChispa, setIsSuperChispa] = useState(false);

  // Encuentro y batalla RPG (estilo Zelda)
  const [activeBattleEnemy, setActiveBattleEnemy] = useState<Enemy | null>(null);
  const [spellCastAnimation, setSpellCastAnimation] = useState(false);
  const [battleFeedback, setBattleFeedback] = useState<string | null>(null);

  // Coleccionables y Bloques interactivos estilo Mario
  const [starsCollected, setStarsCollected] = useState(0);
  const [coinsInWorld, setCoinsInWorld] = useState<Array<{ id: number; x: number; y: number; collected: boolean }>>([
    { id: 1, x: 180, y: 190, collected: false },
    { id: 2, x: 230, y: 190, collected: false },
    { id: 3, x: 420, y: 130, collected: false },
    { id: 4, x: 470, y: 130, collected: false },
    { id: 5, x: 520, y: 130, collected: false },
    { id: 6, x: 800, y: 190, collected: false },
    { id: 7, x: 1040, y: 130, collected: false },
    { id: 8, x: 1380, y: 190, collected: false },
    { id: 9, x: 1430, y: 190, collected: false }
  ]);

  // Bloques Misteriosos [?] de Mario (que al golpearlos por abajo sacan estrellas)
  const [mysteryBlocks, setMysteryBlocks] = useState<MysteryBlock[]>([
    { id: 1, x: 260, y: 155, hit: false, bouncing: false, type: 'star' },
    { id: 2, x: 650, y: 155, hit: false, bouncing: false, type: 'star' },
    { id: 3, x: 960, y: 140, hit: false, bouncing: false, type: 'coin' },
    { id: 4, x: 1250, y: 155, hit: false, bouncing: false, type: 'star' }
  ]);

  // Plataformas de juego
  const platforms: Platform[] = [
    { id: 1, x: 380, y: 180, width: 170, type: 'brick' },
    { id: 2, x: 600, y: 190, width: 130, type: 'grass' },
    { id: 3, x: 890, y: 175, width: 150, type: 'brick' },
    { id: 4, x: 1180, y: 185, width: 160, type: 'cloud' },
    { id: 5, x: 1460, y: 190, width: 140, type: 'grass' }
  ];

  // Enemigos patrulleros
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Física mutable del jugador
  const physicsRef = useRef({
    x: 60,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    isGrounded: true,
    facingRight: true,
    walkCycle: 0
  });

  const inputRef = useRef({
    left: false,
    right: false,
    jumpRequested: false
  });

  // Spawn de partículas visuales
  const addParticles = (x: number, y: number, color: string, emoji?: string, count = 6) => {
    const newParts: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParts.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 6 - 2,
        color,
        emoji,
        life: 25
      });
    }
    setParticles(prev => [...prev.slice(-20), ...newParts]);
  };

  // Inicializar nivel con preguntas DINÁMICAS (nuevas y variadas en cada partida)
  const initGame = useCallback(() => {
    const dynamicQuestions = getDynamicGameQuestions(exercises, 4);

    const enemyTemplates = [
      { name: 'Duende Saltador', emoji: '🧌', startX: 390, endX: 530, y: 180 - 10 },
      { name: 'Golem de Piedra', emoji: '🗿', startX: 720, endX: 860, y: GROUND_Y - 10 },
      { name: 'Dragón Guardián', emoji: '🐉', startX: 1200, endX: 1330, y: 185 - 10 },
      { name: 'Hechicero Sabio', emoji: '🧙‍♂️', startX: 1500, endX: 1620, y: GROUND_Y - 10 }
    ];

    const generatedEnemies: Enemy[] = enemyTemplates.map((t, idx) => ({
      id: idx + 1,
      name: t.name,
      emoji: t.emoji,
      x: t.startX,
      startX: t.startX,
      endX: t.endX,
      vx: 1.2,
      y: t.y,
      defeated: false,
      squashed: false,
      question: dynamicQuestions[idx % dynamicQuestions.length]
    }));

    setEnemies(generatedEnemies);
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
    setActiveBattleEnemy(null);
    setSpellCastAnimation(false);
    setBattleFeedback(null);
    setIsSuperChispa(false);
    setStarsCollected(0);
    setMysteryBlocks([
      { id: 1, x: 260, y: 155, hit: false, bouncing: false, type: 'star' },
      { id: 2, x: 650, y: 155, hit: false, bouncing: false, type: 'star' },
      { id: 3, x: 960, y: 140, hit: false, bouncing: false, type: 'coin' },
      { id: 4, x: 1250, y: 155, hit: false, bouncing: false, type: 'star' }
    ]);
    setCoinsInWorld([
      { id: 1, x: 180, y: 190, collected: false },
      { id: 2, x: 230, y: 190, collected: false },
      { id: 3, x: 420, y: 130, collected: false },
      { id: 4, x: 470, y: 130, collected: false },
      { id: 5, x: 520, y: 130, collected: false },
      { id: 6, x: 800, y: 190, collected: false },
      { id: 7, x: 1040, y: 130, collected: false },
      { id: 8, x: 1380, y: 190, collected: false },
      { id: 9, x: 1430, y: 190, collected: false }
    ]);
    setHasWon(false);
    setShowCelebration(false);
    setRenderPos({ x: 60, y: GROUND_Y, isGrounded: true, facingRight: true });
    setCameraX(0);
  }, [exercises]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Salto instantáneo
  const triggerJump = useCallback(() => {
    if (activeBattleEnemy || hasWon) return;
    const p = physicsRef.current;
    if (p.isGrounded) {
      p.vy = isSuperChispa ? JUMP_FORCE - 2.5 : JUMP_FORCE;
      p.isGrounded = false;
      sounds.playPopSound();
      addParticles(p.x, p.y + 20, '#cbd5e1', undefined, 4);
    }
  }, [activeBattleEnemy, hasWon, isSuperChispa]);

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) inputRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) inputRef.current.right = true;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) triggerJump();
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

  // Bucle de Física del Juego (60 FPS con requestAnimationFrame)
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      if (!activeBattleEnemy && !hasWon) {
        const p = physicsRef.current;
        const currentSpeed = isSuperChispa ? SPEED * 1.35 : SPEED;

        // 1. Movimiento Horizontal
        if (inputRef.current.left) {
          p.x = Math.max(20, p.x - currentSpeed);
          p.facingRight = false;
          p.walkCycle = (p.walkCycle + 0.25) % 4;
        } else if (inputRef.current.right) {
          p.x = Math.min(WORLD_WIDTH - 60, p.x + currentSpeed);
          p.facingRight = true;
          p.walkCycle = (p.walkCycle + 0.25) % 4;
        } else {
          p.walkCycle = 0;
        }

        // 2. Gravedad
        p.vy += GRAVITY;
        const prevY = p.y;
        p.y += p.vy;

        // 3. Golpeo a Bloques Misteriosos [?] de Mario (desde abajo con la cabeza)
        if (p.vy < 0) {
          setMysteryBlocks(prevBlocks =>
            prevBlocks.map(block => {
              if (
                !block.hit &&
                Math.abs(p.x - (block.x + 18)) < 26 &&
                prevY >= block.y + 30 &&
                p.y <= block.y + 36
              ) {
                // ¡Golpe al bloque desde abajo estilo Mario!
                sounds.playMatchSound();
                p.vy = 2; // Rebote hacia abajo
                addParticles(block.x + 18, block.y, '#f59e0b', '⭐', 8);
                setStarsCollected(s => s + 2);
                setIsSuperChispa(true);
                return { ...block, hit: true, bouncing: true };
              }
              return block;
            })
          );
        }

        // 4. Colisión con plataformas flotantes (aterrizar desde arriba)
        let onPlatform = false;
        for (const plat of platforms) {
          if (
            p.x + 22 >= plat.x &&
            p.x - 22 <= plat.x + plat.width &&
            prevY <= plat.y + 6 &&
            p.y >= plat.y &&
            p.vy >= 0
          ) {
            p.y = plat.y;
            p.vy = 0;
            p.isGrounded = true;
            onPlatform = true;
            break;
          }
        }

        // 5. Colisión con el suelo
        if (!onPlatform) {
          if (p.y >= GROUND_Y) {
            p.y = GROUND_Y;
            p.vy = 0;
            p.isGrounded = true;
          } else {
            p.isGrounded = false;
          }
        }

        // 6. Recoger monedas en el camino
        setCoinsInWorld(prevCoins => {
          let updated = false;
          const newCoins = prevCoins.map(coin => {
            if (!coin.collected && Math.abs(coin.x - p.x) < 30 && Math.abs(coin.y - (p.y - 15)) < 35) {
              sounds.playPopSound();
              setStarsCollected(s => s + 1);
              addParticles(coin.x, coin.y, '#fbbf24', '✨', 4);
              updated = true;
              return { ...coin, collected: true };
            }
            return coin;
          });
          return updated ? newCoins : prevCoins;
        });

        // 7. IA de Patrulla de Enemigos y Colisiones
        setEnemies(prevEnemies =>
          prevEnemies.map(enemy => {
            if (enemy.defeated) return enemy;

            let nextX = enemy.x + enemy.vx;
            let nextVx = enemy.vx;
            if (nextX >= enemy.endX) {
              nextX = enemy.endX;
              nextVx = -Math.abs(enemy.vx);
            } else if (nextX <= enemy.startX) {
              nextX = enemy.startX;
              nextVx = Math.abs(enemy.vx);
            }

            // Colisión Chispa vs Enemigo:
            // A) ¡Pisotón desde arriba estilo Super Mario (Stomp)!
            if (
              p.vy > 0 && // Chispa va cayendo
              Math.abs(p.x - enemy.x) < 32 &&
              p.y >= enemy.y - 20 &&
              prevY <= enemy.y
            ) {
              sounds.playMatchSound();
              p.vy = -12; // Chispa rebota alto hacia arriba
              addParticles(enemy.x, enemy.y, '#f43f5e', '💥', 8);
              setStarsCollected(s => s + 3);
              return { ...enemy, x: nextX, vx: nextVx, defeated: true, squashed: true };
            }

            // B) Encuentro lateral: Desafío de Sabiduría RPG (estilo Zelda)
            if (Math.abs(p.x - enemy.x) < 38 && Math.abs(p.y - enemy.y) < 30) {
              sounds.playWobbleSound();
              setActiveBattleEnemy(enemy);
              inputRef.current.left = false;
              inputRef.current.right = false;
            }

            return { ...enemy, x: nextX, vx: nextVx };
          })
        );

        // 8. Llegada a la Meta: Castillo Dorado de Chispa
        if (p.x >= WORLD_WIDTH - 120) {
          sounds.playVictorySound();
          setShowCelebration(true);
          setHasWon(true);
          const stars = 5;
          completeStudySession({
            sessionType: 'new',
            durationSeconds: 60,
            totalQuestions: 5,
            correctAnswers: 5,
            starsEarned: stars
          }).catch(() => {});
          if (onStarsEarned) onStarsEarned(stars);
        }

        // Actualizar renderizado y cámara suave centrada en Chispa
        setRenderPos({
          x: p.x,
          y: p.y,
          isGrounded: p.isGrounded,
          facingRight: p.facingRight
        });
        setWalkFrame(Math.floor(p.walkCycle));

        const targetCamX = Math.max(0, Math.min(WORLD_WIDTH - 580, p.x - 220));
        setCameraX(prev => prev + (targetCamX - prev) * 0.12);
      }

      // Actualizar partículas
      setParticles(prev =>
        prev
          .map(pt => ({
            ...pt,
            x: pt.x + pt.vx,
            y: pt.y + pt.vy,
            vy: pt.vy + 0.3,
            life: pt.life - 1
          }))
          .filter(pt => pt.life > 0)
      );

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeBattleEnemy, hasWon, isSuperChispa, onStarsEarned]);

  // Lanzar Hechizo Mágico en Batalla RPG (Zelda)
  const handleCastSpell = (option: string) => {
    if (!activeBattleEnemy) return;

    if (option === activeBattleEnemy.question.correctAnswer) {
      sounds.playMatchSound();
      setSpellCastAnimation(true);
      setBattleFeedback(`¡Poder Desatado! ⚡ ${activeBattleEnemy.question.explanation}`);
      addParticles(activeBattleEnemy.x, activeBattleEnemy.y, '#a855f7', '⚡', 10);

      setTimeout(() => {
        setEnemies(prev =>
          prev.map(e => (e.id === activeBattleEnemy.id ? { ...e, defeated: true } : e))
        );
        setStarsCollected(s => s + 3);
        setSpellCastAnimation(false);
        setActiveBattleEnemy(null);
        setBattleFeedback(null);
        // Avanzar a Chispa para pasar de largo
        physicsRef.current.x += 70;
      }, 1200);
    } else {
      sounds.playWobbleSound();
      setBattleFeedback(`¡El enemigo resiste con su escudo! Recuerda el concepto y prueba otro poder.`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 animate-fade-in space-y-3 select-none">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra Superior */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>

          {/* Selector de Personaje en el Juego */}
          <button
            onClick={() => setIsCharModalOpen(true)}
            title="Cambiar tu personaje jugable"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-magic-50 border-2 border-magic-200 text-slate-800 font-black text-xs active:scale-95 shadow-sm transition-all"
          >
            <span className="text-base">{hero.emoji}</span>
            <span className="hidden sm:inline">{hero.name}</span>
          </button>
        </div>

        {/* Monedas y Estado Super Chispa */}
        <div className="flex items-center gap-2">
          {isSuperChispa && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-rose-500 text-white px-3 py-1 rounded-2xl font-black text-xs animate-pulse shadow-md">
              <Flame className="w-3.5 h-3.5 fill-amber-200" />
              <span>SUPER CHISPA</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-2xl font-black text-amber-950 text-xs sm:text-sm shadow-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-spin-slow" />
            <span>{starsCollected} Gemas</span>
          </div>

          <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-2xl font-black text-purple-900 text-xs">
            <Shield className="w-4 h-4 text-purple-600" />
            <span>{enemies.filter(e => e.defeated).length}/{enemies.length} Vencidos</span>
          </div>
        </div>

        <button
          onClick={initGame}
          title="Reiniciar aventura con nuevas preguntas"
          className="p-2.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold active:scale-95 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* MUNDO 2D VIVO Y AUTÉNTICO (ESTILO SUPER MARIO BROS + ZELDA) */}
      <div className="relative bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 rounded-4xl p-0 shadow-2xl border-4 border-magic-400 overflow-hidden mx-auto h-[330px] w-full max-w-[660px] touch-none">
        {/* Parallax de Fondo: Sol giratorio y Nubes */}
        <div
          style={{ transform: `translateX(${-cameraX * 0.22}px)` }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-4 left-24 w-16 h-16 rounded-full bg-amber-300 shadow-2xl flex items-center justify-center animate-spin-slow opacity-90 border-4 border-amber-200">
            ☀️
          </div>
          <div className="absolute top-6 left-80 text-4xl opacity-80 animate-pulse">☁️</div>
          <div className="absolute top-12 left-340 text-3xl opacity-75">☁️</div>
          <div className="absolute top-8 left-720 text-5xl opacity-80">☁️</div>
          <div className="absolute top-14 left-1100 text-4xl opacity-70">☁️</div>
          <div className="absolute top-6 left-1500 text-5xl opacity-85">☁️</div>

          <div className="absolute bottom-20 left-60 text-7xl opacity-30">⛰️</div>
          <div className="absolute bottom-20 left-600 text-8xl opacity-35">🏔️</div>
          <div className="absolute bottom-20 left-1200 text-7xl opacity-30">⛰️</div>
        </div>

        {/* Capa de Juego en Scroller */}
        <div
          style={{ transform: `translateX(${-cameraX}px)` }}
          className="absolute inset-0 will-change-transform"
        >
          {/* Suelo decorado de hierba y roca */}
          <div
            style={{ top: GROUND_Y + 36 }}
            className="absolute left-0 w-[1900px] h-24 bg-gradient-to-b from-emerald-600 via-emerald-700 to-amber-950 border-t-6 border-emerald-400 shadow-inner"
          >
            <div className="absolute -top-4 left-40 text-base animate-bounce">🌸</div>
            <div className="absolute -top-4 left-180 text-base">🌼</div>
            <div className="absolute -top-4 left-380 text-base">🌷</div>
            <div className="absolute -top-4 left-720 text-base animate-pulse">🌻</div>
            <div className="absolute -top-4 left-1050 text-base">🌸</div>
            <div className="absolute -top-4 left-1400 text-base">🌼</div>
            <div className="absolute -top-4 left-1720 text-base">🌷</div>
          </div>

          {/* Bloques Misteriosos [?] de Mario (¡Golpéalos por abajo para sacar estrellas!) */}
          {mysteryBlocks.map(block => (
            <div
              key={block.id}
              style={{
                left: block.x,
                top: block.y + 36,
                transform: block.bouncing ? 'translateY(-10px)' : 'translateY(0)'
              }}
              className={`absolute w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border-2 shadow-lg transition-transform ${
                block.hit
                  ? 'bg-amber-800 border-amber-900 text-amber-500'
                  : 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-yellow-200 text-amber-950 animate-pulse'
              }`}
            >
              {block.hit ? '•' : '?'}
            </div>
          ))}

          {/* Plataformas Flotantes (Ladrillos o Césped) */}
          {platforms.map(plat => (
            <div
              key={plat.id}
              style={{
                left: plat.x,
                top: plat.y + 36,
                width: plat.width
              }}
              className={`absolute h-6 rounded-xl shadow-lg flex items-center justify-around px-2 border-t-4 ${
                plat.type === 'brick'
                  ? 'bg-gradient-to-b from-amber-700 to-stone-900 border-amber-500 text-amber-200'
                  : plat.type === 'cloud'
                  ? 'bg-gradient-to-b from-white to-sky-100 border-sky-300 text-sky-400'
                  : 'bg-gradient-to-b from-emerald-500 via-amber-800 to-amber-950 border-emerald-300 text-amber-100'
              }`}
            >
              <span className="text-[10px]">🧱</span>
              <span className="text-[9px] font-black">{plat.type === 'cloud' ? '☁️' : '🌿'}</span>
              <span className="text-[10px]">🧱</span>
            </div>
          ))}

          {/* Monedas y Gemas Doradas Flotantes */}
          {coinsInWorld.map(c =>
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

          {/* Partículas animadas (chispas, estrellas, polvo) */}
          {particles.map(pt => (
            <div
              key={pt.id}
              style={{ left: pt.x, top: pt.y }}
              className="absolute text-xs pointer-events-none drop-shadow"
            >
              {pt.emoji || '✨'}
            </div>
          ))}

          {/* Enemigos Patrulleros: Puedes APLASTARLOS saltando encima o retarlos en duelo */}
          {enemies.map(enemy => (
            <div
              key={enemy.id}
              style={{ left: enemy.x, top: enemy.y }}
              className="absolute flex flex-col items-center pointer-events-none"
            >
              {enemy.defeated ? (
                <div className="flex flex-col items-center animate-fade-out opacity-40">
                  <span className="text-xl">✨</span>
                  <span className="text-[9px] font-bold text-slate-500">
                    {enemy.squashed ? '¡Aplastado!' : '¡Derrotado!'}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center animate-bounce">
                  <div className="absolute -inset-2 bg-rose-500/20 rounded-full blur-sm animate-ping" />
                  <span className="text-[9px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-md mb-0.5 whitespace-nowrap border border-rose-300">
                    {enemy.name}
                  </span>
                  <span className="text-3xl drop-shadow-xl">{enemy.emoji}</span>
                </div>
              )}
            </div>
          ))}

          {/* Meta Final: El Gran Castillo Dorado con Bandera de Mario */}
          <div
            style={{ left: WORLD_WIDTH - 130, top: GROUND_Y - 70 }}
            className="absolute flex flex-col items-center animate-pulse"
          >
            <span className="text-[11px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 px-3 py-0.5 rounded-full shadow-lg mb-1 border border-amber-200">
              ¡Castillo Dorado! 👑
            </span>
            <span className="text-6xl drop-shadow-2xl">🏰</span>
          </div>

          {/* Sombra en el suelo de Chispa */}
          <div
            style={{
              left: renderPos.x + 8,
              top: GROUND_Y + 30,
              transform: `scale(${renderPos.isGrounded ? 1 : 0.6})`,
              opacity: renderPos.isGrounded ? 0.35 : 0.15
            }}
            className="absolute w-8 h-2.5 bg-black rounded-full transition-transform duration-100 pointer-events-none"
          />

          {/* Personaje: Chispa con animaciones ricas */}
          <div
            style={{
              left: renderPos.x,
              top: renderPos.y - 12,
              transform: `scaleX(${renderPos.facingRight ? 1 : -1})`
            }}
            className="absolute flex flex-col items-center will-change-transform"
          >
            {/* Aura Super Chispa */}
            {isSuperChispa && (
              <div className="absolute -inset-2 bg-amber-400/40 rounded-full blur-md animate-ping" />
            )}

            {/* Efecto de Hechizo Mágico */}
            {spellCastAnimation && (
              <div className="absolute -top-10 -right-8 text-3xl animate-ping text-amber-300 drop-shadow-lg z-30">
                ⚡✨
              </div>
            )}

            <div
              className={`relative flex items-center justify-center transition-transform ${
                !renderPos.isGrounded
                  ? '-rotate-6 scale-110'
                  : walkFrame % 2 === 1
                  ? 'translate-y-[-3px]'
                  : 'translate-y-0'
              }`}
            >
              <div className="relative text-4xl drop-shadow-xl select-none">
                {hero.emoji}
              </div>
              <div className="absolute -right-2 top-1 text-sm animate-pulse">
                {isSuperChispa ? '🔥' : '🪄'}
              </div>
            </div>

            {renderPos.isGrounded && walkFrame > 0 && (
              <span className="absolute -bottom-2 -left-2 text-[10px] opacity-70 animate-ping">
                💨
              </span>
            )}
          </div>
        </div>

        {/* Guía didáctica al inicio */}
        {renderPos.x < 150 && (
          <div className="absolute bottom-14 left-4 bg-white/95 text-slate-800 px-3 py-1.5 rounded-2xl text-xs font-black shadow-lg border border-magic-300 animate-bounce">
            👉 ¡Golpea los bloques [?] por abajo y salta sobre los enemigos!
          </div>
        )}
      </div>

      {/* PANTALLA DE BATALLA RPG (Estilo Zelda: Duelo de Sabiduría Dinámico) */}
      {activeBattleEnemy && (
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 rounded-3xl p-4 sm:p-5 border-4 border-amber-400 shadow-2xl text-white space-y-3.5 animate-scale-up text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-4xl animate-bounce">{activeBattleEnemy.emoji}</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  Duelo Mágico • {activeBattleEnemy.question.topic}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  ¡{activeBattleEnemy.name} te bloquea el paso!
                </h3>
              </div>
            </div>

            <SpeechButton text={activeBattleEnemy.question.question} size="sm" />
          </div>

          <p className="text-sm sm:text-base font-bold text-amber-100 bg-white/10 p-3 rounded-2xl border border-white/15">
            «{activeBattleEnemy.question.question}»
          </p>

          <div className="space-y-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Elige tu poder para vencerlo:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activeBattleEnemy.question.options.map((opt, idx) => (
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

      {/* CONTROLES TÁCTILES GIGANTES PARA IPAD */}
      {!activeBattleEnemy && !hasWon && (
        <div className="flex items-center justify-between px-3 pt-2 max-w-xl mx-auto">
          {/* Pad Izquierda / Derecha */}
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

          {/* Botón de Salto Gigante */}
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
              Has alcanzado el Castillo Dorado superando todas las plataformas y guardianes. ¡Chispa te premia con 5 Estrellas Mágicas!
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
              <span>Jugar de nuevo (Nivel con nuevas preguntas)</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Selección de Personaje */}
      <CharacterSelectorModal
        isOpen={isCharModalOpen}
        onClose={() => setIsCharModalOpen(false)}
        onSelectCharacter={setHero}
      />
    </div>
  );
};
