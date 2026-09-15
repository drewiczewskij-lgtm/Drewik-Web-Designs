import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// Remove the pre-hydration plate once React owns the screen.
document.getElementById('boot')?.remove();

// Plain static hosting cannot rewrite unknown paths back to index.html, so a
// build made for it routes on the hash instead. Everything else uses history.
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
