import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import I18nProvider from './i18n/I18nProvider';
import './styles/base.css';
import './styles/game.css';

// Lingua e testi: src/i18n (LOCALE in src/i18n/index.js)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>
);
