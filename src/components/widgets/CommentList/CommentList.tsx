import React, { useContext, useEffect, useState } from "react";
import { List, Spin, Button } from "antd";
import CommentComponent from "../../ui/Comment/Comment";
import { Comment, mockComments } from "../../../models/Comment/types";
import styles from "./styles.module.scss";
import { CommentListContext, WebSocketContext } from "../../../api/comments";
import { ReadyState } from "react-use-websocket";
import dayjs from "dayjs"

interface CommentListProps {
  isLoading?: boolean;
  postId: string | null;
}

const unloadedComment: Comment = {
  id: 0,
  post_union_id: 0,
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
  created_at: dayjs("0000-00-00 00:00:00"),
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
  const requestSize = 20; // комменты

  const [loading, setLoading] = useState(false);

  const filteredComments = props.postId
    ? commentManager.comments.filter(
        (comment) => comment.post_union_id === Number(props.postId)
      )
    : commentManager.comments;

  useEffect(() => {
    if (webSocketmanager.lastJsonMessage) {
        const recievedJSON = JSON.parse(webSocketmanager.lastJsonMessage.data); // Парсим JSON

        if (recievedJSON.hasOwnProperty("comments")){ //recieved multiple comments
          console.log("Comments" + JSON.stringify(recievedJSON))

          const comments = recievedJSON.comments as Comment[]; // recieve comments

          if (comments == null){
            console.log("Комментариев 0");
            return;
          }

          let comm: Comment[] = [];
          comments.forEach((element) => {
            if (
              !commentManager.comments.some(
                (comment) => comment.id === element.id
              )
            ) {
              
              comm.push(element);
              
            }
          });
          console.log(comm);
          commentManager.setComments((prev) => [...prev, ...comm]);
          setLoading(false)
          return
        }else{ //recieved one comment
          console.log("comment" + JSON.stringify(recievedJSON))

          const comment = recievedJSON as Comment; // recieve comment
          if (!commentManager.comments.some(
            (el) => el.id === comment.id
          )) {
            
            commentManager.setComments((prev) => [...prev, comment]);
            
          }
          setLoading(false)
        }
    }
        
  }, [webSocketmanager.lastJsonMessage]);

  useEffect(() => {
      if (props.postId != "" && filteredComments.length < requestSize){
        if (webSocketmanager.readyState == ReadyState.OPEN) {
          webSocketmanager.sendJsonMessage({
            type: "get_comments",
            get_comments: {
              post_union_id:  props.postId,
              offset: "2020-03-26T13:55:57+03:00",
              max_count : requestSize
            },
          });
        }
      }
    }, []);

  const onLoadMore = () => {
    setLoading(true);
    webSocketmanager.sendJsonMessage({
      type: "get_comments",
      get_comments: {
        post_union_id: props.postId ? props.postId : 0,
        offset: "2020-03-26T13:55:57+03:00",
        max_count : requestSize
      },
    });
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
