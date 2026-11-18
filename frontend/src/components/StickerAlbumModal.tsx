import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trophy, Lock, Star, Gift, CheckCircle2 } from 'lucide-react';
import { fireSuccessConfetti } from './ConfettiCelebration.js';
import { sounds } from '../utils/soundEffects.js';

export interface StickerItem {
  id: string;
  name: string;
  category: 'Naturaleza' | 'Matemáticas' | 'Lengua' | 'Sociales' | 'Especial';
  emoji: string;
  description: string;
  rarity: 'Común' | 'Raro' | 'Épico' | 'Legendario';
  color: string;
}

export const ALL_STICKERS: StickerItem[] = [
  {
    id: 'st-leon',
    name: 'León Sabio',
    category: 'Naturaleza',
    emoji: '🦁',
    description: 'Rey de los mamíferos con esqueleto interno articulado.',
    rarity: 'Común',
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'st-saturno',
    name: 'Saturno Dorado',
    category: 'Sociales',
    emoji: '🪐',
    description: 'El planeta de los anillos majestuosos del Sistema Solar.',
    rarity: 'Raro',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'st-tilde',
    name: 'Rayo Esdrújulo',
    category: 'Lengua',
    emoji: '⚡',
    description: '¡Siempre lleva tilde en la antepenúltima sílaba!',
    rarity: 'Común',
    color: 'from-yellow-400 to-amber-600'
  },
  {
    id: 'st-planta',
    name: 'Hoja Clorofila',
    category: 'Naturaleza',
    emoji: '🌿',
    description: 'Fabrica oxígeno limpio a través de la fotosíntesis.',
    rarity: 'Común',
    color: 'from-emerald-400 to-green-600'
  },
  {
    id: 'st-multiplica',
    name: 'Mago del 9',
    category: 'Matemáticas',
    emoji: '✖️',
    description: 'Multiplica a la velocidad de la luz: 9 × 7 = 63.',
    rarity: 'Raro',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'st-teide',
    name: 'Guardián del Teide',
    category: 'Sociales',
    emoji: '⛰️',
    description: 'Volcán canario y cumbre más alta de toda España (3.715 m).',
    rarity: 'Raro',
    color: 'from-stone-500 to-amber-700'
  },
  {
    id: 'st-ebro',
    name: 'Dragón del Ebro',
    category: 'Sociales',
    emoji: '🌊',
    description: 'El río más caudaloso que viaja al Mar Mediterráneo.',
    rarity: 'Épico',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'st-mariposa',
    name: 'Hada de la Metamorfosis',
    category: 'Naturaleza',
    emoji: '🦋',
    description: 'Reina de los animales invertebrados con 6 patas.',
    rarity: 'Común',
    color: 'from-pink-400 to-rose-500'
  },
  {
    id: 'st-reloj',
    name: 'Reloj de Arena Mágico',
    category: 'Matemáticas',
    emoji: '⏰',
    description: 'Controla las horas, cuartos y medias del reloj escolar.',
    rarity: 'Común',
    color: 'from-amber-400 to-orange-600'
  },
  {
    id: 'st-sustantivo',
    name: 'Sello del Sustantivo',
    category: 'Lengua',
    emoji: '🏷️',
    description: 'Tiene el poder de nombrar todas las cosas del universo.',
    rarity: 'Épico',
    color: 'from-violet-500 to-purple-700'
  },
  {
    id: 'st-aguila',
    name: 'Águila Imperial',
    category: 'Naturaleza',
    emoji: '🦅',
    description: 'Ave reina con plumas doradas y vista prodigiosa.',
    rarity: 'Épico',
    color: 'from-sky-400 to-blue-700'
  },
  {
    id: 'st-chispa',
    name: 'Chispa Legendario',
    category: 'Especial',
    emoji: '👑',
    description: '¡El dragón maestro que acompaña a Samantha en cada triunfo!',
    rarity: 'Legendario',
    color: 'from-amber-300 via-rose-500 to-indigo-600'
  }
];

const STORAGE_STICKERS_KEY = 'estudio_unlocked_stickers_v1';

export function getUnlockedStickerIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_STICKERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Al inicio tiene al menos 1 cromo desbloqueado de bienvenida
  return ['st-leon'];
}

