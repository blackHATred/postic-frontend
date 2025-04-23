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
import { setLoginDialog, setRegiserDialog } from '../../../stores/basePageDialogsSlice';
import { getTeamsFromStore, setGlobalActiveTeamId } from '../../../stores/teamSlice';
import { setPosts } from '../../../stores/postsSlice';
import { setComments } from '../../../stores/commentSlice';

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

      dispatch(setPosts([]));
      dispatch(setComments([]));
      setSelectedTeam(teamOptions[0].value);
    }
  }, [teamOptions, selectedTeam]);

  const handleChange = (value: string) => {
    setSelectedTeam(value);
    dispatch(setGlobalActiveTeamId(Number(value)));

    dispatch(setPosts([]));
    dispatch(setComments([]));
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
