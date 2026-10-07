import { AppState } from './types';
import { isAppState } from './is-app-state';
import { isQuizItem } from './is-quiz-item';
import { STORAGE_KEY } from './constants';

export const loadPersistedState = (): AppState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const serializedState = window.localStorage.getItem(STORAGE_KEY);
    if (serializedState == null) {
      return null;
    }

    let state: unknown = JSON.parse(serializedState);
    if (state != null && typeof state === 'object' && !('selectedTopics' in state)) {
      const savedState = state as Record<string, unknown>;
      if (Array.isArray(savedState.items) && savedState.items.every(isQuizItem)) {
        state = {
          ...savedState,
          selectedTopics: [...new Set(savedState.items.map(item => item.topic))]
        };
      }
    }

    if (isAppState(state)) {
      return state;
    }

    console.error('Unable to restore saved quiz state: invalid data.');
  } catch (error) {
    console.error('Unable to restore saved quiz state.', error);
  }

  return null;
};
