
// import Redux store methods
import { createStore, applyMiddleware, compose } from 'redux'
// import Saga middleware
import createSagaMiddleware from 'redux-saga'
// import watcher from saga file we created
import { watcherSaga } from '../sagas'
// import the Reducer
import { reducer } from '../reducers'

// create a Saga middleware
const sagaMiddleware = createSagaMiddleware();

// dev tools middleware
const reduxDevTools =
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

// create a Redux store using the Reducer and connect the Saga middleware to the Redux store + DevTools
export const store = createStore(
    reducer,
    compose(applyMiddleware(sagaMiddleware), reduxDevTools)
);

// run the watcher
sagaMiddleware.run(watcherSaga);

