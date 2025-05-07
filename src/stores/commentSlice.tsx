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

function flat_id(r: any, a: any) {
  r.push(a.id);
  if (Array.isArray(a.children)) {
    return a.children.reduce(flat_id, r);
  }
  return r;
}

interface basicDialogState {
  isOpen: boolean;
  files: string[];
}

export type TicketFilter = '' | 'done' | 'not_done';

export interface CommentSliceState {
  comments: Comments;
  answerDialog: basicDialogState;
  selectedComment: Comment | null;
  ticketFilter: TicketFilter;
}

// Define the initial state using that type
const initialState: CommentSliceState = {
  comments: { comments: [], status: '' },
  answerDialog: { isOpen: false, files: [] },
  selectedComment: null,
  ticketFilter: 'not_done',
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

    removeComment: (state, action: PayloadAction<CommentWithChildren[]>) => {
      const el1: any = [];

      state.comments.comments.reduce(flat, el1);

      const el2: any = [];

      action.payload.reduce(flat_id, el2);

      state.comments.comments = createCommentTree(
        el1.filter((el: any) => {
          return !el2.includes(el.id);
        }),
      );
    },
    setTicketFilter: (state, action: PayloadAction<TicketFilter>) => {
      state.ticketFilter = action.payload;
    },

    addFileComm: (state, action: PayloadAction<string>) => {
      state.answerDialog.files.push(action.payload);
    },
    removeFileComm: (state, action: PayloadAction<string>) => {
      state.answerDialog.files = state.answerDialog.files.filter((f) => f !== action.payload);
    },
    clearFilesComm: (state) => {
      state.answerDialog.files = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setComments,
  setAnswerDialog,
  setSelectedComment,
  addComment,
  removeComment,
  setTicketFilter,
  addFileComm,
  removeFileComm,
  clearFilesComm,
} = commentsSlice.actions;

export const getCommentsFromStore = (state: RootState) => state.comments.comments;

export const getLastDate = (state: RootState) => {
  if (state.comments.comments.comments && state.comments.comments.comments.length > 0)
    return state.comments.comments.comments[0].created_at;
  return dayjs().format();
};

export default commentsSlice.reducer;
