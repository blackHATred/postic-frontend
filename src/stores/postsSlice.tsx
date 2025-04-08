import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { Post } from "../models/Post/types";

export interface PostSliceState {
  posts: Post[];
  selectedPostId: string;
  scrollToPost: boolean;
}

// Define the initial state using that type
const initialState: PostSliceState = {
  posts: [],
  selectedPostId: "",
  scrollToPost: false,
};

export const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setSelectedPostId: (state, action: PayloadAction<string>) => {
      state.selectedPostId = action.payload;
    },

    setScrollToPost: (state, action: PayloadAction<boolean>) => {
      state.scrollToPost = action.payload;
    },

    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },

    addPost: (state, action: PayloadAction<Post>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.posts.push(action.payload);
    },
    addPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = state.posts.concat(action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setSelectedPostId,
  setScrollToPost,
  addPost,
  addPosts,
  setPosts,
} = postsSlice.actions;

export const getPostsStore = (state: RootState) => state.posts.posts;

export default postsSlice.reducer;
