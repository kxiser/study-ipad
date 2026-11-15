import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Trophy, RotateCcw, Volume2, Sparkles, Swords, RefreshCw, Zap } from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { fireSuccessConfetti } from '../ConfettiCelebration.js';
import { CURRICULUM_3_PRIMARIA, CurriculumTopic } from '../../data/curriculum3Primaria.js';
import { Exercise } from '../../types.js';

interface SplitScreenDuelGameProps {
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

interface PlayerState {
  name: string;
  emoji: string;
  color: string;
  score: number;
  frozenUntil: number;
}

export const SplitScreenDuelGame: React.FC<SplitScreenDuelGameProps> = ({
  onBack,
  onStarsEarned
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(CURRICULUM_3_PRIMARIA[1].id);
  const [isFaceToFace, setIsFaceToFace] = useState<boolean>(true); // Modo mesa cara a cara (Jugador 2 rota 180°)
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [targetScore] = useState<number>(5);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [p1Frozen, setP1Frozen] = useState<boolean>(false);
  const [p2Frozen, setP2Frozen] = useState<boolean>(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  // Tema seleccionado
  const currentTopic = useMemo(() => {
    return CURRICULUM_3_PRIMARIA.find(t => t.id === selectedTopicId) || CURRICULUM_3_PRIMARIA[0];
  }, [selectedTopicId]);

  // Lista de ejercicios del tema
  const questions: Exercise[] = useMemo(() => {
    return [...currentTopic.exercises].sort(() => Math.random() - 0.5);
  }, [currentTopic]);

  const currentQ = questions[currentIndex % questions.length] as any;

  // Opciones barajadas para la pregunta actual
  const shuffledOptions = useMemo(() => {
    if (!currentQ || !currentQ.options) return [];
    return [...currentQ.options].sort(() => Math.random() - 0.5);
  }, [currentIndex, currentQ]);

  const handleStartGame = () => {
    setP1Score(0);
    setP2Score(0);
    setP1Frozen(false);
    setP2Frozen(false);
    setCurrentIndex(0);
    setWinner(null);
    setGameStarted(true);
    sounds.playMatchSound();
  };

  const handlePlayerAnswer = (player: 1 | 2, option: string) => {
    if (winner || !currentQ) return;
    if (player === 1 && p1Frozen) return;
    if (player === 2 && p2Frozen) return;

    const isCorrect = option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      sounds.playMatchSound();
      if (player === 1) {
        const nextScore = p1Score + 1;
        setP1Score(nextScore);
        setFlashMessage('¡Punto para Jugador 1 (Azul)! 🔵');
        if (nextScore >= targetScore) {
          setWinner(1);
          fireSuccessConfetti();
          sounds.playVictorySound();
          if (onStarsEarned) onStarsEarned(5);
        } else {
          setTimeout(() => nextRound(), 800);
        }
      } else {
        const nextScore = p2Score + 1;
        setP2Score(nextScore);
        setFlashMessage('¡Punto para Jugador 2 (Rojo)! 🔴');
        if (nextScore >= targetScore) {
          setWinner(2);
          fireSuccessConfetti();
          sounds.playVictorySound();
          if (onStarsEarned) onStarsEarned(5);
        } else {
          setTimeout(() => nextRound(), 800);
        }
      }
    } else {
      // Fallo: congelar al jugador 1.5s
      sounds.playWobbleSound();
      if (player === 1) {
        setP1Frozen(true);
        setTimeout(() => setP1Frozen(false), 1500);
      } else {
        setP2Frozen(true);
        setTimeout(() => setP2Frozen(false), 1500);
      }
    }
  };

  const nextRound = () => {
    setFlashMessage(null);
    setP1Frozen(false);
    setP2Frozen(false);
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col bg-slate-900 text-white rounded-3xl overflow-hidden select-none border-4 border-slate-700 shadow-2xl relative">
      {/* Barra superior de controles */}
      <div className="bg-slate-950/80 px-4 py-3 flex items-center justify-between border-b border-slate-800 z-20">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
          <Swords className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400">DUELO 1 VS 1</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">{currentTopic.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {gameStarted && (
            <button
              type="button"
              onClick={() => setIsFaceToFace(!isFaceToFace)}
              title={isFaceToFace ? 'Modo mismo sentido' : 'Modo cara a cara (mesa)'}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isFaceToFace
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              🔄 {isFaceToFace ? 'Mesa Frente a Frente' : 'Lado a Lado'}
            </button>
          )}

          {gameStarted && (
            <button
              type="button"
              onClick={handleStartGame}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="Reiniciar partida"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* PANTALLA PREVIA: SELECCIÓN DE TEMA Y COMIENZO */}
      {!gameStarted && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-xl mx-auto animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-xl shadow-amber-500/20 animate-bounce">
            <Swords className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Duelo en Pantalla Dividida
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-semibold">
              Coloca el iPad plano sobre la mesa entre los dos. El primero que toque la respuesta correcta suma puntos. ¡El primero a {targetScore} gana!
            </p>
          </div>

          {/* Selector de tema */}
          <div className="w-full space-y-2 text-left">
            <label className="text-xs font-black uppercase text-amber-400 tracking-wider">
              Elige el Tema para el Duelo:
            </label>
            <select
              value={selectedTopicId}
              onChange={e => setSelectedTopicId(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white font-bold text-sm sm:text-base outline-none focus:border-amber-400"
            >
              {CURRICULUM_3_PRIMARIA.map(t => (
                <option key={t.id} value={t.id}>
                  {t.icon} [{t.subject}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Opciones de orientación */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsFaceToFace(true)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all ${
                isFaceToFace
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              🔄 Cara a Cara (iPad en medio de la mesa)
            </button>
            <button
              type="button"
              onClick={() => setIsFaceToFace(false)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all ${
                !isFaceToFace
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              👥 Lado a Lado (Ambos sentados juntos)
            </button>
          </div>

          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-xl shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Zap className="w-6 h-6 fill-white" />
            <span>¡Comenzar Duelo a {targetScore} Puntos!</span>
          </button>
        </div>
      )}

      {/* PANTALLA DE JUEGO DIVIDIDA */}
      {gameStarted && (
        <div className="flex-1 flex flex-col h-full relative">
          {/* MARCADOR CENTRAL FLOTANTE */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center gap-4 bg-slate-950/95 px-6 py-2.5 rounded-full border-2 border-slate-700 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-rose-400 font-black text-xl sm:text-2xl">
              <span>🔴</span>
              <span>{p2Score}</span>
            </div>
            <span className="text-slate-500 font-bold text-xs">VS</span>
            <div className="flex items-center gap-1.5 text-blue-400 font-black text-xl sm:text-2xl">
              <span>{p1Score}</span>
              <span>🔵</span>
            </div>
          </div>

          {/* FLASH MESSAGE */}
          {flashMessage && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 z-40 bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-lg animate-bounce pointer-events-none">
              {flashMessage}
            </div>
          )}

          {/* JUGADOR 2: ARRIBA (ROJO) */}
          <div
            className={`flex-1 p-4 sm:p-6 flex flex-col justify-between bg-gradient-to-b from-rose-950/40 to-slate-900 border-b-2 border-slate-700 transition-all ${
              isFaceToFace ? 'rotate-180' : ''
            } ${p2Frozen ? 'opacity-40 grayscale pointer-events-none' : ''}`}
          >
            <div className="flex items-center justify-between text-rose-300 font-black text-xs sm:text-sm">
              <span className="flex items-center gap-1.5">
                🔴 Jugador 2 {isFaceToFace && '(Frente a ti)'}
              </span>
              <span className="bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30">
                Puntos: {p2Score} / {targetScore}
              </span>
            </div>

            {/* Enunciado */}
            <div className="my-auto py-2 text-center">
              <h3 className="text-base sm:text-xl font-black text-rose-100">
                {currentQ?.question}
              </h3>
              {p2Frozen && (
                <span className="text-xs font-bold text-rose-400 animate-pulse">
                  ❄️ ¡Fallo! Congelado 1 segundo...
                </span>
              )}
            </div>

            {/* Botones de respuesta */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {shuffledOptions.map((opt, i) => (
                <button
                  key={`p2-${i}-${opt}`}
                  type="button"
                  disabled={p2Frozen || Boolean(winner)}
                  onClick={() => handlePlayerAnswer(2, opt)}
                  className="p-3 sm:p-4 rounded-2xl bg-rose-900/60 hover:bg-rose-800 border-2 border-rose-500/40 text-rose-100 font-extrabold text-xs sm:text-sm active:scale-95 transition-all text-center"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* JUGADOR 1: ABAJO (AZUL) */}
          <div
            className={`flex-1 p-4 sm:p-6 flex flex-col justify-between bg-gradient-to-t from-blue-950/40 to-slate-900 border-t-2 border-slate-700 transition-all ${
              p1Frozen ? 'opacity-40 grayscale pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-between text-blue-300 font-black text-xs sm:text-sm">
              <span className="flex items-center gap-1.5">
                🔵 Jugador 1
              </span>
              <span className="bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                Puntos: {p1Score} / {targetScore}
              </span>
            </div>

            {/* Enunciado */}
            <div className="my-auto py-2 text-center">
              <h3 className="text-base sm:text-xl font-black text-blue-100">
                {currentQ?.question}
              </h3>
              {p1Frozen && (
                <span className="text-xs font-bold text-blue-400 animate-pulse">
                  ❄️ ¡Fallo! Congelado 1 segundo...
                </span>
              )}
            </div>

            {/* Botones de respuesta */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {shuffledOptions.map((opt, i) => (
                <button
                  key={`p1-${i}-${opt}`}
                  type="button"
                  disabled={p1Frozen || Boolean(winner)}
                  onClick={() => handlePlayerAnswer(1, opt)}
                  className="p-3 sm:p-4 rounded-2xl bg-blue-900/60 hover:bg-blue-800 border-2 border-blue-500/40 text-blue-100 font-extrabold text-xs sm:text-sm active:scale-95 transition-all text-center"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VICTORIA */}
      {winner && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in text-center">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-sm w-full border-4 border-amber-400 shadow-2xl space-y-5 animate-scale-up">
            <div className="w-20 h-20 rounded-full bg-amber-400/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                ¡FIN DEL DUELO!
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {winner === 1 ? '¡Gana Jugador 1! 🔵' : '¡Gana Jugador 2! 🔴'}
              </h3>
              <p className="text-slate-300 text-sm font-semibold">
                Marcador final: {p1Score} - {p2Score}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleStartGame}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-black text-base shadow-lg shadow-amber-500/30 transition-all active:scale-95"
              >
                Jugar revancha ⚔️
              </button>
              <button
                type="button"
                onClick={() => setGameStarted(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all"
              >
                Elegir otro tema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
