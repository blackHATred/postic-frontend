import React, { useState } from "react";
import { DatePicker } from "antd";
import DialogBox1 from "../../widgets/dialog_box/dialog_box";
import DialogBox2 from "../../widgets/dialog_box/dialog_box_two";

import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import { mockComments } from "../../../models/Comment/types";
import ButtonHeader from "../../widgets/Header/Header";
import styles from "./styles.module.scss";
import WebSocketComponent from "../../../api/comments";

const CommentsPage: React.FC = () => {
  const [showDia1, setShowDia1] = useState(false);
  const [showDia2, setShowDia2] = useState(false);

  const makeVisibleDialog1 = () => {
    setShowDia1(true);
  }
  const makeInvisibleDialog1 = () => {
    setShowDia1(false);
  }
  const makeVisibleDialog2 = () => {
    setShowDia2(true);
  }
  const makeInvisibleDialog2 = () => {
    setShowDia2(false);
  }

  return (
    <div className={styles.commentPage}>
      <ButtonHeader OnClick1={makeVisibleDialog1} OnClick2={makeVisibleDialog2}/>
      <div className={styles.comments}>
        <WebSocketComponent />
      </div>
      {showDia1 ? 
      <DialogBox2 title={"Api keys"} text={"Введите ключи"} input_placeholder1={"Ключ тг"} input_placeholder2={"Ключ dr"} button_text={"Задать"} 
                        onDialogClick={(value: string) =>{return "";}} OnCloseClick={makeInvisibleDialog1}/>  
          
      : null }
      {showDia2 ? 
      <DialogBox1 title={"Суммаризация комментариев"} text={"Ссылка на пост"} input_placeholder={"Пост"} button_text={"Открыть"} 
                        onDialogClick={(value: string) =>{return "";}} OnCloseClick={makeInvisibleDialog2}/>  
          
      : null }
    </div>
  );
};

export default CommentsPage;
