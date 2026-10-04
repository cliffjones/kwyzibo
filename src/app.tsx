import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';

import { CONFIDENCE_RATINGS } from './constants';
import { getTextSize } from './utils/get-text-size';
import { rateConfidence, restart } from './store';
import type { RootState, AppDispatch } from './store';

export const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  const questionCount = useSelector((state: RootState) => state.kwyzibo.items.length);

  const remainingIds = useSelector((state: RootState) => state.kwyzibo.remainingIds);

  const currentId = useSelector((state: RootState) => state.kwyzibo.currentId);

  const [showingAnswer, setShowingAnswer] = useState(false);

  const currentCard = useSelector((state: RootState) =>
    state.kwyzibo.items.find(question => question.id === currentId)
  );

  const handleRating = (rating: number) => {
    setShowingAnswer(false);
    dispatch(rateConfidence(rating));
  };

  const handleRestart = () => {
    setShowingAnswer(false);
    dispatch(restart());
  };

  let remainingMessage = `${questionCount} card${questionCount === 1 ? '' : 's'}`;
  if (remainingIds.length === questionCount) {
    remainingMessage = `${remainingMessage} loaded`;
  } else {
    remainingMessage = `${remainingIds.length} of ${remainingMessage} remaining`;
  }

  return (
    <main className="app">
      <header className="header">
        <h1>Kwyzibo</h1>
        <p>{remainingMessage}</p>
      </header>

      {remainingIds.length && currentCard ? (<>
        <section className="card">
          <p style={{ fontSize: getTextSize(currentCard.question) }} title={currentCard.topic}>
            {currentCard.question}
          </p>

          {!showingAnswer ? (
            <div className="button-set">
              <button className="button" onClick={() => setShowingAnswer(true)}>▼ Show Answer</button>
            </div>
          ) : null}
        </section>

        {showingAnswer && (
          <section className="card">
            <p style={{ fontSize: getTextSize(currentCard.answer) }}>{currentCard.answer}</p>

            <div className="button-set">
              Got it?
              <button
                className="button button--rating button--no"
                onClick={() => handleRating(1)}
                title={CONFIDENCE_RATINGS[0].label}
              >{CONFIDENCE_RATINGS[0].icon}</button>
              <button
                className="button button--rating button--negative"
                onClick={() => handleRating(2)}
                title={CONFIDENCE_RATINGS[1].label}
              >{CONFIDENCE_RATINGS[1].icon}</button>
              <button
                className="button button--rating button--neutral"
                onClick={() => handleRating(3)}
                title={CONFIDENCE_RATINGS[2].label}
              >{CONFIDENCE_RATINGS[2].icon}</button>
              <button
                className="button button--rating button--positive"
                onClick={() => handleRating(4)}
                title={CONFIDENCE_RATINGS[3].label}
              >{CONFIDENCE_RATINGS[3].icon}</button>
              <button
                className="button button--rating button--yes"
                onClick={() => handleRating(5)}
                title={CONFIDENCE_RATINGS[4].label}
              >{CONFIDENCE_RATINGS[4].icon}</button>
            </div>
          </section>
        )}
      </>) : (
        <section className="card">
          <p className="message">You’ve got this.</p>

          <div className="button-set">
            <button className="button" onClick={handleRestart}>⭯ Start Again</button>
          </div>
        </section>
      )}

      <footer className="footer">
        By <a href="https://cliffjonesjr.com/" target="_blank">Cliff Jones Jr.</a>
      </footer>
    </main>
  );
};
