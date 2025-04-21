// src/components/widgets/Analytics/EngagementRateChart.tsx
import React from 'react';
import { Card } from 'antd';
import styles from './styles.module.scss';
import BarChart from '../../ui/Charts/BarChart';
import { PostAnalytics } from '../../../models/Analytics/types';

interface EngagementRateChartProps {
  data: PostAnalytics[];
  loading: boolean;
}

const EngagementRateChart: React.FC<EngagementRateChartProps> = ({ data, loading }) => {
  return (
    <Card className={styles.analyticsCard} title='ER (отношение реакции к просмотрам)'>
      <BarChart data={data} loading={loading} height={400} />
    </Card>
  );
};

export default EngagementRateChart;
