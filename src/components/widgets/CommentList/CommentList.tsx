import React, { useContext, useEffect, useState } from "react";
import { Button } from "antd";
import CommentComponent from "../../ui/Comment/Comment";
import { Comment, mockComments } from "../../../models/Comment/types";
import styles from "./styles.module.scss";
import { WebSocketContext } from "../../../api/WebSocket";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  addComment,
  addComments,
  getLastDate,
} from "../../../stores/commentSlice";
import RowVirtualizerDynamic from "../../ui/stickyScroll/InfiniteScroll";
import dayjs from "dayjs";
import { getComments } from "../../../api/api";

const CommentList: React.FC = () => {
  const webSocketManager = useContext(WebSocketContext);
  //const comments = useAppSelector(getCommentsFromStore);
  const comments = mockComments;
  const last_date = useAppSelector(getLastDate);
  const dispatch = useAppDispatch();
  const requestSize = 20; // комменты
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const filteredComments = selectedPostId
    ? comments.filter(
        (comment) => comment.comment.post_union_id === Number(selectedPostId)
      )
    : comments; //WARNING: CURRENTLY NOT FILTERING PROPERLY
  const selectedteamid = useAppSelector(
    (state) => state.teams.globalActiveTeamId
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (webSocketManager.lastJsonMessage) {
      const recievedJSON = JSON.parse(webSocketManager.lastJsonMessage.data); // Парсим JSON

      if (Object.prototype.hasOwnProperty.call(recievedJSON, "comments")) {
        // Обработка, если поле "comments" существует
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
    const union_id = selectedPostId ? Number(selectedPostId) : 0;
    const limit = 10;

    getComments(selectedteamid, union_id, limit, dayjs().format());
  }, []);

  const onLoadMore = () => {
    setLoading(true);
    webSocketManager.sendJsonMessage({
      type: "get_comments",
      get_comments: {
        post_union_id: selectedPostId ? selectedPostId : 0,
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
    <div className={styles.commentListContainer}>
      <RowVirtualizerDynamic
        object={filteredComments.map((comment) => {
          return <CommentComponent comment={comment} />;
        })}
        getNewData={() => new Promise(() => [])}
        addData={() => {}}
        doSmoothScroll={false}
        smoothScrollTarget={0}
        scrollAmount={0}
        setScroll={(scroll: number) => {}}
      />
    </div>
  );
};

export default CommentList;
