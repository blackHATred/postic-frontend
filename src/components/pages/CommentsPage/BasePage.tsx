import React, { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import ButtonHeader from "../../widgets/Header/Header";
import { Post } from "../../../models/Post/types";
import PostList from "../../widgets/PostList/PostList";
import DialogBoxSummary from "../../widgets/SummaryDialog/SummaryDialog";
import { Breadcrumb } from "antd";
import CreatePostDialog from "../../widgets/CreatePostDialog/CreatePostDialog";
import PostStatusDialog from "../../widgets/PostStatusDialog/PostStatusDialog";
import WelcomeDialog from "../../widgets/auth/WelcomeDialog";
import LoginDialog from "../../widgets/auth/LoginDialog";
import RegisterDialog from "../../widgets/auth/RegisterDialog";
import { getPosts } from "../../../api/api";
import MeDialog from "../../widgets/auth/MeDialog";
import { WebSocketContext } from "../../../api/WebSocket";
import { ReadyState } from "react-use-websocket";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  setPosts,
  setScrollToPost,
  setSelectedPostId,
} from "../../../stores/postsSlice";
import { setActiveTab } from "../../../stores/basePageDialogsSlice";

const BasePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const webSocketmanager = useContext(WebSocketContext);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);

  useEffect(() => {
    getPosts()
      .then((res: { posts: Post[] }) => {
        if (res.posts) {
          dispatch(setPosts(res.posts));
        } else {
        }
      })
      .catch(() => {
        console.log("Error getting posts");
      });
  }, []);

  useEffect(() => {
    if (webSocketmanager.readyState == ReadyState.OPEN) {
      webSocketmanager.sendJsonMessage({
        type: "get_comments",
        get_comments: {
          post_union_id: 0,
          offset: "2020-03-26T13:55:57+03:00",
          max_count: 10,
        },
      });
      console.log("sent");
    }
  }, [webSocketmanager.readyState]);

  // для того, чтоб сбрасывать состояние ленты и миниленты
  const handleTabChange = (key: string) => {
    dispatch(setActiveTab(key));
    if (key === "1") {
      dispatch(setSelectedPostId(""));
    }
  };

  return (
    <div className={styles.commentPage}>
      <ButtonHeader
        activeTab={activeTab}
        onTabChange={handleTabChange} // для изменения вкладки
      />

      {activeTab === "1" ? (
        <div>
          <PostList />
        </div>
      ) : (
        <div>
          {selectedPostId && (
            <Breadcrumb
              className={styles["breadcrumb"]}
              items={[
                {
                  title: (
                    <div
                      className={styles["Post"]}
                      onClick={() => {
                        dispatch(setActiveTab("1"));
                        dispatch(setScrollToPost(true));
                      }}
                    >
                      {"Пост #" + selectedPostId}
                    </div>
                  ),
                },
                {
                  title: "Комментарии",
                },
              ]}
            ></Breadcrumb>
          )}

          <CommentList />
        </div>
      )}
      <DialogBoxSummary />
      <PostStatusDialog />
      <CreatePostDialog />

      <LoginDialog />
      <RegisterDialog />

      <MeDialog />

      <WelcomeDialog />
    </div>
  );
};

export default BasePage;
