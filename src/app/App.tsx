import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BasePage from "../components/pages/CommentsPage/BasePage";
import { ConfigProvider, theme } from "antd";
import WebSocketComponent from "../api/comments";
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
        }}
      >
        <Routes>
          <Route path="/" element={<WebSocketComponent />} />
        </Routes>
      </ConfigProvider>
    </Router>
  );
};

export default App;
