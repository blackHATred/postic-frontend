import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Space, Typography, Spin, Result, message, Dropdown } from 'antd';
import {
  SendOutlined,
  ReloadOutlined,
  LoadingOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  FileImageOutlined,
  CheckOutlined,
  CloseOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import formStyles from './InlineReplyForm.module.scss';
import { ReplyIdeas, Reply, uploadFile } from '../../../api/api';
import { Answ, Comment, CommentReply } from '../../../models/Comment/types';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { addFileComm, clearFilesComm, removeFileComm } from '../../../stores/commentSlice';
import { withTimeout } from '../../../utils/timeoutUtils';
import { validateMinLength } from '../../../utils/validation';
import { createPreviewForFile, generateFileUID } from '../../modals/CreatePostDialog/fileUtils';
import { FILE_TYPES, MAX_FILES, FILE_SIZES } from './types';

const { Text } = Typography;

interface InlineReplyFormProps {
  comment: Comment;
  onCancel: () => void;
}

interface FileObject {
  uid: string;
  name: string;
  size: number;
  type: string;
  originFileObj: File;
  status: string;
  url?: string;
  thumbUrl?: string;
  file_id?: string;
}

const InlineReplyForm: React.FC<InlineReplyFormProps> = ({ comment, onCancel }) => {
  const [replyText, setReplyText] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ ideas: string[] }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTimeoutExceeded, setIsLoadingTimeoutExceeded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [files, setFiles] = useState<FileObject[]>([]);
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const dispatch = useAppDispatch();
  const teamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const inputRef = useRef<React.ElementRef<typeof Input>>(null);
  const fileIdsFromRedux = useAppSelector((state) => state.comments.answerDialog.files);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setIsLoadingTimeoutExceeded(false);

    timeoutRef.current = setTimeout(() => {
      setIsLoadingTimeoutExceeded(true);
    }, 10000);

    const fetchAnswers = async () => {
      const request: Answ = {
        comment_id: Number(comment?.id),
        team_id: teamId,
      };

      try {
        const response = await withTimeout(ReplyIdeas(request), 50000);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (response && typeof response === 'object' && response.ideas) {
          const uniqueIdeasSet = new Set(response.ideas);
          const uniqueIdeas = Array.from(uniqueIdeasSet) as string[];
          setAnswers([{ ideas: uniqueIdeas }]);
        } else if (response && typeof response === 'string') {
          try {
            const parsedResponse = JSON.parse(response);
            if (parsedResponse.ideas) {
              const uniqueIdeasSet = new Set(parsedResponse.ideas);
              const uniqueIdeas = Array.from(uniqueIdeasSet) as string[];
              setAnswers([{ ideas: uniqueIdeas }]);
            }
          } catch (parseError) {
            const formattedAnswers = (response as string).split('\n').filter((text) => text.trim());

            const uniqueAnswersSet = new Set(formattedAnswers);
            const uniqueAnswers = Array.from(uniqueAnswersSet) as string[];
            setAnswers([{ ideas: uniqueAnswers }]);
          }
        }
        setIsLoading(false);
        setIsLoadingTimeoutExceeded(false);
      } catch (err) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsLoading(false);
        setHasError(true);
        setAnswers([]);
      }
    };

    fetchAnswers();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      dispatch(clearFilesComm());
    };
  }, [comment, teamId, dispatch]);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!inputRef.current || !e.clipboardData) return;

      const isTextAreaFocused =
        containerRef.current?.contains(document.activeElement) ||
        document.activeElement?.classList.contains('ant-input');

      if (!isTextAreaFocused) return;

      const items = e.clipboardData.items;
      const imageItems = Array.from(items).filter(
        (item) => item.kind === 'file' && item.type.startsWith('image/'),
      );

      if (imageItems.length > 0) {
        e.preventDefault();

        if (files.length + imageItems.length > MAX_FILES) {
          message.error(`Вы можете загрузить максимум ${MAX_FILES} файлов`);
          return;
        }

        for (const item of imageItems) {
          const file = item.getAsFile();
          if (file) {
            await handleFileUpload(file);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [files]);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        // Проверяем лимит файлов
        if (files.length + e.dataTransfer.files.length > MAX_FILES) {
          message.error(`Вы можете загрузить максимум ${MAX_FILES} файлов`);
          return;
        }

        const droppedFiles = Array.from(e.dataTransfer.files);

        // Загружаем файлы
        for (const file of droppedFiles) {
          await handleFileUpload(file);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('dragenter', handleDragEnter);
      container.addEventListener('dragleave', handleDragLeave);
      container.addEventListener('dragover', handleDragOver);
      container.addEventListener('drop', handleDrop);
    }

    return () => {
      if (container) {
        container.removeEventListener('dragenter', handleDragEnter);
        container.removeEventListener('dragleave', handleDragLeave);
        container.removeEventListener('dragover', handleDragOver);
        container.removeEventListener('drop', handleDrop);
      }
    };
  }, [files]);

  const detectFileType = (file: File): string => {
    const fileName = file.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf('.'));

    if (['.png', '.jpg', '.jpeg'].some((ext) => extension === ext)) {
      return FILE_TYPES.PHOTO;
    } else if (['.mp4', '.gif'].some((ext) => extension === ext)) {
      return FILE_TYPES.VIDEO;
    } else {
      return FILE_TYPES.ANY;
    }
  };

  const handleFileUpload = async (file: File, manualFileType?: string) => {
    const fileObject: FileObject = {
      uid: generateFileUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      originFileObj: file,
      status: 'uploading',
    };

    try {
      const sizeMb = file.size / 1024 / 1024;
      if (sizeMb > FILE_SIZES.MAX_SIZE) {
        message.error(
          `Файл ${file.name} слишком большой. Максимальный размер: ${FILE_SIZES.MAX_SIZE}MB`,
        );
        return null;
      }

      const fileType = manualFileType || detectFileType(file);

      if (file.type.startsWith('image/')) {
        const preview = await createPreviewForFile(file);
        fileObject.url = preview;
        fileObject.thumbUrl = preview;
      }

      setFiles((prevFiles) => [...prevFiles, fileObject]);

      const uploadResult = await uploadFile(file, fileType);

      if (uploadResult && uploadResult.file_id) {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.uid === fileObject.uid ? { ...f, status: 'done', file_id: uploadResult.file_id } : f,
          ),
        );

        dispatch(addFileComm(uploadResult.file_id));

        return uploadResult.file_id;
      } else {
        message.error(`Не удалось загрузить файл ${file.name}`);
        return null;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setFiles((prevFiles) =>
        prevFiles.map((f) => (f.uid === fileObject.uid ? { ...f, status: 'error' } : f)),
      );
    }
  };

  const handleRemoveFile = (uid: string) => {
    const fileToRemove = files.find((f) => f.uid === uid);
    if (fileToRemove && fileToRemove.file_id) {
      dispatch(removeFileComm(fileToRemove.file_id));
    }

    setFiles((prevFiles) => prevFiles.filter((f) => f.uid !== uid));
  };

  const setQuickAnswer = (q_ans: string) => {
    setReplyText(q_ans);
    inputRef.current?.focus();
  };

  const openFileSelector = () => {
    if (files.length >= MAX_FILES) {
      message.warning(`Вы не можете загрузить больше ${MAX_FILES} файлов`);
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFiles = Array.from(e.target.files);

    if (files.length + selectedFiles.length > MAX_FILES) {
      message.warning(`Вы не можете загрузить больше ${MAX_FILES} файлов`);
      return;
    }

    for (const file of selectedFiles) {
      await handleFileUpload(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendReply = async () => {
    const errors: string[] = [];

    if (files.length === 0) {
      const textError = validateMinLength(replyText, 3);
      if (textError) {
        errors.push(textError);
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setIsSendingReply(true);

    try {
      const allFilesUploaded = files.every((file) => file.status === 'done' && file.file_id);

      if (!allFilesUploaded) {
        message.error('Не все файлы загружены');
        setIsSendingReply(false);
        return;
      }

      const attachmentIds =
        fileIdsFromRedux.length > 0
          ? fileIdsFromRedux
          : files.map((file) => file.file_id).filter((id): id is string => typeof id === 'string');

      const req: CommentReply = {
        team_id: teamId,
        comment_id: Number(comment?.id),
        text: replyText,
        attachments: attachmentIds,
      };

      await Reply(req);

      message.success('Ответ отправлен');
      setReplyText('');
      setFiles([]);
      dispatch(clearFilesComm());
      onCancel();
    } catch (error) {
      console.error('Error sending reply:', error);
      message.error('Не удалось отправить ответ. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const uniqueAnswersCount = answers.reduce(
    (count, answer) => count + new Set(answer.ideas.filter((idea) => idea.trim() !== '')).size,
    0,
  );

  return (
    <div className={formStyles.inlineReplyContainer} ref={containerRef}>
      {isDragging && (
        <div className={formStyles.dropZone}>
          <FileImageOutlined className={formStyles.dropZoneIcon} />
          <div>Перетащите файлы сюда</div>
        </div>
      )}

      <div className={formStyles.replyInputWrapper}>
        <Input.TextArea
          ref={inputRef}
          placeholder='Введите ответ...'
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          autoSize={{ minRows: 1, maxRows: 3 }}
          className={formStyles.replyInput}
        />
        <div className={formStyles.replyActions}>
          <Space>
            {files.length > 0 && (
              <div className={formStyles.fileCounter}>
                {files.length}/{MAX_FILES}
              </div>
            )}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'photo',
                    icon: <PictureOutlined />,
                    label: 'Загрузить фото',
                    onClick: () => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.multiple = true;
                      input.onchange = async (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files) {
                          const selectedFiles = Array.from(target.files);
                          if (files.length + selectedFiles.length > MAX_FILES) {
                            message.warning(`Вы можете загрузить максимум ${MAX_FILES} файлов`);
                            return;
                          }
                          for (const file of selectedFiles) {
                            await handleFileUpload(file, FILE_TYPES.PHOTO);
                          }
                        }
                      };
                      input.click();
                    },
                  },
                  {
                    key: 'video',
                    icon: <VideoCameraOutlined />,
                    label: 'Загрузить видео',
                    onClick: () => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'video/*';
                      input.multiple = true;
                      input.onchange = async (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files) {
                          const selectedFiles = Array.from(target.files);
                          if (files.length + selectedFiles.length > MAX_FILES) {
                            message.warning(`Вы можете загрузить максимум ${MAX_FILES} файлов`);
                            return;
                          }
                          for (const file of selectedFiles) {
                            await handleFileUpload(file, FILE_TYPES.VIDEO);
                          }
                        }
                      };
                      input.click();
                    },
                  },
                ],
              }}
              trigger={['click']}
              placement='bottomLeft'
            >
              <Button
                icon={<PaperClipOutlined />}
                disabled={files.length >= MAX_FILES || isSendingReply}
                title={`Прикрепить файл (${files.length}/${MAX_FILES})`}
              />
            </Dropdown>
            <Button
              type='primary'
              icon={isSendingReply ? <LoadingOutlined /> : <SendOutlined />}
              onClick={handleSendReply}
              disabled={(!replyText.trim() && files.length === 0) || isSendingReply}
              loading={isSendingReply}
            />
            <input
              type='file'
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple
              accept='.pdf,.doc,.docx,.xls,.xlsx,.txt'
              onChange={handleFileInputChange}
            />
          </Space>
        </div>
      </div>

      {files.length > 0 && (
        <div className={formStyles.filePreviewContainer}>
          {files.map((file) => (
            <div key={file.uid} className={formStyles.filePreview}>
              {file.type?.startsWith('image/') && file.url ? (
                <img src={file.url} alt={file.name} className={formStyles.imagePreview} />
              ) : (
                <div className={formStyles.fileIcon}>
                  <FileImageOutlined />
                </div>
              )}
              <div className={formStyles.fileInfo}>
                <div className={formStyles.fileName}>{file.name}</div>
                <div className={formStyles.fileStatus}>
                  {file.status === 'uploading' && <Spin size='small' />}
                  {file.status === 'done' && <CheckOutlined style={{ color: 'green' }} />}
                  {file.status === 'error' && <CloseOutlined style={{ color: 'red' }} />}
                </div>
              </div>
              <Button
                type='text'
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveFile(file.uid)}
                className={formStyles.removeFileButton}
                disabled={isSendingReply}
              />
            </div>
          ))}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className={formStyles.validationErrors}>
          {validationErrors.map((error, index) => (
            <Text key={index} type='danger'>
              {error}
            </Text>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className={formStyles.quickRepliesLoading}>
          <Spin size='small' />
          <Space direction='vertical' size='small'>
            <Text type='secondary'>Загрузка вариантов ответа...</Text>
            {isLoadingTimeoutExceeded && (
              <Text type='warning'>Сервер сейчас загружен. Пожалуйста, подождите...</Text>
            )}
          </Space>
        </div>
      ) : hasError ? (
        <div className={formStyles.quickRepliesError}>
          <Result
            status='warning'
            title='Не удалось загрузить варианты ответа'
            className={formStyles.compactResult}
            extra={
              <Button
                size='small'
                icon={<ReloadOutlined />}
                onClick={() => {
                  setIsLoading(true);
                  setHasError(false);
                  const request: Answ = {
                    comment_id: Number(comment?.id),
                    team_id: teamId,
                  };
                  withTimeout(ReplyIdeas(request))
                    .then((response) => {
                      setIsLoading(false);
                      if (response && typeof response === 'object' && response.ideas) {
                        const uniqueIdeas = Array.from(new Set(response.ideas)) as string[];
                        setAnswers([{ ideas: uniqueIdeas }]);
                      } else if (response && typeof response === 'string') {
                        try {
                          const parsedResponse = JSON.parse(response);
                          if (parsedResponse.ideas) {
                            const uniqueIdeas = Array.from(
                              new Set(parsedResponse.ideas),
                            ) as string[];
                            setAnswers([{ ideas: uniqueIdeas }]);
                          }
                        } catch (parseError) {
                          const formattedAnswers = (response as string)
                            .split('\n')
                            .filter((text) => text.trim());

                          const uniqueAnswers = Array.from(new Set(formattedAnswers)) as string[];
                          setAnswers([{ ideas: uniqueAnswers }]);
                        }
                      }
                    })
                    .catch(() => {
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
      ) : uniqueAnswersCount > 0 ? (
        <div className={formStyles.quickRepliesContainer}>
          <div className={formStyles.quickRepliesHeader}>Быстрые ответы</div>
          <div className={formStyles.quickRepliesScroll}>
            {answers.flatMap((answer, answerIndex) => {
              const uniqueIdeas = Array.from(
                new Set(answer.ideas.filter((idea) => idea.trim() !== '')),
              ) as string[];

              return uniqueIdeas.map((text, index) => (
                <Button
                  key={`${answerIndex}-${index}`}
                  className={formStyles.quickReplyButton}
                  type='text'
                  size='small'
                  onClick={() => setQuickAnswer(text)}
                >
                  {text}
                </Button>
              ));
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default InlineReplyForm;
