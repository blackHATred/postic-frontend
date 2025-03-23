import React, { useRef, useState } from "react";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import ButtonHeader from "../../widgets/Header/Header";
import { mockPosts } from "../../../models/Post/types";
import PostList from "../../widgets/PostList/PostList";
import DialogBoxSummary, { SummaryBoxContext } from "../../widgets/dialogBoxes/dialogBoxSummary";
import ApiKeyBox from "../../widgets/ApiKeyBox/ApiKeyBox";





const BasePage: React.FC = () => {
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
          <CommentList/>
        )}

        <ApiKeyBox showBox= {showDia1} setShowBox={setShowDia1} />

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
