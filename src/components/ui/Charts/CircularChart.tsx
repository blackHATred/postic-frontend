import React, { useEffect, useRef, useState } from 'react';
import { Card, Spin, Space, Tooltip, Select } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Pie } from '@antv/g2plot';
import { PostAnalytics } from '../../../models/Analytics/types';
import styles from './styles.module.scss';

interface CircularChartProps {
  data: PostAnalytics[];
  loading: boolean;
  height?: number;
}

type MetricType = 'views' | 'reactions' | 'comments';

const CircularChart: React.FC<CircularChartProps> = ({ data, loading, height = 400 }) => {
  const [metricType, setMetricType] = useState<MetricType>('views');

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!loading && chartRef.current && data.length > 0) {
      const chartData = processDataForCircularChart(data, metricType);

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const pie = new Pie(chartRef.current, {
        data: chartData,
        angleField: 'value',
        colorField: 'platform',
        radius: 0.8,
        label: {
          type: 'outer',
          content: '{name}: {percentage}',
        },
        interactions: [{ type: 'element-active' }],
        legend: { position: 'bottom' },
        animation: {
          appear: {
            animation: 'wave-in',
            duration: 1000,
          },
        },
        tooltip: {
          formatter: (datum) => {
            return {
              name: datum.platform,
              value: datum.value,
            };
          },
        },
        color: ['#4096ff', '#f759ab', '#69b1ff', '#ff85c0', '#5cdbd3'],
      });

      pie.render();
      chartInstance.current = pie;
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data, loading, metricType]);

  const processDataForCircularChart = (sourceData: PostAnalytics[], metric: MetricType) => {
    if (!sourceData.length) return [];

    let tgTotal = 0;
    let vkTotal = 0;
    const uniquePosts = new Map<number, PostAnalytics>();

    sourceData.forEach((item) => {
      const existingPost = uniquePosts.get(item.post_union_id);
      if (!existingPost || new Date(item.timestamp) > new Date(existingPost.timestamp)) {
        uniquePosts.set(item.post_union_id, item);
      }
    });

    uniquePosts.forEach((post) => {
      if (metric === 'views') {
        tgTotal += post.tg_views;
        vkTotal += post.vk_views;
      } else if (metric === 'reactions') {
        tgTotal += post.tg_reactions;
        vkTotal += post.vk_reactions;
      } else if (metric === 'comments') {
        tgTotal += post.tg_comments;
        vkTotal += post.vk_comments;
      }
    });

    const total = tgTotal + vkTotal;

    return [
      {
        platform: 'Telegram',
        value: tgTotal,
        percentage: total > 0 ? ((tgTotal / total) * 100).toFixed(1) : '0',
      },
      {
        platform: 'ВКонтакте',
        value: vkTotal,
        percentage: total > 0 ? ((vkTotal / total) * 100).toFixed(1) : '0',
      },
    ];
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <Card
      className={styles.analyticsCard}
      title={
        <Space>
          Распределение метрик по платформам
          <Tooltip title='Показывает соотношение метрик между Telegram и ВКонтакте'>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
    >
      <div style={{ marginBottom: '20px', display: 'flex', gap: '16px' }}>
        <Select
          value={metricType}
          onChange={setMetricType}
          style={{ width: '180px' }}
          options={[
            { value: 'views', label: 'Просмотры' },
            { value: 'reactions', label: 'Реакции' },
            { value: 'comments', label: 'Комментарии' },
          ]}
        />
      </div>

      <div ref={chartRef} style={{ height: height - 60 }} />
    </Card>
  );
};

export default CircularChart;
