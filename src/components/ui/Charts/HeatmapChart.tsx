import React, { useEffect, useRef, useState } from 'react';
import { Card, Select, Space, Tooltip, Spin } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Heatmap } from '@antv/g2plot';
import { PostAnalytics } from '../../../models/Analytics/types';
import styles from './styles.module.scss';

interface HeatmapChartProps {
  data: PostAnalytics[];
  loading: boolean;
}

type MetricType = 'views' | 'reactions' | 'comments' | 'er';
type PlatformType = 'all' | 'telegram' | 'vk';

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, loading }) => {
  const [metricType, setMetricType] = useState<MetricType>('er');
  const [platform, setPlatform] = useState<PlatformType>('all');

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Heatmap | null>(null);

  useEffect(() => {
    if (!loading && chartRef.current && data.length > 0) {
      // Подготовка данных для тепловой карты
      const heatmapData = processDataForHeatmap(data, metricType, platform);

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const chart = new Heatmap(chartRef.current, {
        data: heatmapData,
        xField: 'hour',
        yField: 'weekday',
        colorField: 'value',
        shape: 'square',
        color: ['#e8f5ff', '#bae0ff', '#4096ff', '#0958d9', '#003eb3'],
        meta: {
          hour: {
            type: 'cat',
            values: Array.from({ length: 24 }, (_, i) => i.toString()),
          },
          weekday: {
            type: 'cat',
            values: [
              'Понедельник',
              'Вторник',
              'Среда',
              'Четверг',
              'Пятница',
              'Суббота',
              'Воскресенье',
            ],
          },
        },
        xAxis: {
          title: { text: 'Час дня' },
          position: 'top',
          label: { formatter: (v) => `${v}:00` },
        },
        yAxis: {
          title: { text: 'День недели' },
        },
        tooltip: {
          formatter: (datum) => {
            const value = formatValue(datum.value, metricType);
            return {
              name: `${datum.weekday}, ${datum.hour}:00`,
              value,
            };
          },
        },
        legend: {
          position: 'bottom',
          // Добавляем форматирование для легенды
          itemValue: {
            formatter: (text, item) => {
              if (metricType === 'er') {
                return `${parseFloat(text).toFixed(2)}%`;
              }
              if (
                metricType === 'views' ||
                metricType === 'reactions' ||
                metricType === 'comments'
              ) {
                const value = Math.round(parseFloat(text));
                return value > 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString();
              }
              return text;
            },
          },
        },
        interactions: [{ type: 'element-active' }],
      });

      chart.render();
      chartInstance.current = chart;
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [loading, data, metricType, platform]);

  const processDataForHeatmap = (
    sourceData: PostAnalytics[],
    metric: MetricType,
    platform: PlatformType,
  ) => {
    const aggregatedData: Record<
      string,
      { total: number; count: number; weekday: string; hour: string }
    > = {};

    const weekdays = [
      'Воскресенье',
      'Понедельник',
      'Вторник',
      'Среда',
      'Четверг',
      'Пятница',
      'Суббота',
    ];

    // Создаём пустую структуру данных для всех комбинаций день/час
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${weekdays[day]}-${hour}`;
        aggregatedData[key] = {
          total: 0,
          count: 0,
          weekday: weekdays[day],
          hour: hour.toString(),
        };
      }
    }

    sourceData.forEach((item) => {
      const date = new Date(item.timestamp);
      const hour = date.getHours().toString();
      const weekdayIndex = date.getDay();
      const weekday = weekdays[weekdayIndex];
      const key = `${weekday}-${hour}`;

      let value = 0;
      if (metric === 'views') {
        if (platform === 'all') value = item.tg_views + item.vk_views;
        else if (platform === 'telegram') value = item.tg_views;
        else value = item.vk_views;
      } else if (metric === 'reactions') {
        if (platform === 'all') value = item.tg_reactions + item.vk_reactions;
        else if (platform === 'telegram') value = item.tg_reactions;
        else value = item.vk_reactions;
      } else if (metric === 'comments') {
        if (platform === 'all') value = item.tg_comments + item.vk_comments;
        else if (platform === 'telegram') value = item.tg_comments;
        else value = item.vk_comments;
      } else if (metric === 'er') {
        if (platform === 'all') {
          const totalViews = item.tg_views + item.vk_views;
          const totalReactions = item.tg_reactions + item.vk_reactions;
          value = totalViews > 0 ? (totalReactions / totalViews) * 100 : 0;
        } else if (platform === 'telegram') {
          value = item.tg_views > 0 ? (item.tg_reactions / item.tg_views) * 100 : 0;
        } else {
          value = item.vk_views > 0 ? (item.vk_reactions / item.vk_views) * 100 : 0;
        }
      }

      aggregatedData[key].total += value;
      aggregatedData[key].count += 1;
    });

    return Object.values(aggregatedData).map((item) => ({
      weekday: item.weekday,
      hour: item.hour,
      value: item.count > 0 ? item.total / item.count : 0,
    }));
  };

  const formatValue = (value: number, metric: MetricType) => {
    if (metric === 'er') {
      return `${value.toFixed(2)}%`;
    }
    // Округляем значения для целочисленных метрик
    if (metric === 'views' || metric === 'reactions' || metric === 'comments') {
      const roundedValue = Math.round(value);
      return roundedValue > 1000 ? `${(roundedValue / 1000).toFixed(1)}K` : roundedValue.toString();
    }
    return value > 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString();
  };

  const metricTitle =
    metricType === 'views'
      ? 'просмотров'
      : metricType === 'reactions'
        ? 'реакций'
        : metricType === 'comments'
          ? 'комментариев'
          : 'ER (%)';

  const platformTitle =
    platform === 'all' ? 'всех платформ' : platform === 'telegram' ? 'Telegram' : 'ВКонтакте';

  if (loading) {
    return (
      <Card className={styles.analyticsCard} title='Тепловая карта активности'>
        <div
          style={{ height: 450, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Spin size='large' />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={styles.analyticsCard}
      title={
        <Space>
          {`Тепловая карта ${metricTitle} для ${platformTitle}`}
          <Tooltip title='Показывает наилучшее время для публикаций с высокой вовлеченностью'>
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
            { value: 'er', label: 'ER (%)' },
            { value: 'views', label: 'Просмотры' },
            { value: 'reactions', label: 'Реакции' },
            { value: 'comments', label: 'Комментарии' },
          ]}
        />
        <Select
          value={platform}
          onChange={setPlatform}
          style={{ width: '180px' }}
          options={[
            { value: 'all', label: 'Все платформы' },
            { value: 'telegram', label: 'Telegram' },
            { value: 'vk', label: 'ВКонтакте' },
          ]}
        />
      </div>
      <div ref={chartRef} style={{ height: 450 }} />
    </Card>
  );
};

export default HeatmapChart;
