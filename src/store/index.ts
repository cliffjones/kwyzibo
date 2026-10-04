import { configureStore, createAction, createReducer } from '@reduxjs/toolkit';

import { getRandomId } from './get-random-id';
import type { QuizItem } from './types';

type KwyziboState = {
  items: QuizItem[];
  remainingIds: number[];
  currentId: number | null;
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
        if (state.currentId == null) {
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
