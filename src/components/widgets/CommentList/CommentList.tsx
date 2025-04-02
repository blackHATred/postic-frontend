import React, { useContext, useEffect, useState } from "react";
import { List, Spin, Button } from "antd";
import CommentComponent from "../../ui/Comment/Comment";
import { Comment } from "../../../models/Comment/types";
import styles from "./styles.module.scss";
import { WebSocketContext } from "../../../api/WebSocket";
import { ReadyState } from "react-use-websocket";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  addComment,
  addComments,
  getComments,
  getLastDate,
} from "../../../stores/commentSlice";

interface CommentListProps {
  isLoading?: boolean;
  postId: string | null;
}

const CommentList: React.FC<CommentListProps> = (props: CommentListProps) => {
  const webSocketManager = useContext(WebSocketContext);
  const comments_store = useAppSelector(getComments);
  const last_date = useAppSelector(getLastDate);
  const dispatch = useAppDispatch();
  const requestSize = 20; // комменты

  const filteredComments = props.postId
    ? comments_store.filter(
        (comment) => comment.post_union_id === Number(props.postId)
      )
    : comments_store; //WARNING: CURRENTLY NOT FILTERING PROPERLY

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (webSocketManager.lastJsonMessage) {
      const recievedJSON = JSON.parse(webSocketManager.lastJsonMessage.data); // Парсим JSON

      if (recievedJSON.hasOwnProperty("comments")) {
        //recieved multiple comments
        const comments = recievedJSON.comments as Comment[];
        if (comments != null) {
          dispatch(addComments(comments));
          setLoading(false);
          return;
        }
      } else {
        //NOTE: recieved one comment
        const comment = recievedJSON as Comment; // recieve comment
        dispatch(addComment(comment));
        setLoading(false);
      }
    }
  }, [webSocketManager.lastJsonMessage]);

  useEffect(() => {
    if (props.postId !== "" && filteredComments.length < requestSize) {
      if (webSocketManager.readyState === ReadyState.OPEN) {
        webSocketManager.sendJsonMessage({
          type: "get_comments",
          get_comments: {
            post_union_id: props.postId,
            offset: "2020-03-26T13:55:57+03:00",
            max_count: requestSize,
          },
        });
      }
    }
  }, []);

  const onLoadMore = () => {
    setLoading(true);
    webSocketManager.sendJsonMessage({
      type: "get_comments",
      get_comments: {
        post_union_id: props.postId ? props.postId : 0,
        offset: last_date,
        max_count: requestSize,
      },
    });
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
