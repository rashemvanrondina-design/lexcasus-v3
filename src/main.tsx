import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// ⬇️ This goes up one level to the root to find your CSS
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);