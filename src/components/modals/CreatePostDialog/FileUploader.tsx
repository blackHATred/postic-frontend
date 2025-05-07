import React, { useContext, useEffect, useState } from 'react';
import { Upload, Typography, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { isFileAlreadyAdded } from '../../../utils/validation';
import { uploadFile } from '../../../api/api';
import { NotificationContext } from '../../../api/notification';
import { isAxiosError } from 'axios';
import styles from './styles.module.scss';
import { useAppSelector } from '../../../stores/hooks';

const { Text } = Typography;

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

  useEffect(() => {
    if (props.files.length == 0) {
      setID(Math.random());
    }
  }, [props.files]);

  const handleFileUpload = async (file: File) => {
    if (!isFileAlreadyAdded(props.files, file)) {
      //  (для всех файлов)
      try {
        const uploadResult = await uploadFile(file);
        props.addFiles(uploadResult.file_id, file);
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
      }
    } else {
      NotificationManager.createNotification(
        'error',
        `Файл ${file.name} не загружен.`,
        'Дубликаты файлов не разрешены',
      );
    }
    return false;
  };

  const handleFileRemove = (file: any) => {
    props.removeFile(file);
  };

  return (
    <div className={styles['post']}>
      {/* 
      <Dragger
        className={styles.dragger}
        name="file"
        multiple={true}
        showUploadList={true}
        beforeUpload={handleFileUpload}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Кликните сюда или перетащите файл в эту область для загрузки
        </p>
        <p className="ant-upload-hint">
          Поддерживается загрузка одного или нескольких файлов (максимум{" "}
          {maxFiles}
          ). Загружено: {files.length}/{maxFiles}
        </p>
      </Dragger>
      */}
      <Text type='secondary'>
        Поддерживается загрузка одного или нескольких файлов (максимум {maxFiles}
        ). Загружено: {props.files.length}/{maxFiles}
      </Text>

      <Upload
        key={id}
        listType='picture'
        multiple={true}
        defaultFileList={props.files}
        beforeUpload={handleFileUpload}
        onRemove={handleFileRemove} // Используйте onRemove вместо action для удаления файлов
        maxCount={10}
      >
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <Button icon={<UploadOutlined />}>Загрузить</Button>
        </div>{' '}
      </Upload>
    </div>
  );
};

export default FileUploader;
