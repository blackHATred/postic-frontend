import { FC, useState } from "react";
import { Typography, Input, Divider, Select, Switch, TimePicker } from "antd";
import DialogBox from "../../ui/dialogBox/DialogBox";
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
import { sendPostRequest } from "../../../api/api";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  setCreatePostDialog,
  setCreatePostDialogSelectedPlatforms,
  setPostStatusDialog,
} from "../../../stores/basePageDialogsSlice";

const { Text } = Typography;
const format = "HH:mm";

const CreatePostDialog: FC = () => {
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [postText, setPostText] = useState(""); // Состояние для текста поста
  const [validationErrors, setValidationErrors] = useState<string[]>([]); // Состояние для ошибок валидации
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null); // Состояние для выбранной даты
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Состояние для отображения панели смайликов
  const [fileIDs, setFilesIDs] = useState<string[]>([]); // ID загруженных изображений
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(
    (state) => state.basePageDialogs.createPostDialog.isOpen
  );
  const selectedPlatforms = useAppSelector(
    (state) => state.basePageDialogs.createPostDialog.selectedPlatforms
  );

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
    const platformsError = validateNotEmptyArray(selectedPlatforms);
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
    sendPostRequest({
      text: postText,
      attachments: fileIDs,
      pub_time: selectedDate?.valueOf() ? selectedDate.valueOf() : 0,
      platforms: selectedPlatforms,
    });
    dispatch(setPostStatusDialog(true));
    dispatch(setCreatePostDialog(false));
  };

  const onCancel = async () => {
    dispatch(setCreatePostDialog(false));
  };

  const onEmojiClick = (emojiObject: any) => {
    setPostText((prevText) => prevText + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          text: "Опубликовать",
          onButtonClick: onOk,
        },
      ]}
      isOpen={isOpen}
      onCancelClick={onCancel}
      title={"Создать пост"}
      isCenter={true}
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
          value={selectedPlatforms}
          onChange={(values) =>
            dispatch(setCreatePostDialogSelectedPlatforms(values))
          }
        />
        <PlatformSettings selectedPlatforms={selectedPlatforms} />
        <div className={styles["post-time"]}>
          <Switch
            size="default"
            onChange={(checked) => setIsTimePickerVisible(checked)}
          />
          <Text> Настроить дату и время публикации </Text>
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
        <FileUploader fileIDs={fileIDs} setFileIDs={setFilesIDs} />
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
    </DialogBox>
  );
};

export default CreatePostDialog;
function validateNotEmptyArray(selectedPlatforms: string[]): string | null {
  return selectedPlatforms.length > 0
    ? null
    : "Не выбраны платформы для публикации.";
}
