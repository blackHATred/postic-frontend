import { FC, useEffect, useState } from 'react';
import { Typography, Input, Divider, Avatar, Button, Spin, Result, Space } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';

import { validateMinLength } from '../../../utils/validation';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';

import FileUploader from '../CreatePostDialog/FileUploader';
import {
  addFileComm,
  clearFilesComm,
  removeFileComm,
  setAnswerDialog,
} from '../../../stores/commentSlice';
import { RightOutlined, TeamOutlined } from '@ant-design/icons';
import { SendOutlined, ReloadOutlined } from '@ant-design/icons/lib/icons';
import { Answ, CommentReply } from '../../../models/Comment/types';
import { Reply, ReplyIdeas } from '../../../api/api';
import { withTimeout } from '../../../utils/timeoutUtils';
import config from '../../../constants/appConfig';
import { LiaQuestionCircle, LiaTelegram, LiaTwitter, LiaVk } from 'react-icons/lia';

const { Text, Paragraph } = Typography;

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
          const response = await withTimeout(ReplyIdeas(request));

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

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'vk':
        return <LiaVk className={styles.icon} />;
      case 'tg':
        return <LiaTelegram className={styles.icon} />;
      case 'twitter':
        return <LiaTwitter className={styles.icon} />;
    }
    return <LiaQuestionCircle className={styles.icon} />;
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
      <div className={styles['comment']}>
        <div className={styles['comment-header']}>
          <Avatar
            src={
              selectedComment?.avatar_mediafile &&
              config.api.baseURL + '/upload/get/' + selectedComment.avatar_mediafile.id
            }
            onError={() => {
              return true;
            }}
            icon={<TeamOutlined />}
            className={selectedComment?.is_team_reply ? styles['team-avatar'] : ''}
          />
          <div className={styles['comment-header-text']}>
            <div className={styles['comment-author']}>
              <div>
                <Text strong>
                  {selectedComment?.username ? selectedComment?.username : selectedComment?.id}
                </Text>
                <Text type='secondary' className={styles['comment-time']}>
                  {selectedComment?.created_at
                    ? dayjs(selectedComment?.created_at).format('D MMMM YYYY [в] HH:mm')
                    : 'Дата не указана'}
                </Text>
                <Space
                  size={0}
                  split={<Divider type='vertical' />}
                  className={styles['platform-icons']}
                >
                  {selectedComment?.platform && getIcon(selectedComment.platform)}
                </Space>
              </div>
              <div>
                <Text className={styles['comment-full-name']}>{selectedComment?.full_name}</Text>
              </div>
            </div>
          </div>
        </div>
        <div className={styles['comment-content']}>
          <Paragraph>{selectedComment?.text}</Paragraph>
        </div>
      </div>

      {selectedComment?.text && (
        <>
          {isLoading ? (
            <div>
              <Divider>Быстрый ответ</Divider>
              <div className={styles['loading-spinner']}>
                <Spin />
              </div>
            </div>
          ) : hasError ? (
            <div>
              <Divider>Быстрый ответ</Divider>
              <div className={styles['compact-error']}>
                <Result
                  title='Не удалось загрузить варианты ответа'
                  className={styles['compact-result']}
                  extra={
                    <Button
                      type='primary'
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setIsLoading(true);
                        setHasError(false);
                        const request: Answ = {
                          comment_id: Number(selectedComment?.id),
                          team_id: team_id,
                        };
                        withTimeout(ReplyIdeas(request))
                          .then((response) => {
                            setIsLoading(false);
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
                          })
                          .catch((error) => {
                            setIsLoading(false);
                            setHasError(true);
                          });
                      }}
                    >
                      Попробовать снова
                    </Button>
                  }
                />
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
