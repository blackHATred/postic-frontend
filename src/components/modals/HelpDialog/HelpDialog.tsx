import React, { useState, useRef, useEffect } from 'react';
import DialogBox from '../dialogBox/DialogBox';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { Menu } from 'antd';
import styles from './styles.module.scss';
import { setHelpDialog } from '../../../stores/basePageDialogsSlice';
import {
  CommentsHelpContent,
  TicketsHelpContent,
  AnalyticsHelpContent,
  SettingsHelpContent,
  GeneralHelpContent,
  PostHelpContent,
  TeamHelpContent,
} from './HelpContentComponents';
import {
  CommentOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  MessageOutlined,
  SettingOutlined,
  TagOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

const HelpDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.basePageDialogs.helpDialog.isOpen);
  const [currentSection, setCurrentSection] = useState<string>('general');
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleCloseDialog = () => {
    dispatch(setHelpDialog(false));
  };

  // Сброс позиции скролла при переключении вкладок
  useEffect(() => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTop = 0;
    }
  }, [currentSection]);

  const handleSectionChange = (e: any) => {
    setCurrentSection(e.key);
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'comments':
        return <CommentsHelpContent />;
      case 'posts':
        return <PostHelpContent />;
      case 'tickets':
        return <TicketsHelpContent />;
      case 'analytics':
        return <AnalyticsHelpContent />;
      case 'teams':
        return <TeamHelpContent />;
      case 'settings':
        return <SettingsHelpContent />;
      default:
        return <GeneralHelpContent />;
    }
  };

  const menuItems = [
    { key: 'general', icon: <InfoCircleOutlined />, label: isMobile ? 'Общее' : '' },
    { key: 'posts', icon: <MessageOutlined />, label: isMobile ? 'Посты' : '' },
    { key: 'comments', icon: <CommentOutlined />, label: isMobile ? 'Комментарии' : '' },
    { key: 'tickets', icon: <TagOutlined />, label: isMobile ? 'Тикеты' : '' },
    { key: 'analytics', icon: <LineChartOutlined />, label: isMobile ? 'Аналитика' : '' },
    { key: 'teams', icon: <TeamOutlined />, label: isMobile ? 'Команды' : '' },
    { key: 'settings', icon: <SettingOutlined />, label: isMobile ? 'Настройки' : '' },
  ];

  return (
    <DialogBox
      isOpen={isOpen}
      onCancelClick={handleCloseDialog}
      title='Руководство пользователя'
      width={isMobile ? '95%' : '50%'}
    >
      <div className={styles.dialogBox}>
        <div className={styles.helpNavigation}>
          <Menu
            selectedKeys={[currentSection]}
            mode={isMobile ? 'horizontal' : 'inline'}
            onClick={handleSectionChange}
            items={menuItems}
          />
        </div>
        <div ref={contentContainerRef} className={styles.contentContainer}>
          {renderContent()}
        </div>
      </div>
    </DialogBox>
  );
};

export default HelpDialog;
