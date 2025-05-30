import React from 'react';
import { Outlet } from 'react-router-dom';
import ButtonHeader from '../../widgets/Header/Header';
import styles from './styles.module.scss';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ClickableButton from '../../ui/Button/Button';
import { useAppDispatch } from '../../../stores/hooks';
import { setHelpDialog } from '../../../stores/basePageDialogsSlice';

const HomePageLayout: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleHelpButtonClick = () => {
    dispatch(setHelpDialog(true));
  };

  return (
    <div className={styles['main-page']}>
      <ButtonHeader />
      <div className={styles['main-container']}>
        <div className={styles['content-full']}>
          <Outlet />
        </div>
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
  );
};

export default HomePageLayout;
