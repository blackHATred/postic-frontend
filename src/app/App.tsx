import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CommentsPage from "../components/pages/CommentsPage/CommentsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CommentsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
