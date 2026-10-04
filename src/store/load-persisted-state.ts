import { AppState } from './types';
import { isAppState } from './is-app-state';
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

    const state: unknown = JSON.parse(serializedState);
    if (isAppState(state)) {
      return state;
    }

    console.error('Unable to restore saved quiz state: invalid data.');
  } catch (error) {
    console.error('Unable to restore saved quiz state.', error);
  }

  return null;
};
