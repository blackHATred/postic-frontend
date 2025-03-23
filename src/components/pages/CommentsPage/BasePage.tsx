import React, { useRef, useState } from "react";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import ButtonHeader from "../../widgets/Header/Header";
import { Comment } from "../../../models/Comment/types";
import DialogBoxOneInput from "../../widgets/dialogBoxes/dialogBoxOneInput";
import DialogBoxThreeInput from "../../widgets/dialogBoxes/dialog_box_two";
import axios from "axios";
import { mockPosts } from "../../../models/Post/types";
import PostList from "../../widgets/PostList/PostList";
import DialogBoxSummary, { SummaryBoxContext } from "../../widgets/dialogBoxes/dialogBoxSummary";
import ApiKeyBox from "../../widgets/ApiKeyBox/ApiKeyBox";
import { Breadcrumb } from "antd";
import CreatePostDialog from "../../widgets/CreatePostDialog/CreatePostDialog";
import { SendOutlined } from "@ant-design/icons";
import PostStatusDialog from "../../widgets/PostStatusDialog/PostStatusDialog";





const BasePage: React.FC = () => {
  const [showDia1, setShowDia1] = useState(false);
  const [showDialogStatusPost, setShowDialogStatusPost] = useState(false);
  const [showDiaCreatePost, setShowDiaCreatePost] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("1");
  const PostRef = useRef<HTMLDivElement>(null);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [postSummaryID, setPostSummaryID] = useState("");


  const [postId, setPostId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5; // комменты
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]); // чтоб передавать соц сети от создания поста к статусу публикации

  const makeVisibleDialog1 = () => {
    setShowDia1(true);
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
      setCurrentPage(1);
    }
  };

  const filteredComments = postId
    ? comments.filter((comment) => comment.postId === postId)
    : comments;

  const paginatedComments = filteredComments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <SummaryBoxContext.Provider
      value={{setActive: setShowDia2, PostRef: PostRef, setLoading:setSummaryLoading, setPostID: setPostSummaryID}}
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
            <PostList posts={mockPosts}/>
          </div>
        ) : (
          <div>
          <Breadcrumb>
            {postId && (
              <Breadcrumb.Item>Комментарии поста {postId}</Breadcrumb.Item>
            )}
          </Breadcrumb>

          <CommentList
            comments={paginatedComments}
            isLoading={false}
            hasMore={filteredComments.length > currentPage * pageSize}
            onLoadMore={() => setCurrentPage(currentPage + 1)}
          />
        </div>
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
      <PostStatusDialog
        title={"Публикация поста"}
        buttonText={"Открыть"}
        onOk={() => {
          console.log("Create post dialog confirmed");
        }}
        onCancel={async () => {
          console.log("Create post dialog canceled");
          return "";
        }}
        setOpen={setShowDialogStatusPost}
        isOpen={showDialogStatusPost}
        selectedPlatforms={selectedPlatforms} // Передаем выбранные платформы
      />

      <CreatePostDialog
        title={"Создать пост"}
        onOk={() => {
          console.log("Create post dialog confirmed");
          setShowDialogStatusPost(true); // открытие окна статуса
        }}
        onCancel={async () => {
          console.log("Create post dialog canceled");
          return "";
        }}
        buttonText={"Опубликовать"}
        setOpen={setShowDiaCreatePost}
        isOpen={showDiaCreatePost}
        selectedPlatforms={selectedPlatforms} // выбранные платформы
        setSelectedPlatforms={setSelectedPlatforms}
      />
    </div>
  );
};

export default BasePage;
