import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { mockTeams, Team } from "../models/Team/types";

export interface teamSliceState {
  teams: Team[];
}

// Define the initial state using that type
const initialState: teamSliceState = {
  teams: mockTeams,
};

export const teamSlice = createSlice({
  name: "comments",
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
  },
});

// Action creators are generated for each case reducer function
export const { addTeam, addTeams } = teamSlice.actions;

export const getTeamsFromStore = (state: RootState) => state.teams.teams;

export default teamSlice.reducer;
