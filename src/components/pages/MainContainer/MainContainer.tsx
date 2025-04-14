import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import CommentList from '../../widgets/CommentList/CommentList';
import PostList from '../../widgets/PostList/PostList';
import { Breadcrumb } from 'antd';
import PostStatusDialog from '../../widgets/PostStatusDialog/PostStatusDialog';
import WelcomeDialog from '../../widgets/auth/WelcomeDialog';
import LoginDialog from '../../widgets/auth/LoginDialog';
import RegisterDialog from '../../widgets/auth/RegisterDialog';
import MeDialog from '../../widgets/auth/MeDialog';
import TeamList from '../../widgets/TeamList/TeamList';
import TeamAddMemberDialog from '../../widgets/TeamDialog/TeamAddMemberDialog';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setScrollToPost } from '../../../stores/postsSlice';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import DialogBoxSummary from '../../widgets/SummaryDialog/SummaryDialog';
import Sidebar from '../../ui/Sidebar/Sidebar';
import TeamCreateDialog from '../../widgets/TeamDialog/TeamCreateDialog';
import TeamEditMemberDialog from '../../widgets/TeamDialog/TeamEditMemberDialog';
import CreatePostDialog from '../../widgets/CreatePostDialog/CreatePostDialog';
import TeamRenameDialog from '../../widgets/TeamDialog/TeamRenameDialog';
import AnswerDialog from '../../widgets/AnswerDialog/AnswerDialog';

interface MainContainerProps {
  isAuthorized: boolean;
}

const MainContainer: React.FC<MainContainerProps> = ({ isAuthorized }) => {
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);
  const [activePage, setActivePage] = useState<string>('posts');
  const [, setShowCreatePostDialog] = useState(false);

  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const dispatch = useAppDispatch();

  const handleBreadcrumbClick = () => {
    dispatch(setActiveTab('1'));
    dispatch(setScrollToPost(true));
  };

  const handleSidebarClick = (page: string) => {
    if (page === 'add-post') {
      setShowCreatePostDialog(true); // Открываем модалку "Добавить пост"
    } else {
      setActivePage(page); // Устанавливаем активную страницу
      dispatch(setActiveTab('')); // Сбрасываем активную вкладку хедера при переключении на страницу сайдбара
    }
  };

  useEffect(() => {
    if (activeTab != '') {
      setActivePage('');
    }
  }, [activeTab]);

  return (
    <div className={styles['main-container']}>
      {isAuthorized && (
        <div className={styles['layout']}>
          {/* Навигационная панель (Sidebar) */}
          <Sidebar setActivePage={handleSidebarClick} />

          {/* Основной контент */}
          <div className={styles['content']}>
            {/* Контент для вкладок хедера */}
            {activeTab === '1' && (
              <div style={{ width: '100%', height: '100%' }}>
                <PostList hasMore={true} />
              </div>
            )}
            {activeTab === '2' && (
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                }}
              >
                {selectedPostId != 0 && (
                  <Breadcrumb className={styles['breadcrumb']}>
                    <Breadcrumb.Item onClick={handleBreadcrumbClick} className={styles['breadcrumb-item-link']}>
                      {'Пост #' + selectedPostId}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Комментарии</Breadcrumb.Item>
                  </Breadcrumb>
                )}
                <CommentList />
              </div>
            )}

            {/* Контент для элементов Sidebar */}
            {activePage === 'teams' && (
              <div>
                <TeamList />
              </div>
            )}

            {/* Другие страницы Sidebar могут быть добавлены здесь */}
          </div>
        </div>
      )}
      {!isAuthorized && <div className={styles['loginDiv']}>Привет, го в команду, а то что как лопушок</div>}

      <DialogBoxSummary />
      <PostStatusDialog />
      <CreatePostDialog />
      <LoginDialog />
      <RegisterDialog />
      <MeDialog />
      <WelcomeDialog />
      <TeamAddMemberDialog />
      <TeamCreateDialog />
      <TeamEditMemberDialog />
      <TeamRenameDialog />
      <AnswerDialog />
    </div>
  );
};

export default MainContainer;
