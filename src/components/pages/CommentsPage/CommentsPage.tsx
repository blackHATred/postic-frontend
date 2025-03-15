import React from "react";
import ButtonHeader from "../../widgets/Header/Header";
import styles from "./styles.module.scss";
import WebSocketComponent from "../../../api/comments";

const CommentsPage: React.FC = () => {
  return (
    <div className={styles.commentPage}>
      <ButtonHeader />
      <div className={styles.comments}>
        <WebSocketComponent />
      </div>
    </div>
  );
};

export default CommentsPage;
