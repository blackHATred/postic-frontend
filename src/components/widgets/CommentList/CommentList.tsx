import React from "react";
import { List, Spin } from "antd";
import CommentComponent from "../../ui/Comment/Comment";
import { Comment } from "../../../models/Comment/types";
import styles from "./styles.module.scss";

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <div className="comment-list">
      <Spin></Spin>
      <div className={styles.commentListContainer} title="Комментарии">
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
      </div>
      <Spin></Spin>
    </div>
  );
};

export default CommentList;
