import React from "react";
import { DatePicker } from "antd";
import DialogBox from "../../widgets/dialog_box/dialog_box";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import { mockComments } from "../../../models/Comment/types";


const CommentsPage: React.FC = () => {
  return (
    <div className={styles["comments-page"]}>
      <h1>Календарик</h1>
      <CommentList comments={mockComments} />
      <DialogBox 
        title="Суммаризация комментариев" 
        input_placeholder="пост" 
        button_text="text-b" 
        text="Ссылка на пост" 
        onDialogClick={(text:string) => {console.log("test"); return "ok";}}/>
    </div>
  );
};

export default CommentsPage;
