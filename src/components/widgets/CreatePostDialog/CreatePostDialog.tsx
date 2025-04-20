import { FC, useState } from 'react';
import { Typography, Input, Divider, Select, Switch, DatePicker } from 'antd';
import DialogBox from '../../ui/dialogBox/DialogBox';
import styles from './styles.module.scss';
import ClickableButton from '../../ui/Button/Button';
import { EditOutlined, SmileOutlined, ThunderboltOutlined } from '@ant-design/icons';
import PlatformSettings from './PlatformSettings';
import FileUploader from './FileUploader';
import { validateMinLength } from '../../../utils/validation';
import { Dayjs } from 'dayjs';
import Picker from 'emoji-picker-react';
import { getPost, sendPostRequest } from '../../../api/api';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  addFile,
  removeFile,
  setCreatePostDialog,
  setPostStatusDialog,
} from '../../../stores/basePageDialogsSlice';
import ru from 'antd/es/date-picker/locale/ru_RU';
import { Post, sendPostResult } from '../../../models/Post/types';
import { addPost, addScheduledPost, setSelectedPostId } from '../../../stores/postsSlice';
import { EmojiStyle } from 'emoji-picker-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Categories } from 'emoji-picker-react';

dayjs.extend(utc);

const { Text } = Typography;

const buddhistLocale: typeof ru = {
  ...ru,
  lang: {
    ...ru.lang,
    fieldDateTimeFormat: 'DD-MM-YYYY HH:mm',
    yearFormat: 'YYYY',
    cellYearFormat: 'YYYY',
  },
};

const emoji_config = [
  {
    category: Categories.SUGGESTED,
    name: 'Недавние',
  },
  {
    category: Categories.SMILEYS_PEOPLE,
    name: 'Эмоции и люди',
  },
  {
    category: Categories.ANIMALS_NATURE,
    name: 'Животные и природа',
  },
  {
    category: Categories.FOOD_DRINK,
    name: 'Еда',
  },
  {
    category: Categories.TRAVEL_PLACES,
    name: 'Путешествия',
  },
  {
    category: Categories.ACTIVITIES,
    name: 'Активнсть',
  },
  {
    category: Categories.OBJECTS,
    name: 'Объекты',
  },
  {
    category: Categories.SYMBOLS,
    name: 'Симболы',
  },
  {
    category: Categories.FLAGS,
    name: 'Флаги',
  },
];

