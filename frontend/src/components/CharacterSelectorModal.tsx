import React from 'react';
import { X, Check, Sparkles, Heart } from 'lucide-react';
import { PLAYABLE_CHARACTERS, PlayableCharacter, getSelectedCharacter, setSelectedCharacter } from '../utils/characters.js';
import { sounds } from '../utils/soundEffects.js';

interface CharacterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter?: (char: PlayableCharacter) => void;
}

export const CharacterSelectorModal: React.FC<CharacterSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectCharacter
}) => {
  if (!isOpen) return null;

  const current = getSelectedCharacter();

  const handleSelect = (char: PlayableCharacter) => {
    setSelectedCharacter(char.id);
    sounds.playPopSound();
    if (onSelectCharacter) onSelectCharacter(char);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white rounded-4xl max-w-lg w-full p-6 space-y-5 shadow-2xl border-4 border-magic-300 relative text-left">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-magic-600 bg-magic-100 px-3 py-1 rounded-full">
              Héroes del Cuaderno
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">
            Elige tu Personaje
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Jugarás con este personaje en todas las aventuras 2D, minijuegos y sesiones de estudio.
          </p>
        </div>

        {/* Lista de Personajes Seleccionables */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {PLAYABLE_CHARACTERS.map(char => {
            const isSelected = char.id === current.id;
            return (
              <button
                key={char.id}
                onClick={() => handleSelect(char)}
                className={`p-3.5 rounded-3xl border-3 flex flex-col items-center text-center gap-2 transition-all active:scale-95 relative ${
                  isSelected
                    ? `bg-white border-magic-500 ring-4 ${char.ringColor} shadow-lg scale-102`
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                )}

                {/* Avatar / Emoji Gigante */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner border-2 ${char.badgeBg}`}>
                  {char.emoji}
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {char.name}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 block">
                    {char.title}
                  </span>
                </div>

                <span className="text-[10px] font-black text-magic-700 bg-magic-50 px-2 py-0.5 rounded-full border border-magic-200">
                  {char.specialPower}
                </span>
              </button>
            );
          })}
        </div>

        {/* Pie con Personaje Actual */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
          <span className="text-3xl">{current.emoji}</span>
          <div className="text-xs">
            <span className="font-black text-slate-800 block">Actualmente jugando con {current.name} ({current.title})</span>
            <span className="text-slate-500 font-medium">{current.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
