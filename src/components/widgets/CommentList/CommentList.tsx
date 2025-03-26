import React, { useContext, useEffect, useState } from "react";
import { List, Spin, Button } from "antd";
import CommentComponent from "../../ui/Comment/Comment";
import { Comment, mockComments } from "../../../models/Comment/types";
import styles from "./styles.module.scss";
import { CommentListContext, WebSocketContext } from "../../../api/comments";

interface CommentListProps {
  isLoading?: boolean;
  postId: string | null;
}

const unloadedComment: Comment = {
  id: 0,
  post_tg_id: 0,
  comment_id: 0,
  user_id: 0,
  user: {
    id: 0,
    username: "Loading...",
    first_name: "Loading...",
    last_name: "Loading...",
    photo_file_id: "",
  },
  text: "Загрузка...",
  created_at: "0000-00-00 00:00:00",
  attachments: [
    {
      id: 0,
      comment_id: 0,
      file_type: "unknown",
      file_id: "",
      RawBytes: null,
    },
  ],
};

const CommentList: React.FC<CommentListProps> = (props: CommentListProps) => {
  const webSocketmanager = useContext(WebSocketContext);
  const commentManager = useContext(CommentListContext);
  const requestSize = 1; // комменты

  const [loading, setLoading] = useState(false);

  const filteredComments = props.postId
    ? commentManager.comments.filter(
        (comment) => comment.id === Number(props.postId)
      )
    : commentManager.comments;

  useEffect(() => {
    if (webSocketmanager.lastJsonMessage != null) {
      try {
        const newComment = JSON.parse(webSocketmanager.lastJsonMessage); // Парсим JSON

        console.log("Новый комментарий:", newComment);

        if (
          newComment &&
          newComment.type &&
          newComment.username &&
          newComment.text
        ) {
          commentManager.setComments((prev) => [...prev, newComment]);
        } else {
          console.error("Получен некорректный комментарий:", newComment);
        }
      } catch (error) {
        console.error("Ошибка при парсинге JSON:", error);
      }
    }
  }, [webSocketmanager.lastJsonMessage]);

  const onLoadMore = () => {
    setLoading(true);
    const newData = commentManager.comments.concat(
      {
        id: 11,
        post_tg_id: 1,
        comment_id: 1,
        user_id: 1,
        user: {
          id: 1,
          username: "john_doe",
          first_name: "John",
          last_name: "Doe",
          photo_file_id: "",
        },
        text: "This is a sample comment.",
        created_at: "2025-03-15T10:00:00Z",
        attachments: [],
      },
      {
        id: 12,
        post_tg_id: 1,
        comment_id: 2,
        user_id: 2,
        user: {
          id: 2,
          username: "jane_smith",
          first_name: "Jane",
          last_name: "Smith",
          photo_file_id: "",
        },
        text: "This is a reply to the sample comment.",
        created_at: "2025-03-15T10:05:00Z",
        attachments: [],
      }
    );
    commentManager.setComments(newData);
    setLoading(false);
    window.dispatchEvent(new Event("resize"));
    // fetch(fakeDataUrl)
    //   .then((res) => res.json())
    //   .then((res) => {
    //     const newData = data.concat(res.results);
    //     setList(newData);
    //     setLoading(false);
    //     // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
    //     // In real scene, you can using public method of react-virtualized:
    //     // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
    //     window.dispatchEvent(new Event('resize'));
    //   });
  };

  const loadMore = !loading ? (
    <div
      style={{
        textAlign: "center",
        marginTop: 12,
        height: 32,
        lineHeight: "32px",
      }}
    >
      <Button onClick={onLoadMore}>Больше</Button>
    </div>
  ) : null;

  return (
    <div className={styles.commentListContainer} title="Комментарии">
      {props.isLoading && (
        <div className={styles.spinnerContainer}>
          <Spin />
        </div>
      )}

      <div className={styles.commentList}>
        <List
          dataSource={filteredComments}
          loadMore={loadMore}
          renderItem={(comment) => (
            <List.Item>
              <CommentComponent comment={comment} />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default CommentList;
