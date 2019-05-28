import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import serialize from 'serialize-javascript';
import { Helmet } from 'react-helmet';
import Routes from '../client/Routes';

import acceptLanguage from 'accept-language';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';
import fs from 'fs';
import path from 'path';

addLocaleData([...ru, ...en]);

const messages = {};
const localeData = {};
console.log('__dirname');
console.log(__dirname);
['en', 'ru'].forEach(locale => {
  localeData[locale] = fs
    .readFileSync(`node_modules/react-intl/locale-data/${locale}.js`)
    .toString();
  messages[locale] = require(`../lang/${locale}.json`);
});

acceptLanguage.languages(['en', 'ru']);

function detectLocale(req) {
  const cookieLocale = req.cookies.locale;

  return acceptLanguage.get(cookieLocale || req.headers['accept-language']) || 'en';
}

export default (req, res, store, context) => {
  const helmet = Helmet.renderStatic();

  const locale = detectLocale(req);
  const initialNow = Date.now();
  res.cookie('locale', locale, { maxAge: new Date() * 0.001 + 365 * 24 * 3600 });

  const content = renderToString(
    <Provider store={store}>
      <IntlProvider initialNow={initialNow} locale={locale} messages={messages[locale]}>
        <StaticRouter location={req.path} context={context}>
          <div>{renderRoutes(Routes)}</div>
        </StaticRouter>
      </IntlProvider>
    </Provider>
  );

  return `<!DOCTYPE html>
            <head>
                ${helmet.title.toString()}
                ${helmet.meta.toString()}
                ${helmet.link.toString()}
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </head>
            <body>
                <div id="root">${content}</div>
                <script>
                    window.__PRELOADED_STATE__ = ${serialize(store.getState()).replace(
                      /</g,
                      '\\u003c'
                    )}
                </script>
                <script src="/bundle.js"></script>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            </body>
    </html>`;
};
