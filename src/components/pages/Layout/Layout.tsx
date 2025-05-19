import { Alert, Spin } from 'antd';
import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import Sidebar from '../../ui/Sidebar/Sidebar';
import SideMenu from '../../ui/SideMenu/SideMenu';
import ButtonHeader from '../../widgets/Header/Header';
import styles from './styles.module.scss';
import { routes } from '../../../app/App.routes';
import ClickableButton from '../../ui/Button/Button';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { setHelpDialog } from '../../../stores/basePageDialogsSlice';

const PageLayout: React.FC = () => {
  const isAuthorized = useAppSelector((state) => state.teams.authorize_status);
  const selectedTeam = useAppSelector((state) => state.teams.globalActiveTeamId);
  const selectedUser = useAppSelector((state) => state.teams.currentUserId);
  const auth = useAppSelector((state) => state.teams.authorize_status);
  const loc = useLocation().pathname;
  const navigate = useNavigate();
  const teams = useAppSelector((state) => state.teams.teams);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const roles = teams
      .find((team) => {
        return team.id == selectedTeam;
      })
      ?.users.find((user) => {
        return user.user_id == selectedUser;
      })?.roles;
    if (
      auth == 'not_authorized' ||
      (selectedUser != 0 &&
        selectedTeam &&
        teams &&
        roles?.find((el) => {
          return '/' + el == loc || el == 'admin';
        }) == undefined)
    ) {
      navigate(routes.teams());
    }
  }, [teams, loc, auth]);

  const handleHelpButtonClick = () => {
    dispatch(setHelpDialog(true));
  };

  return (
    <div className={styles['main-page']}>
      <ButtonHeader />
      <div className={styles['main-container']}>
        <div className={styles['layout']}>
          {/* Навигационная панель (Sidebar) */}

          {isAuthorized === 'loading' && <Spin className={styles.spin} />}

          {isAuthorized === 'not_authorized' && (
            <Alert
              className={styles['loginDiv']}
              message='Пожалуйста зарегистрируйтесь или войдите в аккаунт'
              type='info'
            />
          )}

          {isAuthorized === 'authorized' && selectedTeam === 0 && (
            <>
              <div className={styles['left-sidebar']}>
                <Sidebar />
              </div>
              <Alert
                className={styles['loginDiv']}
                message='Вы не состоите ни в какой команде. Создайте свою или попросите администратора, чтобы он пригласил вас'
                type='info'
              />
              <div className={styles['right-sidebar']}>
                <SideMenu />
              </div>
            </>
          )}

          {/* Основной контент */}
          {isAuthorized === 'authorized' && selectedTeam !== 0 && (
            <>
              <div className={styles['left-sidebar']}>
                <Sidebar />
              </div>
              <div className={styles['content']}>
                <Outlet />
              </div>
              <div className={styles['right-sidebar']}>
                <SideMenu />
              </div>
            </>
          )}

          <div className={styles['help-buttons']}>
            <ClickableButton
              icon={<QuestionCircleOutlined />}
              shape='circle'
              type='default'
              size='large'
              className={styles['help-button']}
              onButtonClick={handleHelpButtonClick}
              withPopover={true}
              popoverContent='Открыть руководство пользователя'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
