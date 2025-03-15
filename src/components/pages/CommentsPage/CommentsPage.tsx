import React from "react";
import styles from "./styles.module.scss";
import DialogBox from "../../widgets/dialog_box/dialog_box";


const CommentsPage: React.FC = () => {
  return (
    <div className={styles["comments-page"]}>
      <h1>Календарик</h1>
      <DialogBox title="Суммаризация комментариев" input_placeholder="пост" button_text="text-b" text="Ссылка на пост" onClick={(text:string) => {console.log("test"); return "ok";}}/>
    </div>
  );
};

export default CommentsPage;
