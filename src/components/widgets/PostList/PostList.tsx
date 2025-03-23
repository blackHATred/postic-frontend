import React, { RefObject } from "react";
import { List, Spin } from "antd";
import styles from "./styles.module.scss";
import { Post } from "../../../models/Post/types";
import PostComponent from "../../ui/Post/Post";

interface PostListProps {
  posts: Post[];
  isLoading?: boolean;
  hasMore?: boolean;
  onCommentClick: (postId: string) => void;
}

const CommentList: React.FC<PostListProps> = ({
  posts,
  onCommentClick,
  isLoading,
  hasMore,
}) => {
  return (
    <div className={styles.postListContainer} title="Комментарии">
      {isLoading && (
        <div className={styles.spinnerContainer}>
          <Spin />
        </div>
      )}

      <div>
        <List
          dataSource={posts}
          renderItem={(post) => (
            <List.Item>
              <PostComponent post={post} onCommentClick={onCommentClick} />
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
