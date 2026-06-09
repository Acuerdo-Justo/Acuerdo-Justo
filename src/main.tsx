import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import './index.css';

const isLoginPage = window.location.pathname.replace(/\/+$/, '') === '/login';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isLoginPage ? <LoginPage /> : <App />}
  </StrictMode>
);
