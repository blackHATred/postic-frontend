import React, { useRef, useState } from "react";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import ButtonHeader from "../../widgets/Header/Header";
import axios from "axios";
import { mockPosts } from "../../../models/Post/types";
import PostList from "../../widgets/PostList/PostList";
import DialogBoxSummary, {
  SummaryBoxContext,
} from "../../widgets/dialogBoxes/dialogBoxSummary";
import ApiKeyBox from "../../widgets/ApiKeyBox/ApiKeyBox";
import { Breadcrumb } from "antd";
import CreatePostDialog from "../../widgets/CreatePostDialog/CreatePostDialog";
import PostStatusDialog from "../../widgets/PostStatusDialog/PostStatusDialog";

const BasePage: React.FC = () => {
  const [showDiaAPI, setShowDiaAPI] = useState(false);
  const [showDiaSummary, setShowDiaSummary] = useState(false);
  const [showDialogStatusPost, setShowDialogStatusPost] = useState(false);
  const [showDiaCreatePost, setShowDiaCreatePost] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("1");

  const PostRef = useRef<HTMLDivElement>(null);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [postSummaryID, setPostSummaryID] = useState("");

  const [postId, setPostId] = useState<string | null>(null);

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]); // чтоб передавать соц сети от создания поста к статусу публикации

  const makeVisibleDialog1 = () => {
    setShowDiaAPI(true);
  };
  const makeVisibleDialogStatusPost = () => {
    setShowDialogStatusPost(true);
  };

  const makeVisibleDialogCreatePost = () => {
    setShowDiaCreatePost(true);
  };

  const handlePostCommentClick = (postId: string) => {
    setPostId(postId);
    setActiveTab("2");
  };

  // для того, чтоб сбрасывать состояние ленты и миниленты
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === "1") {
      setPostId(null);
    }
  };

  return (
    <SummaryBoxContext.Provider
      value={{
        setActive: setShowDiaSummary,
        PostRef: PostRef,
        setLoading: setSummaryLoading,
        setPostID: setPostSummaryID,
      }}
    >
      <div className={styles.commentPage}>
        <ButtonHeader
          OnClick1={makeVisibleDialog1}
          OnClick2={makeVisibleDialogStatusPost}
          OnClickCreatePost={makeVisibleDialogCreatePost}
          activeTab={activeTab}
          onTabChange={handleTabChange} // для изменения вкладки
        />

        {activeTab === "1" ? (
          <div>
            <PostList
              posts={mockPosts}
              onCommentClick={handlePostCommentClick}
            />
          </div>
        ) : (
          <div>
            <Breadcrumb>
              {postId && (
                <Breadcrumb.Item>Комментарии поста {postId}</Breadcrumb.Item>
              )}
            </Breadcrumb>

            <CommentList isLoading={false} postId={postId} />
          </div>
        )}

        <ApiKeyBox showBox={showDiaAPI} setShowBox={setShowDiaAPI} />

        <DialogBoxSummary
          title={"Суммаризация комментариев"}
          buttonText={"Повторная суммаризация"}
          setOpen={setShowDiaSummary}
          isOpen={showDiaSummary}
          postRef={PostRef}
          isLoading={summaryLoading}
          postId={postSummaryID}
        />
      </div>

      <PostStatusDialog
        title={"Публикация поста"}
        buttonText={"Открыть"}
        onOkClick={() => {
          console.log("Create post dialog confirmed");
        }}
        onCancelClick={async () => {
          console.log("Create post dialog canceled");
          return "";
        }}
        setOpen={setShowDialogStatusPost}
        isOpen={showDialogStatusPost}
        selectedPlatforms={selectedPlatforms} // Передаем выбранные платформы
      />

      <CreatePostDialog
        title={"Создать пост"}
        onOkClick={() => {
          console.log("Create post dialog confirmed");
          setShowDialogStatusPost(true); // открытие окна статуса
        }}
        onCancelClick={async () => {
          console.log("Create post dialog canceled");
          return "";
        }}
        buttonText={"Опубликовать"}
        setOpen={setShowDiaCreatePost}
        isOpen={showDiaCreatePost}
        selectedPlatforms={selectedPlatforms} // выбранные платформы
        setSelectedPlatforms={setSelectedPlatforms}
      />
    </SummaryBoxContext.Provider>
  );
};

export default BasePage;
