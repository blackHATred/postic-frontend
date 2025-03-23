import React from "react";
import { Avatar, Typography } from "antd";
import styles from "./styles.module.scss"; // Импортируем стили
import { Comment } from "../../../models/Comment/types";

const { Text } = Typography;

interface CommentProps {
  comment: Comment;
}

const CommentComponent: React.FC<CommentProps> = ({ comment }) => {
  const { username, time, platform, avatarUrl, text, replyToUrl } = comment;

  return (
    <div className={styles.comment}>
      <div className={styles["comment-header"]}>
        <Avatar
          src={avatarUrl}
          alt={username}
          onError={() => {
            console.log("img-error");
            return true;
          }}
        />
        <div className={styles["comment-author"]}>
          <Text strong>{username}</Text>
          <Text type="secondary" className={styles["comment-time"]}>
            {time} | {platform}
          </Text>
        </div>
        {/* Условный для replyToUrl */}
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
      </div>

      <div className={styles["comment-content"]}>
        <Text>{text}</Text>
      </div>
    </div>
  );
};

export default CommentComponent;
