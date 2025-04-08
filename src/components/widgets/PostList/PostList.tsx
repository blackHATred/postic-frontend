import React from "react";
import { List, Spin } from "antd";
import styles from "./styles.module.scss";
import PostComponent from "../../ui/Post/Post";
import { useAppSelector } from "../../../stores/hooks";
import { getPostsStore } from "../../../stores/postsSlice";

interface PostListProps {
  isLoading?: boolean;
  hasMore?: boolean;
}

const CommentList: React.FC<PostListProps> = ({ isLoading, hasMore }) => {
  const posts = useAppSelector(getPostsStore);
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
              <PostComponent {...post} />
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
