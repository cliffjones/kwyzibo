import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';

import './style/index.scss';
import { Button } from './components/button';
import { ButtonSet } from './components/button-set';
import { Card } from './components/card';
import { Confidence } from './components/confidence';
import { rateConfidence, reset, type RootState, type AppDispatch } from './store';

export const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  const itemCount = useSelector((state: RootState) => state.kwyzibo.items.length);

  const remainingIds = useSelector((state: RootState) => state.kwyzibo.remainingIds);

  const currentId = useSelector((state: RootState) => state.kwyzibo.currentId);

  const [revealed, setRevealed] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const currentItem = useSelector((state: RootState) =>
    state.kwyzibo.items.find(item => item.id === currentId)
  );

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleRating = (rating: number) => {
    setRevealed(false);
    dispatch(rateConfidence(rating));
  };

  const confirmReset = () => {
    setConfirmingReset(true);
  };

  const cancelReset = () => {
    setConfirmingReset(false);
  };

  const handleReset = () => {
    setConfirmingReset(false);
    setRevealed(false);
    dispatch(reset());
  };

  let remainingMessage = `${itemCount} card${itemCount === 1 ? '' : 's'}`;
  if (remainingIds.length === itemCount) {
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

      {confirmingReset ? (
        <Card message="Really reset the quiz?">
          <ButtonSet>
            <Button className="button--yes" onClick={handleReset}>✔ Yes</Button>
            <Button className="button--no" onClick={cancelReset}>✘ No</Button>
          </ButtonSet>
        </Card>
      ) : remainingIds.length && currentItem ? (<>
        <Card topic={currentItem.topic} content={currentItem.question}>
          {!revealed ? (
            <ButtonSet>
              <Button onClick={handleReveal}>▼ Reveal</Button>
            </ButtonSet>
          ) : null}
        </Card>

        {revealed && (
          <Card content={currentItem.answer}>
            <Confidence handleRating={handleRating} confirmReset={confirmReset} />
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
