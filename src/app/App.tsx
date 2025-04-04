import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BasePage from "../components/pages/CommentsPage/BasePage";
import { ConfigProvider, theme } from "antd";
import WebSocketComponent from "../api/WebSocket";
import "./App.css";
import NotificationManager from "../api/notification";
import { Provider } from "react-redux";
import { store } from "../stores/store";

const App: React.FC = () => {
  return (
    <Router>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <Provider store={store}>
                <NotificationManager>
                  <WebSocketComponent>
                    <BasePage />
                  </WebSocketComponent>
                </NotificationManager>
              </Provider>
            }
          />
        </Routes>
      </ConfigProvider>
    </Router>
  );
};

export default App;
