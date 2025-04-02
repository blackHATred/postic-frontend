import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Comment } from "../models/Comment/types";
import { RootState } from "./store";

export interface CounterState {
  comments: Comment[];
}

// Define the initial state using that type
const initialState: CounterState = {
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
    },
    addComments: (state, action: PayloadAction<Comment[]>) => {
      let modif = false;
      action.payload.forEach((element) => {
        if (!state.comments.some((comment) => comment.id === element.id)) {
          modif = true;
          state.comments.push(element);
        }
      });
      if (modif) {
        state.comments.sort(
          (a, b) => a.created_at.unix() - b.created_at.unix()
        );
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { addComment, addComments } = commentsSlice.actions;

export const getComments = (post_id: string | null) => (state: RootState) => {
  return post_id
    ? state.comments.comments.filter(
        (comment) => comment.post_union_id === Number(post_id)
      )
    : state.comments.comments;
};

export const getLastDate = (state: RootState) => {
  return state.comments.comments[state.comments.comments.length - 1];
};

export default commentsSlice.reducer;
