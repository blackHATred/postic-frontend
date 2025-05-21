import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { Post } from '../models/Post/types';

export type PostFilter = 'all' | 'published' | 'scheduled' | 'calendar';
export type ViewMode = 'list' | 'calendar';

export interface PostSliceState {
  posts: Post[];
  isOpened: { [key: number]: boolean };
  selectedPostId: number;
  postsScroll: number;
  activePostFilter: PostFilter;
  viewMode: ViewMode;
  calendarSelectedDate: string | null;
  calendarSelectedPosts: Post[];
}

// Define the initial state using that type
const initialState: PostSliceState = {
  posts: [],
  activePostFilter: 'all',
  isOpened: {},
  selectedPostId: 0,
  postsScroll: 0,
  viewMode: 'list',
  calendarSelectedDate: null,
  calendarSelectedPosts: [],
};

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSelectedPostId: (state, action: PayloadAction<number>) => {
      state.selectedPostId = action.payload;
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

    removePost: (state, action: PayloadAction<Post>) => {
      if (!Array.isArray(state.posts)) {
        state.posts = [];
      }
      state.posts = state.posts.filter((p) => p.id != action.payload.id);
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

    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
      if (action.payload !== 'calendar') {
        state.calendarSelectedDate = null;
        state.calendarSelectedPosts = [];
      }
    },

    setCalendarSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.calendarSelectedDate = action.payload;
    },

    setCalendarSelectedPosts: (state, action: PayloadAction<Post[]>) => {
      state.calendarSelectedPosts = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setSelectedPostId,
  addPost,
  removePost,
  addPosts,
  setPosts,
  setPostsScroll,
  setIsOpened,
  setActivePostFilter,
  setViewMode,
  setCalendarSelectedDate,
  setCalendarSelectedPosts,
} = postsSlice.actions;

export const getPostsStore = (state: RootState) => state.posts.posts;

export default postsSlice.reducer;
