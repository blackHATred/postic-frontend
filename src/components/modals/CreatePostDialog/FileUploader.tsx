import React, { useContext, useEffect, useRef, useState } from 'react';
import { Upload, Typography, MenuProps, Dropdown, Space, Button } from 'antd';
import {
  DownOutlined,
  FileImageOutlined,
  PaperClipOutlined,
  VideoCameraAddOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { isFileAlreadyAdded } from '../../../utils/validation';
import { uploadFile } from '../../../api/api';
import { NotificationContext } from '../../../api/notification';
import { isAxiosError } from 'axios';
import styles from './styles.module.scss';
import { useAppSelector } from '../../../stores/hooks';

const { Text } = Typography;
const { Dragger } = Upload;

const items: MenuProps['items'] = [
  {
    label: 'Фото',
    key: '1',
    icon: <FileImageOutlined />,
  },
  {
    label: 'Видео',
    key: '2',
    icon: <VideoCameraAddOutlined />,
  },
];

interface fileUploaderProps {
  addFiles: (id: string, file: any) => void;
  removeFile: (file: any) => any;
  files: any[];
}

const FileUploader: React.FC<fileUploaderProps> = (props: fileUploaderProps) => {
  const fileIds = useAppSelector((state) => state.basePageDialogs.createPostDialog.files).map(
    (file) => {
      return file;
    },
  );

  const NotificationManager = useContext(NotificationContext);
  const maxFiles = 10;
  const [id, setID] = useState(0);
  const ref_upload = useRef<HTMLDivElement>(null);
  const [open_da, setOpenDia] = useState(false);
  const [file_types, setFileTypes] = useState<string>();
  const [isDragging, setIsDragging] = useState(false);
  const dragCountRef = useRef(0);
  const [dragPreviewFiles, setDragPreviewFiles] = useState<{ file: File; preview: string }[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  useEffect(() => {
    if (props.files.length == 0) {
      setID(Math.random());
    }
    setUploadedFiles(props.files);
  }, [props.files]);

  useEffect(() => {}, [props.files]);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setOpenDia(true);
    switch (e.key) {
      case '1': {
        setFileTypes('.png,.jpg,.jpeg');
        break;
      }
      case '2': {
        setFileTypes('.mp4,.gif');
        break;
      }
      case '3': {
        setFileTypes('.');
        break;
      }
    }

    setTimeout(() => {
      ref_upload.current?.click();
      setOpenDia(false);
    }, 100);
  };

  const detectFileType = (file: File): string => {
    const fileName = file.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf('.'));

    if (['.png', '.jpg', '.jpeg'].some((ext) => extension === ext)) {
      return '.png,.jpg,.jpeg';
    } else if (['.mp4', '.gif'].some((ext) => extension === ext)) {
      return '.mp4,.gif';
    } else {
      return '.';
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const handleFileUpload = async (file: File) => {
    // Автоматический тип файла, если тип не задан (при drag-and-drop)
    if (!file_types) {
      const detectedType = detectFileType(file);
      setFileTypes(detectedType);
    }

    if (!isFileAlreadyAdded(props.files, file)) {
      const sizeMb = file.size / 1024 / 1024;
      if (sizeMb > 20) {
        NotificationManager.createNotification(
          'error',
          `Файл ${file.name} не загружен.`,
          'Размер файла превышает 20мб.',
        );
        return 'Размер файла превышает 20мб';
      }

      try {
        let t = '';
        const currentFileType = file_types || detectFileType(file);

        switch (currentFileType) {
          case '.png,.jpg,.jpeg': {
            t = 'photo';
            break;
          }
          case '.mp4,.gif': {
            t = 'video';
            break;
          }
          case '.': {
            t = 'raw';
          }
        }
        if (sizeMb > 10 && t == 'photo') {
          NotificationManager.createNotification(
            'error',
            `Файл ${file.name} не загружен.`,
            'Размер фото превышает 10мб',
          );
          return 'Размер фото превышает 10мб';
        }
        const uploadResult = await uploadFile(file, t);
        props.addFiles(uploadResult.file_id, file);

        setUploadedFiles((prev) => [...prev, file]);

        return '';
      } catch (error: any) {
        if (isAxiosError(error)) {
          NotificationManager.createNotification(
            'error',
            `Файл ${file.name} не загружен.`,
            'Ошибка подключения сети',
          );
        } else {
          NotificationManager.createNotification(
            'error',
            `Файл ${file.name} не загружен.`,
            'Ошибка обработки файла',
          );
        }
        return 'Ошибка загрузки ресурса';
      }
    } else {
      NotificationManager.createNotification(
        'error',
        `Файл ${file.name} не загружен.`,
        'Дубликаты файлов не разрешены',
      );
      return 'Дубликаты не разрешены';
    }
  };

  const handleFileRemove = (file: any) => {
    try {
      props.removeFile(file);
      setUploadedFiles((prev) => prev.filter((f) => f.uid !== file.uid));
    } catch {}
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current += 1;
    setIsDragging(true);

    setDragPreviewFiles([]);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current -= 1;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const fileItems = Array.from(e.dataTransfer.items);

      const imageItems = fileItems.filter(
        (item) => item.kind === 'file' && item.type.startsWith('image/'),
      );

      if (imageItems.length > 0 && dragPreviewFiles.length === 0) {
        const newPreviewFiles: { file: File; preview: string }[] = [];

        imageItems.forEach((item) => {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target && e.target.result) {
                newPreviewFiles.push({
                  file,
                  preview: e.target.result as string,
                });

                if (newPreviewFiles.length === imageItems.length) {
                  setDragPreviewFiles(newPreviewFiles);
                }
              }
            };
            reader.readAsDataURL(file);
          }
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current = 0;
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setFileTypes(undefined);

      files.forEach((file) => {
        handleFileUpload(file);
      });

      setDragPreviewFiles([]);
    }
  };

  useEffect(() => {
    return () => {
      dragPreviewFiles.forEach((item) => {
        if (
          item &&
          item.preview &&
          typeof item.preview === 'string' &&
          item.preview.startsWith('blob:')
        ) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [dragPreviewFiles]);

  return (
    <div
      className={styles['post']}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Text type='secondary'>
        Поддерживается загрузка одного или нескольких файлов (максимум {maxFiles}
        ). Загружено: {uploadedFiles.length}/{maxFiles}
      </Text>

      {!isDragging ? (
        <Upload
          key={id}
          listType='picture'
          multiple={true}
          fileList={uploadedFiles}
          onRemove={(file) => {
            handleFileRemove(file);
            setUploadedFiles((prev) => prev.filter((f) => f.uid !== file.uid));
          }}
          maxCount={10}
          accept={file_types}
          openFileDialogOnClick={open_da}
          customRequest={(obj: any) => {
            handleFileUpload(obj.file).then((f: string) => {
              if (!f) {
                obj.response = 'Успех';
                obj.onSuccess();
              } else {
                obj.onError(null, f, obj.file);
              }
            });
          }}
          onPreview={() => {}}
        >
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <Dropdown menu={menuProps}>
              <Space ref={ref_upload}>
                <Button icon={<PaperClipOutlined />} type='dashed'>
                  Загрузить
                  <DownOutlined />
                </Button>
              </Space>
            </Dropdown>
          </div>
        </Upload>
      ) : (
        <Dragger
          key={`dragger-${id}`}
          listType='picture'
          multiple={true}
          fileList={uploadedFiles}
          onRemove={(file) => {
            handleFileRemove(file);
            setUploadedFiles((prev) => prev.filter((f) => f.uid !== file.uid));
          }}
          maxCount={10}
          accept='*/*'
          customRequest={(obj: any) => {
            setFileTypes(detectFileType(obj.file));

            handleFileUpload(obj.file).then((f: string) => {
              if (!f) {
                obj.response = 'Успех';
                obj.onSuccess();
                setIsDragging(false);
              } else {
                obj.onError(null, f, obj.file);
              }
            });
          }}
          className={styles['file-dragger']}
        >
          {dragPreviewFiles.length > 0 ? (
            <div className={styles['preview-container']}>
              {dragPreviewFiles.map((item, index) => (
                <div key={index} className={styles['preview-item']}>
                  <img
                    src={item.preview}
                    alt={`Preview ${index}`}
                    className={styles['preview-image']}
                  />
                  <p className={styles['preview-filename']}>{item.file.name}</p>
                </div>
              ))}
              <p className='ant-upload-text'>
                Отпустите {dragPreviewFiles.length > 1 ? 'файлы' : 'файл'} для загрузки
              </p>
            </div>
          ) : (
            <>
              <p className='ant-upload-drag-icon'>
                <InboxOutlined />
              </p>
              <p className='ant-upload-text'>Перетащите файлы сюда для загрузки</p>
              <p className='ant-upload-hint'>Поддерживается одиночная или массовая загрузка</p>
            </>
          )}
        </Dragger>
      )}
    </div>
  );
};

export default FileUploader;
