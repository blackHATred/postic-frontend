import React, { useContext, useEffect, useRef, useState } from 'react';
import { Upload, Typography, MenuProps, Dropdown, Space } from 'antd';
import { DownOutlined, FileImageOutlined, VideoCameraAddOutlined } from '@ant-design/icons';
import { isFileAlreadyAdded } from '../../../utils/validation';
import { uploadFile } from '../../../api/api';
import { NotificationContext } from '../../../api/notification';
import { isAxiosError } from 'axios';
import styles from './styles.module.scss';
import { useAppSelector } from '../../../stores/hooks';

const { Text } = Typography;

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

  useEffect(() => {
    if (props.files.length == 0) {
      setID(Math.random());
    }
  }, [props.files]);

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

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const handleFileUpload = async (file: File) => {
    if (!isFileAlreadyAdded(props.files, file)) {
      try {
        let t = '';
        switch (file_types) {
          case '.png,.jpg': {
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
        const uploadResult = await uploadFile(file, t);
        props.addFiles(uploadResult.file_id, file);
        return true;
      } catch (error) {
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
        return false;
      }
    } else {
      NotificationManager.createNotification(
        'error',
        `Файл ${file.name} не загружен.`,
        'Дубликаты файлов не разрешены',
      );
      return false;
    }
  };

  const handleFileRemove = (file: any) => {
    try {
      props.removeFile(file);
    } catch {}
  };

  return (
    <div className={styles['post']}>
      <Text type='secondary'>
        Поддерживается загрузка одного или нескольких файлов (максимум {maxFiles}
        ). Загружено: {props.files.length}/{maxFiles}
      </Text>

      <Upload
        key={id}
        listType='picture'
        multiple={true}
        defaultFileList={props.files}
        onRemove={handleFileRemove}
        maxCount={10}
        accept={file_types}
        openFileDialogOnClick={open_da}
        customRequest={(obj: any) => {
          handleFileUpload(obj.file).then((f: boolean) => {
            if (f) obj.onSuccess();
            else obj.onError();
          });
        }}
      >
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <Dropdown menu={menuProps}>
            <Space ref={ref_upload}>
              Загрузить
              <DownOutlined />
            </Space>
          </Dropdown>
        </div>
      </Upload>
    </div>
  );
};

export default FileUploader;
