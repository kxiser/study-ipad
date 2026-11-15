import React, { useState } from 'react';
import { ArrowLeft, Globe2, Compass, Sparkles, Star, Trophy, Speech, CheckCircle2, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { Mascot } from '../Mascot.js';
import { completeStudySession } from '../../services/api.js';
import { CONTINENT_PATHS } from './worldMapData.js';

export interface InfoItem {
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
}

export const CONTINENTS_INFO: Record<string, InfoItem> = {
  'europa': {
    id: 'europa',
    name: 'Europa',
    type: 'continent',
    emoji: '🏰',
    color: '#10b981', // Verde esmeralda
    hoverColor: '#059669',
    labelX: 520,
    labelY: 145,
    facts: 'El continente donde vivimos nosotros (¡donde está España!).',
    curiosity: 'Tiene países llenos de castillos e historia como España, Francia e Italia. Está separado de América por el Océano Atlántico.'
  },
  'africa': {
    id: 'africa',
    name: 'África',
    type: 'continent',
    emoji: '🦁',
    color: '#eab308', // Amarillo oro
    hoverColor: '#ca8a04',
    labelX: 525,
    labelY: 340,
    facts: 'Gran continente situado al sur de Europa.',
    curiosity: '¡Hogar de la gran sabana, leones, jirafas, elefantes, el río Nilo y el desierto del Sáhara!'
  },
  'asia': {
    id: 'asia',
    name: 'Asia',
    type: 'continent',
    emoji: '🏮',
    color: '#8b5cf6', // Violeta mágico
    hoverColor: '#7c3aed',
    labelX: 710,
    labelY: 200,
    facts: 'El continente más grande y con más personas de la Tierra.',
    curiosity: 'Aquí está la montaña más alta del mundo: el Monte Everest, y países como China, Japón e India.'
  },
  'america-norte': {
    id: 'america-norte',
    name: 'América del Norte',
    type: 'continent',
    emoji: '🦅',
    color: '#f97316', // Naranja atardecer
    hoverColor: '#ea580c',
    labelX: 200,
    labelY: 170,
    facts: 'Parte norte del gran continente americano.',
    curiosity: 'Tiene inmensos bosques de pinos, lagos gigantes y montañas rocosas. Aquí están México, EE.UU. y Canadá.'
  },
  'america-sur': {
    id: 'america-sur',
    name: 'América del Sur',
    type: 'continent',
    emoji: '🦜',
    color: '#f43f5e', // Rosa fuego
    hoverColor: '#e11d48',
    labelX: 320,
    labelY: 410,
    facts: 'Parte sur del continente americano.',
    curiosity: '¡Aquí se encuentra la selva del Amazonas, la más grande del mundo, y la gran cordillera de los Andes!'
  },
  'oceania': {
    id: 'oceania',
    name: 'Oceanía',
    type: 'continent',
    emoji: '🦘',
    color: '#ec4899', // Rosa coral
    hoverColor: '#db2777',
    labelX: 825,
    labelY: 440,
    facts: 'Continente formado por Australia y muchas islas del Pacífico.',
    curiosity: '¡Es la tierra de los canguros y los koalas, rodeada por aguas cálidas y la Gran Barrera de Coral!'
  },
  'antartida': {
    id: 'antartida',
    name: 'Antártida',
    type: 'continent',
    emoji: '🐧',
    color: '#93c5fd', // Glacial hielo
    hoverColor: '#60a5fa',
    labelX: 475,
    labelY: 575,
    facts: 'El continente de hielo situado en el Polo Sur.',
    curiosity: '¡Está casi todo cubierto por una gruesa capa de nieve y hielo! Es el lugar más frío de la Tierra y hogar de los pingüinos.'
  }
};

export const OCEANS_INFO: Record<string, InfoItem> = {
  'atlantico': {
    id: 'atlantico',
    name: 'Océano Atlántico',
    type: 'ocean',
    emoji: '🌊',
    color: '#0284c7',
    hoverColor: '#0369a1',
    labelX: 405,
    labelY: 290,
    facts: 'Gran océano que separa Europa y África de América.',
    curiosity: '¡Es el océano que cruzan los barcos y aviones para ir de España a América! Es de agua salada y el 2.º más grande.'
  },
  'pacifico': {
    id: 'pacifico',
    name: 'Océano Pacífico',
    type: 'ocean',
    emoji: '🐋',
    color: '#0369a1',
    hoverColor: '#075985',
    labelX: 80,
    labelY: 330,
    facts: 'El océano más grande y profundo de todo el planeta Tierra.',
    curiosity: '¡Cubre más de un tercio de todo nuestro planeta! En él nadan las ballenas azules gigantes.'
  },
  'indico': {
    id: 'indico',
    name: 'Océano Índico',
    type: 'ocean',
    emoji: '🐬',
    color: '#0284c7',
    hoverColor: '#0369a1',
    labelX: 680,
    labelY: 410,
    facts: 'Océano cálido situado entre África, Asia y Oceanía.',
    curiosity: 'Sus aguas son muy templadas y en sus arrecifes viven tortugas marinas y cientos de peces de colores.'
  },
  'artico': {
    id: 'artico',
    name: 'Glacial Ártico',
    type: 'ocean',
    emoji: '🐻‍❄️',
    color: '#38bdf8',
    hoverColor: '#0ea5e9',
    labelX: 475,
    labelY: 55,
    facts: 'Océano helado situado en el Polo Norte.',
    curiosity: 'Está cubierto por bloques de hielo flotante donde viven los osos polares y las focas árticas.'
  },
  'antartico': {
    id: 'antartico',
    name: 'Glacial Antártico',
    type: 'ocean',
    emoji: '🧊',
    color: '#0284c7',
    hoverColor: '#0369a1',
    labelX: 475,
    labelY: 520,
    facts: 'Océano muy frío que rodea completamente la Antártida.',
    curiosity: 'Sus aguas frías están llenas de krill diminuto del que se alimentan las ballenas y los pingüinos.'
  }
};

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
    targetId: 'europa',
    prompt: '¿En qué continente vivimos nosotros? (¡Donde está España ⭐!)',
    hint: 'Busca el continente verde en el centro-norte, encima de África.'
  },
  {
    targetId: 'africa',
    prompt: 'Toca el continente de África, famoso por sus leones y la gran sabana.',
    hint: 'Es el continente amarillo en el centro, justo debajo de Europa.'
  },
  {
    targetId: 'asia',
    prompt: 'Toca Asia, el continente más grande de la Tierra.',
    hint: 'Es el continente gigante de color violeta a la derecha de Europa.'
  },
  {
    targetId: 'america-norte',
    prompt: '¿Dónde está América del Norte?',
    hint: 'Está en la parte superior izquierda del mapa.'
  },
  {
    targetId: 'america-sur',
    prompt: '¿Dónde está América del Sur, donde se encuentra la gran selva del Amazonas?',
    hint: 'Está en la parte izquierda del mapa, abajo de América del Norte.'
  },
  {
    targetId: 'antartida',
    prompt: 'Toca el continente cubierto de hielo en el Polo Sur (la Antártida).',
    hint: 'Está en la parte más baja de todo el mapa y es blanco como el hielo.'
  },
  {
    targetId: 'oceania',
    prompt: 'Toca Oceanía, la tierra de los canguros y koalas.',
    hint: 'Busca abajo a la derecha del mapa (Australia y sus islas).'
  },
  {
    targetId: 'pacifico',
    prompt: 'Toca el Océano Pacífico, el más grande y profundo de todo el planeta.',
    hint: 'Está en los laterales del mapa, cubriendo una inmensa parte de agua.'
  },
  {
    targetId: 'atlantico',
    prompt: '¡Encuentra el Océano Atlántico! (El que separa Europa de América)',
    hint: 'Toca la masa de agua en el centro, entre América y Europa/África.'
  }
];

