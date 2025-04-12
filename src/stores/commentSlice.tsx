import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Comment } from "../models/Comment/types";
import { RootState } from "./store";
import dayjs from "dayjs";

interface basicDialogState {
  isOpen: boolean;
}

export interface CommentSliceState {
  comments: Comment[];
  answerDialog: basicDialogState;
  selectedComment: Comment | null;
}

// Define the initial state using that type
const initialState: CommentSliceState = {
  comments: [],
  answerDialog: { isOpen: false },
  selectedComment: null,
};

export const commentsSlice = createSlice({
  name: "comments",
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
        !state.comments.some(
          (el) => el.comment.id === action.payload.comment.id
        )
      ) {
        state.comments.push(action.payload);
        state.comments.sort(
          (a, b) =>
            dayjs(a.comment.created_at).unix() -
            dayjs(b.comment.created_at).unix()
        );
      }
    },
    addComments: (state, action: PayloadAction<Comment[]>) => {
      const modif = false;
      action.payload.forEach((element) => {
        if (
          !state.comments.some(
            (comment) => comment.comment.id === element.comment.id
          )
        ) {
          state.comments = [...state.comments, element];
        }
      });
      if (modif) {
        state.comments.sort(
          (a: Comment, b: Comment) =>
            dayjs(a.comment.created_at).unix() -
            dayjs(b.comment.created_at).unix()
        );
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { addComment, addComments, setAnswerDialog, setSelectedComment } =
  commentsSlice.actions;

export const getCommentsFromStore = (state: RootState) =>
  state.comments.comments;

export const getLastDate = (state: RootState) => {
  if (state.comments.comments.length > 0)
    return state.comments.comments[state.comments.comments.length - 1].comment
      .created_at;
  return 0;
};

export default commentsSlice.reducer;
