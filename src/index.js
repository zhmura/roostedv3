// import 'react-app-polyfill/ie11';
// import 'react-app-polyfill/stable';
// import React from 'react';
// import ReactDOM from 'react-dom';
// import AppWithAuth from './AppWithAuth';
// import * as serviceWorker from './serviceWorker';

// //redux saga imports
// import { Provider } from 'react-redux';
// import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
// import createSagaMiddleware from 'redux-saga';
// import { watchUser } from './store/sagas';

// //Reducer Imports
// import userReducer from './store/reducers/user';
// import referralReducer from './store/reducers/referral';
// import licenseReducer from './store/reducers/license';

// //import HttpsRedirect from 'react-https-redirect'

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// const rootReducer = combineReducers({
//   user: userReducer,
//   referral: referralReducer,
//   license: licenseReducer
// })

// const sagaMiddleware = createSagaMiddleware();

// const store = createStore(
//   rootReducer, 
//   composeEnhancers(applyMiddleware(sagaMiddleware)));

// sagaMiddleware.run(watchUser);

// ReactDOM.render(
//     <Provider store={store}>
//       <AppWithAuth />
//     </Provider>, document.getElementById('root'));

// serviceWorker.unregister();

import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom/client'; // Змінено імпорт для React 18
import AppWithAuth from './AppWithAuth';
import * as serviceWorker from './serviceWorker';

// Redux Saga imports
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { watchUser } from './store/sagas';

// Reducer imports
import userReducer from './store/reducers/user';
import referralReducer from './store/reducers/referral';
import licenseReducer from './store/reducers/license';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  user: userReducer,
  referral: referralReducer,
  license: licenseReducer
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  rootReducer, 
  composeEnhancers(applyMiddleware(sagaMiddleware))
);

sagaMiddleware.run(watchUser);

// Створення кореня React за допомогою нового API createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <AppWithAuth />
  </Provider>
);
