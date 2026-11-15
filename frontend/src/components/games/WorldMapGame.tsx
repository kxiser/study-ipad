import React, { useState } from 'react';
import { ArrowLeft, Globe2, Compass, Sparkles, Star, Trophy, HelpCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { Mascot } from '../Mascot.js';
import { completeStudySession } from '../../services/api.js';

export interface MapRegion {
  id: string;
  name: string;
  type: 'continent' | 'ocean' | 'country';
  emoji: string;
  color: string;
  hoverColor: string;
  labelX: number;
  labelY: number;
  facts: string;
  curiosity: string;
  path: string;
}

const MAP_REGIONS: MapRegion[] = [
  // ================= CONTINENTES =================
  {
    id: 'europa',
    name: 'Europa',
    type: 'continent',
    emoji: '🏰',
    color: '#10b981', // Verde esmeralda
    hoverColor: '#059669',
    labelX: 520,
    labelY: 140,
    facts: 'Continente donde vivimos nosotros (incluye a España).',
    curiosity: '¡Tiene países llenos de historia como España, Francia e Italia! Está separado de América por el Océano Atlántico.',
    path: 'M 470,110 L 530,95 L 565,115 L 560,165 L 525,175 L 495,185 L 475,175 L 465,145 Z'
  },
  {
    id: 'africa',
    name: 'África',
    type: 'continent',
    emoji: '🦁',
    color: '#eab308', // Amarillo cálido
    hoverColor: '#ca8a04',
    labelX: 525,
    labelY: 275,
    facts: 'Gran continente situado al sur de Europa.',
    curiosity: '¡Hogar de la sabana, leones, jirafas, el río Nilo y el gran desierto del Sáhara!',
    path: 'M 480,195 L 555,185 L 575,230 L 585,280 L 550,370 L 510,380 L 475,290 L 465,225 Z'
  },
  {
    id: 'asia',
    name: 'Asia',
    type: 'continent',
    emoji: '🏮',
    color: '#8b5cf6', // Violeta mágico
    hoverColor: '#7c3aed',
    labelX: 710,
    labelY: 150,
    facts: 'El continente más grande y poblado de la Tierra.',
    curiosity: 'Aquí se encuentra la montaña más alta del planeta, el Monte Everest, y países como China y Japón.',
    path: 'M 565,95 L 675,70 L 810,90 L 830,160 L 780,230 L 710,240 L 640,215 L 575,160 Z'
  },
  {
    id: 'america-norte',
    name: 'América del Norte',
    type: 'continent',
    emoji: '🦅',
    color: '#f97316', // Naranja brillante
    hoverColor: '#ea580c',
    labelX: 230,
    labelY: 140,
    facts: 'Parte norte del gran continente americano.',
    curiosity: 'Tiene grandes bosques y lagos. Aquí se encuentran México, Estados Unidos y Canadá.',
    path: 'M 130,80 L 250,65 L 320,105 L 290,170 L 245,210 L 210,180 L 160,150 L 125,115 Z'
  },
  {
    id: 'america-sur',
    name: 'América del Sur',
    type: 'continent',
    emoji: '🦜',
    color: '#f43f5e', // Rosa fuego / carmesí
    hoverColor: '#e11d48',
    labelX: 335,
    labelY: 330,
    facts: 'Parte sur del continente americano.',
    curiosity: '¡Aquí está la selva del Amazonas, la más grande del mundo, y la cordillera de los Andes!',
    path: 'M 285,230 L 370,260 L 395,310 L 360,420 L 325,435 L 300,340 L 275,255 Z'
  },
  {
    id: 'oceania',
    name: 'Oceanía',
    type: 'continent',
    emoji: '🦘',
    color: '#ec4899', // Rosa vibrante
    hoverColor: '#db2777',
    labelX: 810,
    labelY: 345,
    facts: 'Continente formado por Australia e islas del Pacífico.',
    curiosity: '¡Es la tierra de los canguros y los koalas, rodeada por aguas cristalinas y corales!',
    path: 'M 745,315 L 850,305 L 870,365 L 825,395 L 755,375 Z'
  },
  {
    id: 'antartida',
    name: 'Antártida',
    type: 'continent',
    emoji: '🐧',
    color: '#bae6fd', // Glacial hielo
    hoverColor: '#7dd3fc',
    labelX: 500,
    labelY: 485,
    facts: 'El continente blanco situado en el Polo Sur.',
    curiosity: '¡Está casi completamente cubierto de hielo y es el lugar más frío de la Tierra! Aquí viven los pingüinos.',
    path: 'M 120,470 L 350,460 L 650,460 L 880,470 L 840,515 L 500,525 L 160,515 Z'
  },

  // ================= OCÉANOS =================
  {
    id: 'atlantico',
    name: 'Océano Atlántico',
    type: 'ocean',
    emoji: '🌊',
    color: '#0284c7', // Azul marino atlántico
    hoverColor: '#0369a1',
    labelX: 425,
    labelY: 250,
    facts: 'Gran océano que separa Europa y África de América.',
    curiosity: '¡Es el segundo océano más grande! Los aviones y barcos lo cruzan para viajar de Europa a América.',
    path: 'M 380,120 L 460,120 L 460,370 L 380,370 Z'
  },
  {
    id: 'pacifico-oeste',
    name: 'Océano Pacífico',
    type: 'ocean',
    emoji: '🐋',
    color: '#0369a1',
    hoverColor: '#075985',
    labelX: 95,
    labelY: 260,
    facts: 'El océano más grande y profundo de todo el planeta Tierra.',
    curiosity: '¡Cubre más espacio que todos los continentes juntos! En él nadan ballenas gigantes y delfines.',
    path: 'M 20,90 L 110,90 L 110,430 L 20,430 Z'
  },
  {
    id: 'pacifico-este',
    name: 'Océano Pacífico',
    type: 'ocean',
    emoji: '🐋',
    color: '#0369a1',
    hoverColor: '#075985',
    labelX: 910,
    labelY: 250,
    facts: 'El océano más grande y profundo del planeta.',
    curiosity: '¡Da la vuelta al globo terráqueo uniendo Asia y Oceanía con América!',
    path: 'M 880,90 L 980,90 L 980,430 L 880,430 Z'
  },
  {
    id: 'indico',
    name: 'Océano Índico',
    type: 'ocean',
    emoji: '🐬',
    color: '#0284c7',
    hoverColor: '#0369a1',
    labelX: 665,
    labelY: 330,
    facts: 'Océano de aguas cálidas situado entre África, Asia y Oceanía.',
    curiosity: 'Es famoso por sus aguas templadas donde habitan tortugas marinas y corales tropicales.',
    path: 'M 605,255 L 725,255 L 725,410 L 605,410 Z'
  },
  {
    id: 'artico',
    name: 'Glacial Ártico',
    type: 'ocean',
    emoji: '🐻‍❄️',
    color: '#38bdf8',
    hoverColor: '#0ea5e9',
    labelX: 500,
    labelY: 45,
    facts: 'Océano helado situado en el Polo Norte.',
    curiosity: 'Muchos de sus tramos están cubiertos por gruesas capas de hielo sobre las que caminan los osos polares.',
    path: 'M 350,20 L 650,20 L 650,65 L 350,65 Z'
  }
];

interface WorldMapGameProps {
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

interface Mission {
  targetId: string;
  prompt: string;
  hint: string;
}

const QUIZ_MISSIONS: Mission[] = [
  {
    targetId: 'atlantico',
    prompt: '¡Encuentra el Océano Atlántico! (El que separa Europa de América)',
    hint: 'Busca la gran masa de agua azul en medio, entre América y Europa.'
  },
  {
    targetId: 'europa',
    prompt: '¿En qué continente vivimos nosotros? (¡Donde está España!)',
    hint: 'Busca el continente verde en el centro-norte, encima de África.'
  },
  {
    targetId: 'antartida',
    prompt: 'Toca el continente cubierto de hielo en el Polo Sur.',
    hint: 'Está en la parte más baja de todo el mapa y es de color blanco hielo.'
  },
  {
    targetId: 'africa',
    prompt: 'Toca el continente de África, famoso por sus leones y el río Nilo.',
    hint: 'Es el continente amarillo en el centro, justo debajo de Europa.'
  },
  {
    targetId: 'america-sur',
    prompt: '¿Dónde está América del Sur, donde se encuentra la gran selva del Amazonas?',
    hint: 'Está en el lado izquierdo del mapa, en la parte sur de América.'
  },
  {
    targetId: 'oceania',
    prompt: 'Toca el continente de Oceanía, la tierra de los canguros y koalas.',
    hint: 'Busca abajo a la derecha, cerca del Océano Índico y Pacífico.'
  },
  {
    targetId: 'asia',
    prompt: 'Toca Asia, el continente más grande de todo el planeta.',
    hint: 'Es el gigante de color violeta a la derecha de Europa.'
  }
];

export const WorldMapGame: React.FC<WorldMapGameProps> = ({ onBack, onStarsEarned }) => {
  const [selectedRegion, setSelectedRegion] = useState<MapRegion | null>(MAP_REGIONS[0]);
  const [gameMode, setGameMode] = useState<'explore' | 'quiz'>('explore');
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentMission = QUIZ_MISSIONS[quizIndex];

  const handleRegionClick = (region: MapRegion) => {
    setSelectedRegion(region);

    if (gameMode === 'explore') {
      sounds.playPopSound();
    } else {
      // Modo Quiz Misión
      const isCorrect =
        region.id === currentMission.targetId ||
        (currentMission.targetId === 'pacifico-oeste' && region.id === 'pacifico-este') ||
        (currentMission.targetId === 'atlantico' && region.name.includes('Atlántico'));

      if (isCorrect) {
        sounds.playMatchSound();
        setScore(s => s + 1);
        setQuizFeedback(`¡Correcto! ✨ Has encontrado ${region.name}.`);

        setTimeout(() => {
          if (quizIndex + 1 >= QUIZ_MISSIONS.length) {
            sounds.playVictorySound();
            setShowCelebration(true);
            setIsGameOver(true);
            const stars = 5;
            completeStudySession({
              sessionType: 'review',
              durationSeconds: 45,
              totalQuestions: QUIZ_MISSIONS.length,
              correctAnswers: QUIZ_MISSIONS.length,
              starsEarned: stars
            }).catch(() => {});
            if (onStarsEarned) onStarsEarned(stars);
          } else {
            setQuizIndex(i => i + 1);
            setQuizFeedback(null);
          }
        }, 1200);
      } else {
        sounds.playWobbleSound();
        setQuizFeedback(`¡Casi! Has tocado "${region.name}". ${currentMission.hint}`);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 animate-fade-in space-y-4">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra Superior de Controles */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a Juegos</span>
        </button>

        {/* Selector de Modo: Explorar vs Reto */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              setGameMode('explore');
              setQuizFeedback(null);
              sounds.playPopSound();
            }}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              gameMode === 'explore'
                ? 'bg-magic-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explorar Mapa</span>
          </button>

          <button
            onClick={() => {
              setGameMode('quiz');
              setQuizIndex(0);
              setScore(0);
              setIsGameOver(false);
              setQuizFeedback(null);
              sounds.playPopSound();
            }}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              gameMode === 'quiz'
                ? 'bg-sunny-500 text-amber-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Reto Explorador ⭐</span>
          </button>
        </div>
      </div>

      {/* Banner de Misión (Si estamos en modo Quiz) */}
      {gameMode === 'quiz' && !isGameOver && (
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-4 text-white shadow-md border-2 border-amber-300 flex items-center justify-between gap-4 animate-scale-up">
          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl">🧭</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase bg-black/20 px-2.5 py-0.5 rounded-full">
                  Misión {quizIndex + 1} de {QUIZ_MISSIONS.length}
                </span>
                <span className="text-xs font-bold text-amber-100">Aciertos: {score}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black mt-0.5 drop-shadow-sm">
                {currentMission.prompt}
              </h3>
              {quizFeedback && (
                <p className="text-xs sm:text-sm font-bold text-amber-100 mt-1 bg-black/25 px-2.5 py-1 rounded-xl inline-block">
                  {quizFeedback}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 hidden sm:block">
            <SpeechButton text={currentMission.prompt} size="md" />
          </div>
        </div>
      )}

      {/* Contenedor del Mapa Interactivo SVG */}
      <div className="relative bg-gradient-to-b from-sky-400 via-sky-500 to-blue-600 rounded-4xl p-3 sm:p-5 shadow-2xl border-4 border-sky-300 overflow-hidden select-none">
        {/* Decoración de Olas y Rosa de los Vientos */}
        <div className="absolute top-4 left-4 pointer-events-none opacity-40">
          <Compass className="w-16 h-16 text-white animate-spin-slow" />
        </div>

        {/* SVG con proyección cartográfica interactiva */}
        <svg
          viewBox="0 0 1000 530"
          className="w-full h-auto max-h-[500px] drop-shadow-md block"
        >
          {/* Fondo oceánico */}
          <rect width="1000" height="530" fill="transparent" />

          {/* Océano Ártico (Polar Superior) */}
          <g
            onClick={() => handleRegionClick(MAP_REGIONS.find(r => r.id === 'artico')!)}
            className="cursor-pointer group"
          >
            <rect x="250" y="10" width="500" height="60" rx="20" fill="#38bdf8" fillOpacity="0.4" className="group-hover:fillOpacity-70 transition-all" />
            <text x="500" y="45" fill="#FFFFFF" fontSize="16" fontWeight="900" textAnchor="middle">
              ❄️ Océano Glacial Ártico
            </text>
          </g>

          {/* Océano Pacífico (Lado Oeste) */}
          <g
            onClick={() => handleRegionClick(MAP_REGIONS.find(r => r.id === 'pacifico-oeste')!)}
            className="cursor-pointer group"
          >
            <rect x="15" y="80" width="130" height="360" rx="25" fill="#0369a1" fillOpacity="0.35" className="group-hover:fillOpacity-60 transition-all" />
            <text x="80" y="270" fill="#FFFFFF" fontSize="15" fontWeight="900" textAnchor="middle" transform="rotate(-90 80 270)">
              🐋 Océano Pacífico
            </text>
          </g>

          {/* Océano Pacífico (Lado Este) */}
          <g
            onClick={() => handleRegionClick(MAP_REGIONS.find(r => r.id === 'pacifico-este')!)}
            className="cursor-pointer group"
          >
            <rect x="855" y="80" width="130" height="360" rx="25" fill="#0369a1" fillOpacity="0.35" className="group-hover:fillOpacity-60 transition-all" />
            <text x="920" y="270" fill="#FFFFFF" fontSize="15" fontWeight="900" textAnchor="middle" transform="rotate(90 920 270)">
              🐋 Océano Pacífico
            </text>
          </g>

          {/* Océano Atlántico (Centro) */}
          <g
            onClick={() => handleRegionClick(MAP_REGIONS.find(r => r.id === 'atlantico')!)}
            className="cursor-pointer group"
          >
            <rect
              x="370"
              y="120"
              width="100"
              height="300"
              rx="30"
              fill={selectedRegion?.id === 'atlantico' ? '#0284c7' : '#0369a1'}
              fillOpacity={selectedRegion?.id === 'atlantico' ? '0.8' : '0.4'}
              stroke="#FFFFFF"
              strokeWidth={selectedRegion?.id === 'atlantico' ? '3' : '1'}
              className="group-hover:fill-sky-600 transition-all"
            />
            <text x="420" y="270" fill="#FFFFFF" fontSize="16" fontWeight="900" textAnchor="middle" transform="rotate(-75 420 270)">
              🌊 Océano Atlántico
            </text>
          </g>

          {/* Océano Índico (Sur de Asia) */}
          <g
            onClick={() => handleRegionClick(MAP_REGIONS.find(r => r.id === 'indico')!)}
            className="cursor-pointer group"
          >
            <rect
              x="600"
              y="250"
              width="135"
              height="180"
              rx="30"
              fill={selectedRegion?.id === 'indico' ? '#0284c7' : '#0369a1'}
              fillOpacity={selectedRegion?.id === 'indico' ? '0.8' : '0.4'}
              stroke="#FFFFFF"
              strokeWidth={selectedRegion?.id === 'indico' ? '3' : '1'}
              className="group-hover:fill-sky-600 transition-all"
            />
            <text x="665" y="340" fill="#FFFFFF" fontSize="16" fontWeight="900" textAnchor="middle">
              🐬 Océano Índico
            </text>
          </g>

          {/* Océano Antártico (Franja Sur) */}
          <g
            onClick={() => handleRegionClick(MAP_REGIONS.find(r => r.id === 'antartida')!)}
            className="cursor-pointer group"
          >
            <text x="500" y="445" fill="#FFFFFF" fontSize="14" fontWeight="800" textAnchor="middle" fillOpacity="0.8">
              🧊 Océano Glacial Antártico
            </text>
          </g>

          {/* POLÍGONOS DE CONTINENTES */}
          {MAP_REGIONS.filter(r => r.type === 'continent').map(reg => {
            const isSelected = selectedRegion?.id === reg.id;
            return (
              <g
                key={reg.id}
                onClick={() => handleRegionClick(reg)}
                className="cursor-pointer transition-transform duration-200 group"
              >
                <path
                  d={reg.path}
                  fill={isSelected ? reg.hoverColor : reg.color}
                  stroke={isSelected ? '#FBBF24' : '#FFFFFF'}
                  strokeWidth={isSelected ? '5' : '3'}
                  strokeLinejoin="round"
                  className="filter drop-shadow group-hover:scale-102 transition-all"
                />

                {/* Etiqueta visible en el continente */}
                <g pointerEvents="none">
                  <rect
                    x={reg.labelX - 60}
                    y={reg.labelY - 14}
                    width="120"
                    height="28"
                    rx="14"
                    fill="#FFFFFF"
                    fillOpacity="0.92"
                    stroke={reg.color}
                    strokeWidth="2"
                  />
                  <text
                    x={reg.labelX}
                    y={reg.labelY + 5}
                    fill="#0f172a"
                    fontSize="12"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    {reg.emoji} {reg.name}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Detalle especial: España en Europa */}
          <g pointerEvents="none">
            <circle cx="482" cy="172" r="6" fill="#facc15" stroke="#ef4444" strokeWidth="2" />
            <text x="482" y="195" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle" stroke="#000000" strokeWidth="0.5">
              ⭐ España
            </text>
          </g>
        </svg>
      </div>

      {/* Tarjeta de Información Detallada del Lugar Seleccionado */}
      {selectedRegion && (
        <div className="bg-white rounded-3xl p-5 border-3 border-magic-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 text-left animate-scale-up">
          <div className="flex items-start gap-4">
            <div
              style={{ backgroundColor: selectedRegion.color }}
              className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-md text-white shrink-0"
            >
              {selectedRegion.emoji}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  {selectedRegion.type === 'continent' ? 'Continente de la Tierra' : 'Océano del Planeta'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedRegion.name}
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-600">
                {selectedRegion.facts}
              </p>
              <p className="text-xs sm:text-sm text-magic-700 font-semibold bg-magic-50 p-2.5 rounded-2xl border border-magic-100 mt-2">
                💡 <strong>Dato Mágico:</strong> {selectedRegion.curiosity}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <SpeechButton
              text={`${selectedRegion.name}. ${selectedRegion.facts} ${selectedRegion.curiosity}`}
              size="lg"
            />
          </div>
        </div>
      )}

      {/* Modal de Victoria del Reto */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-4xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-4 border-amber-300">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-slate-800">¡Gran Exploradora!</h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              Has localizado todos los continentes y océanos del planeta Tierra a la perfección. ¡Te has ganado 5 Estrellas Mágicas!
            </p>

            <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-xl py-2">
              <Star className="w-7 h-7 fill-amber-400" />
              <span>+5 Estrellas Mágicas</span>
            </div>

            <button
              onClick={() => {
                setIsGameOver(false);
                setShowCelebration(false);
                setGameMode('explore');
              }}
              className="w-full py-3.5 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-sm active:scale-95 transition-all shadow-md shadow-magic-200"
            >
              Seguir explorando el mapa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
