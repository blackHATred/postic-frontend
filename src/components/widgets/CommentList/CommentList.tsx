import React, { useContext, useEffect, useState } from "react";
import { List, Spin, Button } from "antd";
import CommentComponent from "../../ui/comment/Comment";
import { Comment, mockComments } from "../../../models/Comment/types";
import styles from "./styles.module.scss";
import { CommentListContext, WebSocketContext } from "../../../api/comments";

interface CommentListProps {
  isLoading?: boolean;
  postId: string | null;
}

const unloadedComment: Comment = {
  type: "",
  username: "",
  time: "",
  platform: "",
  avatarUrl: "",
  text: "",
};

const CommentList: React.FC<CommentListProps> = (props: CommentListProps) => {
  const webSocketmanager = useContext(WebSocketContext);
  const commentManager = useContext(CommentListContext);
  const requestSize = 1; // комменты

  const [loading, setLoading] = useState(false);

  const filteredComments = props.postId
    ? commentManager.comments.filter(
        (comment) => comment.postId === props.postId
      )
    : commentManager.comments;

  useEffect(() => {
    if (webSocketmanager.lastJsonMessage != null) {
      try {
        const newComment = JSON.parse(webSocketmanager.lastJsonMessage); // Парсим JSON

        console.log("Новый комментарий:", newComment);

        // Проверяем, что newComment соответствует интерфейсу Comment
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
        postId: "11",
        type: "comment",
        username: "john_doe",
        time: "2025-03-15T10:00:00Z",
        platform: "tg",
        avatarUrl:
          "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
        text: "This is a sample comment.",
        replyToUrl: "ляляля",
      },
      {
        type: "reply",
        postId: "22",
        username: "jane_smith",
        time: "2025-03-15T10:05:00Z",
        platform: "tg",
        avatarUrl: "https://example.com/avatars/jane_smith.png",
        text: "This is a reply to the sample comment.",
        replyToUrl: "https://example.com/comments/1",
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
