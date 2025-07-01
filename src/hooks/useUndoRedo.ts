
import { useState, useCallback } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export const useUndoRedo = <T>(initialState: T) => {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;

    setState(prevState => {
      const previous = prevState.past[prevState.past.length - 1];
      const newPast = prevState.past.slice(0, prevState.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [prevState.present, ...prevState.future],
      };
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setState(prevState => {
      const next = prevState.future[0];
      const newFuture = prevState.future.slice(1);

      return {
        past: [...prevState.past, prevState.present],
        present: next,
        future: newFuture,
      };
    });
  }, [canRedo]);

  const set = useCallback((newState: T) => {
    setState(prevState => ({
      past: [...prevState.past, prevState.present],
      present: newState,
      future: [],
    }));
  }, []);

  return {
    state: state.present,
    canUndo,
    canRedo,
    undo,
    redo,
    set,
  };
};
