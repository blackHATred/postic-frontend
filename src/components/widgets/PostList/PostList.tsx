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
import { mockPosts, Post } from "../../../models/Post/types";
import RowVirtualizerDynamic from "../../ui/stickyScroll/InfiniteScroll";
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
    const mocks: Post[] = [];
    for (let i = 0; i < 5; i++) {
      const m = mockPosts.at(Math.random() * 3);
      if (m) mocks.push(m);
    }
    // if first time return newQuotes else concate it
    await new Promise((res) => setTimeout(res, 1000));
    const new_data = mocks;
    return new_data;
  };

  return (
    <div className={styles.postListContainer}>
      {posts.length > 0 && (
        <RowVirtualizerDynamic
          object={posts.map((post, index) => {
            return <PostComponent {...post} key={index} />;
          })}
          addData={(data) => {
            dispatch(addPosts(data));
          }}
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
