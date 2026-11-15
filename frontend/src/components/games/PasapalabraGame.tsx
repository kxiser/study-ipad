import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Volume2,
  RotateCcw,
  Trophy,
  Check,
  X,
  FastForward,
  Star,
  Flame,
  Award
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { completeStudySession } from '../../services/api.js';
import { ExerciseItem } from '../../types.js';
import { Mascot } from '../Mascot.js';
import { getSelectedCharacter } from '../../utils/characters.js';

interface PasapalabraGameProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

interface RoscoLetter {
  letter: string;
  question: string;
  answer: string;
  options: string[];
  explanation: string;
  subject: string;
  status: 'pending' | 'passed' | 'correct' | 'wrong';
}

// Banco curricular para el Rosco de 3.º de Primaria (Madrid)
const DEFAULT_ROSCO_DATA: Omit<RoscoLetter, 'status'>[] = [
  {
    letter: 'A',
    question: 'Empieza por A: Animal vertebrado con plumas, dos alas y pico que pone huevos.',
    answer: 'Ave',
    options: ['Ave', 'Anfibio', 'Arácnido'],
    explanation: '¡Genial! Las aves tienen plumas, alas y son ovíparas.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'B',
    question: 'Empieza por B: Órgano respiratorio de los peces para respirar bajo el agua.',
    answer: 'Branquias',
    options: ['Branquias', 'Boca', 'Bolsa'],
    explanation: '¡Exacto! Las branquias absorben el oxígeno del agua.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'C',
    question: 'Empieza por C: Fortaleza de piedra con torres y murallas donde vivían reyes y caballeros en la Edad Media.',
    answer: 'Castillo',
    options: ['Castillo', 'Cabaña', 'Choza'],
    explanation: '¡Muy bien! Los castillos protegían a los reyes y aldeanos.',
    subject: 'Ciencias Sociales'
  },
  {
    letter: 'D',
    question: 'Empieza por D: Grandes reptiles prehistóricos extintos cuyos fósiles estudian los paleontólogos.',
    answer: 'Dinosaurios',
    options: ['Dinosaurios', 'Delfines', 'Dragones'],
    explanation: '¡Fantástico! Los dinosaurios dominaron la Tierra hace millones de años.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'E',
    question: 'Empieza por E: Conjunto de todos los huesos que sostienen el cuerpo humano.',
    answer: 'Esqueleto',
    options: ['Esqueleto', 'Estómago', 'Espalda'],
    explanation: '¡Correcto! El esqueleto humano tiene más de 200 huesos.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'F',
    question: 'Empieza por F: Restos de animales o plantas petrificados en rocas desde hace miles de años.',
    answer: 'Fósil',
    options: ['Fósil', 'Fuego', 'Flor'],
    explanation: '¡Eso es! Los fósiles nos enseñan cómo era el pasado.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'G',
    question: 'Empieza por G: Capa de vapor de agua o aire que no tiene forma propia y flota libremente.',
    answer: 'Gas',
    options: ['Gas', 'Gota', 'Glaciar'],
    explanation: '¡Bien pensado! El agua en estado gaseoso es vapor de agua.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'H',
    question: 'Empieza por H: Pieza dura y blanca del esqueleto que protege órganos como el cerebro o el corazón.',
    answer: 'Hueso',
    options: ['Hueso', 'Hígado', 'Hombro'],
    explanation: '¡Fenomenal! Los huesos nos permiten estar de pie y correr.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'I',
    question: 'Empieza por I: Animal que no tiene columna vertebral ni huesos por dentro.',
    answer: 'Invertebrado',
    options: ['Invertebrado', 'Insectívoro', 'Indígena'],
    explanation: '¡Excelente! Los insectos, gusanos y moluscos son invertebrados.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'L',
    question: 'Empieza por L: Terreno plano y sin montañas donde se cultiva y pastan animales.',
    answer: 'Llanura',
    options: ['Llanura', 'Laguna', 'Ladera'],
    explanation: '¡Perfecto! Las llanuras son grandes extensiones de tierra llana.',
    subject: 'Ciencias Sociales'
  },
  {
    letter: 'M',
    question: 'Empieza por M: Roca fundida y ardiente dentro de un volcán antes de salir a la superficie.',
    answer: 'Magma',
    options: ['Magma', 'Mineral', 'Montaña'],
    explanation: '¡Genial! Cuando el magma sale al exterior se llama lava.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'N',
    question: 'Empieza por N: Masa flotante en el cielo formada por millones de gotitas de agua.',
    answer: 'Nube',
    options: ['Nube', 'Nieve', 'Niebla'],
    explanation: '¡Muy bien! Las nubes se forman por la condensación del vapor.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'O',
    question: 'Empieza por O: Animal que nace de un huevo, como las aves, los peces o las tortugas.',
    answer: 'Ovíparo',
    options: ['Ovíparo', 'Omnívoro', 'Oveja'],
    explanation: '¡Correcto! Los ovíparos se desarrollan dentro de un huevo.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'P',
    question: 'Empieza por P: Cuerpo celeste como la Tierra, Marte o Júpiter que gira alrededor del Sol.',
    answer: 'Planeta',
    options: ['Planeta', 'Polvo', 'Piedra'],
    explanation: '¡Exacto! Hay 8 planetas principales en el Sistema Solar.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'R',
    question: 'Empieza por R: Monumento romano de Segovia con altos arcos para transportar agua potable.',
    answer: 'Acueducto Romano',
    options: ['Acueducto Romano', 'Río', 'Rueda'],
    explanation: '¡Eso es! El Acueducto de Segovia fue una gran obra romana.',
    subject: 'Ciencias Sociales'
  },
  {
    letter: 'S',
    question: 'Empieza por S: Estrella brillante en el centro de nuestro Sistema Solar que nos da luz y calor.',
    answer: 'Sol',
    options: ['Sol', 'Saturno', 'Sombra'],
    explanation: '¡Fantástico! Sin el Sol no existiría la vida en la Tierra.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'T',
    question: 'Empieza por T: Nuestro planeta, el tercer planeta desde el Sol y el único con vida conocida.',
    answer: 'Tierra',
    options: ['Tierra', 'Terremoto', 'Túnel'],
    explanation: '¡Fenomenal! La Tierra tiene agua líquida y atmósfera para respirar.',
    subject: 'Ciencias Naturales'
  },
  {
    letter: 'V',
    question: 'Empieza por V: Grieta en la corteza terrestre por donde sale lava, gases y cenizas.',
    answer: 'Volcán',
    options: ['Volcán', 'Valle', 'Viento'],
    explanation: '¡Excelente! Los volcanes conectan el interior de la Tierra con el exterior.',
    subject: 'Ciencias Naturales'
  }
];

