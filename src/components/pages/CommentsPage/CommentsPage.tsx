import React from "react"; // Импортируем пример данных
import CommentList from "../../widgets/CommentList/CommentList";
import { mockComments } from "../../../models/Comment/types";
import ButtonHeader from "../../widgets/Header/Header";

const CommentsPage: React.FC = () => {
  return (
    <div>
      <ButtonHeader />
      <CommentList comments={mockComments} />
    </div>
  );
};

export default CommentsPage;
