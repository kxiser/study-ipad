import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function fireSuccessConfetti() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#3B82F6']
  });
}

export function fireBigVictoryConfetti() {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#F59E0B', '#8B5CF6', '#10B981']
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#EC4899', '#F59E0B', '#06B6D4']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export const ConfettiCelebration: React.FC = () => {
  useEffect(() => {
    fireBigVictoryConfetti();
  }, []);

  return null;
};

export default ConfettiCelebration;