export const PasapalabraGame: React.FC<PasapalabraGameProps> = ({
  exercises = [],
  title = 'El Gran Rosco de las Palabras',
  onBack,
  onStarsEarned
}) => {
  const [letters, setLetters] = useState<RoscoLetter[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const hero = getSelectedCharacter();

  // Inicializar el Rosco adaptado a los temas seleccionados
  useEffect(() => {
    const roscoMap = new Map<string, Omit<RoscoLetter, 'status'>>();

    // Cargar defaults
    DEFAULT_ROSCO_DATA.forEach(d => roscoMap.set(d.letter.toUpperCase(), d));

    // Si hay ejercicios de temas seleccionados, extraer definiciones reales para el Rosco
    if (exercises && exercises.length > 0) {
      for (const ex of exercises) {
        let answer = '';
        let question = '';
        let options: string[] = [];
        let explanation = ex.explanation || '';
        let subject = (ex as any).unitSubject || 'Temario Escolar';

        if (ex.type === 'multiple_choice' && ex.correctAnswer && ex.question) {
          answer = ex.correctAnswer.trim();
          question = ex.question;
          options = ex.options || [answer];
        } else if (ex.type === 'fill_blank' && ex.correctAnswer && ex.textWithBlank) {
          answer = ex.correctAnswer.trim();
          question = `Completa: ${ex.textWithBlank}`;
          options = ex.options || [answer];
        } else if (ex.type === 'matching' && ex.pairs && ex.pairs.length > 0) {
          answer = ex.pairs[0].right.trim();
          question = `Se relaciona con: ${ex.pairs[0].left}`;
          options = [answer, ...ex.pairs.slice(1).map(p => p.right)];
        }

        if (answer.length >= 2) {
          // Obtener primera letra limpia
          const firstChar = answer[0].toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (/^[A-Z]$/.test(firstChar)) {
            // Asegurar que haya opciones válidas
            const cleanOptions = Array.from(new Set([answer, ...options])).slice(0, 3);
            while (cleanOptions.length < 3) {
              cleanOptions.push('Otra respuesta');
            }

            roscoMap.set(firstChar, {
              letter: firstChar,
              question: question.includes('Empieza por') ? question : `Empieza por ${firstChar}: ${question}`,
              answer,
              options: cleanOptions.sort(() => Math.random() - 0.5),
              explanation: explanation || `¡Correcto! ${answer} es la respuesta.`,
              subject
            });
          }
        }
      }
    }

    // Ordenar alfabéticamente las letras del Rosco
    const sortedLetters = Array.from(roscoMap.values())
      .sort((a, b) => a.letter.localeCompare(b.letter))
      .slice(0, 16); // 16 letras para una partida ágil en iPad

    const initialized: RoscoLetter[] = sortedLetters.map(d => ({
      ...d,
      status: 'pending'
    }));

    setLetters(initialized);
    setCurrentIndex(0);
    setSecondsLeft(180);
    setIsFinished(false);
    setShowCelebration(false);
  }, [exercises]);

  // Temporizador amable (sin estrés para niños)
  useEffect(() => {
    if (isFinished || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          setIsFinished(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, secondsLeft]);

  // Contar aciertos y fallos
  const correctCount = useMemo(() => letters.filter(l => l.status === 'correct').length, [letters]);
  const wrongCount = useMemo(() => letters.filter(l => l.status === 'wrong').length, [letters]);
  const pendingCount = useMemo(() => letters.filter(l => l.status === 'pending' || l.status === 'passed').length, [letters]);

  // Letra actual
  const currentLetter = letters[currentIndex];

  // Buscar siguiente letra pendiente
  const findNextIndex = (fromIdx: number, list: RoscoLetter[]) => {
    for (let i = 1; i <= list.length; i++) {
      const next = (fromIdx + i) % list.length;
      if (list[next].status === 'pending' || list[next].status === 'passed') {
        return next;
      }
    }
    return -1; // Todas completadas
  };

  // Manejar respuesta del niño
  const handleAnswer = (selectedOption: string) => {
    if (!currentLetter || isFinished) return;

    const isCorrect = selectedOption.trim().toLowerCase() === currentLetter.answer.trim().toLowerCase();

    if (isCorrect) {
      sounds.playMatchSound();
      setFeedback({
        isCorrect: true,
        text: `¡Correcto! ${currentLetter.explanation}`
      });
    } else {
      sounds.playWobbleSound();
      setFeedback({
        isCorrect: false,
        text: `¡Casi! Era "${currentLetter.answer}". ${currentLetter.explanation}`
      });
    }

    const updated = [...letters];
    updated[currentIndex] = {
      ...currentLetter,
      status: isCorrect ? 'correct' : 'wrong'
    };
    setLetters(updated);

    setTimeout(() => {
      setFeedback(null);
      const nextIdx = findNextIndex(currentIndex, updated);
      if (nextIdx === -1) {
        // Rosco completado
        setIsFinished(true);
        setShowCelebration(true);
        sounds.playVictorySound();
        const earnedStars = Math.max(3, Math.round((updated.filter(l => l.status === 'correct').length / updated.length) * 5));
        completeStudySession({
          sessionType: 'new',
          durationSeconds: 180 - secondsLeft,
          totalQuestions: updated.length,
          correctAnswers: updated.filter(l => l.status === 'correct').length,
          starsEarned: earnedStars
        }).catch(() => {});
        if (onStarsEarned) onStarsEarned(earnedStars);
      } else {
        setCurrentIndex(nextIdx);
      }
    }, 1400);
  };

  // Botón ¡Pasapalabra!
  const handlePass = () => {
    if (!currentLetter || isFinished) return;
    sounds.playFlipSound();

    const updated = [...letters];
    updated[currentIndex] = {
      ...currentLetter,
      status: 'passed'
    };
    setLetters(updated);

    const nextIdx = findNextIndex(currentIndex, updated);
    if (nextIdx !== -1) {
      setCurrentIndex(nextIdx);
    }
  };

  // Reiniciar juego
  const handleRestart = () => {
    setLetters(DEFAULT_ROSCO_DATA.map(d => ({ ...d, status: 'pending' })));
    setCurrentIndex(0);
    setSecondsLeft(180);
    setIsFinished(false);
    setShowCelebration(false);
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-4 animate-fade-in select-none">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra superior con volver, aciertos y temporizador */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-black text-xs md:text-sm active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Juegos</span>
        </button>

        {/* Marcador TV Pasapalabra */}
        <div className="flex items-center gap-2">
          {/* Aciertos Verdes */}
          <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-3.5 py-1.5 rounded-2xl font-black text-sm shadow-md border-2 border-emerald-400">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{correctCount}</span>
          </div>

          {/* Fallos Rojos */}
          <div className="flex items-center gap-1.5 bg-rose-500 text-white px-3.5 py-1.5 rounded-2xl font-black text-sm shadow-md border-2 border-rose-400">
            <X className="w-4 h-4 stroke-[3]" />
            <span>{wrongCount}</span>
          </div>

          {/* Temporizador */}
          <div className="flex items-center gap-1 bg-amber-400 text-amber-950 px-3.5 py-1.5 rounded-2xl font-black text-sm shadow-md border-2 border-amber-300">
            <span>⏱️ {secondsLeft}s</span>
          </div>
        </div>
      </div>

      {/* EL GRAN ROSCO CIRCULAR INTERACTIVO */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 rounded-4xl p-6 md:p-8 text-white shadow-2xl border-4 border-indigo-500/50 relative overflow-hidden flex flex-col items-center">
        {/* Rosco Circular de Letras */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-2 flex items-center justify-center">
          {/* Círculo central con la mascota */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/10 backdrop-blur-md border-4 border-white/30 flex flex-col items-center justify-center shadow-inner z-10 text-center p-2">
            <span className="text-4xl sm:text-5xl animate-bounce">{hero.emoji}</span>
            <span className="text-xs font-black text-amber-300 mt-1 uppercase tracking-wider">
              {currentLetter ? `Letra ${currentLetter.letter}` : '¡Fin!'}
            </span>
          </div>

          {/* Letras en órbita circular */}
          {letters.map((item, idx) => {
            const total = letters.length;
            const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
            const radius = 115; // Radio en px (adaptable para iPad)
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            const isCurrent = idx === currentIndex && !isFinished;

            let badgeStyle = 'bg-blue-600 text-white border-blue-400';
            if (item.status === 'correct') {
              badgeStyle = 'bg-emerald-500 text-white border-emerald-300 shadow-emerald-400/50 scale-105';
            } else if (item.status === 'wrong') {
              badgeStyle = 'bg-rose-500 text-white border-rose-300 shadow-rose-400/50';
            } else if (item.status === 'passed') {
              badgeStyle = 'bg-amber-400 text-amber-950 border-amber-200 animate-pulse';
            }

            if (isCurrent) {
              badgeStyle = 'bg-white text-indigo-950 border-amber-400 scale-125 shadow-xl ring-4 ring-amber-400 animate-bounce';
            }

            return (
              <div
                key={item.letter}
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
                className={`absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-black text-xs sm:text-sm shadow-md transition-all duration-300 ${badgeStyle}`}
              >
                {item.letter}
              </div>
            );
          })}
        </div>

        {/* Panel de Pregunta y Definición con Botón de Voz */}
        {currentLetter && !isFinished && (
          <div className="w-full max-w-xl bg-white/10 backdrop-blur-md rounded-3xl p-5 border-2 border-white/20 mt-3 space-y-4 text-center">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-white/10 px-3 py-1 rounded-full">
                {currentLetter.subject}
              </span>

              <div className="flex items-center gap-2">
                <SpeechButton text={currentLetter.question} size="sm" />
                <span className="text-xs font-bold text-blue-200">
                  {pendingCount} restantes
                </span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg md:text-xl font-black text-white leading-snug drop-shadow-md">
              {currentLetter.question}
            </h3>

            {/* Opciones de Respuesta Táctiles para iPad */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {currentLetter.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleAnswer(opt)}
                  disabled={feedback !== null}
                  className="p-3.5 rounded-2xl bg-white hover:bg-amber-100 text-slate-800 font-black text-sm sm:text-base shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Botón ¡Pasapalabra! */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handlePass}
                disabled={feedback !== null}
                className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                <FastForward className="w-4 h-4" />
                <span>¡PASAPALABRA! (Saltar a la siguiente letra)</span>
              </button>
            </div>

            {/* Feedback Pedagógico Flotante */}
            {feedback && (
              <div
                className={`p-3 rounded-2xl font-black text-xs sm:text-sm animate-scale-up ${
                  feedback.isCorrect
                    ? 'bg-emerald-500 text-white border-2 border-emerald-300'
                    : 'bg-rose-500 text-white border-2 border-rose-300'
                }`}
              >
                {feedback.text}
              </div>
            )}
          </div>
        )}

        {/* PANTALLA FINAL AL COMPLETAR EL ROSCO */}
        {isFinished && (
          <div className="w-full max-w-md bg-white rounded-4xl p-8 text-center text-slate-800 space-y-5 shadow-2xl border-4 border-amber-400 animate-scale-up my-4">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
            <h3 className="text-2xl md:text-3xl font-black text-slate-800">
              ¡Rosco Completado!
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              {correctCount >= letters.length * 0.7
                ? '¡Enhorabuena, Samantha! Has dominado el Rosco de las Palabras con matrícula de honor.'
                : '¡Gran esfuerzo! Cada vez conoces más conceptos de tus temas escolares.'}
            </p>

            {/* Puntuación */}
            <div className="flex items-center justify-center gap-3 py-1">
              <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-4 py-2 rounded-2xl font-black text-sm">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{correctCount} Aciertos</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-100 text-amber-950 border border-amber-300 px-4 py-2 rounded-2xl font-black text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>+5 Estrellas</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-emerald-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jugar otro Rosco</span>
              </button>
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm active:scale-95 transition-all"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
