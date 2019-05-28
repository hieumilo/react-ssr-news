/* eslint-disable no-underscore-dangle */
// Startup point for client-side application

import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import reducers from './reducers';
import Routes from './Routes';

import Cookie from 'js-cookie';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';

addLocaleData([...ru, ...en]);

const locale = Cookie.get('locale') || 'en';

const messages = require(`./../lang/${locale}.json`);
console.log(window.ReactIntlLocaleData);
// .then((res) => {
//   console.log(res);
//   if (res.status >= 400) {
//     throw new Error('Bad response from server');
//   }

//   return res.json();
// })
// .then((localeData) => {
// addLocaleData(window.ReactIntlLocaleData[locale]);
// addLocaleData(localeData);

const state = window.__PRELOADED_STATE__;
delete window.__PRELOADED_STATE__;

const store = createStore(reducers, state, applyMiddleware(thunk));

ReactDOM.hydrate(
  <Provider store={store}>
    <IntlProvider locale={locale} messages={messages}>
      <BrowserRouter>
        <div>{renderRoutes(Routes)}</div>
      </BrowserRouter>
    </IntlProvider>
  </Provider>,
  document.querySelector('#root')
);
// })
// .catch((error) => {
//   console.error(error);
// });
