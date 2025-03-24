import React, { useState, useEffect, useContext } from "react";
import { Upload, message, List, Typography, Carousel, Image } from "antd";
import {
  CloseOutlined,
  InboxOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import styles from "./styles.module.scss";
import ClickableButton from "../../ui/Button/Button";
import { exceedsMaxFiles, isFileAlreadyAdded } from "../../../utils/validation";
import { uploadFile } from "../../../api/api";
import { NotificationContext } from "../../../api/notification";
import { isAxiosError } from "axios";

const { Dragger } = Upload;
const { Text } = Typography;

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const NotificationManager = useContext(NotificationContext);
  const maxFiles = 10;

  useEffect(() => {
    if (exceedsMaxFiles(files, maxFiles)) {
      setFiles((prevFiles) => prevFiles.slice(0, maxFiles));
    }
  }, [files, maxFiles]);

  const handleFileUpload = async (file: any) => {
    if (!isFileAlreadyAdded(files, file)) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          setFiles((prevFiles) => [...prevFiles, file]);
          setImagePreviews((prevPreviews) => [
            ...prevPreviews,
            reader.result as string,
          ]);
        };
        reader.readAsDataURL(file.originFileObj);
      } else {
        setFiles((prevFiles) => [...prevFiles, file]);
      }

      //  (для всех файлов)
      try {
        const uploadResult = await uploadFile(file.originFileObj);
        console.log("ID файла:", uploadResult.id);
      } catch (error) {
        if (isAxiosError(error)) {
          NotificationManager.createNotification(
            "error",
            `Файл ${file.name} не загружен.`,
            "Ошибка подключения сети"
          );
        } else {
          NotificationManager.createNotification(
            "error",
            `Файл ${file.name} не загружен.`,
            "Ошибка обработки файла"
          );
        }
      }
    } else {
      NotificationManager.createNotification(
        "error",
        `Файл ${file.name} не загружен.`,
        "Дубликаты файлов не разрешены"
      );
    }
  };

  const handleFileRemove = (file: any) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.uid !== file.uid));
    if (file.type.startsWith("image/")) {
      setImagePreviews((prevPreviews) => {
        const index = files.findIndex((f) => f.uid === file.uid);
        const newPreviews = [...prevPreviews];
        newPreviews.splice(index, 1);
        return newPreviews;
      });
    }
  };

  return (
    <div>
      <Dragger
        className={styles.dragger}
        name="file"
        multiple={true}
        showUploadList={false}
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

      {files.length > 0 && (
        <>
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

          {imagePreviews.length > 0 &&
            (imagePreviews.length === 1 ? (
              <Image src={imagePreviews[0]} />
            ) : (
              <Carousel arrows>
                {imagePreviews.map((preview) => (
                  <div key={preview}>
                    <Image src={preview} />
                  </div>
                ))}
              </Carousel>
            ))}
        </>
      )}
    </div>
  );
};

export default FileUploader;
