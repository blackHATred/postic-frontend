import React from 'react';
import { Avatar, Typography } from 'antd';
import styles from './styles.module.scss';
import { Comment, DeleteComment } from '../../../models/Comment/types';
import dayjs from 'dayjs';
import ClickableButton from '../Button/Button';
import { DeleteOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { setAnswerDialog, setSelectedComment } from '../../../stores/commentSlice';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { Delete } from '../../../api/api';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import { setScrollToPost, setSelectedPostId } from '../../../stores/postsSlice';
import 'dayjs/locale/ru';
import utc from 'dayjs/plugin/utc';

// часовой пояс и отображение времени
dayjs.locale('ru');
dayjs.extend(utc);
const { Text } = Typography;

interface CommentProps {
  comment: Comment;
}

const CommentComponent: React.FC<CommentProps> = ({ comment }) => {
  const { id, post_union_id, username, text = 'Загрузка...', created_at = dayjs('0000-00-00 00:00:00') } = comment;
  const dispatch = useAppDispatch();
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);

  const openAnswerDialog = () => {
    dispatch(setSelectedComment?.(comment));
    dispatch(setAnswerDialog(true));
  };

  const deleteComment = () => {
    console.log('Удаление комментария', selectedTeamId, post_union_id, false);
    const res: DeleteComment = {
      team_id: selectedTeamId,
      post_comment_id: Number(id),
      ban_user: false,
    };
    Delete(res);
  };

  const handlePostClick = () => {
    dispatch(setActiveTab('1'));
    dispatch(setScrollToPost(true));
    dispatch(setSelectedPostId(post_union_id));
  };

  return (
    <div className={styles.comment}>
      <div className={styles['comment-header']}>
        <Avatar
          src={null}
          onError={() => {
            console.log('img-error');
            return true;
          }}
        />
        <div className={styles['comment-author']}>
          <div>
            <Text strong>{username}</Text>
            <Text type='secondary' className={styles['comment-time']}>
              {dayjs.utc(created_at).format('D MMMM YYYY [в] HH:mm')} | {comment.platform}
            </Text>
          </div>

          <div>
            <Text type='secondary' style={{ marginTop: 'auto', marginBottom: 'auto' }} onClick={handlePostClick}>
              К <a>посту</a>
            </Text>
          </div>
        </div>
      </div>

      <div className={styles['comment-content']}>
        <Text>{text}</Text>
      </div>
      <div>
        <ClickableButton
          type='default'
          variant='outlined'
          color='blue'
          text='Ответить'
          icon={<DoubleRightOutlined />}
          onButtonClick={openAnswerDialog}
        />
        <ClickableButton
          type='default'
          variant='outlined'
          color='danger'
          text='Удалить'
          icon={<DeleteOutlined />}
          onButtonClick={deleteComment}
        />
      </div>
    </div>
  );
};

export default CommentComponent;
