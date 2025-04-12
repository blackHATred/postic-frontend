import React, { useContext, useEffect, useState } from "react";
import { Button, Empty, Typography } from "antd";
import CommentComponent from "../../ui/Comment/Comment";
import { Comment } from "../../../models/Comment/types";
import styles from "./styles.module.scss";
import { WebSocketContext } from "../../../api/WebSocket";
import { ReadyState } from "react-use-websocket";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  addComment,
  addComments,
  getCommentsFromStore,
  getLastDate,
  setComments,
} from "../../../stores/commentSlice";
import RowVirtualizerDynamic from "../../ui/stickyScroll/InfiniteScroll";
import dayjs from "dayjs";
import { getComments } from "../../../api/api";

const CommentList: React.FC = () => {
  const webSocketManager = useContext(WebSocketContext);
  const comments = useAppSelector(getCommentsFromStore);
  const last_date = useAppSelector(getLastDate);
  const dispatch = useAppDispatch();
  const requestSize = 20; // комменты
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const filteredComments = comments.comments
    ? selectedPostId !== 0
      ? comments.comments.filter(
          (comment) => comment.post_union_id === Number(selectedPostId)
        )
      : comments.comments
    : []; //WARNING: CURRENTLY NOT FILTERING PROPERLY
  const selectedteamid = useAppSelector(
    (state) => state.teams.globalActiveTeamId
  );

  useEffect(() => {
    const union_id = selectedPostId ? Number(selectedPostId) : 0;
    const limit = 10;

    if (filteredComments.length < requestSize)
      getComments(selectedteamid, union_id, limit, last_date).then((val) =>
        dispatch(setComments(val.comments))
      );
  }, []);

  return (
    <div className={styles.commentListContainer}>
      {filteredComments.length > 0 && (
        <RowVirtualizerDynamic
          object={[...filteredComments].reverse().map((comment) => {
            return <CommentComponent comment={comment} />;
          })}
          getNewData={() => new Promise(() => [])}
          addData={() => {}}
          doSmoothScroll={false}
          smoothScrollTarget={0}
          scrollAmount={filteredComments.length}
          setScroll={(scroll: number) => {}}
        />
      )}
      {filteredComments.length === 0 && (
        <Empty
          styles={{ image: { height: 60 }, root: { paddingTop: 25 } }}
          description={<Typography.Text>Нету комментариев</Typography.Text>}
        ></Empty>
      )}
    </div>
  );
};

export default CommentList;
