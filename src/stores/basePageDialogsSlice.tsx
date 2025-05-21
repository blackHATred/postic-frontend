import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface basicDialogState {
  isOpen: boolean;
}

interface summaryDialogState extends basicDialogState {
  isLoading: boolean;
}

interface createPostDialogState extends basicDialogState {
  files: string[];
}

export interface basePageDialogsSliceState {
  apiBoxDialog: basicDialogState;
  summaryDialog: summaryDialogState;
  createPostDialog: createPostDialogState;
  postStatusDialog: basicDialogState;
  personalInfoDialog: basicDialogState;
  activeTab: string;
  registerEmailDialog: basicDialogState;
  loginEmailDialog: basicDialogState;
  helpDialog: basicDialogState;
  editPostDialog: {
    isOpen: boolean;
    postId: number | null;
    teamId: number | null;
  };
  scrollToTop: boolean;
}

const initialState: basePageDialogsSliceState = {
  apiBoxDialog: { isOpen: false },
  summaryDialog: { isOpen: false, isLoading: false },
  createPostDialog: { isOpen: false, files: [] },
  postStatusDialog: { isOpen: false },
  personalInfoDialog: { isOpen: false },
  activeTab: '1',
  registerEmailDialog: { isOpen: false },
  loginEmailDialog: { isOpen: false },
  helpDialog: { isOpen: false },
  editPostDialog: {
    isOpen: false,
    postId: null,
    teamId: null,
  },
  scrollToTop: false,
};

export const basePageDialogsSlice = createSlice({
  name: 'basePageDialogs',
  initialState,
  reducers: {
    setApiBoxDialog: (state, action: PayloadAction<boolean>) => {
      state.apiBoxDialog.isOpen = action.payload;
    },

    setSummaryDialog: (state, action: PayloadAction<boolean>) => {
      state.summaryDialog.isOpen = action.payload;
    },
    setSummaryLoading: (state, action: PayloadAction<boolean>) => {
      state.summaryDialog.isLoading = action.payload;
    },

    setCreatePostDialog: (state, action: PayloadAction<boolean>) => {
      state.createPostDialog.isOpen = action.payload;
    },

    setPostStatusDialog: (state, action: PayloadAction<boolean>) => {
      state.postStatusDialog.isOpen = action.payload;
    },

    setPersonalInfoDialog: (state, action: PayloadAction<boolean>) => {
      state.personalInfoDialog.isOpen = action.payload;
    },

    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },

    addFile: (state, action: PayloadAction<string>) => {
      state.createPostDialog.files.push(action.payload);
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.createPostDialog.files = state.createPostDialog.files.filter(
        (f) => f !== action.payload,
      );
    },
    clearFiles: (state) => {
      state.createPostDialog.files = [];
    },
    setRegisterEmailDialog: (state, action: PayloadAction<boolean>) => {
      state.registerEmailDialog.isOpen = action.payload;
    },
    setLoginEmailDialog: (state, action: PayloadAction<boolean>) => {
      state.loginEmailDialog.isOpen = action.payload;
    },
    setHelpDialog: (state, action: PayloadAction<boolean>) => {
      state.helpDialog.isOpen = action.payload;
    },
    setEditPostDialog: (
      state,
      action: PayloadAction<{ isOpen: boolean; postId: number | null; teamId: number | null }>,
    ) => {
      state.editPostDialog.isOpen = action.payload.isOpen;
      state.editPostDialog.postId = action.payload.postId;
      state.editPostDialog.teamId = action.payload.teamId;
    },

    setScrollToTop: (state, action: PayloadAction<boolean>) => {
      state.scrollToTop = action.payload;
    },
  },
});

export const {
  setCreatePostDialog,
  setPersonalInfoDialog,
  setPostStatusDialog,
  setSummaryDialog,
  setApiBoxDialog,
  setSummaryLoading,
  setActiveTab,
  addFile,
  removeFile,
  clearFiles,
  setRegisterEmailDialog,
  setLoginEmailDialog,
  setHelpDialog,
  setEditPostDialog,
  setScrollToTop,
} = basePageDialogsSlice.actions;

export default basePageDialogsSlice.reducer;
