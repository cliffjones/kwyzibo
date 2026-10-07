import { configureStore, createAsyncThunk, createAction, createReducer } from '@reduxjs/toolkit';

import { DEFAULT_CUSTOM_DATA } from '../components/initial-setup/constants';
import { getRandomId } from './get-random-id';
import { loadPersistedState } from './load-persisted-state';
import { loadItems } from './load-items';
import { parseQuizData } from './parse-quiz-data';
import { persistState } from './persist-state';
import type { AppState, QuizItem } from './types';

export const selectTopics = createAction<string[]>('kwyzibo/selectTopics');
export const setCustomData = createAction<string>('kwyzibo/setCustomData');
export const startQuiz = createAction('kwyzibo/startQuiz');
export const rateConfidence = createAction<number>('kwyzibo/rateConfidence');
export const reset = createAsyncThunk(
  'kwyzibo/reset',
  async (path: string) => ({ items: await loadItems(path), path })
);

const createInitialState = (
  sourcePath = '/',
  loadedItems: QuizItem[] = [],
  customData = DEFAULT_CUSTOM_DATA,
  initializing = true
): AppState => {
  const items = loadedItems.map((item, index) => ({ ...item, id: index }));
  if (!initializing) {
    items.push(...parseQuizData(customData).map((item, index) => ({
      ...item,
      id: items.length + index,
      topic: item.topic ?? '',
      confidence: 0
    })));
  }

  const ids = items.map(item => item.id);

  return {
    items,
    customData,
    initializing,
    sourcePath,
    selectedTopics: [...new Set(items.map(item => item.topic))],
    remainingIds: ids,
    currentId: ids.length ? getRandomId(ids, items) : null
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

      .addCase(setCustomData, (state, action) => {
        state.customData = action.payload;
      })

      .addCase(startQuiz, state => {
        const selectedItems = state.items.filter(item => state.selectedTopics.includes(item.topic));
        return createInitialState(state.sourcePath, selectedItems, state.customData, false);
      })

      .addCase(reset.fulfilled, (state, action) => {
        const nextState = createInitialState(action.payload.path, action.payload.items, state.customData);
        nextState.selectedTopics = state.selectedTopics;
        return nextState;
      });
  });
};

export const createAppStore = (sourcePath = '/', items: QuizItem[] = []) => {
  const savedState = loadPersistedState();
  const restoredState = savedState?.sourcePath === sourcePath
    ? { ...savedState, sourcePath }
    : null;
  const initialState = restoredState ?? createInitialState(sourcePath, items, DEFAULT_CUSTOM_DATA);

  const store = configureStore({
    reducer: { kwyzibo: createAppReducer(initialState) }
  });

  persistState(store.getState().kwyzibo);
  store.subscribe(() => persistState(store.getState().kwyzibo));
  return store;
};

type AppStore = ReturnType<typeof createAppStore>;
export type { AppStore };
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
