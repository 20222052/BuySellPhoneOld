import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.scss";

// jQuery - MUST be set globally BEFORE importing Summernote
import $ from 'jquery'
window.jQuery = $
window.$ = $

// Bootstrap 5 - MUST be loaded BEFORE Summernote BS5
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Summernote BS5 - Load AFTER jQuery and Bootstrap
import 'summernote/dist/summernote-bs5.min.css'
import 'summernote/dist/summernote-bs5.min.js'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId="882703980752-35acfsufq83kmu2lv7iqmsgtqj4cjdo7.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);
