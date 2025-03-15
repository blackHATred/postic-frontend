import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CommentsPage from "../components/pages/CommentsPage/CommentsPage";
import { ConfigProvider, theme } from "antd";
import WebSocketComponent from "../api/comments";

const App: React.FC = () => {
  return (
    <Router>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
        }}
      >
        <Routes>
          <Route path="/" element={<CommentsPage />} />
        </Routes>
      </ConfigProvider>
    </Router>
  );
};

export default App;
