import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

export type AnalyticsFilter = '' | 'audience' | 'growth' | 'kpi';

export interface AnalyticsSliceState {
  activeAnalyticsFilter: AnalyticsFilter;
  period: [dayjs.Dayjs, dayjs.Dayjs];
}

const initialState: AnalyticsSliceState = {
  activeAnalyticsFilter: '',
  period: [dayjs().subtract(30, 'day'), dayjs()], // по умолчанию последние 30 дней
};

export const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setActiveAnalyticsFilter: (state, action: PayloadAction<AnalyticsFilter>) => {
      state.activeAnalyticsFilter = action.payload;
    },
    setAnalyticsPeriod: (state, action: PayloadAction<[dayjs.Dayjs, dayjs.Dayjs]>) => {
      state.period = action.payload;
    },
  },
});

export const { setActiveAnalyticsFilter, setAnalyticsPeriod } = analyticsSlice.actions;

export default analyticsSlice.reducer;
