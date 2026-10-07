import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';

import './style/index.scss';
import { RouterApp } from './router-app';

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<RouterApp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
