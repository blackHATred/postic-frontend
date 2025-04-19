import { useState, useEffect, useContext } from 'react';
import { FC } from 'react';
import DialogBox from '../../ui/dialogBox/DialogBox';
import { NotificationContext } from '../../../api/notification';
import { getSummarize, Summarize } from '../../../api/api';
import { GetSummarizeResult } from '../../../models/Comment/types';
import BlueDashedTextBox from '../../ui/BlueDashedTextBox/BlueDashedTextBox';
import { setSummaryDialog, setSummaryLoading } from '../../../stores/basePageDialogsSlice';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setScrollToPost, setSelectedPostId } from '../../../stores/postsSlice';
import './styles.scss';
import ReactMarkdown from 'react-markdown';

const DialogBoxSummary: FC = () => {
  const dispatch = useAppDispatch();
  const NotificationManager = useContext(NotificationContext);
  const [summaryText, setSummaryText] = useState('');
  const isOpen = useAppSelector((state) => state.basePageDialogs.summaryDialog.isOpen);
  const isLoading = useAppSelector((state) => state.basePageDialogs.summaryDialog.isLoading);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const help_mode = useAppSelector((state) => state.settings.helpMode);

  useEffect(() => {
    dispatch(setSummaryLoading(true));
    if (isOpen) {
      getSummarize(selectedPostId)
        .then((summary: GetSummarizeResult) => {
          setSummaryText(summary.summarize.markdown);
          dispatch(setSummaryLoading(false));
        })
        .catch(() => {
          NotificationManager.createNotification(
            'error',
            'Ошибка получения суммаризации',
            'ошибка подключения к серверу',
          );
          dispatch(setSummaryLoading(false));
        });
    }
    //Получили id от комментария, делаем Get и потом можно async Post
  }, [selectedPostId]);

  const onRefresh = async () => {
    if (isOpen) {
      Summarize(selectedPostId)
        .then(() => {
          // TODO: добавить АПИ на перезапрос
        })
        .catch(() => {
          NotificationManager.createNotification(
            'error',
            'Ошибка запроса суммарищации',
            'ошибка подключения к серверу',
          );
        });
    }
  };

  const onCancel = async () => {
    setSummaryText('');
    dispatch(setSummaryDialog(false));
    dispatch(setSelectedPostId(0));
  };

  const onHeaderClick = async () => {
    dispatch(setSummaryDialog(false));
    dispatch(setScrollToPost(true));
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          text: 'Повторная суммаризация',
          onButtonClick: onRefresh,
          withPopover: help_mode ? true : false,
          popoverContent: help_mode ? 'Сделать краткий анализ содержания комментариев' : undefined,
        },
      ]}
      isOpen={isOpen}
      onCancelClick={onCancel}
      title={'Суммаризация'}
      headerSubtext={'Пост #' + selectedPostId}
      headerSubtextOnClick={onHeaderClick}
      isCenter={true}
    >
      <BlueDashedTextBox isLoading={isLoading}>
        <div className='reactMarkDown'>
          <ReactMarkdown>{summaryText}</ReactMarkdown>
        </div>
      </BlueDashedTextBox>
    </DialogBox>
  );
};

export default DialogBoxSummary;
