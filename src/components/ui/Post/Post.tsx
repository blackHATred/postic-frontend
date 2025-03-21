import React from "react";
import { Avatar, Divider, Tag, Typography } from "antd";
import styles from "./styles.module.scss"; // Импортируем стили
import { Post } from "../../../models/Post/types";
import ClickableButton from "../Button/Button";
import {
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface PostProps {
  post: Post;
}

const PostComponent: React.FC<PostProps> = ({ post }) => {
  const {
    action_post_vk_id,
    action_post_tg_id,
    time,
    team_id,
    user_id,
    text,
    attachments,
    pub_date,
  } = post;

  const tags = [];
  if (action_post_vk_id) tags.push(<Tag key="vk">VK</Tag>);
  if (action_post_tg_id) tags.push(<Tag key="tg">TG</Tag>);

  return (
    <div className={styles.post}>
      {/* хедер*/}
      <div className={styles["post-header"]}>
        {/* Левая часть */}
        <div className={styles["post-header-info"]}>
          {/* верхняя часть */}
          <div className={styles["post-header-info-text"]}>
            <Text strong>{user_id}</Text>

            <Text type="secondary" className={styles["post-time"]}>
              {time}
            </Text>
          </div>
          <div className={styles["post-tags"]}>{tags}</div>
        </div>

        {/* Правая часть */}
        <div className={styles["post-header-buttons"]}>
          <ClickableButton
            text="Комментарии"
            type="link"
            icon={<CommentOutlined />}
          />
          <ClickableButton
            text="Суммаризация"
            variant="dashed"
            color="primary"
          />
        </div>
      </div>
      {/* тело*/}
      <Divider className={styles.customDivider} />
      <div className={styles["post-content"]}>
        <div className={styles["post-content-text"]}>
          <Text>{text}</Text>
        </div>
        <div className={styles["post-content-buttons"]}>
          <ClickableButton
            text="Редактировать"
            variant="outlined"
            color="primary"
            icon={<EditOutlined />}
          />
          <ClickableButton
            text="Удалить"
            variant="outlined"
            color="danger"
            icon={<DeleteOutlined />}
          />
        </div>
      </div>
    </div>
  );
};

export default PostComponent;
