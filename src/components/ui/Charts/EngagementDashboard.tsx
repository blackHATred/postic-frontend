import React, { useState, useMemo } from 'react';
import { Card, Radio, Space, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { PostAnalytics } from '../../../models/Analytics/types';
import BarChart from '../../ui/Charts/BarChart';
import { useAppSelector } from '../../../stores/hooks';

type MetricType = 'reactions' | 'comments';

interface EngagementDashboardProps {
  data: PostAnalytics[];
  loading: boolean;
  hasTelegram?: boolean;
  hasVk?: boolean;
}

const EngagementDashboard: React.FC<EngagementDashboardProps> = ({
  data,
  loading,
  hasTelegram,
  hasVk,
}) => {
  const [metricType, setMetricType] = useState<MetricType>('reactions');

  // Если пропсы не переданы, получаем доступные платформы из Redux как запасной вариант
  const activePlatforms = useAppSelector((state) => state.teams.globalActivePlatforms);

  // Используем переданные пропсы или получаем значения из Redux
  const isTelegramAvailable =
    hasTelegram !== undefined
      ? hasTelegram
      : activePlatforms.some((p) => p.platform === 'telegram' && p.isLinked);
  const isVkAvailable =
    hasVk !== undefined ? hasVk : activePlatforms.some((p) => p.platform === 'vk' && p.isLinked);

  const chartData = useMemo(() => {
    const dateMap = new Map<
      string,
      {
        date: string;
        tg_views: number;
        tg_reactions: number;
        tg_comments: number;
        vk_views: number;
        vk_reactions: number;
        vk_comments: number;
        timestamp: string;
      }
    >();

    data.forEach((item) => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];

      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          tg_views: 0,
          tg_reactions: 0,
          tg_comments: 0,
          vk_views: 0,
          vk_reactions: 0,
          vk_comments: 0,
          timestamp: item.timestamp,
        });
      }

      const dateData = dateMap.get(date)!;
      dateData.tg_views += item.tg_views;
      dateData.tg_reactions += item.tg_reactions;
      dateData.tg_comments += item.tg_comments;
      dateData.vk_views += item.vk_views;
      dateData.vk_reactions += item.vk_reactions;
      dateData.vk_comments += item.vk_comments;
    });

    const result = Array.from(dateMap.values()).map((item) => {
      const tg_er =
        item.tg_views > 0
          ? metricType === 'reactions'
            ? (item.tg_reactions / item.tg_views) * 100
            : (item.tg_comments / item.tg_views) * 100
          : 0;

      const vk_er =
        item.vk_views > 0
          ? metricType === 'reactions'
            ? (item.vk_reactions / item.vk_views) * 100
            : (item.vk_comments / item.vk_views) * 100
          : 0;

      return {
        ...item,
        tg_er,
        vk_er,
      };
    });

    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, metricType]);

  const metricInfo = {
    reactions: {
      title: 'Engagement Rate (отношение реакций к просмотрам)',
      description: 'Показывает процент пользователей, которые оставили реакции за выбранный период',
    },
    comments: {
      title: 'Discussion Rate (отношение комментариев к просмотрам)',
      description: 'Показывает уровень обсуждения контента пользователями за выбранный период',
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
      loading={loading}
    >
      <div style={{ marginBottom: '20px' }}>
        <Radio.Group
          value={metricType}
          onChange={(e) => setMetricType(e.target.value)}
          buttonStyle='solid'
        >
          <Radio.Button value='reactions'>По реакциям</Radio.Button>
          <Radio.Button value='comments'>По комментариям</Radio.Button>
        </Radio.Group>
      </div>

      <BarChart
        data={chartData as unknown as PostAnalytics[]}
        loading={loading}
        height={400}
        colors={metricType === 'reactions' ? ['#4096ff', '#f759ab'] : ['#5cdbd3', '#b37feb']}
      />
    </Card>
  );
};

export default EngagementDashboard;
