import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AnalyticsFilter = '' | 'audience' | 'growth';

export interface AnalyticsSliceState {
  activeAnalyticsFilter: AnalyticsFilter;
}

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

export const { setActiveAnalyticsFilter } = analyticsSlice.actions;

export default analyticsSlice.reducer;
