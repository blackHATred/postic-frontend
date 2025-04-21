import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './styles.module.scss';
import { Divider, Menu } from 'antd';
import { KeyOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCreateTeamDialog } from '../../../stores/teamSlice';
import { routes } from '../../../app/App.routes';
import { setCreatePostDialog, setPersonalInfoDialog } from '../../../stores/basePageDialogsSlice';
import { PostFilter, setActivePostFilter } from '../../../stores/postsSlice';

const SideMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const activeFilter = useAppSelector((state) => state.posts.activePostFilter);
  const selectedTeam = useAppSelector((state) => state.teams.globalActiveTeamId);

  const handleFilterChange = (filter: PostFilter) => {
    dispatch(setActivePostFilter(filter));
  };

  return (
    <div className={styles['sidebar-right']}>
      <Menu className={styles['menu']} mode='vertical' selectable={false}>
        {currentPath === routes.posts() && selectedTeam !== 0 && (
          <>
            <Menu.Item
              key='all-posts'
              className={`${styles['sidebar-options']} ${activeFilter === '' ? styles['active'] : ''}`}
              onClick={() => handleFilterChange('')}
            >
              Все посты
            </Menu.Item>
            <Menu.Item
              key='published-posts'
              className={`${styles['sidebar-options']} ${activeFilter === 'published' ? styles['active'] : ''}`}
              onClick={() => handleFilterChange('published')}
            >
              Опубликованные посты
            </Menu.Item>
            <Menu.Item
              key='scheduled-posts'
              className={`${styles['sidebar-options']} ${activeFilter === 'scheduled' ? styles['active'] : ''}`}
              onClick={() => handleFilterChange('scheduled')}
            >
              Отложенные посты
            </Menu.Item>
            <Divider className={styles['custom-divider']} />
            <Menu.Item
              key='add-post'
              className={styles['sidebar-options']}
              onClick={() => dispatch(setCreatePostDialog(true))}
              icon={<PlusOutlined className={styles['icon-primary']} />}
            >
              Создать пост
            </Menu.Item>
          </>
        )}

        {currentPath === routes.teams() && (
          <>
            <Menu.Item
              key='add-team'
              className={styles['sidebar-options']}
              onClick={() => dispatch(setCreateTeamDialog(true))}
              icon={<TeamOutlined className={styles['icon-primary']} />}
            >
              Создать команду
            </Menu.Item>
            <Menu.Item
              key='secret-key'
              className={styles['sidebar-options']}
              onClick={() => dispatch(setPersonalInfoDialog(true))}
              icon={<KeyOutlined className={styles['icon-primary']} />}
            >
              Секретный ключ
            </Menu.Item>
          </>
        )}
      </Menu>
    </div>
  );
};

export default SideMenu;
