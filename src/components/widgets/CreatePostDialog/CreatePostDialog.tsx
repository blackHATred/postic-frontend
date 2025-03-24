import { FC, useState } from "react";
import { Typography, Input, Divider, Select, Switch, TimePicker } from "antd";
import DialogBox, {
  DialogBoxProps,
} from "../../ui/dialogBoxOneButton/DialogBox";
import styles from "./styles.module.scss";
import ClickableButton from "../../ui/Button/Button";
import {
  EditOutlined,
  SmileOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import PlatformSettings from "./PlatformSettings";
import FileUploader from "./FileUploader";
import { validateMinLength } from "../../../utils/validation";
import dayjs, { Dayjs } from "dayjs";
import CustCalendar from "../../ui/Calendar/Calendar";
import Picker from "emoji-picker-react";

const { Text } = Typography;
const format = "HH:mm";

export interface CreatePostDialogProps extends DialogBoxProps {
  setOpen: Function;
  onCancelClick: () => Promise<string>;
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
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null); // Состояние для выбранной даты
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Состояние для отображения панели смайликов

  const onOk = () => {
    const errors: string[] = [];

    // Валидация текста поста
    const postTextError = validateMinLength(postText, 3);
    if (postTextError) {
      errors.push(postTextError);
    }

    if (!selectedDate) {
      setSelectedDate(dayjs());
    }

    // Валидация выбранных платформ
    const platformsError = validateNotEmptyArray(props.selectedPlatforms);
    if (platformsError !== null) {
      errors.push(platformsError);
    }

    // Если есть ошибки, отображаем их и не закрываем диалог
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Если ошибок нет, сбрасываем их и вызываем onOk
    setValidationErrors([]);
    props.onOkClick();
  };

  const onCancel = async () => {
    let res = await props.onCancelClick();
    if (res === "") {
      props.setOpen(false);
    } else {
      SetErrorData(res);
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    setPostText((prevText) => prevText + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <DialogBox
      onOkClick={onOk}
      isOpen={props.isOpen}
      onCancelClick={onCancel}
      buttonText={props.buttonText}
      title={props.title}
    >
      <Divider>Содержание поста</Divider>

      <div className={styles["post"]}>
        <div className={styles["post-text"]}>
          <Input.TextArea
            rows={3}
            placeholder="Введите текст поста"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
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
              onButtonClick={() => setShowEmojiPicker(!showEmojiPicker)} //панель смайликов
            />
          </div>
        </div>
        {showEmojiPicker && (
          <div className={styles.emojiPicker}>
            <Picker onEmojiClick={onEmojiClick} />
          </div>
        )}
        <Select
          size="middle"
          placeholder="Выберите платформы для публикации"
          mode="multiple"
          options={[
            { value: "vk", label: "VK" },
            { value: "tg", label: "Telegram" },
          ]}
          value={props.selectedPlatforms}
          onChange={(values) => props.setSelectedPlatforms(values)}
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
          <div className={styles["time-and-data"]}>
            <TimePicker
              placeholder="Выберите время для публикации"
              defaultValue={selectedDate}
              format={format}
              onChange={(time) => {
                if (selectedDate) {
                  setSelectedDate(
                    selectedDate
                      .hour(time?.hour() || 0)
                      .minute(time?.minute() || 0)
                  );
                } else {
                  setSelectedDate(
                    dayjs()
                      .hour(time?.hour() || 0)
                      .minute(time?.minute() || 0)
                  );
                }
              }}
            />
            <CustCalendar
              onPanelChange={(date: Dayjs | null) => setSelectedDate(date)}
            />
          </div>
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
    </DialogBox>
  );
};

export default CreatePostDialog;
function validateNotEmptyArray(selectedPlatforms: string[]): string | null {
  return selectedPlatforms.length > 0
    ? null
    : "Не выбраны платформы для публикации.";
}
