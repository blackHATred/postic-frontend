import { FC, useState } from "react";
import {
  Typography,
  Input,
  Divider,
  Select,
  Collapse,
  Switch,
  TimePicker,
  message,
} from "antd";
import DialogBoxOneButton, {
  DialogBoxModelOneButtonProps,
} from "../../ui/dialogBoxOneButton/DialogBoxOneButton";
import styles from "./styles.module.scss";
import ClickableButton from "../../ui/Button/Button";
import {
  EditOutlined,
  SmileOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import PlatformSettings from "./PlatformSettings";
import FileUploader from "./FileUploader";

const { Text } = Typography;

export interface CreatePostDialogProps extends DialogBoxModelOneButtonProps {
  setOpen: Function;
  onCancel: () => Promise<string>;
  selectedPlatforms: string[];
  setSelectedPlatforms: (platforms: string[]) => void;
}

const CreatePostDialog: FC<CreatePostDialogProps> = (
  props: CreatePostDialogProps
) => {
  const [error_data, SetErrorData] = useState("");
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [postText, setPostText] = useState(""); // Состояние для текста поста
  const [validationErrors, setValidationErrors] = useState<string[]>([]); // Состояние для ошибок валидации

  const onOk = () => {
    const errors = [];

    // Проверка текста поста
    if (!postText.trim()) {
      errors.push("Текст поста не может быть пустым.");
    }

    // Проверка выбранных платформ
    if (props.selectedPlatforms.length === 0) {
      errors.push("Выберите хотя бы одну платформу для публикации.");
    }

    // Если есть ошибки, отображаем их и не закрываем диалог
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Если ошибок нет, сбрасываем их и вызываем onOk
    setValidationErrors([]);
    props.onOk();
  };

  const onCancel = async () => {
    let res = await props.onCancel();
    if (res === "") {
      props.setOpen(false);
    } else {
      SetErrorData(res);
    }
  };

  return (
    <DialogBoxOneButton
      onOk={onOk}
      isOpen={props.isOpen}
      onCancel={onCancel}
      buttonText={props.buttonText}
      title={props.title}
    >
      <Divider>Содержание поста</Divider>

      <div className={styles["post"]}>
        <div className={styles["post-text"]}>
          <Input.TextArea
            rows={3}
            placeholder="Введите текст поста"
            value={postText} // Привязываем значение к состоянию
            onChange={(e) => setPostText(e.target.value)} // Обновляем состояние
          />
          <div className={styles["post-icons"]}>
            <ClickableButton
              icon={<EditOutlined />}
              type="default"
              size="small"
            />
            <ClickableButton
              icon={<ThunderboltOutlined />}
              type="default"
              size="small"
            />
            <ClickableButton
              icon={<SmileOutlined />}
              type="default"
              size="small"
            />
          </div>
        </div>
        <Select
          size="middle"
          placeholder="Выберите платформы для публикации"
          mode="multiple"
          options={[
            { value: "vk", label: "VK" },
            { value: "tg", label: "Telegram" },
          ]}
          value={props.selectedPlatforms} // Используем переданные платформы
          onChange={(values) => props.setSelectedPlatforms(values)} // Обновляем платформы
        />
        <PlatformSettings selectedPlatforms={props.selectedPlatforms} />
        <div className={styles["post-time"]}>
          <Switch
            size="default"
            onChange={(checked) => setIsTimePickerVisible(checked)}
          />
          <Text> Настроить время публикации </Text>
        </div>
        {isTimePickerVisible && (
          <TimePicker placeholder="Выберите время для публикации" />
        )}
        <FileUploader />
      </div>

      {/* Отображение ошибок валидации */}
      {validationErrors.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {validationErrors.map((error, index) => (
            <Text key={index} style={{ color: "red", display: "block" }}>
              {error}
            </Text>
          ))}
        </div>
      )}

      <Text>{error_data}</Text>
    </DialogBoxOneButton>
  );
};

export default CreatePostDialog;
