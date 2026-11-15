import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  Check,
  Star,
  Search,
  Volume2
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { completeStudySession } from '../../services/api.js';
import { ExerciseItem } from '../../types.js';
import { getSelectedCharacter } from '../../utils/characters.js';

interface WordSearchGameProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

interface WordToFind {
  word: string;
  clue: string;
  found: boolean;
  color: string;
}

const PUZZLE_WORDS: { word: string; clue: string; color: string }[] = [
  { word: 'VOLCAN', clue: 'Montaña con cráter que expulsa lava ardiente', color: 'bg-orange-200 border-orange-400 text-orange-950' },
  { word: 'HUESO', clue: 'Parte dura que forma el esqueleto humano', color: 'bg-emerald-200 border-emerald-400 text-emerald-950' },
  { word: 'TIERRA', clue: 'Nuestro planeta, el tercero del Sistema Solar', color: 'bg-blue-200 border-blue-400 text-blue-950' },
  { word: 'AGUA', clue: 'Líquido vital indispensable para los seres vivos', color: 'bg-cyan-200 border-cyan-400 text-cyan-950' },
  { word: 'FOSIL', clue: 'Resto prehistórico de animal conservado en piedra', color: 'bg-purple-200 border-purple-400 text-purple-950' },
  { word: 'PLANETA', clue: 'Cuerpo celeste que gira alrededor del Sol', color: 'bg-pink-200 border-pink-400 text-pink-950' }
];

const GRID_SIZE = 9;

// Generador de Sopa de Letras garantizado con las palabras colocadas
function generateGrid(words: string[]): { grid: string[][]; placements: { word: string; cells: [number, number][] }[] } {
  const grid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
  const placements: { word: string; cells: [number, number][] }[] = [];

  const directions: [number, number][] = [
    [0, 1],  // Horizontal derecha
    [1, 0],  // Vertical abajo
    [1, 1],  // Diagonal abajo derecha
  ];

  for (const word of words) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      attempts++;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const startR = Math.floor(Math.random() * (GRID_SIZE - (dir[0] ? word.length : 0)));
      const startC = Math.floor(Math.random() * (GRID_SIZE - (dir[1] ? word.length : 0)));

      let canPlace = true;
      const cells: [number, number][] = [];

      for (let i = 0; i < word.length; i++) {
        const r = startR + dir[0] * i;
        const c = startC + dir[1] * i;

        if (r >= GRID_SIZE || c >= GRID_SIZE) {
          canPlace = false;
          break;
        }

        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
        cells.push([r, c]);
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const [r, c] = cells[i];
          grid[r][c] = word[i];
        }
        placements.push({ word, cells });
        placed = true;
      }
    }
  }

  // Rellenar huecos vacíos con letras aleatorias en mayúscula
  const letters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid, placements };
}

