import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Comment, Comments } from '../models/Comment/types';
import { RootState } from './store';
import dayjs from 'dayjs';

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
    addComment: (state, action: PayloadAction<Comment>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      if (
        (console.log('Получен новый комментарий через SSE: ', action.payload),
        state.comments.comments &&
          !state.comments.comments.some((el) => el.id === action.payload.id))
      ) {
        state.comments.comments = [action.payload, ...state.comments.comments];
      } else {
        state.comments.comments = [action.payload];
      }
    },
    addComments: (state, action: PayloadAction<Comment[]>) => {
      console.log(action.payload);
      const to_add: Comment[] = [];
      action.payload.forEach((element) => {
        if (!state.comments.comments.some((comment) => comment.id === element.id)) {
          to_add.push(element);
        }
      });
      state.comments.comments = [...to_add, ...state.comments.comments];
    },
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments.comments = action.payload ? action.payload : [];
    },
  },
});

// Action creators are generated for each case reducer function
export const { addComment, addComments, setComments, setAnswerDialog, setSelectedComment } =
  commentsSlice.actions;

export const getCommentsFromStore = (state: RootState) => state.comments.comments;

export const getLastDate = (state: RootState) => {
  if (state.comments.comments.comments && state.comments.comments.comments.length > 0)
    return state.comments.comments.comments[0].created_at;
  return dayjs().format();
};

export default commentsSlice.reducer;
