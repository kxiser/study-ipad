export interface PlayableCharacter {
  id: string;
  name: string;
  title: string;
  emoji: string;
  badgeBg: string;
  colorGradient: string;
  ringColor: string;
  description: string;
  specialPower: string;
}

export const PLAYABLE_CHARACTERS: PlayableCharacter[] = [
  {
    id: 'chispa-dragon',
    name: 'Chispa',
    title: 'Dragón Mágico',
    emoji: '🐉',
    badgeBg: 'bg-amber-100 border-amber-300 text-amber-950',
    colorGradient: 'from-amber-400 via-orange-500 to-amber-600',
    ringColor: 'ring-amber-300',
    description: 'Valiente y alegre. Lanza estrellas mágicas y le encanta volar alto.',
    specialPower: 'Aliento de Estrellas ✨'
  },
  {
    id: 'chispa-zorro',
    name: 'Chispa',
    title: 'Zorro Explorador',
    emoji: '🦊',
    badgeBg: 'bg-orange-100 border-orange-300 text-orange-950',
    colorGradient: 'from-orange-400 via-rose-500 to-amber-500',
    ringColor: 'ring-orange-300',
    description: 'Rápido y curioso. Siempre lleva su bufanda morada y descubre caminos secretos.',
    specialPower: 'Super Velocidad ⚡'
  },
  {
    id: 'luna-buho',
    name: 'Luna',
    title: 'Búho Sabia',
    emoji: '🦉',
    badgeBg: 'bg-purple-100 border-purple-300 text-purple-950',
    colorGradient: 'from-purple-500 via-indigo-600 to-purple-700',
    ringColor: 'ring-purple-300',
    description: 'Con su birrete escolar, lee todos los libros y resuelve cualquier enigma.',
    specialPower: 'Hechizo de Sabiduría 📖'
  },
  {
    id: 'bambu-panda',
    name: 'Bambú',
    title: 'Oso Panda Gentil',
    emoji: '🐼',
    badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-950',
    colorGradient: 'from-emerald-400 via-teal-500 to-green-600',
    ringColor: 'ring-emerald-300',
    description: 'Tranquilo, bondadoso y muy fuerte. Nunca se rinde ante un problema.',
    specialPower: 'Escudo de Bambú 🎋'
  },
  {
    id: 'estrella-unicornio',
    name: 'Estrella',
    title: 'Unicornio Brillante',
    emoji: '🦄',
    badgeBg: 'bg-pink-100 border-pink-300 text-pink-950',
    colorGradient: 'from-pink-400 via-purple-400 to-rose-400',
    ringColor: 'ring-pink-300',
    description: 'Deja un sendero de arcoíris por donde camina y llena de alegría el reino.',
    specialPower: 'Rayo Arcoíris 🌈'
  },
  {
    id: 'leo-leon',
    name: 'Leo',
    title: 'León Aventurero',
    emoji: '🦁',
    badgeBg: 'bg-yellow-100 border-yellow-300 text-yellow-950',
    colorGradient: 'from-yellow-400 via-amber-500 to-orange-500',
    ringColor: 'ring-yellow-300',
    description: 'Lleno de energía y valor. Defiende el Castillo del Saber con valentía.',
    specialPower: 'Rugido del Saber 👑'
  }
];

const SELECTED_CHAR_KEY = 'study_selected_character_id';

export function getSelectedCharacter(): PlayableCharacter {
  try {
    const savedId = localStorage.getItem(SELECTED_CHAR_KEY);
    if (savedId) {
      const found = PLAYABLE_CHARACTERS.find(c => c.id === savedId);
      if (found) return found;
    }
  } catch (e) {}
  return PLAYABLE_CHARACTERS[0]; // Por defecto Chispa Dragón
}

export function setSelectedCharacter(characterId: string): void {
  try {
    localStorage.setItem(SELECTED_CHAR_KEY, characterId);
    window.dispatchEvent(new CustomEvent('study_character_changed', { detail: characterId }));
  } catch (e) {}
}
