/**
 * @file frontend/src/main.jsx
 * @description This is the entry point of the React application.
 * It renders the main `App` component into the DOM, typically within the `root` element defined in `index.html`.
 * `React.StrictMode` is used to enable additional checks and warnings for its descendants during development, which helps in identifying potential problems.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);