export const WordSearchGame: React.FC<WordSearchGameProps> = ({
  exercises = [],
  title = 'Sopa de Letras Mágica',
  onBack,
  onStarsEarned
}) => {
  const [wordsList, setWordsList] = useState<WordToFind[]>(PUZZLE_WORDS.map(w => ({ ...w, found: false })));
  const [gridData, setGridData] = useState<string[][]>([]);
  const [placements, setPlacements] = useState<{ word: string; cells: [number, number][] }[]>([]);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [foundCells, setFoundCells] = useState<{ r: number; c: number; color: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const hero = getSelectedCharacter();

  // Inicializar sopa de letras
  const initGame = () => {
    const rawWords = PUZZLE_WORDS.map(p => p.word);
    const { grid, placements: plc } = generateGrid(rawWords);
    setGridData(grid);
    setPlacements(plc);
    setWordsList(PUZZLE_WORDS.map(w => ({ ...w, found: false })));
    setSelectedCells([]);
    setFoundCells([]);
    setIsFinished(false);
    setShowCelebration(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Manejar clic / selección de celda (Tocar primera celda, tocar última celda)
  const handleCellClick = (r: number, c: number) => {
    if (isFinished) return;
    sounds.playPopSound();

    if (selectedCells.length === 0) {
      // Primer clic: empezar selección
      setSelectedCells([[r, c]]);
      return;
    }

    if (selectedCells.length === 1) {
      const [startR, startC] = selectedCells[0];

      // Si vuelve a tocar la misma celda, deseleccionar
      if (startR === r && startC === c) {
        setSelectedCells([]);
        return;
      }

      // Calcular línea entre inicio y fin
      const deltaR = r - startR;
      const deltaC = c - startC;
      const stepR = deltaR === 0 ? 0 : deltaR / Math.abs(deltaR);
      const stepC = deltaC === 0 ? 0 : deltaC / Math.abs(deltaC);

      const isLine = deltaR === 0 || deltaC === 0 || Math.abs(deltaR) === Math.abs(deltaC);

      if (isLine) {
        const length = Math.max(Math.abs(deltaR), Math.abs(deltaC)) + 1;
        const lineCells: [number, number][] = [];
        let curWord = '';

        for (let i = 0; i < length; i++) {
          const curR = startR + stepR * i;
          const curC = startC + stepC * i;
          lineCells.push([curR, curC]);
          curWord += gridData[curR][curC];
        }

        // Comprobar si la palabra formada (o su inversa) está en la lista pendiente
        const reversedWord = curWord.split('').reverse().join('');
        const match = wordsList.find(
          w => !w.found && (w.word === curWord || w.word === reversedWord)
        );

        if (match) {
          sounds.playMatchSound();
          // Marcar palabra como encontrada
          const updatedWords = wordsList.map(w =>
            w.word === match.word ? { ...w, found: true } : w
          );
          setWordsList(updatedWords);

          // Guardar celdas coloreadas
          const newColored = lineCells.map(([cr, cc]) => ({
            r: cr,
            c: cc,
            color: match.color
          }));
          setFoundCells(prev => [...prev, ...newColored]);

          setSelectedCells([]);

          // Comprobar si ha terminado
          if (updatedWords.every(w => w.found)) {
            setIsFinished(true);
            setShowCelebration(true);
            sounds.playVictorySound();
            const stars = 5;
            completeStudySession({
              sessionType: 'new',
              durationSeconds: 90,
              totalQuestions: updatedWords.length,
              correctAnswers: updatedWords.length,
              starsEarned: stars
            }).catch(() => {});
            if (onStarsEarned) onStarsEarned(stars);
          }
          return;
        }
      }

      // Si no es palabra válida, reiniciar selección a la nueva celda
      setSelectedCells([[r, c]]);
    }
  };

  const foundCount = wordsList.filter(w => w.found).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-4 animate-fade-in select-none">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra superior */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-black text-xs md:text-sm active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Juegos</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-sunny-100 text-amber-950 px-3.5 py-1.5 rounded-2xl font-black text-xs md:text-sm border border-sunny-300">
            <Search className="w-4 h-4 text-amber-600" />
            <span>{foundCount} de {wordsList.length} Palabras</span>
          </div>

          <div className="flex items-center gap-1.5 bg-magic-100 text-magic-950 px-3.5 py-1.5 rounded-2xl font-black text-xs md:text-sm border border-magic-300">
            <span className="text-base">{hero.emoji}</span>
            <span>{hero.name}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* TABLERO DE LA SOPA DE LETRAS */}
        <div className="md:col-span-2 bg-white rounded-4xl p-4 sm:p-6 shadow-xl border-4 border-magic-200 flex flex-col items-center">
          <div className="inline-grid gap-1.5 sm:gap-2 p-2 bg-slate-50 rounded-3xl border-2 border-slate-200 touch-none">
            {gridData.map((row, r) => (
              <div key={r} className="flex gap-1.5 sm:gap-2">
                {row.map((letter, c) => {
                  const isSelected = selectedCells.some(([sr, sc]) => sr === r && sc === c);
                  const foundInfo = foundCells.find(fc => fc.r === r && fc.c === c);

                  let cellClass = 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100';

                  if (foundInfo) {
                    cellClass = `${foundInfo.color} font-black shadow-sm`;
                  } else if (isSelected) {
                    cellClass = 'bg-magic-600 text-white border-magic-700 scale-110 shadow-lg ring-2 ring-magic-300';
                  }

                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCellClick(r, c)}
                      className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center font-black text-sm sm:text-lg transition-all active:scale-90 ${cellClass}`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 font-bold mt-4 text-center">
            💡 Toca la primera letra de la palabra y luego la última letra para marcarla.
          </p>
        </div>

        {/* LISTA DE PALABRAS A BUSCAR */}
        <div className="space-y-3">
          <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-magic-100 space-y-3">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-magic-600" />
              <span>Palabras del Cuaderno</span>
            </h3>

            <div className="space-y-2">
              {wordsList.map((item) => (
                <div
                  key={item.word}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    item.found
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 opacity-90 line-through'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-black text-sm tracking-wide block">
                      {item.word}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 line-clamp-1">
                      {item.clue}
                    </span>
                  </div>

                  <div className="shrink-0 ml-2">
                    {item.found ? (
                      <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                    ) : (
                      <SpeechButton text={`${item.word}. ${item.clue}`} size="sm" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta de Victoria */}
          {isFinished && (
            <div className="bg-gradient-to-br from-amber-400 to-sunny-500 rounded-3xl p-6 text-amber-950 shadow-xl border-3 border-amber-300 text-center space-y-3 animate-scale-up">
              <Trophy className="w-12 h-12 mx-auto animate-bounce" />
              <h4 className="text-xl font-black">¡Sopa Resuelta!</h4>
              <p className="text-xs font-bold">
                ¡Has encontrado todas las palabras del temario! Has ganado 5 Estrellas Mágicas.
              </p>
              <div className="flex items-center justify-center gap-1.5 font-black text-lg">
                <Star className="w-5 h-5 fill-amber-950" />
                <span>+5 Estrellas</span>
              </div>
              <button
                type="button"
                onClick={initGame}
                className="w-full py-2.5 rounded-xl bg-amber-950 text-white font-black text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Jugar otra Sopa</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
