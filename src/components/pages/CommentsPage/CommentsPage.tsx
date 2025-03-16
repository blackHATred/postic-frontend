import React, { useState } from "react";
import { DatePicker } from "antd";
import DialogBox1 from "../../widgets/dialogBoxes/dialogBoxOneInput";
import DialogBox2 from "../../widgets/dialogBoxes/dialog_box_two";

import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import { mockComments } from "../../../models/Comment/types";
import ButtonHeader from "../../widgets/Header/Header";
import WebSocketComponent from "../../../api/comments";
import { Comment } from "../../../models/Comment/types";
import DialogBoxOneInput from "../../widgets/dialogBoxes/dialogBoxOneInput";
import DialogBoxThreeInput from "../../widgets/dialogBoxes/dialog_box_two";


export interface commentsPageProps{
  comments : Comment[];
  sendMessage: any;
}

const CommentsPage: React.FC<commentsPageProps> = ({comments, sendMessage}) => {
  const [showDia1, setShowDia1] = useState(false);
  const [showDia2, setShowDia2] = useState(false);
    const [message, setMessage] = useState<string>("");

  const makeVisibleDialog1 = () => {
    setShowDia1(true);
  }
  const makeVisibleDialog2 = () => {
    setShowDia2(true);
  }

  return (
    <div className={styles.commentPage}>
      <ButtonHeader OnClick1={makeVisibleDialog1} OnClick2={makeVisibleDialog2}/>
      <DialogBoxThreeInput title={"Api keys"} 
                           text={"Введите ключи"} 
                           input_placeholder_one={"id тг"} 
                           input_placeholder_two={"id vk"} 
                           input_placeholder_three={"Ключ vk"} 
                           buttonText={"Задать"} 
                           onOk={sendMessage} 
                           onCancel={(value: string) => {
					            axios
					              .get("http://localhost:8080/api/comments/summary", {
					                params: {
					                  url: value,
					                },
					              })
					              .then((response) => {
					                return response.toString();
					              })
					              .catch((error) => {
					                console.error("Error:", error);
					              });
					            return "Request sent";
				            }}
                           setOpen={setShowDia1}
                           isOpen={showDia1}/>  
          
      <DialogBoxOneInput title={"Суммаризация комментариев"} 
                         text={"Ссылка на пост"} 
                         input_placeholder={"Пост"} 
                         buttonText={"Открыть"} 
                         onOk={(value: string) =>{return "";}} 
                         onCancel={()=>{}}
                         setOpen={setShowDia2}
                         isOpen={showDia2}/>  

    <h1>WebSocket Тест</h1>
      <h2>Комментарии:</h2>
      <CommentList comments={comments} />
    </div>
  );
};

export default CommentsPage;
