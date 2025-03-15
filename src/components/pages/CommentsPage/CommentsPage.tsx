import React from "react";
import CommentList from "../../widgets/CommentList/CommentList";
import { mockComments } from "../../../models/Comment/types";
import ButtonHeader from "../../widgets/Header/Header";
import styles from "./styles.module.scss";

const CommentsPage: React.FC = () => {
  return (
    <div className={styles.commentPage}>
      <ButtonHeader />
      <div className={styles.comments}>
        <CommentList comments={mockComments} />
      </div>
    </div>
  );
};

export default CommentsPage;