const CreatePostDialog: FC = () => {
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [postText, setPostText] = useState(''); // Состояние для текста поста
  const [validationErrors, setValidationErrors] = useState<string[]>([]); // Состояние для ошибок валидации
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(); // Состояние для выбранной даты
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]); // Состояние для выбранной даты
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Состояние для отображения панели смайликов
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.basePageDialogs.createPostDialog.isOpen);
  const team_id = useAppSelector((state) => state.teams.globalActiveTeamId);
  const fileIds = useAppSelector((state) => state.basePageDialogs.createPostDialog.files).map((file) => file.id);
  const help_mode = useAppSelector((state) => state.settings.helpMode);
  const specificDate = dayjs('2025-04-15T02:40:00.258+03:00');

  const onOk = () => {
    const errors: string[] = [];

    // Валидация текста поста
    const postTextError = validateMinLength(postText, 3);
    if (postTextError) {
      errors.push(postTextError);
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
    setValidationErrors([]);

    // Формируем объект для отправки
    const postPayload = {
      text: postText,
      attachments: fileIds,
      platforms: selectedPlatforms,
      team_id: team_id,
      pub_datetime: selectedDate ? selectedDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ') : undefined, // Используем pub_datetime
    };

    console.log('Отправляем пост:', postPayload);

    sendPostRequest(postPayload).then((data: sendPostResult) => {
      getPost(team_id, data.post_id).then((res: { post: Post }) => {
        if (res.post) {
          // если у поста есть время публикации и оно в будущем, добавляем его в отложенные
          if (res.post.pub_datetime && new Date(res.post.pub_datetime) > new Date()) {
            dispatch(addScheduledPost(res.post));
          } else {
            dispatch(addPost(res.post));
          }
        } else {
          console.error('Ошибка получения поста:', res);
        }
        clearFields();
      });
      dispatch(setSelectedPostId(data.post_id));
    });
    dispatch(setPostStatusDialog(true));
    dispatch(setCreatePostDialog(false));
  };

  const clearFields = () => {
    setIsTimePickerVisible(false);
    setPostText('');
    setValidationErrors([]);
    setSelectedDate(null);
    setSelectedPlatforms([]);
    setShowEmojiPicker(false);
    dispatch(clearFiles());
  };

  const onCancel = async () => {
    dispatch(setCreatePostDialog(false));
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiObject: any) => {
    setPostText((prevText) => prevText + emojiObject.emoji);
  };

  const addFileIDs = (id: string, file: any) => {
    dispatch(addFile({ id: id, file: file }));
  };

  const removeFiles = (file: any) => {
    dispatch(removeFile({ file: file }));
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          text: 'Опубликовать',
          onButtonClick: onOk,
        },
      ]}
      isOpen={isOpen}
      onCancelClick={onCancel}
      title={'Создать пост'}
      isCenter={true}
    >
      <Divider>Содержание поста</Divider>

      <div className={styles['post']}>
        <div className={styles['post-text']}>
          <Input.TextArea
            rows={3}
            placeholder='Введите текст поста'
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
          <div className={styles['post-icons']}>
            {help_mode ? (
              <>
                <ClickableButton
                  icon={<EditOutlined />}
                  type='default'
                  size='small'
                  withPopover={true}
                  popoverContent={
                    'Редактор автоматически исправит грамматические, пунктуационные и другие ошибки в тексте'
                  }
                />
                <ClickableButton
                  icon={<ThunderboltOutlined />}
                  type='default'
                  size='small'
                  withPopover={true}
                  popoverContent={'ИИ-генерация текста поста'}
                />
              </>
            ) : (
              <>
                <ClickableButton icon={<EditOutlined />} type='default' size='small' />
                <ClickableButton icon={<ThunderboltOutlined />} type='default' size='small' />
              </>
            )}

            <ClickableButton
              icon={<SmileOutlined />}
              type='default'
              size='small'
              onButtonClick={() => setShowEmojiPicker(!showEmojiPicker)} //панель смайликов
            />
          </div>
        </div>
        {showEmojiPicker && (
          <div className={styles.emojiPicker}>
            <Picker
              onEmojiClick={onEmojiClick}
              lazyLoadEmojis={true}
              emojiStyle={EmojiStyle.APPLE}
              previewConfig={{
                showPreview: false,
              }}
              categories={emoji_config}
              searchPlaceHolder='Поиск'
            />
          </div>
        )}
        <Select
          size='middle'
          placeholder='Выберите платформы для публикации'
          mode='multiple'
          options={[
            { value: 'vk', label: 'VK' },
            { value: 'tg', label: 'Telegram' },
          ]}
          value={selectedPlatforms}
          onChange={(values: string[]) => setSelectedPlatforms(values)}
        />
        <PlatformSettings selectedPlatforms={selectedPlatforms} />
        <div className={styles['post-time']}>
          <Switch
            size='default'
            onChange={(checked) => {
              setIsTimePickerVisible(checked);
              if (!checked) {
                setSelectedDate(null);
              }
            }}
          />
          <Text> Настроить дату и время публикации </Text>
        </div>
        {isTimePickerVisible && (
          <div className={styles['time-and-data']}>
            <DatePicker
              placeholder='Выберите дату и время'
              showTime
              locale={buddhistLocale}
              defaultValue={dayjs()}
              onChange={(date: Dayjs | null) => {
                setSelectedDate(date);
              }}
            />
          </div>
        )}
        <FileUploader addFiles={addFileIDs} removeFile={removeFiles} />
      </div>

      {/* Отображение ошибок валидации */}
      {validationErrors.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {validationErrors.map((error, index) => (
            <Text key={index} style={{ color: 'red', display: 'block' }}>
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
  return selectedPlatforms.length > 0 ? null : 'Не выбраны платформы для публикации.';
}
