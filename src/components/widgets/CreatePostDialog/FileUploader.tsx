import React, { useState, useEffect, useContext } from 'react';
import { Upload, Typography, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { exceedsMaxFiles, isFileAlreadyAdded } from '../../../utils/validation';
import { uploadFile } from '../../../api/api';
import { NotificationContext } from '../../../api/notification';
import { isAxiosError } from 'axios';
import styles from './styles.module.scss';

const { Dragger } = Upload;
const { Text } = Typography;

interface fileUploaderProps {
  addFiles: (id: string, file: any) => void;
  removeFile: (file: any) => any;
}

const FileUploader: React.FC<fileUploaderProps> = (props: fileUploaderProps) => {
  const [files, setFiles] = useState<any[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const NotificationManager = useContext(NotificationContext);
  const maxFiles = 10;

  useEffect(() => {
    if (exceedsMaxFiles(files, maxFiles)) {
      setFiles((prevFiles) => prevFiles.slice(0, maxFiles));
    }
  }, [files, maxFiles]);

  const handleFileUpload = async (file: File) => {
    if (!isFileAlreadyAdded(files, file)) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          setFiles((prevFiles) => [...prevFiles, file]);
          setImagePreviews((prevPreviews) => [...prevPreviews, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setFiles((prevFiles) => [...prevFiles, file]);
      }

      //  (для всех файлов)
      try {
        const uploadResult = await uploadFile(file);
        props.addFiles(uploadResult.file_id, file);
      } catch (error) {
        if (isAxiosError(error)) {
          NotificationManager.createNotification('error', `Файл ${file.name} не загружен.`, 'Ошибка подключения сети');
        } else {
          NotificationManager.createNotification('error', `Файл ${file.name} не загружен.`, 'Ошибка обработки файла');
        }
      }
    } else {
      NotificationManager.createNotification('error', `Файл ${file.name} не загружен.`, 'Дубликаты файлов не разрешены');
    }
    return false;
  };

  const handleFileRemove = (file: any) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.uid !== file.uid));
    props.removeFile(file);
    if (file.type.startsWith('image/')) {
      setImagePreviews((prevPreviews) => {
        const index = files.findIndex((f) => f.uid === file.uid);
        const newPreviews = [...prevPreviews];
        newPreviews.splice(index, 1);
        return newPreviews;
      });
    }
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
        ). Загружено: {files.length}/{maxFiles}
      </Text>

      <Upload
        listType='picture'
        multiple={true}
        defaultFileList={files}
        beforeUpload={handleFileUpload}
        onRemove={handleFileRemove} // Используйте onRemove вместо action для удаления файлов
      >
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <Button icon={<UploadOutlined />}>Upload</Button>
        </div>{' '}
      </Upload>
      <Upload defaultFileList={files}></Upload>
    </div>
  );
};

export default FileUploader;
