import React, { useEffect, useRef } from "react";
import { Divider, Typography } from "antd";
import styles from "./styles.module.scss";
import { Post } from "../../../models/Post/types";
import ClickableButton from "../Button/Button";
import Icon, {
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import "./selected_style.css";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  setActiveTab,
  setSummaryDialog,
} from "../../../stores/basePageDialogsSlice";
import { setScrollToPost, setSelectedPostId } from "../../../stores/postsSlice";

const { Text } = Typography;

const PostComponent: React.FC<Post> = (props: Post) => {
  const {
    CreatedAt,
    userID,
    Text: postText,
    Attachments,
    PubDate,
    Platforms,
    ID: id,
  } = props;

  const dispatch = useAppDispatch();
  const scrollToPost = useAppSelector((state) => state.posts.scrollToPost);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const refer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToPost && id === selectedPostId) {
      setSelected();
    }
  }, []);

  useEffect(() => {
    if (scrollToPost && id === selectedPostId) {
      setSelected();
    }
  }, [scrollToPost]);

  const setSelected = async () => {
    if (refer.current) {
      refer.current.scrollIntoView({ behavior: "smooth" });
      refer.current.className += " selected";
      await setTimeout(() => {
        if (refer.current)
          refer.current.className = refer.current.className.replace(
            " selected",
            ""
          );
      }, 3000);
      dispatch(setScrollToPost(false));
      dispatch(setSelectedPostId(""));
    }
  };

  const onCommentClick = () => {
    dispatch(setSelectedPostId(id));
    dispatch(setActiveTab("2"));
  };

  const onSummaryClick = async () => {
    // При нажатии кнопки суммаризации
    dispatch(setSummaryDialog(true));
    dispatch(setSelectedPostId(id));
  };

  return (
    <div ref={refer} className={styles["post"]}>
      {/* хедер*/}
      <div className={styles["post-header"]}>
        <div className={styles["post-header-info"]}>
          <div className={styles["post-header-info-text"]}>
            <Text strong>Модератор {userID}</Text>
            <Text type="secondary" className={styles["post-time"]}>
              {dayjs(PubDate).format("DD.MM.YYYY HH:mm")}
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
              onCommentClick();
            }}
          />
          <ClickableButton
            text="Суммаризация"
            variant="dashed"
            color="primary"
            onButtonClick={onSummaryClick}
          />
        </div>
      </div>
      <Divider className={styles.customDivider} />
      <div className={styles["post-content"]}>
        <div className={styles["post-content-text"]}>
          <Text>{postText}</Text>
        </div>
        <div className={styles["post-content-attachments"]}>
          {Attachments?.map((attachment, index) => (
            <div className={styles["post-content-attachment"]} key={index}>
              <Icon component={PaperClipOutlined} />
              <Text className={styles.primaryText}>{attachment.file_path}</Text>
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
