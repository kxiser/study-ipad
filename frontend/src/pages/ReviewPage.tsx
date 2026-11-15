import React, { useEffect, useState } from 'react';
import { fetchReviewToday } from '../services/api.js';
import { ReviewItem, ExerciseSet } from '../types.js';
import { StudySession } from './StudySession.js';
import { Mascot } from '../components/Mascot.js';
import { ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';

interface ReviewPageProps {
  onBack: () => void;
  mascotType?: string;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ onBack, mascotType = 'chispa' }) => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewToday().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Mascot mascotType={mascotType} mood="thinking" size="md" message="Buscando lo que te toca repasar hoy..." />
      </div>
    );
  }

  // Si no hay ejercicios para hoy
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6 animate-fade-in">
        <div className="bg-white rounded-4xl p-8 md:p-10 shadow-xl border-3 border-mint-200 space-y-6">
          <div className="w-20 h-20 bg-mint-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-mint-100 px-3 py-1 rounded-full">
              ¡Repaso al Día!
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">
              ¡No tienes nada pendiente hoy!
            </h2>
            <p className="text-slate-600 font-bold text-sm md:text-base">
              Tu memoria está súper fresca. El algoritmo de repetición espaciada te avisará cuando toque repasar de nuevo.
            </p>
          </div>

          <div className="flex justify-center">
            <Mascot
              mascotType={mascotType}
              mood="celebrating"
              size="md"
              message="¡Eres una campeona del estudio! ¡Buen trabajo!"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onBack}
              className="px-8 py-4 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-base shadow-lg shadow-magic-300 active:scale-95 transition-all"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Convertir items de repaso a un ExerciseSet para StudySession
  const reviewSet: ExerciseSet = {
    title: 'Repaso Diario Mágico',
    subject: 'Varias Materias',
    summary: 'Reforzamos lo aprendido para que se quede en tu memoria para siempre.',
    exercises: items.map(i => i.exercise)
  };

  return (
    <StudySession
      exerciseSet={reviewSet}
      mascotType={mascotType}
      sessionType="review"
      onFinish={onBack}
    />
  );
};
