import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

export type AnalyticsFilter = '' | 'audience' | 'growth' | 'kpi';

export interface AnalyticsSliceState {
  activeAnalyticsFilter: AnalyticsFilter;
  period: [string, string];
}

const initialState: AnalyticsSliceState = {
  activeAnalyticsFilter: '',
  period: [dayjs().subtract(30, 'day').toISOString(), dayjs().toISOString()], // Сериализуем в ISO строки
};

export const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setActiveAnalyticsFilter: (state, action: PayloadAction<AnalyticsFilter>) => {
      state.activeAnalyticsFilter = action.payload;
    },
    setAnalyticsPeriod: (state, action: PayloadAction<[string, string]>) => {
      state.period = action.payload;
    },
  },
});

export const { setActiveAnalyticsFilter, setAnalyticsPeriod } = analyticsSlice.actions;

export const getAnalyticsPeriodAsDayjs = (state: {
  analytics: AnalyticsSliceState;
}): [dayjs.Dayjs, dayjs.Dayjs] => [
  dayjs(state.analytics.period[0]),
  dayjs(state.analytics.period[1]),
];

export default analyticsSlice.reducer;
