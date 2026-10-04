import { AppState } from './types';
import { isQuizItem } from './is-quiz-item';

export const isAppState = (value: unknown): value is AppState => {
  if (typeof value !== 'object' || value == null) {
    return false;
  }

  const state = value as Record<string, unknown>;
  if (!Array.isArray(state.items) || !state.items.every(isQuizItem)
    || !Array.isArray(state.remainingIds)
    || !state.remainingIds.every(id => typeof id === 'number' && Number.isInteger(id))) {
    return false;
  }

  const itemIds = new Set(state.items.map(item => item.id));
  const remainingIds = new Set(state.remainingIds);
  return itemIds.size === state.items.length
    && remainingIds.size === state.remainingIds.length
    && state.remainingIds.every(id => itemIds.has(id))
    && (state.remainingIds.length === 0
      ? state.currentId == null
      : typeof state.currentId === 'number' && remainingIds.has(state.currentId));
};
