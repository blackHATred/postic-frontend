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
  welcomeDialog: basicDialogState;
  loginDialog: basicDialogState;
  registerDialog: basicDialogState;
  createPostDialog: createPostDialogState;
  postStatusDialog: basicDialogState;
  personalInfoDialog: basicDialogState;
  activeTab: string;
}

// Define the initial state using that type
const initialState: basePageDialogsSliceState = {
  apiBoxDialog: { isOpen: false },
  summaryDialog: { isOpen: false, isLoading: false },
  welcomeDialog: { isOpen: false },
  loginDialog: { isOpen: false },
  registerDialog: { isOpen: false },
  createPostDialog: { isOpen: false, files: [] },
  postStatusDialog: { isOpen: false },
  personalInfoDialog: { isOpen: false },
  activeTab: '1',
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

    setWelcomeDialog: (state, action: PayloadAction<boolean>) => {
      state.welcomeDialog.isOpen = action.payload;
    },

    setLoginDialog: (state, action: PayloadAction<boolean>) => {
      state.loginDialog.isOpen = action.payload;
    },

    setRegiserDialog: (state, action: PayloadAction<boolean>) => {
      state.registerDialog.isOpen = action.payload;
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
  },
});

// Action creators are generated for each case reducer function
export const {
  setCreatePostDialog,
  setLoginDialog,
  setPersonalInfoDialog,
  setPostStatusDialog,
  setRegiserDialog,
  setSummaryDialog,
  setWelcomeDialog,
  setApiBoxDialog,
  setSummaryLoading,
  setActiveTab,
  addFile,
  removeFile,
  clearFiles,
} = basePageDialogsSlice.actions;

export default basePageDialogsSlice.reducer;
