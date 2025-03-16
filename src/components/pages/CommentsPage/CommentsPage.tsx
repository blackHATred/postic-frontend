import React, { useState } from "react";
import { DatePicker } from "antd";
import DialogBox1 from "../../widgets/dialog_box/dialog_box";
import DialogBox2 from "../../widgets/dialog_box/dialog_box_two";

import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import { mockComments } from "../../../models/Comment/types";
import ButtonHeader from "../../widgets/Header/Header";
import WebSocketComponent from "../../../api/comments";
import { Comment } from "../../../models/Comment/types";
import axios from "axios";

export interface commentsPageProps {
  comments: Comment[];
  sendMessage: any;
}

const CommentsPage: React.FC<commentsPageProps> = ({
  comments,
  sendMessage,
}) => {
  const [showDia1, setShowDia1] = useState(false);
  const [showDia2, setShowDia2] = useState(false);
  const [message, setMessage] = useState<string>("");

  const makeVisibleDialog1 = () => {
    setShowDia1(true);
  };
  const makeInvisibleDialog1 = () => {
    setShowDia1(false);
  };
  const makeVisibleDialog2 = () => {
    setShowDia2(true);
  };
  const makeInvisibleDialog2 = () => {
    setShowDia2(false);
  };

  return (
    <div className={styles.commentPage}>
      <ButtonHeader
        OnClick1={makeVisibleDialog1}
        OnClick2={makeVisibleDialog2}
      />
      {showDia1 ? (
        <DialogBox2
          title={"Api keys"}
          text={"Введите ключи"}
          input_placeholder1={"id тг"}
          input_placeholder2={"id vk"}
          input_placeholder3={"Ключ vk"}
          button_text={"Задать"}
          onDialogClick={sendMessage}
          OnCloseClick={makeInvisibleDialog1}
        />
      ) : null}
      {showDia2 ? (
        <DialogBox1
          title={"Суммаризация комментариев"}
          text={"Ссылка на пост"}
          input_placeholder={"Пост"}
          button_text={"Открыть"}
          onDialogClick={(value: string) => {
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
          OnCloseClick={makeInvisibleDialog2}
        />
      ) : null}

      <h1></h1>
      <h2></h2>
      <CommentList comments={comments} />
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите сообщение"
        />
        <button onClick={sendMessage}>Отправить</button>
      </div>
    </div>
  );
};

export default CommentsPage;
