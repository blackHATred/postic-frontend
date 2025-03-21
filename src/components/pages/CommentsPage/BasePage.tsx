import React, { useState } from "react";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import ButtonHeader from "../../widgets/Header/Header";
import { Comment } from "../../../models/Comment/types";
import DialogBoxOneInput from "../../widgets/dialogBoxes/dialogBoxOneInput";
import DialogBoxThreeInput from "../../widgets/dialogBoxes/dialog_box_two";
import axios from "axios";
import { mockPosts } from "../../../models/Post/types";
import PostList from "../../widgets/PostList/PostList";

export interface commentsPageProps {
  comments: Comment[];
  sendMessage: any;
}

const BasePage: React.FC<commentsPageProps> = ({ comments, sendMessage }) => {
  const [showDia1, setShowDia1] = useState(false);
  const [showDia2, setShowDia2] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("1");

  const makeVisibleDialog1 = () => {
    setShowDia1(true);
  };
  const makeVisibleDialog2 = () => {
    setShowDia2(true);
  };

  return (
    <div className={styles.commentPage}>
      <ButtonHeader
        OnClick1={makeVisibleDialog1}
        OnClick2={makeVisibleDialog2}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key)} // для изменения вкладки
      />

      {activeTab === "1" ? (
        <div>
          <PostList posts={mockPosts} />
        </div>
      ) : (
        <CommentList comments={comments} />
      )}

      <DialogBoxThreeInput
        title={"Api keys"}
        text={"Введите ключи"}
        input_placeholder_one={"id тг"}
        input_placeholder_two={"id vk"}
        input_placeholder_three={"Ключ vk"}
        buttonText={"Задать"}
        onOk={sendMessage}
        onCancel={async () => {
          return "";
        }}
        setOpen={setShowDia1}
        isOpen={showDia1}
      />

      <DialogBoxOneInput
        title={"Суммаризация комментариев"}
        text={"Ссылка на пост"}
        input_placeholder={"Пост"}
        buttonText={"Открыть"}
        onOk={async (value: string) => {
          return axios
            .get("http://localhost:8080/api/comments/summary", {
              params: {
                url: value,
              },
            })
            .then((response) => {
              return response.toString();
            })
            .catch((error) => {
              return "Error:" + error;
            });
        }}
        onCancel={async () => {
          return "";
        }}
        setOpen={setShowDia2}
        isOpen={showDia2}
      />
    </div>
  );
};

export default BasePage;
