import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { Post } from '../models/Post/types';

export interface PostSliceState {
  posts: Post[];
  scheduled_posts: Post[];
  isOpened: { [key: number]: boolean };
  selectedPostId: number;
  scrollToPost: boolean;
  postsScroll: number;
}

// Define the initial state using that type
const initialState: PostSliceState = {
  posts: [],
  scheduled_posts: [],
  isOpened: {},
  selectedPostId: 0,
  scrollToPost: false,
  postsScroll: 10000,
};

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSelectedPostId: (state, action: PayloadAction<number>) => {
      state.selectedPostId = action.payload;
    },

    setScrollToPost: (state, action: PayloadAction<boolean>) => {
      state.scrollToPost = action.payload;
    },

    setScheduledPosts: (state, action: PayloadAction<Post[]>) => {
      state.scheduled_posts = action.payload;
    },

    addScheduledPost: (state, action: PayloadAction<Post>) => {
      state.scheduled_posts = [action.payload, ...state.scheduled_posts];
    },

    addScheduledPosts: (state, action: PayloadAction<Post[]>) => {
      state.scheduled_posts = [...action.payload, ...state.scheduled_posts];
    },
    // редюсер для удаления отложенного поста
    removeScheduledPost: (state, action: PayloadAction<number>) => {
      state.scheduled_posts = state.scheduled_posts.filter((post) => post.id !== action.payload);
    },

    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },

    setIsOpened(state, action: PayloadAction<{ key: number; value: boolean }>) {
      state.isOpened[action.payload.key] = action.payload.value;
    },

    addPost: (state, action: PayloadAction<Post>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.posts = [action.payload, ...state.posts];
    },
    addPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = [...action.payload, ...state.posts];
    },

    setPostsScroll: (state, action: PayloadAction<number>) => {
      state.postsScroll = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setSelectedPostId,
  setScrollToPost,
  addPost,
  addScheduledPost,
  addPosts,
  addScheduledPosts,
  setPosts,
  setScheduledPosts,
  setPostsScroll,
  setIsOpened,
  removeScheduledPost,
} = postsSlice.actions;

export const getPostsStore = (state: RootState) => state.posts.posts;

export default postsSlice.reducer;
