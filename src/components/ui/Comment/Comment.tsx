import React from "react";
import { Avatar, Typography } from "antd";
import styles from "./styles.module.scss"; // Импортируем стили
import { Comment, DeleteComment } from "../../../models/Comment/types";
import dayjs from "dayjs";
import ClickableButton from "../Button/Button";
import { DeleteOutlined, DoubleRightOutlined } from "@ant-design/icons";
import {
  setAnswerDialog,
  setSelectedComment,
} from "../../../stores/commentSlice";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { Delete } from "../../../api/api";
import { setActiveTab } from "../../../stores/basePageDialogsSlice";
import { setScrollToPost, setSelectedPostId } from "../../../stores/postsSlice";

const { Text } = Typography;

interface CommentProps {
  comment: Comment;
}

const CommentComponent: React.FC<CommentProps> = ({ comment }) => {
  const {
    id,
    post_union_id,
    comment_id,
    user_id,
    username,
    text = "Загрузка...",
    created_at = dayjs("0000-00-00 00:00:00"),
    attachments = [],
  } = comment;
  const dispatch = useAppDispatch();
  const selectedTeamId = useAppSelector(
    (state) => state.teams.globalActiveTeamId
  );

  const openAnswerDialog = () => {
    dispatch(setSelectedComment?.(comment));
    dispatch(setAnswerDialog(true));
  };

  const deleteComment = () => {
    console.log("Удаление комментария", selectedTeamId, post_union_id, false);
    const res: DeleteComment = {
      team_id: selectedTeamId,
      post_comment_id: Number(post_union_id),
      ban_user: false,
    };
    Delete(res);
  };

  const handlePostClick = () => {
    dispatch(setActiveTab("1"));
    dispatch(setScrollToPost(true));
    dispatch(setSelectedPostId(post_union_id));
  };

  return (
    <div className={styles.comment}>
      <div className={styles["comment-header"]}>
        <Avatar
          src={null}
          onError={() => {
            console.log("img-error");
            return true;
          }}
        />
        <div className={styles["comment-author"]}>
          <Text strong>{username}</Text>
          <Text type="secondary" className={styles["comment-time"]}>
            {dayjs(created_at).format("DD.MM.YYYY HH:mm")} | tg
          </Text>
          <Text
            underline
            type="secondary"
            style={{ marginTop: "auto", marginBottom: "auto" }}
            onClick={handlePostClick}
          >
            От Поста № {post_union_id}
          </Text>
        </div>
        {/* Условный для replyToUrl 
        
                {replyToUrl && (
          <div className={styles["comment-reply-to"]}>
            <Text type="secondary">
              смотрите{" "}
              <a href={replyToUrl} target="_blank" rel="noopener noreferrer">
                сообщение
              </a>
            </Text>
          </div>
        )}
        */}
      </div>

      <div className={styles["comment-content"]}>
        <Text>{text}</Text>
      </div>
      <div>
        <ClickableButton
          type="default"
          variant="outlined"
          color="blue"
          text="Ответить"
          icon={<DoubleRightOutlined />}
          onButtonClick={openAnswerDialog}
        />
        <ClickableButton
          type="default"
          variant="outlined"
          color="danger"
          text="Удалить"
          icon={<DeleteOutlined />}
          onButtonClick={deleteComment}
        />
      </div>
    </div>
  );
};

export default CommentComponent;
