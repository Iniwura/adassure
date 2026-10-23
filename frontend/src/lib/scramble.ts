import { useState, useEffect } from 'react';

export function useScrambleOnMount(target: number | string, ms = 950): string {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const isNum = typeof target === 'number';
    const targetStr = String(target);
    const start = performance.now();
    const chars = isNum ? '0123456789' : '0123456789ABCDEF';
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      const len = targetStr.length;
      const revealed = Math.floor(eased * len);
      const scrambled =
        targetStr.slice(0, revealed) +
        Array.from({ length: len - revealed }, () =>
          chars[Math.floor(Math.random() * chars.length)]
        ).join('');

      setDisplay(scrambled);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);

  return display;
}
