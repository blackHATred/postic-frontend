import React, { createContext, Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import ButtonHeader from "../../widgets/Header/Header";
import { Comment } from "../../../models/Comment/types";
import DialogBoxOneInput from "../../widgets/dialogBoxes/dialogBoxOneInput";
import DialogBoxThreeInput from "../../widgets/dialogBoxes/dialogBoxThreeInput";
import axios from "axios";
import { mockPosts } from "../../../models/Post/types";
import PostList from "../../widgets/PostList/PostList";
import DialogBoxSummary from "../../widgets/dialogBoxes/dialogBoxSummary";

export interface commentsPageProps {
  comments: Comment[];
  sendMessage: any;
}

interface SummaryBoxContent {
  setActive: Dispatch<SetStateAction<boolean>>
  PostRef: RefObject<HTMLDivElement | null> | null
  setLoading: Dispatch<SetStateAction<boolean>>
  setPostID: Dispatch<SetStateAction<string>>
}

export const SummaryBoxContext = createContext<SummaryBoxContent>(
  {
    setActive: () => {},
    PostRef: null,
    setLoading: () => {},
    setPostID:() => {}
  }
)

const BasePage: React.FC<commentsPageProps> = ({ comments, sendMessage }) => {
  const [showDia1, setShowDia1] = useState(false);
  const [showDia2, setShowDia2] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("1");
  const PostRef = useRef<HTMLDivElement>(null);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [postSummaryID, setPostSummaryID] = useState("");

  const makeVisibleDialog1 = () => {
    setShowDia1(true);
  };
  const makeVisibleDialog2 = () => {
    setShowDia2(true);
  };

  return (
    <SummaryBoxContext.Provider
      value={{setActive: setShowDia2, PostRef: PostRef, setLoading:setSummaryLoading, setPostID: setPostSummaryID}}
    >
    <div className={styles.commentPage}>
      <ButtonHeader
        OnClick1={makeVisibleDialog1}
        OnClick2={()=>{}}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key)} // для изменения вкладки
      />

      {activeTab === "1" ? (
        <div>
          <PostList posts={mockPosts}/>
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

      <DialogBoxSummary
        title={"Суммаризация комментариев"}
        buttonText={"Повторная суммаризация"}
        setOpen={setShowDia2}
        isOpen={showDia2}
        postRef={PostRef}
        isLoading={summaryLoading}
        postId={postSummaryID}
      />
    </div>
    </SummaryBoxContext.Provider>
  );
};

export default BasePage;
