import React from "react"; // Импортируем пример данных
import CommentList from "../../widgets/CommentList/CommentList";
import { mockComments } from "../../../models/Comment/types";

const CommentsPage: React.FC = () => {
  return (
    <div>
      <h1>Комментарии</h1>
      <CommentList comments={mockComments} />
    </div>
  );
};

export default CommentsPage;
