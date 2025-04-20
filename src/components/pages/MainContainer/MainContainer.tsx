import React, { useState } from 'react';
import styles from './styles.module.scss';
import CommentList from '../../widgets/CommentList/CommentList';
import PostList from '../../widgets/PostList/PostList';
import PostStatusDialog from '../../widgets/PostStatusDialog/PostStatusDialog';
import WelcomeDialog from '../../widgets/auth/WelcomeDialog';
import LoginDialog from '../../widgets/auth/LoginDialog';
import RegisterDialog from '../../widgets/auth/RegisterDialog';
import MeDialog from '../../widgets/auth/MeDialog';
import TeamList from '../../widgets/TeamList/TeamList';
import TeamAddMemberDialog from '../../widgets/TeamDialog/TeamAddMemberDialog';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import DialogBoxSummary from '../../widgets/SummaryDialog/SummaryDialog';
import Sidebar from '../../ui/Sidebar/Sidebar';
import TeamCreateDialog from '../../widgets/TeamDialog/TeamCreateDialog';
import TeamEditMemberDialog from '../../widgets/TeamDialog/TeamEditMemberDialog';
import CreatePostDialog from '../../widgets/CreatePostDialog/CreatePostDialog';
import TeamRenameDialog from '../../widgets/TeamDialog/TeamRenameDialog';
import AnswerDialog from '../../widgets/AnswerDialog/AnswerDialog';
import { Alert } from 'antd';
import SideMenu from '../../ui/SideMenu/SideMenu';
const MainContainer: React.FC = () => {
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);
  const [activePage, setActivePage] = useState<string>('posts');
  const [, setShowCreatePostDialog] = useState(false);
  const selectedTeam = useAppSelector((state) => state.teams.globalActiveTeamId);
  const isAuthorized = useAppSelector((state) => state.teams.authorize_status);

  const dispatch = useAppDispatch();
  const handleSidebarClick = (key: string) => {
    dispatch(setActiveTab(key));
    dispatch(setSelectedPostId(0));
  };

  return (
    <div className={styles['main-container']}>
      {isAuthorized == 'authorized' && (
        <div className={styles['layout']}>
          {/* Навигационная панель (Sidebar) */}
          <div className={styles['left-sidebar']}>
            <Sidebar />
          </div>

          {/* Основной контент */}
          <div className={styles['content']}>
            {/* Контент для вкладок хедера */}
            {activeTab === '1' && (
              <div style={{ width: '100%', height: '100%' }}>
                <PostList hasMore={true} />
              </div>
            )}
            {activeTab === '2' && <CommentList />}

            {activeTab === '3' && (
              <div className={styles['content']}>
                <TeamList />
              </div>
            )}
          </div>
          <div className={styles['right-sidebar']}>
            <SideMenu setActivePage={handleSidebarClick} />
          </div>
        </div>
      )}
      {isAuthorized == 'not_authorized' && (
        <Alert className={styles['loginDiv']} message='Пожалуйста зарегестрируйтесь или войдите в аккаунт' type='info' />
      )}
      {isAuthorized == 'authorized' && selectedTeam == 0 && (
        <Alert
          className={styles['loginDiv']}
          message='Вы не состоите ни в какой команде. Создайте свою или попросите администратора, чтобы он пригласил вас'
          type='info'
        />
      )}
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
