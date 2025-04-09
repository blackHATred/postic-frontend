import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { Team } from "../models/Team/types";

interface basicDialogState {
  isOpen: boolean;
}

export interface teamSliceState {
  teams: Team[];
  selectedMemberId: number;
  selectedTeamId: number;
  addMemberDialog: basicDialogState;
  editMemberDialog: basicDialogState;
  createTeamDialog: basicDialogState;
}

// Define the initial state using that type
const initialState: teamSliceState = {
  teams: [],
  selectedMemberId: 0,
  selectedTeamId: 0,
  addMemberDialog: { isOpen: false },
  editMemberDialog: { isOpen: false },
  createTeamDialog: { isOpen: false },
};

export const teamSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    addTeam: (state, action: PayloadAction<Team>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.teams.push(action.payload);
    },
    addTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = [...state.teams, ...action.payload];
    },

    setTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = action.payload;
    },

    setSelectedMemberId: (state, action: PayloadAction<number>) => {
      state.selectedMemberId = action.payload;
    },
    setSelectedTeamId: (state, action: PayloadAction<number>) => {
      state.selectedTeamId = action.payload;
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
  },
});

// Action creators are generated for each case reducer function
export const {
  addTeam,
  addTeams,
  setTeams,
  setSelectedMemberId,
  setSelectedTeamId,
  setAddMemberDialog,
  setEditMemberDialog,
  setCreateTeamDialog,
} = teamSlice.actions;

export const getTeamsFromStore = (state: RootState) => state.teams.teams;

export default teamSlice.reducer;
