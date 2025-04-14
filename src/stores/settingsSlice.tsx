import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface settingsSliceState {
  helpMode: boolean;
}

const initialState: settingsSliceState = {
  helpMode: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setHelpMode: (state, action: PayloadAction<boolean>) => {
      state.helpMode = action.payload;
    },
  },
});

export const { setHelpMode } = settingsSlice.actions;

export const getSettingsFromStore = (state: RootState) => state.teams.teams;

export default settingsSlice.reducer;
