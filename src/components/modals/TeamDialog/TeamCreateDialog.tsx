import React, { useEffect, useState } from 'react';
import { Input, Divider, Form, notification } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCreateTeamDialog } from '../../../stores/teamSlice';
import { TeamCreate } from '../../../api/teamApi';

interface TeamCreateDialogProps {
  demoMode?: boolean;
  currentDemoStep?: number;
}

const TeamCreateDialog: React.FC<TeamCreateDialogProps> = ({
  demoMode = false,
  currentDemoStep = 0,
}) => {
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  // Исправляем доступ к isOpen, учитывая структуру в Redux-сторе
  const isOpen = useAppSelector((state) => state.teams.createTeamDialog.isOpen);

  // Для демо-режима: автоматически заполняем имя команды с эффектом печати
  useEffect(() => {
    if (demoMode && isOpen && currentDemoStep === 2) {
      // Очистить предыдущее имя команды
      setTeamName('');

      // Симулируем ввод имени "Киберкотлетки" с эффектом печати
      const targetName = 'Киберкотлетки';
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex <= targetName.length) {
          setTeamName(targetName.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);

          // Имитируем задержку перед отправкой формы
          setTimeout(() => {
            if (demoMode && isOpen) {
              handleCreateTeam();
            }
          }, 1000);
        }
      }, 150); // задержка между символами

      return () => clearInterval(typingInterval);
    }
  }, [demoMode, isOpen, currentDemoStep]);

  const validate = () => {
    if (!teamName.trim()) {
      setError('Введите название команды');
      return false;
    }
    setError('');
    return true;
  };

  const handleCreateTeam = async () => {
    if (!validate()) {
      return;
    }

    if (demoMode) {
      // Создаём событие для сигнализации о создании команды
      const event = new Event('demo-team-created');
      document.dispatchEvent(event);

      // В демо-режиме просто закрываем диалог
      dispatch(setCreateTeamDialog(false));

      // Уведомление о создании команды
      notification.success({
        message: 'Успешно',
        description: `Команда "${teamName}" успешно создана`,
        placement: 'topRight',
      });

      return;
    }

    try {
      const response = await TeamCreate({ team_name: teamName });
      if (response) {
        notification.success({
          message: 'Успешно',
          description: `Команда "${teamName}" успешно создана`,
          placement: 'topRight',
        });
        dispatch(setCreateTeamDialog(false));
        setTeamName('');
      }
    } catch (error) {
      notification.error({
        message: 'Ошибка',
        description: 'Не удалось создать команду',
        placement: 'topRight',
      });
    }
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          text: 'Создать',
          onButtonClick: handleCreateTeam,
          className: demoMode ? styles.animatedButton : '',
        },
      ]}
      isOpen={isOpen}
      onCancelClick={() => {
        dispatch(setCreateTeamDialog(false));
        setTeamName('');
        setError('');
      }}
      title='Создание команды'
      isCenter={true}
    >
      <Divider />

      <div className={styles.form}>
        <Form layout='vertical'>
          <Form.Item label='Название команды' validateStatus={error ? 'error' : ''} help={error}>
            <Input
              placeholder='Введите название команды'
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className={`${demoMode ? styles.animatedInput : ''} ${
                teamName ? styles.activeInput : ''
              }`}
            />
          </Form.Item>
        </Form>
      </div>
    </DialogBox>
  );
};

export default TeamCreateDialog;