export const WorldMapGame: React.FC<WorldMapGameProps> = ({ onBack, onStarsEarned }) => {
  const [selectedId, setSelectedId] = useState<string>('europa');
  const [gameMode, setGameMode] = useState<'explore' | 'quiz'>('explore');
  const [activeMissions, setActiveMissions] = useState<Mission[]>(() =>
    [...QUIZ_MISSIONS].sort(() => Math.random() - 0.5)
  );
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentMission = activeMissions[quizIndex] || activeMissions[0];

  const getInfo = (id: string): InfoItem => {
    return CONTINENTS_INFO[id] || OCEANS_INFO[id] || CONTINENTS_INFO['europa'];
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);

    if (gameMode === 'explore') {
      sounds.playPopSound();
    } else {
      // Modo Quiz
      const isCorrect = id === currentMission.targetId;

      if (isCorrect) {
        sounds.playMatchSound();
        setScore(s => s + 1);
        const info = getInfo(id);
        setQuizFeedback(`¡Correcto! ✨ Has tocado ${info.name}.`);

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
        }, 1100);
      } else {
        sounds.playWobbleSound();
        const wrongInfo = getInfo(id);
        setQuizFeedback(`¡Casi! Has tocado "${wrongInfo.name}". ${currentMission.hint}`);
      }
    }
  };

  const selectedItem = getInfo(selectedId);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 animate-fade-in space-y-4">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra Superior */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a Juegos</span>
        </button>

        {/* Selector de Modo */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          <button
            onClick={() => {
              setGameMode('explore');
              setQuizFeedback(null);
              sounds.playPopSound();
            }}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              gameMode === 'explore'
                ? 'bg-magic-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explorar Mapa</span>
          </button>

          <button
            onClick={() => {
              setGameMode('quiz');
              setActiveMissions([...QUIZ_MISSIONS].sort(() => Math.random() - 0.5));
              setQuizIndex(0);
              setScore(0);
              setIsGameOver(false);
              setQuizFeedback(null);
              sounds.playPopSound();
            }}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              gameMode === 'quiz'
                ? 'bg-sunny-500 text-amber-950 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Reto Explorador ⭐</span>
          </button>
        </div>
      </div>

      {/* Banner de Misión (Modo Quiz) */}
      {gameMode === 'quiz' && !isGameOver && (
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-4 text-white shadow-lg border-2 border-amber-300 flex items-center justify-between gap-4 animate-scale-up">
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

      {/* MAPA DEL MUNDO AUTÉNTICO SVG */}
      <div className="relative bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] rounded-4xl p-2 sm:p-4 shadow-2xl border-4 border-sky-300 overflow-hidden select-none">
        {/* Rosa de los vientos decorativa */}
        <div className="absolute top-3 left-3 pointer-events-none opacity-40">
          <Compass className="w-14 h-14 text-white" />
        </div>

        <svg
          viewBox="0 0 950 620"
          className="w-full h-auto max-h-[540px] drop-shadow-xl block"
        >
          {/* Fondo oceánico */}
          <rect width="950" height="620" fill="transparent" />

          {/* ================= CAPA 1: POLÍGONOS DE TIERRA (DEBAJO DE TODO) ================= */}
          <g id="land-polygons-layer">
            {Object.entries(CONTINENT_PATHS).map(([continentKey, countries]) => {
              const info = CONTINENTS_INFO[continentKey];
              if (!info) return null;
              const isSelected = selectedId === continentKey;

              return (
                <g
                  key={continentKey}
                  onClick={() => handleSelect(continentKey)}
                  className="cursor-pointer group"
                >
                  {/* Cada país renderizado con geometría cartográfica auténtica */}
                  {countries.map((c, idx) => (
                    <path
                      key={`${c.id}-${idx}`}
                      d={c.d}
                      fill={isSelected ? info.hoverColor : info.color}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? '1.2' : '0.6'}
                      strokeLinejoin="round"
                      className="transition-colors duration-150 group-hover:brightness-110"
                    />
                  ))}
                </g>
              );
            })}
          </g>

          {/* ================= CAPA 2: ETIQUETAS Y BOTONES TÁCTILES (ENCIMA DE TODO) ================= */}
          {/* Esta capa se renderiza AL FINAL para que NINGÚN polígono pueda tapar jamás los nombres */}
          <g id="ui-labels-layer">
            {/* 1. Océano Ártico */}
            <g
              onClick={() => handleSelect('artico')}
              className="cursor-pointer group"
            >
              <rect
                x="365"
                y="18"
                width="220"
                height="38"
                rx="19"
                fill={selectedId === 'artico' ? '#facc15' : '#ffffff'}
                fillOpacity={0.96}
                stroke={selectedId === 'artico' ? '#b45309' : '#0284c7'}
                strokeWidth={selectedId === 'artico' ? '3' : '2'}
                className="drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <text x="475" y="42" fill={selectedId === 'artico' ? '#78350f' : '#0369a1'} fontSize="13" fontWeight="900" textAnchor="middle">
                ❄️ Glacial Ártico
              </text>
            </g>

            {/* 2. Océano Pacífico (Oeste) */}
            <g
              onClick={() => handleSelect('pacifico')}
              className="cursor-pointer group"
            >
              <rect
                x="20"
                y="275"
                width="116"
                height="38"
                rx="19"
                fill={selectedId === 'pacifico' ? '#facc15' : '#ffffff'}
                fillOpacity={0.96}
                stroke={selectedId === 'pacifico' ? '#b45309' : '#0284c7'}
                strokeWidth={selectedId === 'pacifico' ? '3' : '2'}
                className="drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <text x="78" y="299" fill={selectedId === 'pacifico' ? '#78350f' : '#0369a1'} fontSize="12" fontWeight="900" textAnchor="middle">
                🐋 O. Pacífico
              </text>
            </g>

            {/* 3. Océano Pacífico (Este) */}
            <g
              onClick={() => handleSelect('pacifico')}
              className="cursor-pointer group"
            >
              <rect
                x="815"
                y="275"
                width="116"
                height="38"
                rx="19"
                fill={selectedId === 'pacifico' ? '#facc15' : '#ffffff'}
                fillOpacity={0.96}
                stroke={selectedId === 'pacifico' ? '#b45309' : '#0284c7'}
                strokeWidth={selectedId === 'pacifico' ? '3' : '2'}
                className="drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <text x="873" y="299" fill={selectedId === 'pacifico' ? '#78350f' : '#0369a1'} fontSize="12" fontWeight="900" textAnchor="middle">
                🐋 O. Pacífico
              </text>
            </g>

            {/* 4. Océano Atlántico (Centro - Gran protagonista) */}
            <g
              onClick={() => handleSelect('atlantico')}
              className="cursor-pointer group"
            >
              <rect
                x="330"
                y="245"
                width="145"
                height="44"
                rx="22"
                fill={selectedId === 'atlantico' ? '#facc15' : '#ffffff'}
                fillOpacity={0.98}
                stroke={selectedId === 'atlantico' ? '#b45309' : '#0284c7'}
                strokeWidth={selectedId === 'atlantico' ? '3.5' : '2.5'}
                className="drop-shadow-lg group-hover:scale-105 transition-transform"
              />
              <text x="402" y="272" fill={selectedId === 'atlantico' ? '#78350f' : '#0284c7'} fontSize="13" fontWeight="900" textAnchor="middle">
                🌊 Océano Atlántico
              </text>
            </g>

            {/* 5. Océano Índico */}
            <g
              onClick={() => handleSelect('indico')}
              className="cursor-pointer group"
            >
              <rect
                x="620"
                y="370"
                width="120"
                height="38"
                rx="19"
                fill={selectedId === 'indico' ? '#facc15' : '#ffffff'}
                fillOpacity={0.96}
                stroke={selectedId === 'indico' ? '#b45309' : '#0284c7'}
                strokeWidth={selectedId === 'indico' ? '3' : '2'}
                className="drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <text x="680" y="394" fill={selectedId === 'indico' ? '#78350f' : '#0369a1'} fontSize="12" fontWeight="900" textAnchor="middle">
                🐬 Océano Índico
              </text>
            </g>

            {/* 6. Glacial Antártico */}
            <g
              onClick={() => handleSelect('antartico')}
              className="cursor-pointer group"
            >
              <rect
                x="400"
                y="515"
                width="150"
                height="36"
                rx="18"
                fill={selectedId === 'antartico' ? '#facc15' : '#ffffff'}
                fillOpacity={0.96}
                stroke={selectedId === 'antartico' ? '#b45309' : '#0284c7'}
                strokeWidth={selectedId === 'antartico' ? '3' : '2'}
                className="drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <text x="475" y="538" fill={selectedId === 'antartico' ? '#78350f' : '#0369a1'} fontSize="12" fontWeight="900" textAnchor="middle">
                🧊 Glacial Antártico
              </text>
            </g>

            {/* 7. ETIQUETAS DE CONTINENTES (TOTALMENTE FLOTANTES Y NUNCA SOLAPADAS) */}
            {Object.entries(CONTINENTS_INFO).map(([key, info]) => {
              const isSelected = selectedId === key;
              return (
                <g
                  key={`label-${key}`}
                  onClick={() => handleSelect(key)}
                  className="cursor-pointer group"
                >
                  <rect
                    x={info.labelX - 60}
                    y={info.labelY - 15}
                    width="120"
                    height="30"
                    rx="15"
                    fill={isSelected ? '#FEF08A' : '#FFFFFF'}
                    fillOpacity={0.98}
                    stroke={isSelected ? '#CA8A04' : info.color}
                    strokeWidth={isSelected ? '3.5' : '2.5'}
                    className="drop-shadow-lg group-hover:scale-105 transition-transform"
                  />
                  <text
                    x={info.labelX}
                    y={info.labelY + 5}
                    fill="#0f172a"
                    fontSize="12"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    {info.emoji} {info.name}
                  </text>
                </g>
              );
            })}

            {/* 8. DETALLE DESTACADO: ESPAÑA (EN EUROPA) */}
            <g
              onClick={() => handleSelect('europa')}
              className="cursor-pointer group"
            >
              <circle cx="445" cy="210" r="8" fill="#facc15" stroke="#ef4444" strokeWidth="2.5" className="animate-pulse" />
              <rect
                x="415"
                y="222"
                width="60"
                height="20"
                rx="10"
                fill="#ffffff"
                stroke="#ef4444"
                strokeWidth="1.5"
                className="drop-shadow"
              />
              <text x="445" y="236" fill="#991b1b" fontSize="10" fontWeight="900" textAnchor="middle">
                ⭐ España
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Tarjeta de Información Didáctica */}
      {selectedItem && (
        <div className="bg-white rounded-3xl p-5 border-3 border-magic-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 text-left animate-scale-up">
          <div className="flex items-start gap-4">
            <div
              style={{ backgroundColor: selectedItem.color }}
              className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-md text-white shrink-0"
            >
              {selectedItem.emoji}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  {selectedItem.type === 'continent' ? 'Continente de la Tierra' : 'Océano del Planeta'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedItem.name}
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-600">
                {selectedItem.facts}
              </p>
              <p className="text-xs sm:text-sm text-magic-700 font-semibold bg-magic-50 p-2.5 rounded-2xl border border-magic-100 mt-2">
                💡 <strong>Dato Mágico:</strong> {selectedItem.curiosity}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <SpeechButton
              text={`${selectedItem.name}. ${selectedItem.facts} ${selectedItem.curiosity}`}
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
