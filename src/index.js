import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

import 'leaflet/dist/leaflet.css';
import registerServiceWorker from './serviceWorker';


const WithRouter = () => <BrowserRouter><App /></BrowserRouter>;
ReactDOM.render(
  <WithRouter />,
  document.getElementById('root')
);

registerServiceWorker();
