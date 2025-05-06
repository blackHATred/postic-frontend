import { configureStore } from '@reduxjs/toolkit';
import commentsReducer from './commentSlice';
import postsReducer from './postsSlice';
import basePageDialogsReducer from './basePageDialogsSlice';
import teamsReducer from './teamSlice';
import settingsReducer from './settingsSlice';
import analyticsReducer from './analyticsSlice';
// ...

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    comments: commentsReducer,
    basePageDialogs: basePageDialogsReducer,
    teams: teamsReducer,
    settings: settingsReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['basePageDialogs/addFile', 'basePageDialogs/removeFile'],
      },
    }),
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
