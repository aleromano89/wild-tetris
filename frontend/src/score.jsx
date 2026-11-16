import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ScorePage from './components/ScorePage';
import './styles/base.css';
import './styles/game.css';
import './styles/score.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScorePage />
  </StrictMode>
);
