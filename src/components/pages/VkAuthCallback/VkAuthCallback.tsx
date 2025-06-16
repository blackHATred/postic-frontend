import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../stores/hooks';
import { NotificationContext } from '../../../api/notification';
import { setAuthorized, setCurrentUserId, setTeams } from '../../../stores/teamSlice';
import { Me } from '../../../api/api';
import { MyTeams } from '../../../api/teamApi';
import { routes } from '../../../app/App.routes';
import { Spin } from 'antd';

const VkAuthCallback: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notificationManager = useContext(NotificationContext);

  useEffect(() => {
    const processVkAuth = async () => {
      try {
        dispatch(setAuthorized('loading'));

        const userData = await Me();

        if (userData && userData.id) {
          const userId = Number(userData.id);
          dispatch(setCurrentUserId(userId));

          try {
            const teamsResult = await MyTeams();
            if (teamsResult.teams) {
              dispatch(setTeams(teamsResult.teams));
            }
            dispatch(setAuthorized('authorized'));
            notificationManager.createNotification(
              'success',
              'Вход через ВКонтакте',
              'Вы успешно вошли в аккаунт',
            );
            navigate(routes.teams());
          } catch (error) {
            dispatch(setAuthorized('authorized'));
            navigate(routes.teams());
          }
        } else {
          dispatch(setAuthorized('not_authorized'));
          notificationManager.createNotification(
            'error',
            'Ошибка авторизации',
            'Не удалось получить данные пользователя',
          );
          navigate(routes.login());
        }
      } catch (error) {
        dispatch(setAuthorized('not_authorized'));
        notificationManager.createNotification(
          'error',
          'Ошибка авторизации через ВКонтакте',
          'Не удалось завершить авторизацию',
        );
        navigate(routes.login());
      }
    };

    processVkAuth();
  }, [dispatch, navigate, notificationManager]);

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
      <Spin size='large' tip='Завершение авторизации через ВКонтакте...' />
    </div>
  );
};

export default VkAuthCallback;
