import React, { useState } from "react";
import { DatePicker } from "antd";
import DialogBox from "../../widgets/dialog_box/dialog_box";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import { mockComments } from "../../../models/Comment/types";
import ButtonHeader from "../../widgets/Header/Header";

const CommentsPage: React.FC = () => {
  const [showDia1, setShowDia1] = useState(false);
  const [showDia2, setShowDia2] = useState(false);
  const [showDia3, setShowDia3] = useState(false);

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
  const makeVisibleDialog3 = () => {
    setShowDia3(true);
  }
  const makeInvisibleDialog3 = () => {
    setShowDia3(false);
  }

  return (
    <div>
      <ButtonHeader OnClick1={makeVisibleDialog1} OnClick2={makeVisibleDialog2} OnClick3={makeVisibleDialog3}/>
      <CommentList comments={mockComments} />
      {showDia1 ? 
      <DialogBox title={"Api key Tg"} text={"Введите ключи"} input_placeholder={"Ключ"} button_text={"Задать"} 
                        onDialogClick={(value: string) =>{console.log("test"); return "";}} OnCloseClick={makeInvisibleDialog1}/>  
          
      : null }
      {showDia2 ? 
      <DialogBox title={"Суммаризация комментариев"} text={"Ссылка на пост"} input_placeholder={"Пост"} button_text={"Открыть"} 
                        onDialogClick={(value: string) =>{console.log("test"); return "";}} OnCloseClick={makeInvisibleDialog2}/>  
          
      : null }
      {showDia3 ? 
      <DialogBox title={"Api key vk"} text={"Введите ключи"} input_placeholder={"Ключ"} button_text={"Задать"} 
                        onDialogClick={(value: string) =>{console.log("test"); return "";}} OnCloseClick={makeInvisibleDialog3}/>  
          
      : null }
    </div>
  );
};

export default CommentsPage;
