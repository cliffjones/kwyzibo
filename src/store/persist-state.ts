import { AppState } from './types';
import { STORAGE_KEY } from './constants';

export const persistState = (state: AppState) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Unable to save quiz state.', error);
  }
};
