import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';

import './style/index.scss';
import { Button } from './components/button';
import { ButtonSet } from './components/button/button-set';
import { Card } from './components/card';
import { Confidence } from './components/confidence';
import { InitialSetup } from './components/initial-setup';
import {
  rateConfidence,
  reset,
  setCustomData,
  type AppDispatch,
  type RootState
} from './store';

export const App = ({ query }: { query: string }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [revealed, setRevealed] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const initializing = useSelector((state: RootState) => state.kwyzibo.initializing);
  const itemCount = useSelector((state: RootState) => state.kwyzibo.items.length);
  const customData = useSelector((state: RootState) => state.kwyzibo.customData);
  const remainingIds = useSelector((state: RootState) => state.kwyzibo.remainingIds);
  const currentId = useSelector((state: RootState) => state.kwyzibo.currentId);
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

  const handleReset = async () => {
    setRevealed(false);

    try {
      await dispatch(reset()).unwrap();
      setConfirmingReset(false);
    } catch (error) {
      console.error('Unable to reload cards.', error);
    }
  };

  let remainingMessage = `${itemCount} card${itemCount === 1 ? '' : 's'}`;
  if (remainingIds.length === itemCount) {
    remainingMessage = `${remainingMessage} loaded`;
  } else {
    remainingMessage = `${remainingIds.length} of ${remainingMessage} remaining`;
  }

  console.log({query});

  return (
    <main className="app">
      <header className="header">
        <h1>Kwyzibo</h1>
        {initializing ? null : (
          <div className="info-bar">
            {remainingMessage}
            {confirmingReset || !remainingIds.length ? null : (
              <Button className="button--minor" onClick={confirmReset} title="Reset">⭯</Button>
            )}
          </div>
        )}
      </header>

      {initializing ? (
        <InitialSetup
          customData={customData}
          handleTextChange={({ target: { value } }) => dispatch(setCustomData(value))}
        />
      ) : confirmingReset ? (
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
            <Confidence handleRating={handleRating} />
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
        By <a href="https://ko-fi.com/cliff" target="_blank" title="Donate on Ko-fi">Cliff Jones Jr.</a>
      </footer>
    </main>
  );
};
