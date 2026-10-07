import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { App } from '../src/app';
import { Header } from '../src/features/header';
import { InitialSetup } from '../src/features/initial-setup';
import { createAppStore, rateConfidence, setCustomData, startQuiz, type QuizItem } from '../src/store';
import { loadItems } from '../src/store/load-items';

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
  });

  it('shows card counts and calls the reset confirmation handler', () => {
    const store = createAppStore('/header', createItems().slice(0, 1));
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

  it('lists unique topics in order, updates selection, and starts the quiz', () => {
    const store = createAppStore('/setup', createItems());
    store.dispatch(setCustomData(''));
    const handleTextChange = jest.fn();

    render(
      <Provider store={store}>
        <InitialSetup customData="custom quiz" handleTextChange={handleTextChange} />
      </Provider>
    );

    expect(screen.getAllByRole('checkbox').map(option => option.getAttribute('aria-label') ?? option.parentElement?.textContent))
      .toEqual(['Alpha', 'Zulu']);
    expect(screen.getByLabelText('Custom quiz data:')).toHaveValue('custom quiz');

    fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }));
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
    const store = createAppStore('/app');

    render(
      <Provider store={store}>
        <App path="/app" />
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
    const store = createAppStore('/reset');
    store.dispatch(startQuiz());
    store.dispatch(rateConfidence(5));

    render(
      <Provider store={store}>
        <App path="/reset" />
      </Provider>
    );

    fireEvent.click(screen.getByTitle('Reset'));
    expect(screen.getByText('Really reset the quiz?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '✔ Yes' }));
    expect(await screen.findByText('What do you want to learn today?')).toBeInTheDocument();
  });
});
