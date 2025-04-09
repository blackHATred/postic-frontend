import React, { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import ButtonHeader from "../../widgets/Header/Header";
import { Post } from "../../../models/Post/types";
import PostList from "../../widgets/PostList/PostList";
import { Breadcrumb } from "antd";
import CreatePostDialog from "../../widgets/CreatePostDialog/CreatePostDialog";
import PostStatusDialog from "../../widgets/PostStatusDialog/PostStatusDialog";
import WelcomeDialog from "../../widgets/auth/WelcomeDialog";
import LoginDialog from "../../widgets/auth/LoginDialog";
import RegisterDialog from "../../widgets/auth/RegisterDialog";
import { getPosts } from "../../../api/api";
import MeDialog from "../../widgets/auth/MeDialog";
import { WebSocketContext } from "../../../api/WebSocket";
import TeamList from "../../widgets/TeamList/TeamList";
import TeamCreateDialog from "../../widgets/TeamDialog/TeamCreateDialog";
import TeamAddMemberDialog from "../../widgets/TeamDialog/TeamAddMemberDialog";
import TeamEditMemberDialog from "../../widgets/TeamDialog/TeamEditMemberDialog";
import { ReadyState } from "react-use-websocket";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  setPosts,
  setPostsScroll,
  setScrollToPost,
  setSelectedPostId,
} from "../../../stores/postsSlice";
import { setActiveTab } from "../../../stores/basePageDialogsSlice";
import DialogBoxSummary from "../../widgets/SummaryDialog/SummaryDialog";

const BasePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const webSocketmanager = useContext(WebSocketContext);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);
  const [showDiaTeamCreate, setShowDiaTeamCreate] = useState(false);

  useEffect(() => {
    getPosts()
      .then((res: { posts: Post[] }) => {
        if (res.posts) {
          dispatch(setPosts(res.posts));
          dispatch(setPostsScroll(res.posts.length));
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

      {activeTab == "1" && <PostList hasMore={true} />}
      {activeTab == "2" && (
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
      <TeamAddMemberDialog
        title={"Добавление участника"}
        setOpen={setShowDiaTeamCreate}
        isOpen={showDiaTeamCreate}
      />
    </div>
  );
};

export default BasePage;
