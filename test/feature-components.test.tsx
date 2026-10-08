import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { App } from '../src/app';
import { Header } from '../src/features/header';
import { InitialSetup } from '../src/features/initial-setup';
import { CUSTOM_DATA_EXAMPLE } from '../src/features/initial-setup/constants';
import { createAppStore, rateConfidence, setCustomData, setDarkMode, startQuiz } from '../src/store';
import { getStorageKey } from '../src/store/constants';
import { loadItems } from '../src/store/load-items';
import type { QuizItem } from '../src/store/types';

jest.mock('../src/store/load-items', () => ({
  loadItems: jest.fn()
}));

const mockedLoadItems = jest.mocked(loadItems);

const createItems = (): QuizItem[] => [
  { id: 0, topic: 'Zulu', question: 'Question Z?', answer: 'Answer Z.', confidence: 0 },
  { id: 1, topic: 'Alpha', question: 'Question A?', answer: 'Answer A.', confidence: 0 },
  { id: 2, topic: 'Alpha', question: 'Another question A?', answer: 'Another answer A.', confidence: 0 }
];

describe('feature and application components', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('shows card counts and calls the reset confirmation handler', () => {
    const store = createAppStore('/test', createItems().slice(0, 1));
    store.dispatch(setCustomData(''));
    store.dispatch(startQuiz());
    const confirmReset = jest.fn();

    render(
      <Provider store={store}>
        <Header confirmReset={confirmReset} confirmingReset={false} />
      </Provider>
    );

    expect(screen.getByText('1 card loaded')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Reset'));
    expect(confirmReset).toHaveBeenCalledTimes(1);
  });

  it('toggles and persists the global color theme from the header', () => {
    const store = createAppStore('/test');

    const { unmount } = render(
      <Provider store={store}>
        <Header confirmReset={jest.fn()} confirmingReset={false} />
      </Provider>
    );

    const toggle = screen.getByTitle('Switch to Dark Mode');
    fireEvent.click(toggle);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(store.getState().kwyzibo.darkMode).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(getStorageKey('/test')) ?? '{}').darkMode).toBe(true);

    const restoredStore = createAppStore('/test');
    expect(restoredStore.getState().kwyzibo.darkMode).toBe(true);

    unmount();
    render(
      <Provider store={restoredStore}>
        <Header confirmReset={jest.fn()} confirmingReset={false} />
      </Provider>
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    fireEvent.click(screen.getByTitle('Switch to Light Mode'));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(restoredStore.getState().kwyzibo.darkMode).toBe(false);
  });

  it('persists independent app state for each route', () => {
    window.localStorage.setItem('kwyzibo', JSON.stringify({
      sourcePath: '/science',
      items: [],
      customData: 'legacy shared quiz',
      initializing: true,
      darkMode: true,
      selectedTopics: [],
      remainingIds: [],
      currentId: null
    }));

    const scienceStore = createAppStore('/science');
    expect(scienceStore.getState().kwyzibo.customData).toBe('');
    expect(scienceStore.getState().kwyzibo.darkMode).toBe(false);
    scienceStore.dispatch(setCustomData('Science-specific quiz'));
    scienceStore.dispatch(setDarkMode(true));

    const mathStore = createAppStore('/math');
    expect(mathStore.getState().kwyzibo.customData).toBe('');
    expect(mathStore.getState().kwyzibo.darkMode).toBe(false);
    mathStore.dispatch(setCustomData('Math-specific quiz'));

    const restoredScienceStore = createAppStore('/science');
    expect(restoredScienceStore.getState().kwyzibo.customData).toBe('Science-specific quiz');
    expect(restoredScienceStore.getState().kwyzibo.darkMode).toBe(true);

    const restoredMathStore = createAppStore('/math');
    expect(restoredMathStore.getState().kwyzibo.customData).toBe('Math-specific quiz');
    expect(restoredMathStore.getState().kwyzibo.darkMode).toBe(false);
  });

  it('lists unique topics in order, updates selection, and starts the quiz', () => {
    const store = createAppStore('/test', createItems());
    store.dispatch(setCustomData(''));
    const handleTextChange = jest.fn();

    render(
      <Provider store={store}>
        <InitialSetup customData="custom quiz" handleTextChange={handleTextChange} />
      </Provider>
    );

    expect(screen.getAllByRole('checkbox').map(option => option.getAttribute('aria-label') ?? option.parentElement?.textContent))
      .toEqual(['Alpha (2)', 'Zulu (1)']);
    expect(screen.getByLabelText('Custom quiz data:')).toHaveValue('custom quiz');

    fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha (2)' }));
    fireEvent.change(screen.getByLabelText('Custom quiz data:'), {
      target: { value: 'updated quiz' }
    });
    expect(store.getState().kwyzibo.selectedTopics).toEqual(['Zulu']);
    expect(handleTextChange).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '➤ Start' }));
    expect(store.getState().kwyzibo.initializing).toBe(false);
    expect(store.getState().kwyzibo.items.map(item => item.topic)).toEqual(['Zulu']);
  });

  it('starts a quiz, reveals an answer, and advances after a confident rating', () => {
    const store = createAppStore('/test');
    store.dispatch(setCustomData(CUSTOM_DATA_EXAMPLE));

    render(
      <Provider store={store}>
        <App path="/test" />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: '➤ Start' }));
    expect(screen.getByText(/Question (one|two)\?/)).toBeInTheDocument();
    expect(screen.queryByText('Answer one.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '▼ Reveal' }));
    expect(screen.getByText(/Answer (one|two)\./)).toBeInTheDocument();

    const currentId = store.getState().kwyzibo.currentId;
    const currentItem = store.getState().kwyzibo.items.find(item => item.id === currentId);
    const answer = currentItem?.answer;
    fireEvent.click(screen.getByTitle('Yes!'));

    expect(store.getState().kwyzibo.remainingIds).toHaveLength(1);
    expect(screen.queryByText(answer ?? '')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '▼ Reveal' })).toBeInTheDocument();
  });

  it('renders the reset confirmation and dispatches reset when accepted', async () => {
    mockedLoadItems.mockResolvedValue([]);
    const store = createAppStore('/test');
    store.dispatch(setCustomData(CUSTOM_DATA_EXAMPLE));
    store.dispatch(setDarkMode(true));
    store.dispatch(startQuiz());
    store.dispatch(rateConfidence(5));

    render(
      <Provider store={store}>
        <App path="/test" />
      </Provider>
    );

    fireEvent.click(screen.getByTitle('Reset'));
    expect(screen.getByText('Really reset the quiz?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '✔ Yes' }));
    expect(await screen.findByText('What do you want to learn today?')).toBeInTheDocument();
    expect(mockedLoadItems).toHaveBeenCalledWith('/test');
    expect(store.getState().kwyzibo.darkMode).toBe(true);
  });
});
