import React, { useContext, useEffect, useRef } from "react";
import { Divider, Tag, Typography } from "antd";
import styles from "./styles.module.scss";
import { Post } from "../../../models/Post/types";
import ClickableButton from "../Button/Button";
import Icon, {
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { SummaryBoxContext } from "../../widgets/dialogBoxes/dialogBoxSummary";
import "./selected_style.css";
import dayjs from "dayjs";
import { subscribe, unsubscribe } from "../../logic/event";

const { Text } = Typography;

interface PostProps {
  post: Post;
  onCommentClick: (postId: string) => void;
}

const PostComponent: React.FC<PostProps> = ({ post, onCommentClick }) => {
  const {
    CreatedAt,
    userID,
    Text: postText,
    Attachments,
    PubDate,
    Platforms,
    ID: id,
  } = post;

  const context = useContext(SummaryBoxContext);

  const refer = useRef<HTMLDivElement>(null);

  const formatPubDate = dayjs(PubDate).format("DD.MM.YYYY HH:mm");

  const onCommentSummary = async () => {
    context.setActive(true);
    context.setPostID(id); //!!!!! Здесь задается id поста
  };

  const PostSelected = async (event: any) => {
    console.log(event.detail);
    if (id === event.detail["id"] && refer.current) {
      refer.current.scrollIntoView({ behavior: "smooth" });
      refer.current.className += " selected";
      await setTimeout(() => {
        if (refer.current)
          refer.current.className = refer.current.className.replace(
            " selected",
            ""
          );
      }, 3000);
    }
  };

  useEffect(() => {
    subscribe("PostSelected", PostSelected);

    return () => {
      unsubscribe("PostSelected", PostSelected);
    };
  }, []);

  return (
    <div ref={refer} className={styles["post"]}>
      {/* хедер*/}
      <div className={styles["post-header"]}>
        <div className={styles["post-header-info"]}>
          <div className={styles["post-header-info-text"]}>
            <Text strong>Модератор {userID}</Text>
            <Text type="secondary" className={styles["post-time"]}>
              {formatPubDate}
            </Text>
            <Text type="secondary"> | {Platforms}</Text>
          </div>
        </div>
        <div className={styles["post-header-buttons"]}>
          <ClickableButton
            text="Комментарии"
            type="link"
            icon={<CommentOutlined />}
            onButtonClick={() => {
              onCommentClick(id);
            }}
          />
          <ClickableButton
            text="Суммаризация"
            variant="dashed"
            color="primary"
            onButtonClick={onCommentSummary}
          />
        </div>
      </div>
      <Divider className={styles.customDivider} />
      <div className={styles["post-content"]}>
        <div className={styles["post-content-text"]}>
          <Text>{postText}</Text>
        </div>
        <div className={styles["post-content-attachments"]}>
          {Attachments.map((attachment, index) => (
            <div className={styles["post-content-attachment"]} key={index}>
              <Icon component={PaperClipOutlined} />
              <Text className={styles.primaryText}>{attachment}</Text>
            </div>
          ))}
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
