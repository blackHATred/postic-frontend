import React from 'react';
import styles from './styles.module.scss';
import CommentList from '../../lists/CommentList/CommentList';
import PostList from '../../lists/PostList/PostList';
import PostStatusDialog from '../../modals/PostStatusDialog/PostStatusDialog';
import WelcomeDialog from '../../modals/auth/WelcomeDialog';
import LoginDialog from '../../modals/auth/LoginDialog';
import RegisterDialog from '../../modals/auth/RegisterDialog';
import MeDialog from '../../modals/auth/MeDialog';
import TeamList from '../../lists/TeamList/TeamList';
import TeamAddMemberDialog from '../../modals/TeamDialog/TeamAddMemberDialog';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import DialogBoxSummary from '../../modals/SummaryDialog/SummaryDialog';
import Sidebar from '../../ui/Sidebar/Sidebar';
import TeamCreateDialog from '../../modals/TeamDialog/TeamCreateDialog';
import TeamEditMemberDialog from '../../modals/TeamDialog/TeamEditMemberDialog';
import CreatePostDialog from '../../modals/CreatePostDialog/CreatePostDialog';
import TeamRenameDialog from '../../modals/TeamDialog/TeamRenameDialog';
import AnswerDialog from '../../modals/AnswerDialog/AnswerDialog';
import { Alert } from 'antd';
import SideMenu from '../../ui/SideMenu/SideMenu';
import { setSelectedPostId } from '../../../stores/postsSlice';
const MainContainer: React.FC = () => {
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);
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
            <SideMenu />
          </div>
        </div>
      )}
      {isAuthorized == 'not_authorized' && (
        <Alert
          className={styles['loginDiv']}
          message='Пожалуйста зарегестрируйтесь или войдите в аккаунт'
          type='info'
        />
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
