import { configureStore, createAction, createReducer } from '@reduxjs/toolkit';

import type { QuizItem } from './types';

type KwyziboState = {
  items: QuizItem[];
  remainingIds: number[];
  currentId: number | null;
};

// Returns a random ID from the list, weighted by confidence. Lower ratings are more likely chosen.
const getRandomId = (
  ids: number[],
  items: QuizItem[],
  previousId?: number | null
): number => {
  const choices = ids.filter(id => id !== previousId);
  const candidates = choices.length ? choices : ids;
  const weights = [5, 4, 3, 2, 1];
  const weightedCandidates = candidates.map(id => {
    const confidence = items.find(question => question.id === id)?.confidence ?? 0;
    return { id, weight: weights[confidence] ?? weights[0] };
  });
  const totalWeight = weightedCandidates.reduce(
    (total, candidate) => total + candidate.weight,
    0
  );
  let selection = Math.random() * totalWeight;
  for (const candidate of weightedCandidates) {
    selection -= candidate.weight;
    if (selection < 0) {
      return candidate.id;
    }
  }
  return candidates[candidates.length - 1];
};

export const rateConfidence = createAction<number>('kwyzibo/rateConfidence');
export const restart = createAction('kwyzibo/restart');

const createKwyziboReducer = (items: QuizItem[]) => {
  const initialIds = items.map(question => question.id);
  const initialState: KwyziboState = {
    items: items.map(question => ({ ...question })),
    remainingIds: initialIds,
    currentId: initialIds.length ? getRandomId(initialIds, items) : null
  };

  return createReducer(initialState, builder => {
    builder
      .addCase(rateConfidence, (state, action) => {
        if (state.currentId === null) {
          return;
        }

        const currentIndex = state.remainingIds.indexOf(
          state.currentId
        );

        const rating = action.payload;
        if (currentIndex !== -1) {
          const currentItem = state.items.find(
            question => question.id === state.currentId
          );
          if (currentItem) {
            if (rating > 4) {
              // Remove the current question from rotation if the user reports confidence.
              currentItem.confidence = 0;
              state.remainingIds.splice(currentIndex, 1);
            } else {
              currentItem.confidence = rating;
            }
          }
        }

        if (state.remainingIds.length === 0) {
          state.currentId = null;
          return;
        }

        state.currentId = getRandomId(
          state.remainingIds,
          state.items,
          state.currentId
        );
      })
      .addCase(restart, state => {
        state.remainingIds = [...initialIds];
        state.currentId = initialIds.length
          ? getRandomId(initialIds, state.items)
          : null;
      });
  });
};

export const createAppStore = (items: QuizItem[]) => configureStore({
  reducer: { kwyzibo: createKwyziboReducer(items) }
});

type AppStore = ReturnType<typeof createAppStore>;

export type RootState = ReturnType<AppStore['getState']>;

export type AppDispatch = AppStore['dispatch'];
