import React, { useContext, useEffect, useState } from "react";
import { List, Spin, Button } from "antd";
import CommentComponent from "../../ui/comment/Comment";
import { Comment, mockComments } from "../../../models/Comment/types";
import styles from "./styles.module.scss";
import { WebSocketContext } from "../../../api/comments";

interface CommentListProps {
  isLoading?: boolean;
  postId: string | null;
}

const CommentList: React.FC<CommentListProps> = (props: CommentListProps) => {
   const webSocketmanager = useContext(WebSocketContext);
   const [comments, setComments] = useState<Comment[]>(mockComments);
   const pageSize = 5; // комменты
   const [currentPage, setCurrentPage] = useState<number>(1);

   const filteredComments = props.postId ? comments.filter((comment) => comment.postId === props.postId) : comments;
   
    const paginatedComments = filteredComments.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

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
      {props.isLoading && (
        <div className={styles.spinnerContainer}>
          <Spin />
        </div>
      )}

      <div className={styles.commentList}>
        <List
          dataSource={paginatedComments}
          renderItem={(comment) => (
            <List.Item>
              <CommentComponent comment={comment} />
            </List.Item>
          )}
        />
      </div>

      {filteredComments.length > currentPage * pageSize && (
        <div className={styles.spinnerContainer}>
          <Button onClick={() => setCurrentPage(currentPage + 1)}>Загрузить еще</Button>
        </div>
      )}
    </div>
  );
};

export default CommentList;
