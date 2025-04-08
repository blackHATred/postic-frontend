import React, { useEffect, useRef, useState } from "react";
import { Space, Spin } from "antd";
import styles from "./styles.module.scss";
import PostComponent from "../../ui/Post/Post";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  addPosts,
  getPostsStore,
  setPosts,
  setPostsScroll,
  setScrollToPost,
} from "../../../stores/postsSlice";
import { mockPosts, Post } from "../../../models/Post/types";
import Example from "../../ui/stickyScroll/InfiniteScroll";
import RowVirtualizerDynamic from "../../ui/stickyScroll/InfiniteScroll";
import dayjs from "dayjs";
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

  const getNewData = () => {
    let mocks: Post[] = [];
    for (let i = 0; i < 50; i++) {
      const m = mockPosts.at(Math.random() * 3);
      if (m) mocks.push(m);
    }
    const new_data = mocks;
    // if first time return newQuotes else concate it
    dispatch(addPosts(new_data));
    return new_data.length;
  };

  return (
    <div className={styles.postListContainer}>
      {posts.length > 0 && (
        <RowVirtualizerDynamic
          object={posts.map((post, index) => {
            return <PostComponent {...post} key={index} />;
          })}
          getNewData={getNewData}
          doSmoothScroll={scrollToPost}
          smoothScrollTarget={posts.findIndex(
            (post) => post.ID === selectedPostId
          )}
          scrollAmount={scrollAmount}
          setScroll={(scroll) => setScroll(scroll)}
        />
      )}
    </div>
  );
};

export default PostList;
