import React, { useContext, useEffect, useState } from "react";
import { List, Spin } from "antd";
import CommentComponent from "../../ui/comment/Comment";
import { Comment, mockComments } from "../../../models/Comment/types";
import styles from "./styles.module.scss";
import { WebSocketContext } from "../../../api/comments";

interface CommentListProps {
  isLoading?: boolean;
  hasMore?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({isLoading,hasMore,}) => {
   const webSocketmanager = useContext(WebSocketContext);
   const [comments, setComments] = useState<Comment[]>(mockComments);

  useEffect(() => {
    if (webSocketmanager.lastJsonMessage != null){
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
          setComments((prev) => [...prev, newComment]);
        } else {
          console.error("Получен некорректный комментарий:", newComment);
        }
      } catch (error) {
        console.error("Ошибка при парсинге JSON:", error);
      }
    }
    
  }, [webSocketmanager.lastJsonMessage])


  return (
    <div className={styles.commentListContainer} title="Комментарии">
      {isLoading && (
        <div className={styles.spinnerContainer}>
          <Spin />
        </div>
      )}

      <div className={styles.commentList}>
        <List
          dataSource={comments}
          renderItem={(comment) => (
            <List.Item>
              <CommentComponent comment={comment} />
            </List.Item>
          )}
        />
      </div>

      {hasMore && (
        <div className={styles.spinnerContainer}>
          <Spin />
        </div>
      )}
    </div>
  );
};

export default CommentList;
