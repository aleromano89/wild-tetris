import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ScorePage from './components/ScorePage';
import I18nProvider from './i18n/I18nProvider';
import './styles/base.css';
import './styles/game.css';
import './styles/score.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <ScorePage />
    </I18nProvider>
  </StrictMode>
);
