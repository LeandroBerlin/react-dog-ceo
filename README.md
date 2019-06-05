

We'll create a webapp using React, Redux and Saga as middleware. The application will fetch image data from the Dogs API and store it to Redux using Saga.

## What is Redux-saga

"Redux-saga is a library that aims to make application side effects (i.e. asynchronous things like data fetching and impure things like accessing the browser cache) easier to manage, more efficient to execute, easy to test, and better at handling failures."
(https://redux-saga.js.org/)

- a saga is like a separate thread in your application that's solely responsible for side effects (fetch APIs, write data to a file, etc)

- saga uses an ES6 feature called Generators to make those asynchronous flows easy to read, write and test. 

## Install packages

Create your React App and then install Redux

`npm i redux react-redux`

We can now install Saga

`npm i redux-saga`

We will also use Axios

`npm i axios`

Axios is a Promise based HTTP client for the browser and node.js (https://github.com/axios/axios)


## Create the folder structure

```
- react-redux-saga-dogs
  - public
  - src
    - actions
    - reducers
    - sagas
    - store
```


## The Actions

First, let's define some actions.

"Actions are payloads of information that send data from your application to your store. They are the only source of information for the store. You send them to the store using store.dispatch()."
(https://redux.js.org/basics/actions)

- actions are plain JavaScript objects  
- actions must have a type property that indicates the type of action being performed  
- types should typically be defined as string constants  

Create a new file `actions/actionTypes.js`.

The application will have 3 action: 
- to start the request  
- if the request success  
- if thr request fails

```jsx

// action types
export const API_CALL_REQUEST = "API_CALL_REQUEST";
export const API_CALL_SUCCESS = "API_CALL_SUCCESS";
export const API_CALL_FAILURE = "API_CALL_FAILURE";
```



## The Reducer

"Reducers specify how the application's state changes in response to actions sent to the store. Remember that actions only describe what happened, but don't describe how the application's state changes."
(https://redux.js.org/basics/reducers)


Create a new file `reducers/index.js`  

```jsx

// import the actions we defined
import { API_CALL_REQUEST, API_CALL_SUCCESS, API_CALL_FAILURE } from '../actions/actionTypes'

// define an initial state
const initialState = {
    fetching: false,
    dog: null,
    error: null
};

// the reducer
export function reducer(state = initialState, action) {
    switch (action.type) {
        case API_CALL_REQUEST:
            return { ...state, fetching: true, error: null };
        case API_CALL_SUCCESS:
            return { ...state, fetching: false };
        case API_CALL_FAILURE:
            return { ...state, fetching: false };
        default:
            return state;
    }
}

```


## Create Saga

In order to run our Saga, we need to:

- create a Saga middleware
- connect the Saga middleware to the Redux store

Create a new file `sagas/index.js`  

```jsx

// import saga
import { takeLatest, call, put } from "redux-saga/effects";
import axios from "axios";

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* watcherSaga() {
    yield takeLatest("API_CALL_REQUEST", workerSaga);
}

// function that makes the api request and returns a Promise for response
function fetchDog() {
    return axios({
        method: "get",
        url: "https://dog.ceo/api/breeds/image/random"
    });
}

// worker saga: makes the api call when watcher saga sees the action
function* workerSaga() {
    try {
        const response = yield call(fetchDog);
        const dog = response.data.message;

        // dispatch a success action to the store with the new dog
        yield put({ type: "API_CALL_SUCCESS", dog });

    } catch (error) {
        // dispatch a failure action to the store with the error
        yield put({ type: "API_CALL_FAILURE", error });
    }
}

```

## Update your Reducer
Update your reducer with the payloads of the success and failure actions

```jsx
...
        case API_CALL_SUCCESS:
            return { ...state, fetching: false, dog: action.dog };
        case API_CALL_FAILURE:
            return { ...state, fetching: false, dog: null, error: action.error };
...
```


## The Store

A store holds the whole state tree of your application. The only way to change the state inside it is to dispatch an action on it.
(https://redux.js.org/api/store)  

- a store is not a class.  
- it's just an object with a few methods on it.  
- to create it, pass your root reducing function to createStore.  

Create a new file `store/index.js`  

```jsx

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

// compose the middleware and ReduxDevTools
const composed = compose(applyMiddleware(sagaMiddleware), reduxDevTools);

// create a Redux store using the Reducer and connect the Saga middleware to the Redux store with DevTools enables
export const store = createStore(
    reducer,
    composed
);

// run the watcher
sagaMiddleware.run(watcherSaga);


```

## The entry point - index.js

Edit the `src/index.js`  


```jsx

import React from "react";
import ReactDOM from "react-dom";

// import React bindings for Redux
import { Provider } from "react-redux";
// import the store
import { store } from "./store"
// import App
import "./index.css";
import App from "./App";

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root")
);

```

## The main component - App.js

Edit the `src/App.js` 

We will extracting:
- destructuring from Props  
- extracting data from the state with [mapStateToProps](https://react-redux.js.org/using-react-redux/connect-mapstate)  
- dispatching actions with [mapDispatchToProps](https://react-redux.js.org/using-react-redux/connect-mapdispatch)  
- connects the React component to the Redux store


```jsx
import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

// import React bindings for Redux
import { connect } from "react-redux";

class App extends Component {
  render() {
    // Destructuring assignment from Props
    const { fetching, dog, onRequestDog, error } = this.props;

    return (
      <div className="App">
        <header className="App-header">
          <img src={dog || logo} className="App-logo rounded-circle" alt="logo" />
          <h1 className="App-title">The Dog Saga</h1>


          {dog ? (
            <p className="App-intro">Keep clicking for new dogs</p>
          ) : (
              <p className="App-intro">Replace the React icon with a dog!</p>
            )}

          {fetching ? (
            <button className="btn btn-warning" disabled>Fetching...</button>
          ) : (
              <button className="btn btn-primary" onClick={onRequestDog}>Request a Dog</button>
            )}

          {error && <p style={{ color: "red" }}>Uh oh - something went wrong!</p>}
        </header>
      </div>
    );
  }
}

// Extracting Data with mapStateToProps
const mapStateToProps = state => {
  return {
    fetching: state.fetching,
    dog: state.dog,
    error: state.error
  };
};

// Dispatching actions with mapDispatchToProps
const mapDispatchToProps = dispatch => {
  return {
    onRequestDog: () => dispatch({ type: "API_CALL_REQUEST" })
  };
};

// the connect() function connects the React component to the Redux store.
export default connect(mapStateToProps, mapDispatchToProps)(App);
```

## Extra
- Inspect with ReduxDevTools
- Install node-sass and bootstrap
- Add rounded images