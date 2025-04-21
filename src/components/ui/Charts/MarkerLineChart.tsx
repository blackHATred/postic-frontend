import React, { useEffect, useRef, useState } from 'react';
import { Card, Select, Space, Tooltip, Spin, Radio } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Line } from '@antv/g2plot';
import { PostAnalytics } from '../../../models/Analytics/types';
import styles from './styles.module.scss';

interface MarkerLineChartProps {
  data: PostAnalytics[];
  loading: boolean;
}

type MetricType = 'views' | 'reactions' | 'comments' | 'er';
type PlatformType = 'all' | 'telegram' | 'vk';

const MarkerLineChart: React.FC<MarkerLineChartProps> = ({ data, loading }) => {
  const [metricType, setMetricType] = useState<MetricType>('comments');
  const [platform, setPlatform] = useState<PlatformType>('all');
  const [highlightType, setHighlightType] = useState<'peaks' | 'growth' | 'top3'>('peaks');

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Line | null>(null);

  useEffect(() => {
    if (!loading && chartRef.current && data.length > 0) {
      // Подготовка данных для графика
      const lineData = processDataForLineChart(data, metricType, platform, highlightType);

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const chart = new Line(chartRef.current, {
        data: lineData,
        xField: 'date',
        yField: 'value',
        seriesField: 'type',
        smooth: true,
        animation: {
          appear: {
            animation: 'fade-in',
            duration: 1000,
          },
        },
        color: ({ type }) => {
          if (type === 'Значение') return '#4096ff';
          return 'transparent'; // Скрываем линию для маркеров
        },
        point: {
          size: ({ type }) => (type === 'Маркер' ? 8 : 0),
          shape: ({ type }) => (type === 'Маркер' ? 'diamond' : 'circle'),
          style: ({ type }) => ({
            fill: type === 'Маркер' ? '#f5222d' : 'transparent',
            stroke: type === 'Маркер' ? '#fff' : 'transparent',
            lineWidth: 2,
          }),
        },
        label: {
          formatter: (datum) => {
            if (datum.type === 'Маркер') {
              return datum.value.toString();
            }
            return '';
          },
          style: {
            fill: '#f5222d',
            fontSize: 12,
            fontWeight: 'bold',
            textShadow: '0px 0px 3px #ffffff',
          },
        },
        lineStyle: ({ type }) => {
          if (type === 'Значение') {
            return {
              lineWidth: 3,
              lineDash: [0, 0],
              strokeOpacity: 0.8,
            };
          }
          return {
            lineWidth: 0,
          };
        },
        yAxis: {
          title: { text: getMetricLabel(metricType) },
          grid: {
            line: {
              style: {
                stroke: '#e8e8e8',
                lineDash: [4, 4],
              },
            },
          },
          label: {
            formatter: (v) => {
              const value = parseFloat(v);
              if (metricType === 'er') {
                return `${value.toFixed(1)}%`;
              }
              return value > 1000 ? `${(value / 1000).toFixed(1)}K` : value;
            },
          },
        },
        xAxis: {
          title: { text: 'Дата публикации' },
        },
        tooltip: {
          shared: true,
          showMarkers: true,
          formatter: (datum) => {
            let value = '';
            if (metricType === 'er') {
              value = `${datum.value.toFixed(2)}%`;
            } else {
              value =
                datum.value > 1000 ? `${(datum.value / 1000).toFixed(1)}K` : datum.value.toString();
            }

            // Добавляем пояснение для маркера
            if (datum.type === 'Маркер') {
              const marker = lineData.find(
                (item) => item.date === datum.date && item.type === 'Маркер',
              );
              if (marker?.reason) {
                return {
                  name: datum.type,
                  value: `${value} - ${marker.reason}`,
                };
              }
            }

            return { name: datum.type, value };
          },
        },
        legend: {
          position: 'top',
        },
        annotations: [
          // Добавляем горизонтальную линию для среднего значения
          {
            type: 'line',
            start: ['min', 'mean'],
            end: ['max', 'mean'],
            style: {
              stroke: '#ffbf00',
              lineDash: [4, 4],
              lineWidth: 2,
            },
          },
          // Добавляем текстовую аннотацию для среднего значения
          {
            type: 'text',
            position: ['max', 'mean'],
            content: 'Среднее',
            offsetX: -20,
            offsetY: -5,
            style: {
              fill: '#ffbf00',
              fontSize: 12,
              textAlign: 'end',
            },
          },
        ],
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
  }, [loading, data, metricType, platform, highlightType]);

  // Функция для обработки данных и выделения пиков
  const processDataForLineChart = (
    sourceData: PostAnalytics[],
    metric: MetricType,
    platform: PlatformType,
    highlight: 'peaks' | 'growth' | 'top3',
  ) => {
    // Сортируем данные по дате
    const sortedData = [...sourceData].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    // Создаем массив с данными для графика
    const chartData = sortedData.map((item) => {
      const date = new Date(item.timestamp).toLocaleDateString();
      let value = 0;

      // Получаем значение метрики в зависимости от платформы
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

      return {
        date,
        value,
        originalValue: value,
        timestamp: item.timestamp,
        type: 'Значение',
      };
    });

    // Создаем копию данных для маркеров
    const markerData: any[] = [];

    // Опре��еляем, какие точки выделять маркерами
    if (highlight === 'peaks') {
      // Находим локальные пики (точки, которые выше соседей)
      chartData.forEach((item, index, array) => {
        if (index > 0 && index < array.length - 1) {
          const prev = array[index - 1].originalValue;
          const current = item.originalValue;
          const next = array[index + 1].originalValue;

          // Выделяем точку маркером, если она выше соседей на 5%
          if (current > prev * 1.05 && current > next * 1.05) {
            markerData.push({
              ...item,
              type: 'Маркер',
              reason: 'Пик активности',
            });
          }
        }
      });
    } else if (highlight === 'growth') {
      // Находим наибольший рост (изменение относительно предыдущей точки)
      let maxGrowth = -Infinity;
      let maxGrowthIndex = -1;

      chartData.forEach((item, index, array) => {
        if (index > 0) {
          const prev = array[index - 1].originalValue;
          const current = item.originalValue;
          const growth = current - prev;

          if (growth > maxGrowth) {
            maxGrowth = growth;
            maxGrowthIndex = index;
          }
        }
      });

      if (maxGrowthIndex !== -1) {
        markerData.push({
          ...chartData[maxGrowthIndex],
          type: 'Маркер',
          reason: 'Наибольший рост',
        });
      }
    } else if (highlight === 'top3') {
      // Выделяем 3 наибольших значения
      const sortedByValue = [...chartData]
        .sort((a, b) => b.originalValue - a.originalValue)
        .slice(0, 3);

      sortedByValue.forEach((item) => {
        markerData.push({
          ...item,
          type: 'Маркер',
          reason: 'Топ-3 значение',
        });
      });
    }

    return [...chartData, ...markerData];
  };

  // Получение названия метрики для подписи оси
  const getMetricLabel = (metric: MetricType) => {
    switch (metric) {
      case 'views':
        return 'Просмотры';
      case 'reactions':
        return 'Реакции';
      case 'comments':
        return 'Комментарии';
      case 'er':
        return 'ER (%)';
      default:
        return '';
    }
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
      <Card className={styles.analyticsCard} title='График ключевых точек'>
        <div
          style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
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
          {`Динамика ${metricTitle} с выделением ключевых точек (${platformTitle})`}
          <Tooltip title='График показывает динамику изменений и выделяет важные точки данных'>
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
            { value: 'comments', label: 'Комментарии' },
            { value: 'reactions', label: 'Реакции' },
            { value: 'views', label: 'Просмотры' },
            { value: 'er', label: 'ER (%)' },
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
        <Radio.Group
          value={highlightType}
          onChange={(e) => setHighlightType(e.target.value)}
          buttonStyle='solid'
        >
          <Radio.Button value='peaks'>Пики активности</Radio.Button>
          <Radio.Button value='growth'>Наибольший рост</Radio.Button>
          <Radio.Button value='top3'>Топ-3 значения</Radio.Button>
        </Radio.Group>
      </div>
      <div ref={chartRef} style={{ height: 400 }} />
    </Card>
  );
};

export default MarkerLineChart;
