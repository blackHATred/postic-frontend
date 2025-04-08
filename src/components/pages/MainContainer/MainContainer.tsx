import React, { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import { Post } from "../../../models/Post/types";
import PostList from "../../widgets/PostList/PostList";
import { Breadcrumb, Typography } from "antd";
import CreatePostDialog from "../../widgets/CreatePostDialog/CreatePostDialog";
import PostStatusDialog from "../../widgets/PostStatusDialog/PostStatusDialog";
import WelcomeDialog from "../../widgets/auth/WelcomeDialog";
import LoginDialog from "../../widgets/auth/LoginDialog";
import RegisterDialog from "../../widgets/auth/RegisterDialog";
import { getPosts } from "../../../api/api";
import MeDialog from "../../widgets/auth/MeDialog";
import { WebSocketContext } from "../../../api/WebSocket";
import TeamAddMemberDialog from "../../widgets/TeamDialog/TeamAddMemberDialog";
import { ReadyState } from "react-use-websocket";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { setPosts, setScrollToPost } from "../../../stores/postsSlice";
import { setActiveTab } from "../../../stores/basePageDialogsSlice";
import DialogBoxSummary from "../../widgets/SummaryDialog/SummaryDialog";
import Sidebar from "../../ui/Sidebar/Sidebar";

const { Text } = Typography;

const MainContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const webSocketmanager = useContext(WebSocketContext);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);
  const [showDiaTeamCreate, setShowDiaTeamCreate] = useState(false);
  const [activePage, setActivePage] = useState<string>("posts");

  useEffect(() => {
    getPosts()
      .then((res: { posts: Post[] }) => {
        if (res.posts) {
          dispatch(setPosts(res.posts));
        } else {
          console.log("нет постов");
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

  return (
    <div className={styles["main-container"]}>
      <div className={styles["layout"]}>
        {/* Навигационная панель */}
        <Sidebar setActivePage={setActivePage} />

        {/* Основной контент */}
        <div className={styles["content"]}>
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
        </div>
      </div>

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

export default MainContainer;
