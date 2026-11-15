// Gestor de Accesorios y Disfraces para la mascota Chispa

export interface MascotAccessories {
  hat?: 'none' | 'wizard' | 'crown' | 'cap' | 'astronaut';
  glasses?: 'none' | 'sunglasses' | 'stars';
  accessory?: 'none' | 'wand' | 'cape' | 'medal';
}

const STORAGE_KEY = 'study_mascot_accessories';
const listeners: Array<(acc: MascotAccessories) => void> = [];

export function getMascotAccessories(): MascotAccessories {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { hat: 'none', glasses: 'none', accessory: 'none' };
    return JSON.parse(raw);
  } catch {
    return { hat: 'none', glasses: 'none', accessory: 'none' };
  }
}

export function saveMascotAccessories(acc: MascotAccessories): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(acc));
    listeners.forEach(cb => cb(acc));
  } catch (e) {
    console.error('Error saving accessories', e);
  }
}

export function subscribeToAccessories(cb: (acc: MascotAccessories) => void): () => void {
  listeners.push(cb);
  return () => {
    const index = listeners.indexOf(cb);
    if (index > -1) listeners.splice(index, 1);
  };
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'hat' | 'glasses' | 'accessory';
  type: string;
  price: number;
  emoji: string;
  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'hat-wizard',
    name: 'Sombrero de Mago',
    category: 'hat',
    type: 'wizard',
    price: 15,
    emoji: '🧙‍♂️',
    description: '¡Con estrellas brillantes para hacer magia en cada respuesta!'
  },
  {
    id: 'hat-crown',
    name: 'Corona de Princesa',
    category: 'hat',
    type: 'crown',
    price: 25,
    emoji: '👑',
    description: 'Corona de oro brillante para la reina de las matemáticas y la ciencia.'
  },
  {
    id: 'hat-cap',
    name: 'Gorra Aventurera',
    category: 'hat',
    type: 'cap',
    price: 10,
    emoji: '🧢',
    description: 'Estilo deportivo genial para explorar el mundo.'
  },
  {
    id: 'hat-astronaut',
    name: 'Casco de Astronauta',
    category: 'hat',
    type: 'astronaut',
    price: 30,
    emoji: '🧑‍🚀',
    description: 'Para viajar por el espacio y descubrir los planetas.'
  },
  {
    id: 'glasses-sunglasses',
    name: 'Gafas de Sol Cool',
    category: 'glasses',
    type: 'sunglasses',
    price: 15,
    emoji: '😎',
    description: 'Las gafas más modernas de la galaxia.'
  },
  {
    id: 'glasses-stars',
    name: 'Gafas de Estrellas',
    category: 'glasses',
    type: 'stars',
    price: 20,
    emoji: '⭐',
    description: 'Cristales mágicos con forma de estrella brillante.'
  },
  {
    id: 'acc-wand',
    name: 'Varita de Chispa',
    category: 'accessory',
    type: 'wand',
    price: 20,
    emoji: '✨',
    description: 'Lanza destellos cada vez que aprendes algo nuevo.'
  },
  {
    id: 'acc-cape',
    name: 'Capa de Superheroína',
    category: 'accessory',
    type: 'cape',
    price: 35,
    emoji: '🦸‍♀️',
    description: 'Capa ondeante roja que te da súper poderes de estudio.'
  },
  {
    id: 'acc-medal',
    name: 'Medalla de Oro',
    category: 'accessory',
    type: 'medal',
    price: 20,
    emoji: '🏅',
    description: 'Medalla reluciente de campeona.'
  }
];

export function getUnlockedItems(): string[] {
  try {
    const raw = localStorage.getItem('study_unlocked_items');
    if (!raw) return ['none'];
    return JSON.parse(raw);
  } catch {
    return ['none'];
  }
}

export function unlockItem(itemId: string): void {
  const current = getUnlockedItems();
  if (!current.includes(itemId)) {
    current.push(itemId);
    localStorage.setItem('study_unlocked_items', JSON.stringify(current));
  }
}
