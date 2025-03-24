import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BasePage from "../components/pages/CommentsPage/BasePage";
import { ConfigProvider, theme } from "antd";
import WebSocketComponent, { CommentListContext } from "../api/comments";
import "./App.css";
import NotificationManager from "../api/notification";
import { Comment, mockComments } from "../models/Comment/types";

const App: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>(mockComments);

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
              <CommentListContext.Provider value={{ comments, setComments }}>
                <NotificationManager>
                  <WebSocketComponent>
                    <BasePage />
                  </WebSocketComponent>
                </NotificationManager>
              </CommentListContext.Provider>
            }
          />
        </Routes>
      </ConfigProvider>
    </Router>
  );
};

export default App;
