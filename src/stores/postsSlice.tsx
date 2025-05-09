import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { Post } from '../models/Post/types';

export type PostFilter = 'all' | 'published' | 'scheduled';

export interface PostSliceState {
  posts: Post[];
  scheduled_posts: Post[];
  isOpened: { [key: number]: boolean };
  selectedPostId: number;
  scrollToPost: boolean;
  postsScroll: number;
  activePostFilter: PostFilter;
}

// Define the initial state using that type
const initialState: PostSliceState = {
  posts: [],
  activePostFilter: 'all',
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

    addScheduledPost: (state, action: PayloadAction<Post>) => {
      state.scheduled_posts = [action.payload, ...state.scheduled_posts];
    },

    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },

    setIsOpened(state, action: PayloadAction<{ key: number; value: boolean }>) {
      state.isOpened[action.payload.key] = action.payload.value;
    },

    addPost: (state, action: PayloadAction<Post>) => {
      if (!Array.isArray(state.posts)) {
        state.posts = [];
      }
      state.posts = [action.payload, ...state.posts];
    },
    addPosts: (state, action: PayloadAction<Post[]>) => {
      if (!Array.isArray(state.posts)) {
        state.posts = [];
      }
      state.posts = [...action.payload, ...state.posts];
    },

    setPostsScroll: (state, action: PayloadAction<number>) => {
      state.postsScroll = action.payload;
    },

    setActivePostFilter: (state, action: PayloadAction<PostFilter>) => {
      state.activePostFilter = action.payload;
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
  setPosts,
  setPostsScroll,
  setIsOpened,
  setActivePostFilter,
} = postsSlice.actions;

export const getPostsStore = (state: RootState) => state.posts.posts;

export default postsSlice.reducer;
