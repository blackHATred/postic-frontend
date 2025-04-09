import { FC, useState } from "react";
import { Typography, Input, Divider, Select, Switch, DatePicker } from "antd";
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
import Picker from "emoji-picker-react";
import { getPosts, sendPostRequest } from "../../../api/api";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  setCreatePostDialog,
  setPostStatusDialog,
} from "../../../stores/basePageDialogsSlice";
import ru from "antd/es/date-picker/locale/ru_RU";
import { Post, sendPostResult } from "../../../models/Post/types";
import {
  setPosts,
  setScrollToPost,
  setSelectedPostId,
} from "../../../stores/postsSlice";

const { Text } = Typography;

const buddhistLocale: typeof ru = {
  ...ru,
  lang: {
    ...ru.lang,
    fieldDateTimeFormat: "DD-MM-YYYY HH:mm:ss",
    yearFormat: "YYYY",
    cellYearFormat: "YYYY",
  },
};

const CreatePostDialog: FC = () => {
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [postText, setPostText] = useState(""); // Состояние для текста поста
  const [validationErrors, setValidationErrors] = useState<string[]>([]); // Состояние для ошибок валидации
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(); // Состояние для выбранной даты
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]); // Состояние для выбранной даты
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Состояние для отображения панели смайликов
  const [fileIDs, setFilesIDs] = useState<string[]>([]); // ID загруженных изображений
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(
    (state) => state.basePageDialogs.createPostDialog.isOpen
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
      pub_time: selectedDate?.unix() ? selectedDate.unix() : dayjs().unix(),
      platforms: selectedPlatforms,
    }).then((data: sendPostResult) => {
      getPosts().then((res: { posts: Post[] }) => {
        if (res.posts) {
          dispatch(setPosts(res.posts));
        } else {
        }
      }); // Вот это можно будет удалить после изменения бекэнда (вместо этого добавление нового элемента)
      dispatch(setSelectedPostId(data.post_id));
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
          onChange={(values: string[]) => setSelectedPlatforms(values)}
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
            <DatePicker
              placeholder="Выберите дату и время"
              showTime
              locale={buddhistLocale}
              defaultValue={selectedDate}
              onChange={(date: Dayjs | null) => {
                setSelectedDate(date);
              }}
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
