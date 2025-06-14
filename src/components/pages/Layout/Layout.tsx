import { Alert, Spin, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import Sidebar from '../../ui/Sidebar/Sidebar';
import SideMenu from '../../ui/SideMenu/SideMenu';
import ButtonHeader from '../../widgets/Header/Header';
import styles from './styles.module.scss';
import { routes } from '../../../app/App.routes';
import ClickableButton from '../../ui/Button/Button';
import {
  DoubleLeftOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
  MessageOutlined,
  CommentOutlined,
  TeamOutlined,
  LineChartOutlined,
  TagOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { setHelpDialog, setScrollToTop } from '../../../stores/basePageDialogsSlice';

const PageLayout: React.FC = () => {
  const isAuthorized = useAppSelector((state) => state.teams.authorize_status);
  const selectedTeam = useAppSelector((state) => state.teams.globalActiveTeamId);
  const selectedUser = useAppSelector((state) => state.teams.currentUserId);
  const auth = useAppSelector((state) => state.teams.authorize_status);
  const location = useLocation();
  const loc = location.pathname;
  const navigate = useNavigate();
  const teams = useAppSelector((state) => state.teams.teams);
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const roles = teams
      .find((team) => {
        return team.id == selectedTeam;
      })
      ?.users.find((user) => {
        return user.user_id == selectedUser;
      })?.roles;
    if (
      auth == 'not_authorized' &&
      loc !== routes.login() &&
      loc !== routes.register() &&
      loc !== routes.home()
    ) {
      navigate(routes.home());
    } else if (
      selectedUser != 0 &&
      selectedTeam &&
      teams &&
      roles?.find((el) => {
        return '/' + el == loc || el == 'admin';
      }) == undefined &&
      loc !== routes.teams() &&
      loc !== routes.home()
    ) {
      navigate(routes.teams());
    }
  }, [teams, loc, auth, selectedUser, selectedTeam, navigate]);

  const handleHelpButtonClick = () => {
    dispatch(setHelpDialog(true));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navigateTo = (route: string) => {
    navigate(route);
    closeMenu();
  };

  const hasRoleAccess = (role: string) => {
    const roles = teams
      .find((team) => team.id === selectedTeam)
      ?.users.find((user) => user.user_id === selectedUser)?.roles;

    return roles?.find((r) => r === role || r === 'admin') !== undefined;
  };

  const isRouteActive = (route: string) => {
    return location.pathname === route;
  };

  return (
    <div className={styles['main-page']}>
      <ButtonHeader onMenuClick={toggleMenu} />
      <div className={styles['main-container']}>
        <div className={styles['layout']}>
          {/* Навигационная панель (Sidebar) */}

          {isAuthorized === 'loading' && <Spin className={styles.spin} />}

          {isAuthorized === 'not_authorized' &&
            location.pathname !== routes.login() &&
            location.pathname !== routes.register() && (
              <Alert
                className={styles['loginDiv']}
                message='Пожалуйста зарегистрируйтесь или войдите в аккаунт'
                type='info'
              />
            )}

          {(isAuthorized === 'authorized' ||
            location.pathname === routes.login() ||
            location.pathname === routes.register()) && (
            <>
              {location.pathname !== routes.login() && location.pathname !== routes.register() && (
                <div className={styles['left-sidebar']}>
                  <Sidebar />
                </div>
              )}

              <div className={styles['content']}>
                {isAuthorized === 'authorized' &&
                selectedTeam === 0 &&
                location.pathname === routes.teams() ? (
                  <Alert
                    className={styles['loginDiv']}
                    message='Вы не состоите ни в какой команде. Создайте свою или попросите администратора, чтобы он пригласил вас'
                    type='info'
                  />
                ) : (
                  <Outlet />
                )}
              </div>

              {location.pathname !== routes.login() && location.pathname !== routes.register() && (
                <div className={styles['right-sidebar']}>
                  <SideMenu />
                </div>
              )}
            </>
          )}

          {/* Мобильное */}
          <div
            className={`${styles['menu-overlay']} ${isMenuOpen ? styles['open'] : ''}`}
            onClick={closeMenu}
          ></div>
          <div className={`${styles['hamburger-menu']} ${isMenuOpen ? styles['open'] : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <Button icon={<CloseOutlined />} type='text' onClick={closeMenu} />
            </div>
            <SideMenu isMobile={true} />
          </div>

          {isAuthorized === 'authorized' &&
            location.pathname !== routes.login() &&
            location.pathname !== routes.register() && (
              <div className={styles['mobile-bottom-nav']}>
                <Button
                  type='text'
                  icon={<HomeOutlined />}
                  onClick={() => navigateTo(routes.home())}
                  className={isRouteActive(routes.home()) ? styles['nav-button-active'] : ''}
                />

                {selectedTeam !== 0 && (
                  <>
                    <Button
                      type='text'
                      icon={<MessageOutlined />}
                      onClick={() => navigateTo(routes.posts())}
                      disabled={!hasRoleAccess('posts')}
                      className={isRouteActive(routes.posts()) ? styles['nav-button-active'] : ''}
                    />
                    <Button
                      type='text'
                      icon={<CommentOutlined />}
                      onClick={() => navigateTo(routes.comments())}
                      disabled={!hasRoleAccess('comments')}
                      className={
                        isRouteActive(routes.comments()) ? styles['nav-button-active'] : ''
                      }
                    />
                  </>
                )}

                <Button
                  type='text'
                  icon={<TeamOutlined />}
                  onClick={() => navigateTo(routes.teams())}
                  className={isRouteActive(routes.teams()) ? styles['nav-button-active'] : ''}
                />

                {selectedTeam !== 0 && (
                  <>
                    <Button
                      type='text'
                      icon={<TagOutlined />}
                      onClick={() => navigateTo(routes.ticket())}
                      disabled={!hasRoleAccess('ticket')}
                      className={isRouteActive(routes.ticket()) ? styles['nav-button-active'] : ''}
                    />
                    <Button
                      type='text'
                      icon={<LineChartOutlined />}
                      onClick={() => navigateTo(routes.analytics())}
                      disabled={!hasRoleAccess('analitics')}
                      className={
                        isRouteActive(routes.analytics()) ? styles['nav-button-active'] : ''
                      }
                    />
                  </>
                )}
              </div>
            )}

          <div className={styles['help-buttons']}>
            {isAuthorized === 'authorized' &&
              (location.pathname === routes.comments() ||
                location.pathname === routes.ticket() ||
                location.pathname.startsWith('/posts')) && (
                <ClickableButton
                  icon={<DoubleLeftOutlined rotate={90} />}
                  shape='circle'
                  type='default'
                  size='large'
                  className={styles['help-button']}
                  withPopover={true}
                  popoverContent='Вернуться к началу страницы'
                  onButtonClick={() => dispatch(setScrollToTop(true))}
                />
              )}

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
