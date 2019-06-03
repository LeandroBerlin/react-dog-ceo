import React from "react";
import ReactDOM from "react-dom";

// import React bindings for Redux
import { Provider } from "react-redux";
// import the store
import { store } from "./store"
// import App
import "./index.scss";
import App from "./App";

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root")
);