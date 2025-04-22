// src/components/ui/Charts/CommentsRateChart.tsx
import React from 'react';
import { Card } from 'antd';
import styles from './styles.module.scss';
import { PostAnalytics } from '../../../models/Analytics/types';
import BarChart from './BarChart';

interface CommentsRateChartProps {
  data: PostAnalytics[];
  loading: boolean;
}

const CommentsRateChart: React.FC<CommentsRateChartProps> = ({ data, loading }) => {
  const commentsRateData = data.map((item) => {
    return {
      ...item,
      tg_reactions: item.tg_comments,
      vk_reactions: item.vk_comments,
    };
  });

  return (
    <Card
      className={styles.analyticsCard}
      title='Уровень обсуждения (отношение комментариев к просмотрам)'
    >
      <BarChart
        data={commentsRateData}
        loading={loading}
        height={400}
        colors={['#69b1ff', '#ff85c0']}
      />
    </Card>
  );
};

export default CommentsRateChart;
