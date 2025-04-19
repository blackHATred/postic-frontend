import React, { useEffect, useState } from 'react';
import ClickableButton from '../../ui/Button/Button';
import {
  BellOutlined,
  LoginOutlined,
  LogoutOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import styles from './styles.module.scss';
import { Tabs, Select, Dropdown, MenuProps, Button } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCreatePostDialog, setLoginDialog, setRegiserDialog } from '../../../stores/basePageDialogsSlice';
import { getTeamsFromStore, setGlobalActiveTeamId } from '../../../stores/teamSlice';
interface ButtonHeaderProps {
  activeTab?: string; // Сделаем необязательным, так как вкладки могут отсутствовать
  onTabChange?: (key: string) => void; // Сделаем необязательным
}

const ButtonHeader: React.FC<ButtonHeaderProps> = ({ activeTab, onTabChange }) => {
  const dispatch = useAppDispatch();
  const teams = useAppSelector(getTeamsFromStore);
  const activeTeam = useAppSelector((state) => state.teams.globalActiveTeamId);
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
        dispatch(setLoginDialog(true));
        return;
      }
      case 'register': {
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

  const tabItems = [
    {
      key: '1',
      label: 'Посты',
    },
    {
      key: '2',
      label: 'Все комментарии',
    },
  ];

  const teamOptions = teams.map((team) => ({
    value: team.id.toString(),
    label: team.name,
  }));

  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id.toString());
    }
  }, [teams, selectedTeam]);

  useEffect(() => {
    if (teamOptions[0] && !selectedTeam) {
      const number = Number(teamOptions[0].value);
      dispatch(setGlobalActiveTeamId(number));
      setSelectedTeam(teamOptions[0].value);
    }
  }, [teamOptions, selectedTeam]);

  const handleChange = (value: string) => {
    setSelectedTeam(value);
    dispatch(setGlobalActiveTeamId(Number(value)));
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerComponents}>
        <img src={'logo.png'} alt='logo' className={styles.logo} />

        {/* Рендерим вкладки только для авторизованных пользователей */}
        {isAuthorized == 'authorized' && activeTeam && (
          <div className={styles.tabs}>
            <Tabs activeKey={activeTab} items={tabItems} onChange={onTabChange} />
          </div>
        )}

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
              {activeTeam != 0 && (
                <ClickableButton
                  className={styles['icon']}
                  icon={<PlusOutlined />}
                  type='default'
                  onButtonClick={() => dispatch(setCreatePostDialog(true))}
                />
              )}
              <ClickableButton className={styles['icon']} icon={<BellOutlined />} type='default' onButtonClick={() => {}} />
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
