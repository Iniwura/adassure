import { useEffect, useRef } from 'react';

type KeyChordAction = () => void;

export interface ChordRegistry {
  [key: string]: {
    [secondKey: string]: KeyChordAction;
  };
}

export interface SingleKeyRegistry {
  [key: string]: KeyChordAction;
}

export function useKeyChords(
  chords: ChordRegistry,
  singleKeys: SingleKeyRegistry = {},
  chordTimeoutMs = 500
) {
  const stateRef = useRef<'IDLE' | 'WAITING_FOR_CHORD'>('IDLE');
  const firstKeyRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const chordsRef = useRef(chords);
  const singleKeysRef = useRef(singleKeys);

  useEffect(() => {
    chordsRef.current = chords;
    singleKeysRef.current = singleKeys;
  }, [chords, singleKeys]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      // 1. Skip when typing in an input, textarea, or contentEditable container
      if (
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.isContentEditable)
      ) {
        return;
      }

      // 2. Ignore browser modifier combos (Cmd+R, Ctrl+C, Alt+Tab)
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      // If waiting for second key of chord
      if (stateRef.current === 'WAITING_FOR_CHORD' && firstKeyRef.current) {
        const firstKey = firstKeyRef.current;
        const secondAction = chordsRef.current[firstKey]?.[key];

        // Reset timer and state
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        stateRef.current = 'IDLE';
        firstKeyRef.current = null;

        if (secondAction) {
          event.preventDefault();
          secondAction();
        }
        return;
      }

      // If idle, check if this key starts a registered chord
      if (chordsRef.current[key]) {
        stateRef.current = 'WAITING_FOR_CHORD';
        firstKeyRef.current = key;

        timerRef.current = setTimeout(() => {
          stateRef.current = 'IDLE';
          firstKeyRef.current = null;
        }, chordTimeoutMs);
        return;
      }

      // Check single-key triggers
      if (singleKeysRef.current[key]) {
        event.preventDefault();
        singleKeysRef.current[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [chordTimeoutMs]);
}
