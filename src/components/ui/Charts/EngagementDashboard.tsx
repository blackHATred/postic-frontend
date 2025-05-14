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

// Определим интерфейс данных для графика
interface ChartDataItem extends PostAnalytics {
  date: string;
  tg_er: number;
  vk_er: number;
}

const EngagementDashboard: React.FC<EngagementDashboardProps> = ({ data, loading }) => {
  const [metricType, setMetricType] = useState<MetricType>('reactions');

  const chartData = useMemo(() => {
    // Группируем данные по дате
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
        post_union_id: number;
        user_id: number;
      }
    >();

    // Обрабатываем все записи
    data.forEach((item) => {
      // Получаем дату в формате YYYY-MM-DD
      const date = new Date(item.timestamp).toISOString().split('T')[0];

      // Если даты еще нет, создаем запись
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
          post_union_id: 0, // не используем в группировке
          user_id: 0, // не используем в группировке
        });
      }

      // Добавляем данные к этой дате
      const dateData = dateMap.get(date)!;
      dateData.tg_views += item.tg_views;
      dateData.tg_reactions += item.tg_reactions;
      dateData.tg_comments += item.tg_comments;
      dateData.vk_views += item.vk_views;
      dateData.vk_reactions += item.vk_reactions;
      dateData.vk_comments += item.vk_comments;
    });

    // Преобразуем Map в массив и рассчитываем ER
    const result = Array.from(dateMap.values()).map((item) => {
      // Рассчитываем ER для TG
      const tg_er =
        item.tg_views > 0
          ? metricType === 'reactions'
            ? (item.tg_reactions / item.tg_views) * 100
            : (item.tg_comments / item.tg_views) * 100
          : 0;

      // Рассчитываем ER для VK
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

    // Сортируем по дате (от ранних к поздним)
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, metricType]);

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
