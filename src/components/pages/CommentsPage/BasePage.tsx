import React, { useContext, useRef, useState } from "react";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import ButtonHeader from "../../widgets/Header/Header";
import { Comment } from "../../../models/Comment/types";
import DialogBoxXInputs from "../../widgets/dialogBoxes/DialogBoxXInputs";
import axios from "axios";
import { mockPosts } from "../../../models/Post/types";
import PostList from "../../widgets/PostList/PostList";
import DialogBoxSummary, { SummaryBoxContext } from "../../widgets/dialogBoxes/dialogBoxSummary";
import { NotificationContext } from "../../../api/notification";

export interface commentsPageProps {
  comments: Comment[];
  sendMessage: any;
}



const BasePage: React.FC<commentsPageProps> = ({ comments, sendMessage }) => {
  const [showDia1, setShowDia1] = useState(false);
  const [showDia2, setShowDia2] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("1");
  const PostRef = useRef<HTMLDivElement>(null);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [postSummaryID, setPostSummaryID] = useState("");

  const NotificationManager = useContext(NotificationContext);

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

      <DialogBoxXInputs
        title={"Api keys"}
        text={"Введите ключи"}
        input_placeholders={{id_tg : "id тг", id_vk: "id vk", vk_key : "Ключ vk"}}
        buttonText={"Задать"}
        onOkClick={(args: {[key: string]: string})=>{
          
          try{
            if (!args.id_tg || !args.id_vk || !args.vk_key){
              throw new Error("Введите все параметры")
            }
            let args_int = {
              tg_chat_id : parseInt(args.id_tg),
              vk_group_id : parseInt(args.id_vk),
              vk_key : args.vk_key
            } 
            if (isNaN(parseInt(args.id_tg))){
              throw new Error("id тг должен быть чилсовой")
            }
            if (isNaN(parseInt(args.id_vk))){
              throw new Error("id тг должен быть чилсовой")
            }
            sendMessage(args_int)
          }
          catch (error : unknown) {
            NotificationManager.createNotification("error", (error as Error).message, "")
          }

        }
        }
        onCancelClick={async () => {
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
