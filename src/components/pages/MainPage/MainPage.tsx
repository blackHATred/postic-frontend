import React, { useEffect, useState } from "react";
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
import { Post } from "../../../models/Post/types";
import { setCurrentUserId, setTeams } from "../../../stores/teamSlice";
import { getComment, getPosts, Me } from "../../../api/api";
import AuthenticatedSSE from "../../../api/SSE";
import { addComment } from "../../../stores/commentSlice";

const MainPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);
  const selectedteamid = useAppSelector(
    (state) => state.teams.globalActiveTeamId
  );
  const [isAuthorized, setIsAuthorized] = useState(false);
  const url =
    "http://localhost:80/api/comment/subscribe?team_id=" + selectedteamid;

  // для того, чтоб сбрасывать состояние ленты и миниленты
  const handleTabChange = (key: string) => {
    dispatch(setActiveTab(key));
    dispatch(setSelectedPostId(0));
  };

  useEffect(() => {
    getPosts(selectedteamid, 20)
      .then((res: { posts: Post[] }) => {
        if (res.posts) {
          if (res.posts.length == 0) {
          } else {
            dispatch(setPostsScroll(res.posts.length - 1));
            dispatch(setPosts(res.posts));
          }
        } else {
        }
      })
      .catch(() => {});
  }, [selectedteamid]);

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
    console.log(data);
    getComment(selectedteamid, data.data).then((data) => {
      console.log(data);
      dispatch(addComment(data.comment));
    });
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
