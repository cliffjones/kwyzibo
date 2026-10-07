import { configureStore, createAsyncThunk, createAction, createReducer } from '@reduxjs/toolkit';

import { getRandomId } from './get-random-id';
import { loadPersistedState } from './load-persisted-state';
import { loadItems } from './load-items';
import { persistState } from './persist-state';
import type { AppState, QuizData, QuizItem } from './types';

export const selectTopics = createAction<string[]>('kwyzibo/selectTopics');
export const startQuiz = createAction<QuizData[]>('kwyzibo/startQuiz');
export const rateConfidence = createAction<number>('kwyzibo/rateConfidence');
export const reset = createAsyncThunk('kwyzibo/reset', loadItems);

const createInitialState = (
  loadedItems: QuizItem[] = [],
  customData: QuizData[] = [],
  initializing = true
): AppState => {
  const customItems = customData.map((item, index) => ({
    ...item,
    id: loadedItems.length + index,
    topic: item.topic ?? '',
    confidence: 0
  }));

  const items = [
    ...loadedItems.map((item, index) => ({ ...item, id: index })),
    ...customItems
  ];

  const ids = items.map(item => item.id);

  return {
    items,
    customData: customData.map(item => ({ ...item })),
    initializing,
    selectedTopics: [...new Set(items.map(item => item.topic))],
    remainingIds: ids,
    currentId: ids.length ? getRandomId(ids, items) : null,
  };
};

const createAppReducer = (initialState: AppState) => {
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
          const currentItem = state.items.find(item => item.id === state.currentId);
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

        state.currentId = getRandomId(state.remainingIds, state.items, state.currentId);
      })

      .addCase(selectTopics, (state, action) => {
        state.selectedTopics = action.payload;
      })

      .addCase(startQuiz, (state, action) => {
        const customData: QuizData[] = action.payload;
        const sourceItems = state.items.slice(0, state.items.length - state.customData.length);
        const selectedItems = sourceItems.filter(item => state.selectedTopics.includes(item.topic));
        return createInitialState(selectedItems, customData, false);
      })

      .addCase(reset.fulfilled, (_state, action) => {
        return createInitialState(action.payload);
      });
  });
};

export const createAppStore = (items: QuizItem[]) => {
  const savedState = loadPersistedState();
  const initialState = savedState ?? createInitialState(items);

  const store = configureStore({
    reducer: { kwyzibo: createAppReducer(initialState) }
  });

  persistState(store.getState().kwyzibo);
  store.subscribe(() => persistState(store.getState().kwyzibo));
  return store;
};

type AppStore = ReturnType<typeof createAppStore>;

export type RootState = ReturnType<AppStore['getState']>;

export type AppDispatch = AppStore['dispatch'];
