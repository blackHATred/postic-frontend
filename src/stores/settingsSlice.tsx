import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface settingsSliceState {
  helpMode: boolean;
  darkMode: boolean;
}

const loadHelpModeFromStorage = (): boolean => {
  try {
    const savedHelpMode = localStorage.getItem('helpMode');
    if (savedHelpMode !== null) {
      return savedHelpMode === 'true';
    }
  } catch (error) {
    console.error('Ошибка при чтении из localStorage:', error);
  }
  return true;
};

const loadDarkModeFromStorage = (): boolean => {
  try {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDarkMode = savedDarkMode === 'true';
      if (isDarkMode) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
      return isDarkMode;
    }
  } catch (error) {
    console.error('Ошибка при чтении из localStorage:', error);
  }
  return false;
};

const initialState: settingsSliceState = {
  helpMode: loadHelpModeFromStorage(),
  darkMode: loadDarkModeFromStorage(),
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setHelpMode: (state, action: PayloadAction<boolean>) => {
      state.helpMode = action.payload;
      try {
        localStorage.setItem('helpMode', action.payload.toString());
      } catch (error) {
        console.error('Ошибка при сохранении в localStorage:', error);
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      try {
        localStorage.setItem('darkMode', action.payload.toString());
        if (action.payload) {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
      } catch (error) {
        console.error('Ошибка при сохранении в localStorage:', error);
      }
    },
  },
});

export const { setHelpMode, setDarkMode } = settingsSlice.actions;

export const getSettingsFromStore = (state: RootState) => state.teams.teams;

export default settingsSlice.reducer;
