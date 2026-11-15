import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Star, Trophy, RefreshCw } from 'lucide-react';
import { ExerciseItem } from '../../types.js';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { completeStudySession } from '../../services/api.js';

interface WheelSector {
  label: string;
  sub: string;
  color: string;
  type: 'bonus' | 'question';
  stars: number;
}

const SECTORS: WheelSector[] = [
  { label: '🌟 Doble', sub: '+4 Estrellas', color: '#F59E0B', type: 'bonus', stars: 4 },
  { label: '⚡ Reto', sub: 'Pregunta', color: '#8B5CF6', type: 'question', stars: 3 },
  { label: '🦊 Chispa', sub: '+3 Estrellas', color: '#F97316', type: 'bonus', stars: 3 },
  { label: '🎯 Desafío', sub: 'Pregunta', color: '#EC4899', type: 'question', stars: 3 },
  { label: '💎 Cofre', sub: '+5 Estrellas', color: '#10B981', type: 'bonus', stars: 5 },
  { label: '🌈 Trivia', sub: 'Pregunta', color: '#06B6D4', type: 'question', stars: 3 },
  { label: '✨ Estrella', sub: '+2 Estrellas', color: '#EAB308', type: 'bonus', stars: 2 },
  { label: '🚀 Súper', sub: 'Pregunta', color: '#3B82F6', type: 'question', stars: 4 }
];

