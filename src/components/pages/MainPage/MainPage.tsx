import React, { useContext, useEffect, useState } from "react";
import ButtonHeader from "../../widgets/Header/Header";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  setPosts,
  setPostsScroll,
  setSelectedPostId,
} from "../../../stores/postsSlice";
import { setActiveTab } from "../../../stores/basePageDialogsSlice";
import MainContainer from "../MainContainer/MainContainer";
import styles from "./styles.module.scss";
import { Team } from "../../../models/Team/types";
import { MyTeams } from "../../../api/teamApi";
import { mockPosts, Post } from "../../../models/Post/types";
import { setCurrentUserId, setTeams } from "../../../stores/teamSlice";
import { getComment, getPosts, Me } from "../../../api/api";
import { ReadyState } from "react-use-websocket";
import { WebSocketContext } from "../../../api/WebSocket";
import AuthenticatedSSE from "../../../api/SSE";
import { addComment } from "../../../stores/commentSlice";

const MainPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);
  const webSocketmanager = useContext(WebSocketContext);
  const selectedteamid = useAppSelector(
    (state) => state.teams.globalActiveTeamId
  );
  const [isAuthorized, setIsAuthorized] = useState(false);
  const url =
    "http://localhost:80/api/comment/subscribe?team_id=" + selectedteamid;

  useEffect(() => {
    console.log(url);
  }, [selectedteamid]);

  // для того, чтоб сбрасывать состояние ленты и миниленты
  const handleTabChange = (key: string) => {
    dispatch(setActiveTab(key));
    if (key === "1") {
      dispatch(setSelectedPostId(""));
    }
  };

  useEffect(() => {
    getPosts()
      .then((res: { posts: Post[] }) => {
        if (res.posts) {
          if (res.posts.length == 0) {
            console.log("mocks");
            dispatch(setPosts(mockPosts));
            dispatch(setPostsScroll(mockPosts.length));
          } else {
            dispatch(setPosts(res.posts));
            dispatch(setPostsScroll(res.posts.length));
          }
        } else {
        }
      })
      .catch(() => {
        console.log("mocks");
        dispatch(setPosts(mockPosts));
        dispatch(setPostsScroll(mockPosts.length));
        console.log("Error getting posts");
      });
  }, []);

  useEffect(() => {
    MyTeams()
      .then((res: { teams: Team[] }) => {
        if (res.teams) {
          dispatch(setTeams(res.teams));
        }
      })
      .catch(() => {
        console.log("Error getting teams");
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

  useEffect(() => {
    Me()
      .then((userData) => {
        if (userData && userData.user_id) {
          const userId = Number(userData.user_id);
          setCurrentUserId(userId);
          dispatch(setCurrentUserId(userId));
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      })
      .catch((error) => {
        console.error("Ошибка при получении данных пользователя:", error);
        setIsAuthorized(false);
      });
  }, [dispatch]);

  const newComment = (data: any) => {
    getComment(selectedteamid, data.data).then((data) =>
      dispatch(addComment(data))
    );
  };

  return (
    <AuthenticatedSSE url={url} onMessage={newComment}>
      <div className={styles["main-page"]}>
        <ButtonHeader
          isAuthorized={isAuthorized}
          activeTab={activeTab}
          onTabChange={handleTabChange} // для изменения вкладки
        />

        <MainContainer isAuthorized={isAuthorized} />
      </div>
    </AuthenticatedSSE>
  );
};

export default MainPage;
