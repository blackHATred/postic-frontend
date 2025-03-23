import React from "react";
import { List, Spin, Button } from "antd";
import CommentComponent from "../../ui/Comment/Comment";
import { Comment } from "../../../models/Comment/types";
import styles from "./styles.module.scss";

interface CommentListProps {
  comments: Comment[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  isLoading,
  hasMore,
  onLoadMore,
}) => {
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
          <Button onClick={onLoadMore}>Загрузить еще</Button>
        </div>
      )}
    </div>
  );
};

export default CommentList;
