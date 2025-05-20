import { FC, useEffect, useState } from 'react';
import { Typography, Input, Divider, Avatar, Button, Spin } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';

import { validateMinLength } from '../../../utils/validation';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';

import FileUploader from '../CreatePostDialog/FileUploader';
import {
  addComment,
  addFileComm,
  addPostComment,
  addTicket,
  clearFilesComm,
  removeFileComm,
  setAnswerDialog,
} from '../../../stores/commentSlice';
import { RightOutlined } from '@ant-design/icons';
import { SendOutlined } from '@ant-design/icons/lib/icons';
import { Answ, CommentReply } from '../../../models/Comment/types';
import { getComment, Reply, ReplyIdeas } from '../../../api/api';

const { Text } = Typography;

const AnswerDialog: FC = () => {
  const [replyText, setReplyText] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileIds = useAppSelector((state) => state.comments.answerDialog.files);
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.comments.answerDialog.isOpen);
  const team_id = useAppSelector((state) => state.teams.globalActiveTeamId);

  const selectedComment = useAppSelector((state) => state.comments.selectedComment);
  const [files, setFiles] = useState<{ id: string; files: any }[]>([]);

  const [answers, setAnswers] = useState<{ ideas: string[] }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);

  useEffect(() => {
    if (isOpen && selectedComment) {
      setIsLoading(true);
      setHasError(false);

      const fetchAnswers = async () => {
        const request: Answ = {
          comment_id: Number(selectedComment?.id),
          team_id: team_id,
        };

        try {
          const response = await ReplyIdeas(request);

          if (response && typeof response === 'object' && response.ideas) {
            setAnswers([{ ideas: response.ideas }]);
          } else if (typeof response === 'string') {
            try {
              const parsedResponse = JSON.parse(response);
              if (parsedResponse.ideas) {
                setAnswers([{ ideas: parsedResponse.ideas }]);
              }
            } catch (parseError) {
              const formattedAnswers = (response as string)
                .split('\n')
                .filter((text) => text.trim())
                .map((text) => ({ ideas: [text] }));
              setAnswers(formattedAnswers);
            }
          }
          setIsLoading(false);
        } catch (err) {
          console.error('Ошибка при получении идей ответа:', err);
          setIsLoading(false);
          setHasError(true);
          setAnswers([]);
        }
      };

      fetchAnswers();
    } else {
      setAnswers([]);
    }
  }, [isOpen, selectedComment, team_id]);

  useEffect(() => {
    clearFields();
  }, [selectedComment]);

  const setQuickAnswer = (q_ans: string) => {
    setReplyText(q_ans);
  };

  const onOk = () => {
    const errors: string[] = [];

    if (fileIds.length === 0) {
      const postTextError = validateMinLength(replyText, 3);
      if (postTextError) {
        errors.push(postTextError);
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    const req: CommentReply = {
      team_id: team_id,
      comment_id: Number(selectedComment?.id),
      text: replyText,
      attachments: fileIds,
    };
    Reply(req).then((id) => {
      clearFields();
      if (activeTab == '2')
        getComment(team_id, id.comment_id).then((c) => dispatch(addComment(c.comment)));
      else if (activeTab == '4')
        getComment(team_id, id.comment_id).then((c) => dispatch(addTicket(c.comment)));
      else getComment(team_id, id.comment_id).then((c) => dispatch(addPostComment(c.comment)));
    });
    dispatch(setAnswerDialog(false));
  };

  const onCancel = async () => {
    dispatch(setAnswerDialog(false));
  };

  const clearFields = () => {
    setReplyText('');
    setValidationErrors([]);
    setAnswers([]);
    dispatch(clearFilesComm());
    setFiles([]);
  };

  const addFiles = (id: string, file: any) => {
    setFiles([...files, { id: id, files: file }]);
    dispatch(addFileComm(id));
  };

  const removeFiles = (file: any) => {
    const id = files.filter((filed) => {
      return filed.files.uid == file.uid;
    })[0].id;
    dispatch(removeFileComm(id));
    setFiles(
      files.filter((filed) => {
        return filed.files.uid != file.uid;
      }),
    );
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          icon: <SendOutlined />,
          text: 'Отправить',
          onButtonClick: onOk,
        },
      ]}
      isOpen={isOpen}
      onCancelClick={onCancel}
      title={'Ответ на комментарий'}
      isCenter={true}
    >
      <div className={styles['comment-header']}>
        <Avatar
          src={null}
          onError={() => {
            return true;
          }}
        />
        <div className={styles['comment-author']}>
          <Text strong>
            {selectedComment?.username ? selectedComment?.username : selectedComment?.id}
          </Text>
          <Text type='secondary' className={styles['comment-time']}>
            {selectedComment?.created_at
              ? dayjs(selectedComment?.created_at).format('DD.MM.YYYY HH:mm')
              : 'Дата не указана'}{' '}
            | tg
          </Text>
        </div>
      </div>
      <Text>{selectedComment?.text}</Text>

      {selectedComment?.text && (
        <>
          {isLoading ? (
            <div>
              <Divider>Быстрый ответ</Divider>
              <div
                className={styles['answers']}
                style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}
              >
                <Spin />
              </div>
            </div>
          ) : hasError ? (
            <div>
              <Divider>Быстрый ответ</Divider>
              <div className={styles['answers']}>
                <Text type='danger'>Не удалось загрузить варианты ответа</Text>
              </div>
            </div>
          ) : answers.length > 0 &&
            answers.some((answer) => answer.ideas.some((idea) => idea.trim() !== '')) ? (
            <div>
              <Divider>Быстрый ответ</Divider>
              <div className={styles['answers']}>
                {answers.map((answer, answerIndex) =>
                  answer.ideas
                    .filter((text) => text.trim() !== '')
                    .map((text, index) => (
                      <Button
                        className={styles['answ-button']}
                        shape='round'
                        key={`${answerIndex}-${index}`}
                        icon={<RightOutlined />}
                        type='default'
                        onClick={() => setQuickAnswer(text)}
                      >
                        {text}
                      </Button>
                    )),
                )}
              </div>
            </div>
          ) : null}
        </>
      )}

      <Divider>Свой ответ</Divider>

      <div className={styles['post']}>
        <div className={styles['post-text']}>
          <Input.TextArea
            rows={3}
            placeholder='Введите текст ответа'
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </div>
        {/* Отображение ошибок валидации */}
        {validationErrors.length > 0 && (
          <div style={{ marginTop: '5px' }}>
            {validationErrors.map((error, index) => (
              <Text key={index} style={{ color: 'red', display: 'block' }}>
                {error}
              </Text>
            ))}
          </div>
        )}

        <FileUploader
          addFiles={addFiles}
          removeFile={removeFiles}
          files={files.map((file) => file.files)}
        />
      </div>
    </DialogBox>
  );
};

export default AnswerDialog;
function validateNotEmptyArray(selectedPlatforms: string[]): string | null {
  return selectedPlatforms.length > 0 ? null : 'Не выбраны платформы для публикации.';
}
