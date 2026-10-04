import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';

import './app.scss';
import { Button } from './components/button/button';
import { ButtonSet } from './components/button-set/button-set';
import { Card } from './components/card/card';
import { CONFIDENCE_RATINGS } from './constants';
import { rateConfidence, restart } from './store';
import type { RootState, AppDispatch } from './store';

export const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  const questionCount = useSelector((state: RootState) => state.kwyzibo.items.length);

  const remainingIds = useSelector((state: RootState) => state.kwyzibo.remainingIds);

  const currentId = useSelector((state: RootState) => state.kwyzibo.currentId);

  const [revealed, setRevealed] = useState(false);

  const currentCard = useSelector((state: RootState) =>
    state.kwyzibo.items.find(question => question.id === currentId)
  );

  const handleRating = (rating: number) => {
    setRevealed(false);
    dispatch(rateConfidence(rating));
  };

  const handleReset = () => {
    setRevealed(false);
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
        <Card topic={currentCard.topic} content={currentCard.question}>
          {!revealed ? (
            <ButtonSet>
              <Button onClick={() => setRevealed(true)}>▼ Reveal</Button>
            </ButtonSet>
          ) : null}
        </Card>

        {revealed && (
          <Card content={currentCard.answer}>
            <ButtonSet>
              Got it?
              <Button
                className="button--rating button--no"
                onClick={() => handleRating(1)}
                title={CONFIDENCE_RATINGS[0].label}
              >{CONFIDENCE_RATINGS[0].icon}</Button>
              <Button
                className="button--rating button--negative"
                onClick={() => handleRating(2)}
                title={CONFIDENCE_RATINGS[1].label}
              >{CONFIDENCE_RATINGS[1].icon}</Button>
              <Button
                className="button--rating button--neutral"
                onClick={() => handleRating(3)}
                title={CONFIDENCE_RATINGS[2].label}
              >{CONFIDENCE_RATINGS[2].icon}</Button>
              <Button
                className="button--rating button--positive"
                onClick={() => handleRating(4)}
                title={CONFIDENCE_RATINGS[3].label}
              >{CONFIDENCE_RATINGS[3].icon}</Button>
              <Button
                className="button--rating button--yes"
                onClick={() => handleRating(5)}
                title={CONFIDENCE_RATINGS[4].label}
              >{CONFIDENCE_RATINGS[4].icon}</Button>
            </ButtonSet>
          </Card>
        )}
      </>) : (
        <Card message="You’ve got this.">
          <ButtonSet>
            <Button onClick={handleReset}>⭯ Reset</Button>
          </ButtonSet>
        </Card>
      )}

      <footer className="footer">
        By <a href="https://cliffjonesjr.com/" target="_blank">Cliff Jones Jr.</a>
      </footer>
    </main>
  );
};
