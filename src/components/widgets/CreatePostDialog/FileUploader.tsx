import React, { useState, useEffect } from "react";
import { Upload, message, List, Typography } from "antd";
import {
  CloseOutlined,
  InboxOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import styles from "./styles.module.scss";
import ClickableButton from "../../ui/Button/Button";

const { Dragger } = Upload;
const { Text } = Typography;

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]); // тут храним файлы
  const maxFiles = 10;

  // смешная нарезка файлов (обрезаем количество до 10 шт)
  useEffect(() => {
    if (files.length > maxFiles) {
      setFiles((prevFiles) => prevFiles.slice(0, maxFiles));
    }
  }, [files]);

  const handleFileUpload = (info: any) => {
    const { file } = info;

    // повторно файл добавить нельзя
    const isFileAlreadyAdded = files.some(
      (f) => f.name === file.name && f.size === file.size
    );

    if (
      (file.status === "done" || file.status === "uploading") &&
      !isFileAlreadyAdded
    ) {
      setFiles((prevFiles) => [...prevFiles, file]);
    } else if (file.status === "error") {
      message.error(
        `Файл ${file.name} не загружен. Нельзя загружать одинаковые файлы`
      );
    }
  };

  const handleFileRemove = (file: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  };

  return (
    <div>
      <Dragger
        className={styles.dragger}
        name="file"
        multiple={true}
        showUploadList={false}
        beforeUpload={() => true} // автоматически загружаем файл
        onChange={handleFileUpload}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Кликните сюда или перетащите файл в эту область для загрузки
        </p>
        <p className="ant-upload-hint">
          Поддерживается загрузка одного или нескольких файлов (максимум{" "}
          {maxFiles}). Загружено: {files.length}/{maxFiles}
        </p>
      </Dragger>

      {files.length > 0 && (
        <List
          className={styles.images}
          dataSource={files}
          renderItem={(file) => (
            <List.Item>
              <PaperClipOutlined />
              <Text className={styles.filename}>{file.name}</Text>
              <ClickableButton
                icon={<CloseOutlined />}
                type="text"
                onButtonClick={() => handleFileRemove(file)}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default FileUploader;
