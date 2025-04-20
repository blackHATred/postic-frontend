import React, { useEffect } from 'react';
import { Breadcrumb, Empty, Typography } from 'antd';
import CommentComponent from '../../ui/Comment/Comment';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { addComment, addComments, getLastDate } from '../../../stores/commentSlice';
import RowVirtualizerDynamic from '../../ui/stickyScroll/InfiniteScroll';
import { getComment, getComments } from '../../../api/api';
import { getSseUrl } from '../../../constants/appConfig';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import { setScrollToPost } from '../../../stores/postsSlice';
import { useAuthenticatedSSE } from '../../../api/newSSE';

const CommentList: React.FC = () => {
  //const comments = useAppSelector(getCommentsFromStore);
  const comments = useAppSelector((state) => state.comments.comments);
  const last_date = useAppSelector(getLastDate);
  const dispatch = useAppDispatch();
  const requestSize = 20; // комменты
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const filteredComments = comments.comments
    ? selectedPostId !== 0
      ? comments.comments.filter((comment) => comment.post_union_id === Number(selectedPostId))
      : comments.comments.filter((el) => el.post_union_id != null)
    : []; //WARNING: CURRENTLY NOT FILTERING PROPERLY
  const selectedteamid = useAppSelector((state) => state.teams.globalActiveTeamId);
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);

  const url = getSseUrl(selectedteamid, selectedPostId || 0);

  const newComment = (data: any) => {
    if (data.type == 'new') {
      getComment(selectedteamid, data.comment_id).then((data) => {
        dispatch(addComment(data.comment));
      });
    }
  };

  const { isConnected, close } = useAuthenticatedSSE({ url: url, onMessage: newComment });
  // Обработчик новых комментариев

  useEffect(() => {
    const union_id = selectedPostId ? Number(selectedPostId) : 0;
    console.log(last_date);

    if (filteredComments.length < requestSize) {
      getComments(selectedteamid, union_id, requestSize, last_date)
        .then((val) => {
          if (val.comments) {
            dispatch(addComments(val.comments));
          }
        })
        .catch((error) => {
          console.error('Ошибка при загрузке комментариев:', error.response?.data || error.message);
        });
    }
    return () => {
      close();
    };
  }, []);

  const handleBreadcrumbClick = () => {
    dispatch(setActiveTab('1'));
    dispatch(setScrollToPost(true));
  };

  return (
    <div className={styles.commentListContainer}>
      {selectedPostId != 0 && (
        <Breadcrumb className={styles['breadcrumb']}>
          <Breadcrumb.Item
            onClick={handleBreadcrumbClick}
            className={styles['breadcrumb-item-link']}
          >
            <a>{'Пост #' + selectedPostId}</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Комментарии</Breadcrumb.Item>
        </Breadcrumb>
      )}

      {filteredComments.length > 0 && (
        <RowVirtualizerDynamic
          object={[...filteredComments].reverse().map((comment) => {
            return <CommentComponent comment={comment} />;
          })}
          getNewData={() => new Promise(() => [])}
          doSmoothScroll={false}
          smoothScrollTarget={0}
          scrollAmount={filteredComments.length}
          addData={function (data: any[]): void {
            console.log('Объяви меня в CommentList');
          }}
          setScroll={function (scroll: number): void {
            console.log('Объяви меня в CommentList');
          }}
        />
      )}
      {filteredComments.length === 0 && (
        <Empty
          styles={{ image: { height: 60 }, root: { paddingTop: 25 } }}
          description={<Typography.Text>Нет комментариев</Typography.Text>}
        ></Empty>
      )}
    </div>
  );
};

export default CommentList;
