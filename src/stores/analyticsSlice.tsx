import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AnalyticsFilter = '' | 'audience' | 'growth';

export interface AnalyticsSliceState {
  activeAnalyticsFilter: AnalyticsFilter;
}

// Define the initial state using that type
const initialState: AnalyticsSliceState = {
  activeAnalyticsFilter: '',
};

export const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setActiveAnalyticsFilter: (state, action: PayloadAction<AnalyticsFilter>) => {
      state.activeAnalyticsFilter = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setActiveAnalyticsFilter } = analyticsSlice.actions;

export default analyticsSlice.reducer;