interface WheelGameProps {
  exercises: ExerciseItem[];
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

export const WheelGame: React.FC<WheelGameProps> = ({
  exercises,
  onBack,
  onStarsEarned
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSector, setSelectedSector] = useState<WheelSector | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<{ q: string; opts: string[]; ans: string } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedSector(null);
    setActiveQuestion(null);
    setShowResultModal(false);
    setShowCelebration(false);

    // Reproducir tics de giro
    let ticks = 0;
    const tickInterval = setInterval(() => {
      sounds.playSpinTick();
      ticks++;
      if (ticks > 16) clearInterval(tickInterval);
    }, 180);

    // Calcular sector al azar
    const chosenIndex = Math.floor(Math.random() * SECTORS.length);
    const sectorAngle = 360 / SECTORS.length;
    // Giro de 5 a 8 vueltas completas más la posición del sector
    const randomExtraRounds = 5 + Math.floor(Math.random() * 3);
    const targetRotation = rotation + (randomExtraRounds * 360) + (SECTORS.length - 1 - chosenIndex) * sectorAngle + (sectorAngle / 2);

    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const sector = SECTORS[chosenIndex];
      setSelectedSector(sector);

      if (sector.type === 'bonus') {
        sounds.playVictorySound();
        setShowCelebration(true);
        setResultMessage(`¡Felicidades! Has caído en "${sector.label}" y ganado ${sector.stars} Estrellas Mágicas.`);
        setShowResultModal(true);
        completeStudySession({
          sessionType: 'review',
          durationSeconds: 15,
          totalQuestions: 1,
          correctAnswers: 1,
          starsEarned: sector.stars
        }).catch(() => {});
        if (onStarsEarned) onStarsEarned(sector.stars);
      } else {
        // Seleccionar una pregunta de los temas
        sounds.playMatchSound();
        const mcEx = exercises.find(e => e.type === 'multiple_choice' && (e as any).question && (e as any).options);
        if (mcEx && mcEx.type === 'multiple_choice') {
          setActiveQuestion({
            q: mcEx.question,
            opts: [...mcEx.options].sort(() => Math.random() - 0.5),
            ans: mcEx.correctAnswer
          });
        } else {
          setActiveQuestion({
            q: '¿Qué animal tiene esqueleto óseo en su interior?',
            opts: ['El gato', 'El caracol', 'La mariposa'],
            ans: 'El gato'
          });
        }
        setShowResultModal(true);
      }
    }, 4200);
  };

  const handleAnswerQuestion = (selectedOption: string) => {
    if (!activeQuestion || !selectedSector) return;

    if (selectedOption === activeQuestion.ans) {
      sounds.playVictorySound();
      setShowCelebration(true);
      setResultMessage(`¡Respuesta Perfecta! Ganaste ${selectedSector.stars} Estrellas Mágicas.`);
      completeStudySession({
        sessionType: 'review',
        durationSeconds: 20,
        totalQuestions: 1,
        correctAnswers: 1,
        starsEarned: selectedSector.stars
      }).catch(() => {});
      if (onStarsEarned) onStarsEarned(selectedSector.stars);
      setActiveQuestion(null);
    } else {
      sounds.playWobbleSound();
      setResultMessage(`¡Casi! La respuesta correcta era: "${activeQuestion.ans}". ¡Gira otra vez para tener suerte!`);
      setActiveQuestion(null);
    }
  };

  const numSectors = SECTORS.length;
  const radius = 150;
  const center = 160;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 animate-fade-in space-y-6">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a Juegos</span>
        </button>

        <span className="inline-block bg-sunny-100 text-amber-900 border border-sunny-300 font-black text-xs md:text-sm px-4 py-1.5 rounded-full">
          🎡 Ruleta de la Suerte de Chispa
        </span>
      </div>

      {/* Contenedor Ruleta */}
      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        {/* Puntero arriba */}
        <div className="relative flex flex-col items-center">
          <div className="z-20 -mb-4 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[30px] border-t-rose-600 drop-shadow-md" />

          {/* SVG de la Ruleta */}
          <div
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.2s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
            }}
            className="w-72 h-72 md:w-84 md:h-84 rounded-full shadow-2xl border-6 border-white bg-slate-900 select-none overflow-hidden"
          >
            <svg viewBox="0 0 320 320" className="w-full h-full">
              {SECTORS.map((sec, idx) => {
                const angle = (360 / numSectors);
                const startAngle = idx * angle;
                const endAngle = (idx + 1) * angle;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = center + radius * Math.cos(startRad);
                const y1 = center + radius * Math.sin(startRad);
                const x2 = center + radius * Math.cos(endRad);
                const y2 = center + radius * Math.sin(endRad);

                const midAngle = startAngle + angle / 2;
                const midRad = (midAngle * Math.PI) / 180;
                const textX = center + (radius * 0.65) * Math.cos(midRad);
                const textY = center + (radius * 0.65) * Math.sin(midRad);

                return (
                  <g key={idx}>
                    <path
                      d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
                      fill={sec.color}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                    >
                      {sec.label}
                    </text>
                  </g>
                );
              })}
              {/* Centro de la Ruleta */}
              <circle cx={center} cy={center} r="32" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="4" />
              <circle cx={center} cy={center} r="22" fill="#F59E0B" />
              <text x={center} y={center + 4} textAnchor="middle" fontSize="16" fill="#FFFFFF" fontWeight="900">
                ★
              </text>
            </svg>
          </div>
        </div>

        {/* Botón de girar táctil gigante para iPad */}
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className={`px-10 py-5 rounded-3xl font-black text-xl md:text-2xl text-white shadow-xl flex items-center gap-3 transition-all transform active:scale-95 ${
            isSpinning
              ? 'bg-slate-400 cursor-not-allowed opacity-75'
              : 'bg-gradient-to-r from-sunny-500 via-amber-500 to-orange-500 hover:from-sunny-600 hover:to-orange-600 shadow-amber-300 animate-pulse'
          }`}
        >
          <Sparkles className="w-7 h-7" />
          <span>{isSpinning ? '¡Girando la suerte...' : '¡GIRAR RULETA!'}</span>
        </button>
      </div>

      {/* Modal interactivo de resultado o pregunta */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl p-6 md:p-8 max-w-md w-full border-4 border-amber-400 shadow-2xl text-center space-y-5 animate-scale-up">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 text-amber-500 flex items-center justify-center">
              <Trophy className="w-10 h-10" />
            </div>

            {/* Si es una pregunta de desafío */}
            {activeQuestion ? (
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                  ⚡ Reto de la Ruleta (+{selectedSector?.stars} Estrellas)
                </span>
                <h4 className="text-lg md:text-xl font-black text-slate-800">
                  {activeQuestion.q}
                </h4>

                <div className="space-y-2 text-left">
                  {activeQuestion.opts.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerQuestion(opt)}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-magic-50 border-2 border-slate-200 hover:border-magic-400 font-bold text-slate-700 text-sm text-left active:scale-98 transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Mensaje de bono directo
              <div className="space-y-4">
                <h4 className="text-2xl font-black text-slate-800">
                  {resultMessage}
                </h4>

                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-md active:scale-95 transition-all"
                >
                  ¡Genial, gracias!
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
