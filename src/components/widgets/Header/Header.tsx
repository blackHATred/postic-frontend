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
import { Select, Dropdown, MenuProps, Button } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  setLoginDialog,
  setRegiserDialog,
  setRegisterEmailDialog,
} from '../../../stores/basePageDialogsSlice';
import {
  ActivePlatform,
  getTeamsFromStore,
  setGlobalActivePlatforms,
  setGlobalActiveTeamId,
} from '../../../stores/teamSlice';
import { setComments } from '../../../stores/commentSlice';
import { Typography } from 'antd';
import { Platforms } from '../../../api/teamApi';

const { Text } = Typography;

const ButtonHeader: React.FC = () => {
  const dispatch = useAppDispatch();
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
            label: 'Регистрация1',
            key: 'register1',
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
        dispatch(setLoginDialog(true));
        return;
      }
      case 'register': {
        dispatch(setRegisterEmailDialog(true));
        return;
      }
      case 'register1': {
        dispatch(setRegiserDialog(true));
        return;
      }
      case 'logout': {
        return;
      }
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const teamOptions = teams.map((team) => ({
    value: team.id.toString(),
    label: (
      <span>
        {team.name} <Text type='secondary'>(id:{team.id})</Text>
      </span>
    ),
  }));

  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id.toString());
    }
  }, [teams, selectedTeam]);

  useEffect(() => {
    //  у пользователя есть команды, но не выбрана конкретная команда
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id.toString());
      dispatch(setGlobalActiveTeamId(teams[0].id));
      dispatch(setComments([]));
    }
    //  у пользователя нет команд, сбрасываем выбранную команду
    // TODO: проверить удаление всех команд
    else if (teams.length === 0) {
      setSelectedTeam(undefined);
      dispatch(setGlobalActiveTeamId(0));
      dispatch(setComments([]));
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
      dispatch(setComments([]));
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

  const handleChange = (value: string) => {
    setSelectedTeam(value);
    const teamId = Number(value);

    // команду в localStorage, а то пропадает при перезагрузке
    localStorage.setItem('selectedTeamId', value);

    dispatch(setGlobalActiveTeamId(teamId));
    dispatch(setComments([]));

    // чтоб платформы обновились
    loadPlatformsForTeam(teamId);
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerComponents}>
        <img src={'logo.png'} alt='logo' className={styles.logo} />

        <div className={styles.headerIcons}>
          {isAuthorized == 'authorized' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ color: '#1890ff' }} />{' '}
                <Select
                  value={selectedTeam}
                  defaultValue={teamOptions[0]?.value}
                  style={{
                    width: 150,
                    margin: 5,
                  }}
                  variant='borderless'
                  onChange={handleChange}
                  options={teamOptions}
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
