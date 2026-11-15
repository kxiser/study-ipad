import React, { useState } from 'react';
import { ArrowLeft, Star, Sparkles, Check, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Mascot } from '../Mascot.js';
import {
  SHOP_ITEMS,
  ShopItem,
  getMascotAccessories,
  saveMascotAccessories,
  getUnlockedItems,
  unlockItem,
  MascotAccessories
} from '../../utils/mascotAccessories.js';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';

interface ClosetShopProps {
  userStars: number;
  onBack: () => void;
  onStarsUpdated?: (newStars: number) => void;
}

export const ClosetShop: React.FC<ClosetShopProps> = ({
  userStars,
  onBack,
  onStarsUpdated
}) => {
  const [activeCategory, setActiveCategory] = useState<'hat' | 'glasses' | 'accessory'>('hat');
  const [currentAccessories, setCurrentAccessories] = useState<MascotAccessories>(getMascotAccessories());
  const [unlocked, setUnlocked] = useState<string[]>(getUnlockedItems());
  const [showCelebration, setShowCelebration] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const filteredItems = SHOP_ITEMS.filter(item => item.category === activeCategory);

  const handleEquip = (item: ShopItem) => {
    sounds.playMatchSound();
    const newAcc = { ...currentAccessories };

    if (item.category === 'hat') {
      newAcc.hat = newAcc.hat === (item.type as any) ? 'none' : (item.type as any);
    } else if (item.category === 'glasses') {
      newAcc.glasses = newAcc.glasses === (item.type as any) ? 'none' : (item.type as any);
    } else if (item.category === 'accessory') {
      newAcc.accessory = newAcc.accessory === (item.type as any) ? 'none' : (item.type as any);
    }

    setCurrentAccessories(newAcc);
    saveMascotAccessories(newAcc);
  };

  const handleBuy = (item: ShopItem) => {
    if (userStars < item.price) {
      sounds.playWobbleSound();
      setBannerMessage(`¡Necesitas ${item.price - userStars} estrellas más! Juega más partidas para conseguirlas.`);
      setTimeout(() => setBannerMessage(null), 3000);
      return;
    }

    sounds.playVictorySound();
    setShowCelebration(true);
    unlockItem(item.id);
    setUnlocked(getUnlockedItems());

    const newStars = userStars - item.price;
    if (onStarsUpdated) onStarsUpdated(newStars);

    // Equipar automáticamente
    handleEquip(item);

    setBannerMessage(`¡Has desbloqueado "${item.name}"! Chispa se ve súper genial.`);
    setTimeout(() => {
      setBannerMessage(null);
      setShowCelebration(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 animate-fade-in space-y-6">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra superior con volver y estrellas */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a Juegos</span>
        </button>

        <div className="flex items-center gap-2 bg-sunny-100 border border-sunny-300 px-4 py-1.5 rounded-full text-amber-900 font-black text-sm md:text-base shadow-sm">
          <Star className="w-5 h-5 fill-amber-400 text-amber-500 animate-bounce" />
          <span>{userStars} Estrellas para gastar</span>
        </div>
      </div>

      {bannerMessage && (
        <div className="bg-magic-600 text-white font-black text-center py-2 px-4 rounded-2xl animate-fade-in shadow-md">
          {bannerMessage}
        </div>
      )}

      {/* Probador de Chispa */}
      <div className="bg-gradient-to-r from-sunny-100 via-pink-50 to-magic-100 rounded-4xl p-6 border-3 border-magic-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left space-y-2">
          <span className="inline-block bg-magic-600 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
            Probador Mágico
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-800">
            ¡El Armario de Chispa!
          </h3>
          <p className="text-slate-600 font-bold text-sm max-w-sm">
            Usa tus estrellas de estudio para vestir y personalizar a Chispa a tu gusto.
          </p>
        </div>

        <div className="p-4 bg-white/70 backdrop-blur-md rounded-3xl border-2 border-white shadow-inner flex items-center justify-center">
          <Mascot
            size="xl"
            mood="happy"
            accessories={currentAccessories}
            message="¡Mira qué guapo estoy!"
          />
        </div>
      </div>

      {/* Selector de Categorías */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setActiveCategory('hat')}
          className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all active:scale-95 ${
            activeCategory === 'hat'
              ? 'bg-magic-600 text-white shadow-md shadow-magic-300'
              : 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          🧙‍♂️ Sombreros
        </button>
        <button
          onClick={() => setActiveCategory('glasses')}
          className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all active:scale-95 ${
            activeCategory === 'glasses'
              ? 'bg-magic-600 text-white shadow-md shadow-magic-300'
              : 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          😎 Gafas
        </button>
        <button
          onClick={() => setActiveCategory('accessory')}
          className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all active:scale-95 ${
            activeCategory === 'accessory'
              ? 'bg-magic-600 text-white shadow-md shadow-magic-300'
              : 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          ✨ Accesorios
        </button>
      </div>

      {/* Cuadrícula de artículos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isOwned = unlocked.includes(item.id);
          const isEquipped =
            (item.category === 'hat' && currentAccessories.hat === item.type) ||
            (item.category === 'glasses' && currentAccessories.glasses === item.type) ||
            (item.category === 'accessory' && currentAccessories.accessory === item.type);

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border-3 transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                isEquipped
                  ? 'bg-mint-50 border-mint-400'
                  : isOwned
                  ? 'bg-white border-slate-200 hover:border-magic-300'
                  : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{item.emoji}</span>
                {isEquipped ? (
                  <span className="bg-mint-500 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Check className="w-3.5 h-3.5" /> Puesto
                  </span>
                ) : isOwned ? (
                  <span className="bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                    Comprado
                  </span>
                ) : (
                  <div className="flex items-center gap-1 text-amber-900 bg-sunny-100 border border-sunny-300 px-2.5 py-1 rounded-full text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{item.price}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-black text-slate-800 text-base">{item.name}</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{item.description}</p>
              </div>

              <div>
                {isOwned ? (
                  <button
                    onClick={() => handleEquip(item)}
                    className={`w-full py-2.5 rounded-2xl font-black text-xs transition-all active:scale-95 ${
                      isEquipped
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-magic-600 hover:bg-magic-700 text-white shadow-md shadow-magic-200'
                    }`}
                  >
                    {isEquipped ? 'Quitar' : 'Poner a Chispa'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-sunny-400 to-amber-500 hover:from-sunny-500 hover:to-amber-600 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-200 active:scale-95 transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Comprar por {item.price} ⭐</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
