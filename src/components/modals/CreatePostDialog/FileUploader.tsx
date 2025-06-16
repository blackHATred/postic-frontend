import React, { useState } from 'react';
import { Typography } from 'antd';
import { useAppSelector } from '../../../stores/hooks';
import { FileUploaderProps, MAX_FILES } from './types';
import { useFileUpload } from './useFileUpload';
import { StandardUploader, DragUploader } from './Uploaders';
import DragPreview from './DragPreview';
import { detectFileType } from './fileUtils';
import styles from './styles.module.scss';

const { Text } = Typography;

/**
 * Компонент для загрузки файлов в пост
 */
const FileUploader: React.FC<FileUploaderProps> = (props) => {
  const [localIsDragging, setLocalIsDragging] = useState(false);
  const [localFileTypes, setLocalFileTypes] = useState<string>();

  // Получаем список ID файлов из состояния Redux
  const fileIds = useAppSelector((state) => state.basePageDialogs.createPostDialog.files).map(
    (file) => file,
  );

  const {
    id,
    ref_upload,
    open_da,
    file_types,
    isDragging,
    dragPreviewFiles,
    uploadedFiles,
    setUploadedFiles,
    handleMenuClick,
    handleFileUpload,
    handleFileRemove,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    getCustomRequestHandler,
    handlePreview,
  } = useFileUpload(props.addFiles, props.removeFile, props.files);

  const customRequestHandler = (obj: any) => {
    const file = obj.file;

    getCustomRequestHandler(file).then((f: string) => {
      if (!f) {
        obj.response = 'Успех';
        obj.onSuccess();
      } else {
        obj.onError(null, f, obj.file);
      }
    });
  };

  const dragCustomRequestHandler = (obj: any) => {
    const file = obj.file;

    setLocalFileTypes(detectFileType(file));

    getCustomRequestHandler(file).then((f: string) => {
      if (!f) {
        obj.response = 'Успех';
        obj.onSuccess();
        setLocalIsDragging(false);
      } else {
        obj.onError(null, f, obj.file);
      }
    });
  };

  return (
    <div
      className={styles['post']}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Text type='secondary'>
        Поддерживается загрузка одного или нескольких файлов (максимум {MAX_FILES}
        ). Загружено: {uploadedFiles.length}/{MAX_FILES}
      </Text>

      {!isDragging ? (
        <StandardUploader
          id={id}
          uploadedFiles={uploadedFiles}
          fileTypes={file_types || localFileTypes}
          onRemove={(file) => {
            handleFileRemove(file);
            setUploadedFiles((prev) => prev.filter((f) => f.uid !== file.uid));
          }}
          onOpen={open_da}
          customRequest={customRequestHandler}
          onPreview={handlePreview}
          uploaderRef={ref_upload}
          menuClickHandler={handleMenuClick}
        />
      ) : (
        <DragUploader
          id={id}
          uploadedFiles={uploadedFiles}
          onRemove={(file) => {
            handleFileRemove(file);
            setUploadedFiles((prev) => prev.filter((f) => f.uid !== file.uid));
          }}
          customRequest={dragCustomRequestHandler}
          onPreview={handlePreview}
        >
          <DragPreview previewFiles={dragPreviewFiles} />
        </DragUploader>
      )}
    </div>
  );
};

export default FileUploader;
