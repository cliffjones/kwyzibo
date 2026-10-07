import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { StrictMode } from 'react';

import './style/index.scss';
import { App } from './app';
import { createAppStore } from './store';
import { loadItems } from './store/load-items';

// Show an initial loading message.
const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <p className="loader">Loading…</p>
  </StrictMode>
);

// Parse any parameters from the query string.
const query = new URLSearchParams(window.location.search).get('query') ?? '';

// Show the full app once initial data is ready.
void loadItems()
  .then(items => {
    const store = createAppStore(items);
    root.render(
      <StrictMode>
        <Provider store={store}>
          <App query={query} />
        </Provider>
      </StrictMode>
    );
  })
  .catch(error => {
    console.error(error);
    const store = createAppStore();
    root.render(
      <StrictMode>
        <Provider store={store}>
          <App query={query} />
        </Provider>
      </StrictMode>
    );
  });
