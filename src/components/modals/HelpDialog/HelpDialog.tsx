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

const HelpDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.basePageDialogs.helpDialog.isOpen);
  const [currentSection, setCurrentSection] = useState<string>('general');
  const contentContainerRef = useRef<HTMLDivElement>(null);

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

  return (
    <DialogBox
      isOpen={isOpen}
      onCancelClick={handleCloseDialog}
      title='Руководство пользователя'
      width='50%'
    >
      <div className={styles.dialogBox}>
        <Menu
          selectedKeys={[currentSection]}
          mode='inline'
          style={{ width: 70, borderRight: '1px solid #f0f0f0' }}
          onClick={handleSectionChange}
        >
          <Menu.Item icon={<InfoCircleOutlined />} key='general' />
          <Menu.Item icon={<MessageOutlined />} key='posts' />
          <Menu.Item icon={<CommentOutlined />} key='comments' />
          <Menu.Item icon={<TagOutlined />} key='tickets' />
          <Menu.Item icon={<LineChartOutlined />} key='analytics' />
          <Menu.Item icon={<TeamOutlined />} key='teams' />
          <Menu.Item icon={<SettingOutlined />} key='settings' />
        </Menu>
        <div ref={contentContainerRef} className={styles.contentContainer}>
          {renderContent()}
        </div>
      </div>
    </DialogBox>
  );
};

export default HelpDialog;
