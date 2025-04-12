import React, { useEffect } from "react";
import styles from "./styles.module.scss";
import PostComponent from "../../ui/Post/Post";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  addPosts,
  getPostsStore,
  setPostsScroll,
  setScrollToPost,
} from "../../../stores/postsSlice";
import { Post } from "../../../models/Post/types";
import RowVirtualizerDynamic from "../../ui/stickyScroll/InfiniteScroll";
import { Empty, Typography } from "antd";
interface PostListProps {
  isLoading?: boolean;
  hasMore?: boolean;
}

const PostList: React.FC<PostListProps> = ({ isLoading, hasMore }) => {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(getPostsStore);
  const scrollToPost = useAppSelector((state) => state.posts.scrollToPost);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const scrollAmount = useAppSelector((state) => state.posts.postsScroll);

  useEffect(() => {
    dispatch(setScrollToPost(false));
  }, [scrollToPost]);

  const setScroll = (scroll: number) => {
    dispatch(setPostsScroll(scroll));
  };

  const getNewData = async () => {
    const new_data: Post[] = [];
    return new_data;
  };

  return (
    <div className={styles.postListContainer}>
      {posts.length > 0 && (
        <RowVirtualizerDynamic
          object={[...posts].reverse().map((post, index) => {
            return <PostComponent {...post} key={index} />;
          })}
          addData={(data) => {
            dispatch(addPosts(data));
          }}
          getNewData={getNewData}
          doSmoothScroll={scrollToPost}
          smoothScrollTarget={
            posts.length -
            posts.findIndex((post) => post.id === selectedPostId) -
            1
          }
          scrollAmount={scrollAmount}
          setScroll={(scroll) => setScroll(scroll)}
        />
      )}
      {posts.length === 0 && (
        <Empty
          styles={{ image: { height: 60 } }}
          description={<Typography.Text>Нету постов</Typography.Text>}
        ></Empty>
      )}
    </div>
  );
};

export default PostList;
