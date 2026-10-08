import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDarkMode, type AppDispatch, type RootState } from '../../store';
import { Button } from '../../ui/button';
import './style.scss';

type HeaderProps = {
  confirmReset: () => void;
  confirmingReset: boolean;
};

export const Header = ({ confirmReset, confirmingReset }: HeaderProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const initializing = useSelector((state: RootState) => state.kwyzibo.initializing);
  const darkMode = useSelector((state: RootState) => state.kwyzibo.darkMode);
  const itemCount = useSelector((state: RootState) => state.kwyzibo.items.length);
  const remainingIds = useSelector((state: RootState) => state.kwyzibo.remainingIds);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  let remainingMessage = `${itemCount} card${itemCount === 1 ? '' : 's'}`;
  if (remainingIds.length === itemCount) {
    remainingMessage = `${remainingMessage} loaded`;
  } else {
    remainingMessage = `${remainingIds.length} of ${remainingMessage} remaining`;
  }

  return (<>
    <header className="header">
      <h1 className="header-title">Kwyzibo</h1>

      <div className="header-toolbar">
        <Button
          className="button--text"
          onClick={() => dispatch(setDarkMode(!darkMode))}
          title={`Switch to ${darkMode ? 'Light' : 'Dark'} Mode`}
        >{darkMode ? '☀' : '⏾'}</Button>
      </div>

      {initializing ? null : (
        <div className="header-info">
          {remainingMessage}
          {confirmingReset || !remainingIds.length ? null : (
            <Button className="button--text" onClick={confirmReset} title="Reset">⭯</Button>
          )}
        </div>
      )}
    </header>
  </>);
};
