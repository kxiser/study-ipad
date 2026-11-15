import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeaking } from '../services/speech.js';

interface SpeechButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SpeechButton: React.FC<SpeechButtonProps> = ({ text, className = '', size = 'md' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(text, () => setIsSpeaking(false));
    }
  };

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg'
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title="Escuchar en voz alta"
      aria-label="Escuchar en voz alta"
      className={`rounded-full transition-all duration-200 active:scale-95 shadow-sm border ${
        isSpeaking
          ? 'bg-sunny-400 text-amber-950 border-sunny-500 animate-pulse'
          : 'bg-white text-magic-600 border-magic-200 hover:bg-magic-50'
      } ${sizeClasses[size]} ${className}`}
    >
      {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
    </button>
  );
};
