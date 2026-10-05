import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { StrictMode } from 'react';

import { App } from './app';
import { createAppStore } from './store';
import { loadItems } from './store/load-items';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <p>Loading cards...</p>
  </StrictMode>
);

void loadItems()
  .then(items => {
    root.render(
      <StrictMode>
        <Provider store={createAppStore(items)}>
          <App />
        </Provider>
      </StrictMode>
    );
  })
  .catch(error => {
    console.error(error);
    root.render(
      <StrictMode>
        <p role="alert">Unable to load cards.</p>
      </StrictMode>
    );
  });
