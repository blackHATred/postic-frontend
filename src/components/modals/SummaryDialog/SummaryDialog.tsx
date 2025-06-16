import { useState, useEffect, useContext } from 'react';
import { FC } from 'react';
import DialogBox from '../dialogBox/DialogBox';
import { NotificationContext } from '../../../api/notification';
import { getSummarize, Summarize } from '../../../api/api';
import { GetSummarizeResult } from '../../../models/Comment/types';
import BlueDashedTextBox from '../../ui/BlueDashedTextBox/BlueDashedTextBox';
import { setSummaryDialog, setSummaryLoading } from '../../../stores/basePageDialogsSlice';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setSelectedPostId } from '../../../stores/postsSlice';
import './styles.scss';
import ReactMarkdown from 'react-markdown';
import { Result, Button } from 'antd';
import { withTimeout } from '../../../utils/timeoutUtils';

const DialogBoxSummary: FC = () => {
  const dispatch = useAppDispatch();
  const NotificationManager = useContext(NotificationContext);
  const [summaryText, setSummaryText] = useState('');
  const [timeoutError, setTimeoutError] = useState(false);
  const isOpen = useAppSelector((state) => state.basePageDialogs.summaryDialog.isOpen);
  const isLoading = useAppSelector((state) => state.basePageDialogs.summaryDialog.isLoading);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);

  useEffect(() => {
    if (isOpen && selectedPostId > 0) {
      setTimeoutError(false);
      dispatch(setSummaryLoading(true));

      const apiPromise = getSummarize(selectedTeamId, selectedPostId);
      withTimeout(apiPromise)
        .then((summary: GetSummarizeResult) => {
          setSummaryText(summary.summarize.markdown);
          dispatch(setSummaryLoading(false));
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.message === 'TIMEOUT_ERROR') {
            setTimeoutError(true);
          }
          dispatch(setSummaryLoading(false));
        });
    }
  }, [selectedPostId, isOpen, selectedTeamId]);

  const onRefresh = async () => {
    if (isOpen) {
      setTimeoutError(false);
      dispatch(setSummaryLoading(true));

      try {
        await withTimeout(Summarize(selectedPostId));
        // TODO: добавить АПИ на перезапрос
        dispatch(setSummaryLoading(false));
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'TIMEOUT_ERROR') {
          setTimeoutError(true);
          // Убираем уведомление, так как у нас уже есть Result
        }
        dispatch(setSummaryLoading(false));
      }
    }
  };

  const onCancel = async () => {
    setSummaryText('');
    setTimeoutError(false);
    dispatch(setSummaryDialog(false));
    dispatch(setSelectedPostId(0));
  };

  const onHeaderClick = async () => {
    dispatch(setSummaryDialog(false));
  };

  return (
    <DialogBox
      /*
      bottomButtons={[
        {
          text: 'Повторная суммаризация',
          onButtonClick: onRefresh,
          withPopover: help_mode ? true : false,
          popoverContent: help_mode ? 'Сделать краткий анализ содержания комментариев' : undefined,
        },
      ]}
       */

      isOpen={isOpen}
      onCancelClick={onCancel}
      title={'Суммаризация'}
      headerSubtext={'Пост #' + selectedPostId}
      //headerSubtextOnClick={onHeaderClick}
      isCenter={true}
    >
      <BlueDashedTextBox isLoading={isLoading}>
        {timeoutError ? (
          <Result
            status='warning'
            title='Превышено время ожидания'
            subTitle='Сервер сейчас перегружен, пожалуйста, попробуйте позже'
            extra={
              <Button type='primary' onClick={onRefresh}>
                Попробовать снова
              </Button>
            }
          />
        ) : (
          <div>
            <ReactMarkdown>{summaryText}</ReactMarkdown>
          </div>
        )}
      </BlueDashedTextBox>
    </DialogBox>
  );
};

export default DialogBoxSummary;
