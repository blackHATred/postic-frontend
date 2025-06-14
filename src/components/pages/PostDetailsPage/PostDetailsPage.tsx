import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Empty, Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setSelectedPostId } from '../../../stores/postsSlice';
import styles from './styles.module.scss';
import PostDetailed from '../../cards/PostDetailed/PostDetailed';
import CommentList from '../../lists/CommentList/CommentList';
import { Post } from '../../../models/Post/types';
import { getPost } from '../../../api/api';
import {
  addPostComment,
  removePostComment,
  replacePostComment,
  setPostComments,
} from '../../../stores/commentSlice';

const PostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const posts = useAppSelector((state) => state.posts.posts);
  const team_id = useAppSelector((state) => state.teams.globalActiveTeamId);
  const [p, setP] = useState<Post | undefined>(posts.find((post) => post.id === Number(id)));
  const post: Post = p
    ? p
    : {
        id: 0,
        text: '',
        platforms: [],
        pub_datetime: '',
        attachments: [],
        created_at: 0,
        user_id: 0,
        team_id: 0,
      };
  const [isLoading, setIsLoading] = useState(false);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);

  useEffect(() => {
    if (id && team_id) {
      if (selectedPostId != +id) {
        dispatch(setSelectedPostId(+id));
      }
    }
    if (!p && id && team_id) {
      setIsLoading(true);
      getPost(team_id, +id)
        .then((p) => {
          setIsLoading(false);
          setP(p.post);
        })
        .catch(() => {
          setIsLoading(false);
          setP(undefined);
        });
    }
    return () => {
      dispatch(setSelectedPostId(0));
    };
  }, [dispatch, team_id]);

  return p ? (
    <div className={styles.detailsContainer}>
      <div className={styles.postSection}>
        <PostDetailed {...post} />
      </div>
      <div className={styles.commentsSection}>
        <CommentList
          key={'post_list'}
          get_func={(state) => state.comments.post_comments}
          set_func={setPostComments}
          add_func={addPostComment}
          remove_func={removePostComment}
          replace_func={replacePostComment}
        />
      </div>
    </div>
  ) : isLoading ? (
    <div className={styles.detailsContainer}>
      <Spin style={{ paddingTop: '20px' }}></Spin>
    </div>
  ) : (
    <Empty description='Пост не найден' />
  );
};

export default PostDetailsPage;
