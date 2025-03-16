import React from "react";
import { List, Spin } from "antd";
import CommentComponent from "../../ui/comment/Comment";
import { Comment } from "../../../models/Comment/types";
import styles from "./styles.module.scss";

interface CommentListProps {
  comments: Comment[];
  isLoading?: boolean;
  hasMore?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  isLoading,
  hasMore,
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
          <Spin />
        </div>
      )}
    </div>
  );
};

export default CommentList;
