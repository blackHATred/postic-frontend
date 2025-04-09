import React, { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import { Post } from "../../../models/Post/types";
import PostList from "../../widgets/PostList/PostList";
import { Breadcrumb, Typography } from "antd";
import PostStatusDialog from "../../widgets/PostStatusDialog/PostStatusDialog";
import WelcomeDialog from "../../widgets/auth/WelcomeDialog";
import LoginDialog from "../../widgets/auth/LoginDialog";
import RegisterDialog from "../../widgets/auth/RegisterDialog";
import { getPosts } from "../../../api/api";
import MeDialog from "../../widgets/auth/MeDialog";
import { WebSocketContext } from "../../../api/WebSocket";
import TeamList from "../../widgets/TeamList/TeamList";
import TeamAddMemberDialog from "../../widgets/TeamDialog/TeamAddMemberDialog";
import { ReadyState } from "react-use-websocket";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { setPosts, setScrollToPost } from "../../../stores/postsSlice";
import { setActiveTab } from "../../../stores/basePageDialogsSlice";
import DialogBoxSummary from "../../widgets/SummaryDialog/SummaryDialog";
import Sidebar from "../../ui/Sidebar/Sidebar";
import TeamCreateDialog from "../../widgets/TeamDialog/TeamCreateDialog";
import TeamEditMemberDialog from "../../widgets/TeamDialog/TeamEditMemberDialog";

const { Text } = Typography;

interface MainContainerProps {
  isAuthorized: boolean;
}

const MainContainer: React.FC<MainContainerProps> = ({ isAuthorized }) => {
  const dispatch = useAppDispatch();
  const webSocketmanager = useContext(WebSocketContext);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);
  const [showDiaTeamCreate, setShowDiaTeamCreate] = useState(false);
  const [activePage, setActivePage] = useState<string>("posts");
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);

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

  const handleBreadcrumbClick = () => {
    dispatch(setActiveTab("1"));
    dispatch(setScrollToPost(true));
  };

  const handleSidebarClick = (page: string) => {
    if (page === "add-post") {
      setShowCreatePostDialog(true); // Открываем модалку "Добавить пост"
    } else {
      setActivePage(page); // Устанавливаем активную страницу
      dispatch(setActiveTab("")); // Сбрасываем активную вкладку хедера при переключении на страницу сайдбара
    }
  };

  return (
    <div className={styles["main-container"]}>
      {isAuthorized && (
        <div className={styles["layout"]}>
          {/* Навигационная панель (Sidebar) */}
          <Sidebar setActivePage={handleSidebarClick} />

          {/* Основной контент */}
          <div className={styles["content"]}>
            {/* Контент для вкладок хедера */}
            {activeTab === "1" && (
              <div>
                <PostList />
              </div>
            )}
            {activeTab === "2" && (
              <div>
                {selectedPostId && (
                  <Breadcrumb className={styles["breadcrumb"]}>
                    <Breadcrumb.Item
                      onClick={handleBreadcrumbClick}
                      className={styles["breadcrumb-item-link"]}
                    >
                      {"Пост #" + selectedPostId}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Комментарии</Breadcrumb.Item>
                  </Breadcrumb>
                )}
                <CommentList />
              </div>
            )}

            {/* Контент для элементов Sidebar */}
            {activePage === "teams" && (
              <div>
                <TeamList />
              </div>
            )}

            {/* Другие страницы Sidebar могут быть добавлены здесь */}
          </div>
        </div>
      )}
      {!isAuthorized && <div>Привет, го в команду, а то что как лопушок</div>}

      <DialogBoxSummary />
      <PostStatusDialog />
      <LoginDialog />
      <RegisterDialog />
      <MeDialog />
      <WelcomeDialog />
      <TeamAddMemberDialog />
      <TeamCreateDialog />
      <TeamEditMemberDialog />
    </div>
  );
};

export default MainContainer;
