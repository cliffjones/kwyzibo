import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Button } from '../button';
import './style.scss';

type HeaderProps = {
  confirmReset: () => void;
  confirmingReset: boolean;
};

export const Header = ({ confirmReset, confirmingReset }: HeaderProps) => {
  const initializing = useSelector((state: RootState) => state.kwyzibo.initializing);
  const itemCount = useSelector((state: RootState) => state.kwyzibo.items.length);
  const remainingIds = useSelector((state: RootState) => state.kwyzibo.remainingIds);

  let remainingMessage = `${itemCount} card${itemCount === 1 ? '' : 's'}`;
  if (remainingIds.length === itemCount) {
    remainingMessage = `${remainingMessage} loaded`;
  } else {
    remainingMessage = `${remainingIds.length} of ${remainingMessage} remaining`;
  }

  return (<>
    <header className="header">
      <h1>Kwyzibo</h1>
      {initializing ? null : (
        <div className="header-info">
          {remainingMessage}
          {confirmingReset || !remainingIds.length ? null : (
            <Button className="button--minor" onClick={confirmReset} title="Reset">⭯</Button>
          )}
        </div>
      )}
    </header>
  </>);
};
