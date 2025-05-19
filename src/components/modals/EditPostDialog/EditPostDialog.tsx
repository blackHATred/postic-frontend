import React, { FC, useEffect, useState } from 'react';
import { Input, Form } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setEditPostDialog } from '../../../stores/basePageDialogsSlice';
import { getPost, postEdit } from '../../../api/api';
import { Typography } from 'antd';

const { Text } = Typography;

const EditPostDialog: FC = () => {
  const [postText, setPostText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.basePageDialogs.editPostDialog.isOpen);
  const postId = useAppSelector((state) => state.basePageDialogs.editPostDialog.postId);
  const teamId = useAppSelector((state) => state.basePageDialogs.editPostDialog.teamId);

  useEffect(() => {
    if (isOpen && postId && teamId) {
      setLoading(true);
      getPost(teamId, postId)
        .then(({ post }) => {
          setPostText(post.text);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Ошибка загрузки поста:', err);
          setError('Не удалось загрузить данные поста');
          setLoading(false);
        });
    }
  }, [isOpen, postId, teamId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
    if (e.target.value.trim() === '') {
      setError('Текст поста не может быть пустым');
    } else {
      setError(null);
    }
  };

  const onSave = () => {
    if (!postText.trim()) {
      setError('Текст поста не может быть пустым');
      return;
    }

    if (postId && teamId) {
      setLoading(true);
      postEdit({
        team_id: teamId,
        post_union_id: postId,
        text: postText,
      })
        .then(() => {
          dispatch(setEditPostDialog({ isOpen: false, postId: null, teamId: null }));
        })
        .catch((err) => {
          console.error('Ошибка при редактировании поста:', err);
          setError('Не удалось сохранить изменения');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const onCancel = () => {
    dispatch(setEditPostDialog({ isOpen: false, postId: null, teamId: null }));
    setPostText('');
    setError(null);
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          text: 'Отмена',
          onButtonClick: onCancel,
          type: 'default',
        },
        {
          text: 'Сохранить',
          onButtonClick: onSave,
          loading: loading,
          disabled: !!error || loading || !postText.trim(),
        },
      ]}
      isOpen={isOpen}
      onCancelClick={onCancel}
      title='Редактирование поста'
      isCenter={true}
    >
      <div className={styles.editPostContainer}>
        <Form.Item validateStatus={error ? 'error' : ''} help={error}>
          <Input.TextArea
            rows={8}
            placeholder='Введите текст поста'
            value={postText}
            onChange={handleTextChange}
            disabled={loading}
          />
        </Form.Item>
      </div>
    </DialogBox>
  );
};

export default EditPostDialog;
