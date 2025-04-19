import React, { useEffect, useState } from 'react';
import ButtonHeader from '../../widgets/Header/Header';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setPosts, setPostsScroll, setSelectedPostId } from '../../../stores/postsSlice';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import MainContainer from '../MainContainer/MainContainer';
import styles from './styles.module.scss';
import { Team } from '../../../models/Team/types';
import { MyTeams } from '../../../api/teamApi';
import { Post } from '../../../models/Post/types';
import { setCurrentUserId, setTeams } from '../../../stores/teamSlice';
import { getPosts, Me } from '../../../api/api';
import dayjs from 'dayjs';

const MainPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);
  const selectedteamid = useAppSelector((state) => state.teams.globalActiveTeamId);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // для того, чтоб сбрасывать состояние ленты и миниленты
  const handleTabChange = (key: string) => {
    dispatch(setActiveTab(key));
    dispatch(setSelectedPostId(0));
  };

  useEffect(() => {
    getPosts(selectedteamid, 20, dayjs().format())
      .then((res: { posts: Post[] }) => {
        if (res.posts) {
          if (res.posts.length == 0) {
            console.log('Постов нет в MainPage, объяви меня');
          } else {
            dispatch(setPostsScroll(res.posts.length - 1));
            dispatch(setPosts(res.posts));
          }
        } else {
          console.log('Постов нет в MainPage, объяви меня');
        }
      })
      .catch(() => {
        console.log('Error getting posts');
      });
  }, [selectedteamid]);

  useEffect(() => {
    MyTeams()
      .then((res: { teams: Team[] }) => {
        if (res.teams) {
          dispatch(setTeams(res.teams));
        }
      })
      .catch(() => {
        console.log('Error getting teams');
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
        console.error('Ошибка при получении данных пользователя:', error);
        setIsAuthorized(false);
      });
  }, [dispatch]);

  return (
    <div className={styles['main-page']}>
      <ButtonHeader
        isAuthorized={isAuthorized}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <MainContainer isAuthorized={isAuthorized} />
    </div>
  );
};

export default MainPage;
