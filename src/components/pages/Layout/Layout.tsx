import { Alert } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../../../stores/hooks';
import Sidebar from '../../ui/Sidebar/Sidebar';
import SideMenu from '../../ui/SideMenu/SideMenu';
import ButtonHeader from '../../widgets/Header/Header';
import styles from './styles.module.scss';

const PageLayout: React.FC = () => {
  const isAuthorized = useAppSelector((state) => state.teams.authorize_status);
  const selectedTeam = useAppSelector((state) => state.teams.globalActiveTeamId);

  return (
    <div className={styles['main-page']}>
      <ButtonHeader />
      <div className={styles['main-container']}>
        {isAuthorized === 'authorized' && (
          <div className={styles['layout']}>
            {/* Навигационная панель (Sidebar) */}
            <div className={styles['left-sidebar']}>
              <Sidebar />
            </div>

            {/* Основной контент */}
            <div className={styles['content']}>
              <Outlet />
            </div>

            <div className={styles['right-sidebar']}>
              <SideMenu />
            </div>
          </div>
        )}

        {isAuthorized === 'not_authorized' && (
          <Alert
            className={styles['loginDiv']}
            message='Пожалуйста зарегистрируйтесь или войдите в аккаунт'
            type='info'
          />
        )}

        {isAuthorized === 'authorized' && selectedTeam === 0 && (
          <Alert
            className={styles['loginDiv']}
            message='Вы не состоите ни в какой команде. Создайте свою или попросите администратора, чтобы он пригласил вас'
            type='info'
          />
        )}
      </div>
    </div>
  );
};

export default PageLayout;
