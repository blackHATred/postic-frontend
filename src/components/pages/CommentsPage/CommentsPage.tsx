import React from "react";
import styles from "./styles.module.scss";
import DialogBox from "../../widgets/dialog_box/dialog_box";

const CommentsPage: React.FC = () => {
  return (
    <div className={styles["comments-page"]}>
      <h1>Календарик</h1>
      <DialogBox />
    </div>
  );
};

export default CommentsPage;
