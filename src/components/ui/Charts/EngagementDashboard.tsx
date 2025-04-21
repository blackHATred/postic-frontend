import React, { useState, useMemo } from 'react';
import { Card, Radio, Space, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { PostAnalytics } from '../../../models/Analytics/types';
import BarChart from '../../ui/Charts/BarChart';

interface EngagementDashboardProps {
  data: PostAnalytics[];
  loading: boolean;
}

type MetricType = 'reactions' | 'comments';

const EngagementDashboard: React.FC<EngagementDashboardProps> = ({ data, loading }) => {
  const [metricType, setMetricType] = useState<MetricType>('reactions');

  // Модифицируем данные для выбранной метрики
  const chartData = useMemo(() => {
    if (metricType === 'reactions') {
      // Для ER используем оригинальные данные
      return data;
    } else {
      // Для соотношения комментариев подменяем реакции комментариями
      return data.map((item) => ({
        ...item,
        tg_reactions: item.tg_comments,
        vk_reactions: item.vk_comments,
      }));
    }
  }, [data, metricType]);

  // Название и описание метрики
  const metricInfo = {
    reactions: {
      title: 'Engagement Rate (отношение реакций к просмотрам)',
      description: 'Показывает процент пользователей, которые оставили реакции',
    },
    comments: {
      title: 'Discussion Rate (отношение комментариев к просмотрам)',
      description: 'Показывает уровень обсуждения контента пользователями',
    },
  };

  return (
    <Card
      className={styles.analyticsCard}
      title={
        <Space>
          {metricInfo[metricType].title}
          <Tooltip title={metricInfo[metricType].description}>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
    >
      <div style={{ marginBottom: '20px' }}>
        <Radio.Group
          value={metricType}
          onChange={(e) => setMetricType(e.target.value)}
          buttonStyle='solid'
        >
          <Radio.Button value='reactions'>Реакции</Radio.Button>
          <Radio.Button value='comments'>Комментарии</Radio.Button>
        </Radio.Group>
      </div>

      <BarChart
        data={chartData}
        loading={loading}
        height={400}
        colors={metricType === 'reactions' ? ['#4096ff', '#f759ab'] : ['#73d13d', '#ffec3d']}
      />
    </Card>
  );
};

export default EngagementDashboard;
