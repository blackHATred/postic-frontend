import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { Team } from '../models/Team/types';

interface basicDialogState {
  isOpen: boolean;
}
export interface ActivePlatform {
  platform: string;
  isLinked: boolean;
  name: string;
}

export interface teamSliceState {
  teams: Team[];
  selectedMemberId: number;
  selectedTeamId: number;
  currentUserId: number;
  globalActiveTeamId: number;
  addMemberDialog: basicDialogState;
  editMemberDialog: basicDialogState;
  createTeamDialog: basicDialogState;
  renameTeamDialog: basicDialogState;
  authorize_status: 'not_authorized' | 'loading' | 'authorized';
  platformsDialog: basicDialogState;
  selectedPlatform: string;
  globalActivePlatforms: ActivePlatform[];
}

const initialState: teamSliceState = {
  teams: [],
  selectedMemberId: 0,
  selectedTeamId: 0,
  currentUserId: 0,
  globalActiveTeamId: 0,
  addMemberDialog: { isOpen: false },
  editMemberDialog: { isOpen: false },
  createTeamDialog: { isOpen: false },
  renameTeamDialog: { isOpen: false },
  authorize_status: 'loading',
  platformsDialog: { isOpen: false },
  selectedPlatform: '',
  globalActivePlatforms: [],
};

export const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = action.payload;
    },

    setSelectedMemberId: (state, action: PayloadAction<number>) => {
      state.selectedMemberId = action.payload;
    },
    setSelectedTeamId: (state, action: PayloadAction<number>) => {
      state.selectedTeamId = action.payload;
    },
    setCurrentUserId: (state, action: PayloadAction<number>) => {
      state.currentUserId = action.payload;
    },
    setAddMemberDialog: (state, action: PayloadAction<boolean>) => {
      state.addMemberDialog.isOpen = action.payload;
    },
    setEditMemberDialog: (state, action: PayloadAction<boolean>) => {
      state.editMemberDialog.isOpen = action.payload;
    },
    setCreateTeamDialog: (state, action: PayloadAction<boolean>) => {
      state.createTeamDialog.isOpen = action.payload;
    },
    setRenameTeamDialog: (state, action: PayloadAction<boolean>) => {
      state.renameTeamDialog.isOpen = action.payload;
    },
    setGlobalActiveTeamId: (state, action: PayloadAction<number>) => {
      state.globalActiveTeamId = action.payload;
    },
    setAuthorized: (state, action: PayloadAction<'not_authorized' | 'loading' | 'authorized'>) => {
      state.authorize_status = action.payload;
    },
    setPlatformsDialog: (state, action: PayloadAction<boolean>) => {
      state.platformsDialog.isOpen = action.payload;
    },
    setSelectedPlatform: (state, action: PayloadAction<string>) => {
      state.selectedPlatform = action.payload;
    },
    setGlobalActivePlatforms: (state, action: PayloadAction<ActivePlatform[]>) => {
      state.globalActivePlatforms = action.payload;
    },
  },
});

export const {
  setTeams,
  setSelectedMemberId,
  setSelectedTeamId,
  setCurrentUserId,
  setGlobalActiveTeamId,
  setAddMemberDialog,
  setEditMemberDialog,
  setCreateTeamDialog,
  setRenameTeamDialog,
  setAuthorized,
  setPlatformsDialog,
  setSelectedPlatform,
  setGlobalActivePlatforms,
} = teamSlice.actions;

export const getTeamsFromStore = (state: RootState) => state.teams.teams;

export default teamSlice.reducer;