export function unlockRandomSticker(): StickerItem | null {
  const current = getUnlockedStickerIds();
  const locked = ALL_STICKERS.filter(s => !current.includes(s.id));
  if (locked.length === 0) return null; // Ya los tiene todos

  // Elegir uno al azar
  const next = locked[Math.floor(Math.random() * locked.length)];
  const updated = [...current, next.id];
  try {
    localStorage.setItem(STORAGE_STICKERS_KEY, JSON.stringify(updated));
  } catch (e) {}
  return next;
}

interface StickerAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  newStickerRevealed?: StickerItem | null;
}

export const StickerAlbumModal: React.FC<StickerAlbumModalProps> = ({
  isOpen,
  onClose,
  newStickerRevealed
}) => {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUnlockedIds(getUnlockedStickerIds());
      if (newStickerRevealed) {
        setSelectedSticker(newStickerRevealed);
        fireSuccessConfetti();
        sounds.playVictorySound();
      }
    }
  }, [isOpen, newStickerRevealed]);

  if (!isOpen) return null;

  const totalUnlocked = unlockedIds.length;
  const totalStickers = ALL_STICKERS.length;
  const progressPercent = Math.round((totalUnlocked / totalStickers) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-4xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-amber-300 overflow-hidden animate-scale-up">
        {/* Cabecera del Álbum */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 p-6 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-inner">
              ⭐
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/25 px-2.5 py-0.5 rounded-full inline-block">
                Colección Mágica
              </span>
              <h2 className="text-2xl font-black leading-tight">Álbum de Cromos</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Barra de Progreso de Colección */}
        <div className="bg-amber-50 px-6 py-3 border-b border-amber-200 flex items-center justify-between text-xs sm:text-sm font-black text-amber-950">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Coleccionados: <strong>{totalUnlocked} de {totalStickers}</strong> ({progressPercent}%)</span>
          </div>

          <span className="text-xs bg-amber-200 text-amber-900 px-3 py-1 rounded-full">
            ¡Gana sobres acertando sin fallos!
          </span>
        </div>

        {/* Cuadrícula de Cromos */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ALL_STICKERS.map(sticker => {
            const isUnlocked = unlockedIds.includes(sticker.id);

            return (
              <button
                key={sticker.id}
                type="button"
                onClick={() => isUnlocked && setSelectedSticker(sticker)}
                disabled={!isUnlocked}
                className={`relative rounded-3xl p-4 flex flex-col items-center text-center transition-all duration-200 active:scale-95 border-3 ${
                  isUnlocked
                    ? `bg-gradient-to-b ${sticker.color} text-white border-white/50 shadow-lg hover:scale-105 cursor-pointer`
                    : 'bg-slate-100 text-slate-400 border-dashed border-slate-300 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Badge de Rareza */}
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-2 ${
                  isUnlocked ? 'bg-black/20 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {sticker.rarity}
                </span>

                {/* Emoji del Cromo o Candado */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-2 ${
                  isUnlocked ? 'bg-white/25 shadow-inner' : 'bg-slate-200 text-slate-400'
                }`}>
                  {isUnlocked ? sticker.emoji : <Lock className="w-6 h-6" />}
                </div>

                <h4 className="text-xs sm:text-sm font-black leading-tight line-clamp-1">
                  {isUnlocked ? sticker.name : '??? Bloqueado'}
                </h4>
                <span className="text-[10px] font-bold opacity-80 mt-0.5">
                  {sticker.category}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Detalle del Cromo Seleccionado */}
        {selectedSticker && (
          <div className="bg-slate-900/90 text-white p-6 border-t-2 border-slate-700 flex flex-col sm:flex-row items-center gap-4 animate-slide-in">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${selectedSticker.color} flex items-center justify-center text-5xl shadow-xl shrink-0 border-2 border-white/40 animate-bounce`}>
              {selectedSticker.emoji}
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-black uppercase bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                  {selectedSticker.rarity}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {selectedSticker.category}
                </span>
              </div>
              <h3 className="text-xl font-black text-white">{selectedSticker.name}</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold">{selectedSticker.description}</p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSticker(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
