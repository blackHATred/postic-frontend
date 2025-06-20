import React, { useState, useMemo } from 'react';
import { Card, Radio, Space, Tooltip, Alert } from 'antd';
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
    if (!data || data.length === 0) {
      return [];
    }

    const sortedData = [...data].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const lastTenPosts = sortedData.slice(0, 10);

    const result = lastTenPosts.map((post) => {
      const postId = `Пост ${post.post_union_id}`;

      return {
        post_union_id: post.post_union_id,
        postId: postId,
        tg_views: post.tg_views || 0,
        tg_reactions: post.tg_reactions || 0,
        tg_comments: post.tg_comments || 0,
        vk_views: post.vk_views || 0,
        vk_reactions: post.vk_reactions || 0,
        vk_comments: post.vk_comments || 0,
        timestamp: post.timestamp,
        user_id: 0,
      };
    });

    return result.reverse();
  }, [data]);

  const hasZeroMetrics = useMemo(() => {
    if (!data || data.length === 0) return false;

    let hasZeroTgMetrics = true;
    let hasZeroVkMetrics = true;

    const sortedData = [...data].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    const lastTenPosts = sortedData.slice(0, 10);

    for (const item of lastTenPosts) {
      if (metricType === 'reactions') {
        if (item.tg_reactions > 0 && item.tg_views > 0) hasZeroTgMetrics = false;
        if (item.vk_reactions > 0 && item.vk_views > 0) hasZeroVkMetrics = false;
      } else {
        if (item.tg_comments > 0 && item.tg_views > 0) hasZeroTgMetrics = false;
        if (item.vk_comments > 0 && item.vk_views > 0) hasZeroVkMetrics = false;
      }
    }

    return {
      telegram: hasZeroTgMetrics && isTelegramAvailable,
      vkontakte: hasZeroVkMetrics && isVkAvailable,
    };
  }, [data, metricType, isTelegramAvailable, isVkAvailable]);

  const metricInfo = {
    reactions: {
      title: 'Engagement Rate по постам (отношение реакций к просмотрам)',
      description:
        'Показывает процент пользователей, которые оставили реакции на 10 последних постах',
    },
    comments: {
      title: 'Discussion Rate по постам (отношение комментариев к просмотрам)',
      description: 'Показывает уровень обсуждения 10 последних постов пользователями',
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

      {chartData.length === 0 && !loading && (
        <Alert
          message='Недостаточно данных для отображения'
          type='info'
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      {typeof hasZeroMetrics !== 'boolean' && hasZeroMetrics.telegram && (
        <Alert
          message='Нет доступных данных по реакциям/комментариям в Telegram'
          type='info'
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      {typeof hasZeroMetrics !== 'boolean' && hasZeroMetrics.vkontakte && (
        <Alert
          message='Нет доступных данных по реакциям/комментариям во ВКонтакте'
          type='info'
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      <BarChart
        data={chartData}
        loading={loading}
        height={400}
        colors={metricType === 'reactions' ? ['#4096ff', '#f759ab'] : ['#5cdbd3', '#b37feb']}
        xField='postId'
        xAxisTitle='ID поста'
        metricType={metricType}
      />
    </Card>
  );
};

export default EngagementDashboard;
