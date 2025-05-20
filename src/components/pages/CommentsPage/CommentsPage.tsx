import React from 'react';
import CommentList from '../../lists/CommentList/CommentList';
import { addComment, removeComment, setComments } from '../../../stores/commentSlice';

const CommentsPage: React.FC = () => {
  return (
    <CommentList
      get_func={(state) => state.comments.comments}
      set_func={setComments}
      add_func={addComment}
      remove_func={removeComment}
    />
  );
};

export default CommentsPage;
