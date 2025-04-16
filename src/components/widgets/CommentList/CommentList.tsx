import React, { useEffect } from 'react';
import { Empty, Typography } from 'antd';
import CommentComponent from '../../ui/Comment/Comment';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { addComment, addComments, getLastDate } from '../../../stores/commentSlice';
import RowVirtualizerDynamic from '../../ui/stickyScroll/InfiniteScroll';
import { getComment, getComments } from '../../../api/api';
import AuthenticatedSSE from '../../../api/SSE';
import { getSseUrl } from '../../../constants/appConfig';

const PureSSE = React.memo(AuthenticatedSSE);

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

  // Обработчик новых комментариев
  const newComment = (data: any) => {
    if (data.event == 'comment') {
      getComment(selectedteamid, JSON.parse(data.data).comment_id).then((data) => {
        dispatch(addComment(data.comment));
      });
    }
  };

  useEffect(() => {
    const union_id = selectedPostId ? Number(selectedPostId) : 0;
    console.log(last_date);
    if (filteredComments.length < requestSize)
      getComments(selectedteamid, union_id, requestSize, last_date).then((val) => {
        if (val.comments) dispatch(addComments(val.comments));
      });
  }, []);

  return (
    <div className={styles.commentListContainer}>
      {/* SSE подключение только когда активна вкладка комментариев */}
      {activeTab === '2' && <PureSSE url={url} onMessage={newComment} />}

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
