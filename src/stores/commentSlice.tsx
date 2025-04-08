import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Comment } from "../models/Comment/types";
import { RootState } from "./store";
import dayjs from "dayjs";

export interface CommentSliceState {
  comments: Comment[];
}

// Define the initial state using that type
const initialState: CommentSliceState = {
  comments: [],
};

export const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    addComment: (state, action: PayloadAction<Comment>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      if (!state.comments.some((el) => el.id === action.payload.id)) {
        state.comments.push(action.payload);
        state.comments.sort(
          (a, b) => a.created_at.unix() - b.created_at.unix()
        );
      }
      console.log(state.comments);
    },
    addComments: (state, action: PayloadAction<Comment[]>) => {
      const modif = false;
      action.payload.forEach((element) => {
        if (!state.comments.some((comment) => comment.id === element.id)) {
          state.comments = [...state.comments, element];
        }
      });
      if (modif) {
        state.comments.sort(
          (a: Comment, b: Comment) =>
            dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
        );
      }
      console.log(state.comments);
    },
  },
});

// Action creators are generated for each case reducer function
export const { addComment, addComments } = commentsSlice.actions;

export const getCommentsFromStore = (state: RootState) =>
  state.comments.comments;

export const getLastDate = (state: RootState) => {
  if (state.comments.comments.length > 0)
    return state.comments.comments[state.comments.comments.length - 1]
      .created_at;
  return 0;
};

export default commentsSlice.reducer;
