import React, { useEffect, useState } from 'react';
import ClickableButton from '../../ui/Button/Button';
import {
  BellOutlined,
  LoginOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import styles from './styles.module.scss';
import { Select, Dropdown, MenuProps, Button, Image } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  ActivePlatform,
  getTeamsFromStore,
  setAuthorized,
  setCurrentUserId,
  setGlobalActivePlatforms,
  setGlobalActiveTeamId,
  setTeams,
} from '../../../stores/teamSlice';
import { clearAllComms } from '../../../stores/commentSlice';
import { Typography } from 'antd';
import { Platforms } from '../../../api/teamApi';
import { setPosts } from '../../../stores/postsSlice';
import { Logout } from '../../../api/api';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/App.routes';

const { Text } = Typography;

const ButtonHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const teams = useAppSelector(getTeamsFromStore);
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>(undefined);
  const isAuthorized = useAppSelector((state) => state.teams.authorize_status);

  const items: MenuProps['items'] =
    isAuthorized == 'not_authorized'
      ? [
          {
            label: 'Вход',
            key: 'login',
            icon: <LoginOutlined />,
          },
          {
            label: 'Регистрация',
            key: 'register',
            icon: <UserOutlined />,
          },

          {
            label: 'Помощь',
            key: 'help',
            icon: <QuestionCircleOutlined />,
            disabled: true,
          },
        ]
      : [
          {
            label: 'Выход',
            key: 'logout',
            icon: <LogoutOutlined />,
            danger: true,
          },
          {
            label: 'Помощь',
            key: 'help',
            icon: <QuestionCircleOutlined />,
            disabled: true,
          },
        ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case 'login': {
        navigate(routes.login());
        return;
      }
      case 'register': {
        navigate(routes.register());
        return;
      }
      case 'logout': {
        logout();
        return;
      }
    }
  };

  const logout = () => {
    Logout()
      .then(() => {
        dispatch(setCurrentUserId(0));
        dispatch(setAuthorized('not_authorized'));
        dispatch(setTeams([]));
        dispatch(setPosts([]));
        dispatch(clearAllComms());
      })
      .catch(() => {});
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const teamOptions = teams.map((team) => ({
    value: team.id.toString(),
    label: (
      <span title={`${team.name} (id:${team.id})`}>
        {team.name} <Text type='secondary'>(id:{team.id})</Text>
      </span>
    ),
  }));

  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id.toString());
      dispatch(clearAllComms());
      dispatch(setPosts([]));
    }
  }, [teams, selectedTeam]);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id.toString());
      dispatch(setGlobalActiveTeamId(teams[0].id));
      dispatch(clearAllComms());
      dispatch(setPosts([]));
    }
    // TODO: проверить удаление всех команд
    else if (teams.length === 0) {
      setSelectedTeam(undefined);
      dispatch(setGlobalActiveTeamId(0));
      dispatch(clearAllComms());
      dispatch(setPosts([]));
    }
  }, [teams, selectedTeam, dispatch]);

  useEffect(() => {
    // загрузка сохраненной команды при инициализации
    const savedTeamId = localStorage.getItem('selectedTeamId');

    if (teams.length > 0) {
      const teamIdToUse =
        savedTeamId && teams.some((t) => t.id === Number(savedTeamId))
          ? savedTeamId
          : teams[0].id.toString();

      setSelectedTeam(teamIdToUse);
      const teamId = Number(teamIdToUse);
      dispatch(setGlobalActiveTeamId(teamId));

      loadPlatformsForTeam(teamId);
    } else {
      setSelectedTeam(undefined);
      dispatch(setGlobalActiveTeamId(0));
      dispatch(clearAllComms());
    }
  }, [teams, dispatch]);

  const loadPlatformsForTeam = (teamId: number) => {
    Platforms(teamId)
      .then((platformsData) => {
        const platforms: ActivePlatform[] = [
          {
            platform: 'vk',
            isLinked: platformsData.platforms.vk_group_id !== 0,
            name: 'ВКонтакте',
          },
          {
            platform: 'tg',
            isLinked: platformsData.platforms.tg_channel_id !== 0,
            name: 'Telegram',
          },
        ];
        dispatch(setGlobalActivePlatforms(platforms));
      })
      .catch((error) => {
        console.error('Ошибка при получении платформ:', error);
      });
  };

  const handleChange = (value: string | undefined) => {
    if (!value) return; // Ранний выход, если значение undefined

    setSelectedTeam(value);
    const teamId = Number(value);

    localStorage.setItem('selectedTeamId', value);

    dispatch(setGlobalActiveTeamId(teamId));
    dispatch(clearAllComms());
    dispatch(setPosts([]));

    loadPlatformsForTeam(teamId);
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerComponents}>
        <Image
          src={`${process.env.PUBLIC_URL}/logo.png`}
          alt={'Postic'}
          width={40}
          height={40}
          preview={false}
        />

        <div className={styles.headerIcons}>
          {isAuthorized == 'authorized' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ color: '#1890ff' }} />{' '}
                <Select
                  labelInValue
                  value={{
                    value: selectedTeam,
                    label: teams.find((t) => t.id.toString() === selectedTeam)?.name,
                  }}
                  defaultValue={{
                    value: teamOptions[0]?.value,
                    label: teams[0]?.name,
                  }}
                  style={{
                    width: 150,
                    margin: 5,
                  }}
                  variant='borderless'
                  onChange={(option) => handleChange(option.value)}
                  options={teamOptions}
                  showSearch={false}
                />
              </div>
              <ClickableButton
                className={styles['icon']}
                icon={<BellOutlined />}
                type='default'
                onButtonClick={() => {}}
              />
            </>
          )}
          <Dropdown menu={menuProps} placement='bottom'>
            <Button className={styles['icon']} icon={<UserOutlined />} />
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default ButtonHeader;
