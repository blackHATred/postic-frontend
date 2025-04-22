import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Comment, Comments } from '../models/Comment/types';
import { RootState } from './store';
import dayjs from 'dayjs';
import {
  CommentWithChildren,
  createCommentTree,
} from '../components/lists/CommentList/commentTree';

function flat(r: any, a: any) {
  const b: any = {};
  Object.keys(a).forEach(function (k) {
    if (k !== 'children') {
      b[k] = a[k];
    }
  });
  r.push(b);
  if (Array.isArray(a.children)) {
    return a.children.reduce(flat, r);
  }
  return r;
}

interface basicDialogState {
  isOpen: boolean;
}

export interface CommentSliceState {
  comments: Comments;
  answerDialog: basicDialogState;
  selectedComment: Comment | null;
}

// Define the initial state using that type
const initialState: CommentSliceState = {
  comments: { comments: [], status: '' },
  answerDialog: { isOpen: false },
  selectedComment: null,
};

export const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setAnswerDialog: (state, action: PayloadAction<boolean>) => {
      state.answerDialog.isOpen = action.payload;
    },
    setSelectedComment: (state, action: PayloadAction<Comment>) => {
      state.selectedComment = action.payload;
    },
    setComments: (state, action: PayloadAction<CommentWithChildren[]>) => {
      state.comments.comments = action.payload ? action.payload : [];
    },

    addComment: (state, action: PayloadAction<Comment>) => {
      const el: any = [];

      state.comments.comments.reduce(flat, el);
      if (action.payload.reply_to_comment_id) {
        if (el.filter((el: any) => el.id == action.payload.reply_to_comment_id).length > 0) {
          el.push(action.payload);
        }
      } else {
        el.push(action.payload);
      }
      state.comments.comments = createCommentTree(el);
    },
  },
});

// Action creators are generated for each case reducer function
export const { setComments, setAnswerDialog, setSelectedComment, addComment } =
  commentsSlice.actions;

export const getCommentsFromStore = (state: RootState) => state.comments.comments;

export const getLastDate = (state: RootState) => {
  if (state.comments.comments.comments && state.comments.comments.comments.length > 0)
    return state.comments.comments.comments[0].created_at;
  return dayjs().format();
};

export default commentsSlice.reducer;
