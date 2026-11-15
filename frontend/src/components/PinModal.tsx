import React, { useState } from 'react';
import { Lock, Delete, X } from 'lucide-react';
import { verifyPinCode } from '../services/api.js';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Zona de Padres y Profes',
  subtitle = 'Introduce el PIN de 4 dígitos (por defecto 1234)'
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDigit = async (d: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + d;
    setPin(nextPin);
    setError(false);

    if (nextPin.length === 4) {
      setLoading(true);
      const ok = await verifyPinCode(nextPin);
      setLoading(false);
      if (ok) {
        setPin('');
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => setPin(''), 600);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border-4 border-magic-200 animate-scale-up text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-16 h-16 bg-magic-100 text-magic-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-slate-800">{title}</h3>
        <p className="text-xs md:text-sm text-slate-500 mt-1 mb-6">{subtitle}</p>

        {/* Indicadores de 4 dígitos */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                error
                  ? 'border-bubble-500 bg-bubble-100 scale-110'
                  : pin.length > idx
                  ? 'border-magic-600 bg-magic-600 scale-110'
                  : 'border-slate-300 bg-slate-100'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-bubble-500 font-bold text-xs mb-3 animate-shake">
            PIN incorrecto. Inténtalo de nuevo.
          </p>
        )}

        {/* Teclado numérico táctil estilo iPad */}
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              disabled={loading}
              onClick={() => handleDigit(num)}
              className="h-16 text-2xl font-black rounded-2xl bg-slate-50 hover:bg-magic-100 active:scale-95 text-slate-800 border border-slate-200 transition-all"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDigit('0')}
            className="h-16 text-2xl font-black rounded-2xl bg-slate-50 hover:bg-magic-100 active:scale-95 text-slate-800 border border-slate-200 transition-all"
          >
            0
          </button>
          <button
            type="button"
            disabled={loading || pin.length === 0}
            onClick={handleDelete}
            className="h-16 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-bubble-50 active:scale-95 text-slate-700 border border-slate-200 transition-all"
          >
            <Delete className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
