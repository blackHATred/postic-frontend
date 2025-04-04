import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { CookiesProvider } from "react-cookie";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <CookiesProvider defaultSetOptions={{ path: "/", httpOnly: false }}>
      <App />
    </CookiesProvider>
  </React.StrictMode>
);

/*
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

*/
