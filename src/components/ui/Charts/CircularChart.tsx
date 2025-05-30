import React, { useEffect, useRef, useState } from 'react';
import { Card, Spin, Space, Tooltip, Select } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Pie } from '@antv/g2plot';
import { PostAnalytics } from '../../../models/Analytics/types';
import styles from './styles.module.scss';
import { useAppSelector } from '../../../stores/hooks';

interface CircularChartProps {
  data: PostAnalytics[];
  loading: boolean;
  height?: number;
  hasTelegram?: boolean;
  hasVk?: boolean;
}

type MetricType = 'views' | 'reactions' | 'comments';

const CircularChart: React.FC<CircularChartProps> = ({
  data,
  loading,
  height = 400,
  hasTelegram,
  hasVk,
}) => {
  const [metricType, setMetricType] = useState<MetricType>('views');
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  // Если пропсы не переданы, получаем доступные платформы из Redux как запасной вариант
  const activePlatforms = useAppSelector((state) => state.teams.globalActivePlatforms);

  // Используем переданные пропсы или получаем значения из Redux
  const isTelegramAvailable =
    hasTelegram !== undefined
      ? hasTelegram
      : activePlatforms.some((p) => p.platform === 'tg' && p.isLinked);
  const isVkAvailable =
    hasVk !== undefined ? hasVk : activePlatforms.some((p) => p.platform === 'vk' && p.isLinked);

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
  }, [data, loading, metricType, isTelegramAvailable, isVkAvailable]);

  const processDataForCircularChart = (sourceData: PostAnalytics[], metric: MetricType) => {
    if (!sourceData.length) return [];

    let tgTotal = 0;
    let vkTotal = 0;

    sourceData.forEach((item) => {
      if (metric === 'views') {
        tgTotal += item.tg_views;
        vkTotal += item.vk_views;
      } else if (metric === 'reactions') {
        tgTotal += item.tg_reactions;
        vkTotal += item.vk_reactions;
      } else if (metric === 'comments') {
        tgTotal += item.tg_comments;
        vkTotal += item.vk_comments;
      }
    });

    const total = tgTotal + vkTotal;
    const result = [];

    // Добавляем только те платформы, которые подключены
    if (isTelegramAvailable) {
      result.push({
        platform: 'Telegram',
        value: tgTotal,
        percentage: total > 0 ? ((tgTotal / total) * 100).toFixed(1) : '0',
      });
    }

    if (isVkAvailable) {
      result.push({
        platform: 'ВКонтакте',
        value: vkTotal,
        percentage: total > 0 ? ((vkTotal / total) * 100).toFixed(1) : '0',
      });
    }

    return result;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Spin size='large' />
      </div>
    );
  }

  // Если нет подключенных платформ или только одна, не показываем график
  if (!isTelegramAvailable && !isVkAvailable) {
    return (
      <Card className={styles.analyticsCard} title='Распределение метрик по платформам'>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          Нет подключенных платформ для отображения метрик
        </div>
      </Card>
    );
  }

  if ((isTelegramAvailable && !isVkAvailable) || (!isTelegramAvailable && isVkAvailable)) {
    return (
      <Card
        className={styles.analyticsCard}
        title={`Метрики ${isTelegramAvailable ? 'Telegram' : 'ВКонтакте'}`}
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          Подключена только одна платформа. Графики сравнения недоступны.
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={styles.analyticsCard}
      title={
        <Space>
          Распределение метрик по платформам за выбранный период
          <Tooltip title='Показывает соотношение метрик между платформами за выбранный период'>
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
