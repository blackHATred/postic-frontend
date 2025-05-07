import React, { useState, useMemo } from 'react';
import { Card, Select, Row, Col, Statistic, Divider, Space, Tooltip, Radio } from 'antd';
import { InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { DualAxes } from '@antv/g2plot';
import { useEffect, useRef } from 'react';
import { PostAnalytics } from '../../../models/Analytics/types';
import styles from './styles.module.scss';

interface PeriodComparisonChartProps {
  data: PostAnalytics[];
  loading: boolean;
}

type PeriodType = 'week' | 'month';
type MetricType = 'views' | 'reactions' | 'comments' | 'er';
type PlatformType = 'all' | 'telegram' | 'vk';

const PeriodComparisonChart: React.FC<PeriodComparisonChartProps> = ({ data, loading }) => {
  const [periodType, setPeriodType] = useState<PeriodType>('week');
  const [metricType, setMetricType] = useState<MetricType>('views');
  const [platform, setPlatform] = useState<PlatformType>('all');
  const [displayMode, setDisplayMode] = useState<'default' | 'clean'>('default');

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<DualAxes | null>(null);

  const {
    currentPeriodData,
    previousPeriodData,
    percentChange,
    metricLabel,
    metricSummary,
    previousMetricSummary,
    comparisonData,
  } = useMemo(() => {
    const sortedData = [...data].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const midPoint = Math.ceil(sortedData.length / 2);
    const prev = sortedData.slice(0, midPoint);
    const current = sortedData.slice(midPoint);

    const getMetricValue = (item: PostAnalytics, metricKey: MetricType) => {
      const value = 0;

      if (metricKey === 'views') {
        if (platform === 'all') return item.tg_views + item.vk_views;
        if (platform === 'telegram') return item.tg_views;
        return item.vk_views;
      }

      if (metricKey === 'reactions') {
        if (platform === 'all') return item.tg_reactions + item.vk_reactions;
        if (platform === 'telegram') return item.tg_reactions;
        return item.vk_reactions;
      }

      if (metricKey === 'comments') {
        if (platform === 'all') return item.tg_comments + item.vk_comments;
        if (platform === 'telegram') return item.tg_comments;
        return item.vk_comments;
      }

      if (metricKey === 'er') {
        if (platform === 'all') {
          const totalViews = item.tg_views + item.vk_views;
          const totalReactions = item.tg_reactions + item.vk_reactions;
          return totalViews > 0 ? (totalReactions / totalViews) * 100 : 0;
        }
        if (platform === 'telegram') {
          return item.tg_views > 0 ? (item.tg_reactions / item.tg_views) * 100 : 0;
        }
        return item.vk_views > 0 ? (item.vk_reactions / item.vk_views) * 100 : 0;
      }

      return value;
    };

    const calculatePeriodMetrics = (periodData: PostAnalytics[]) => {
      return periodData.reduce((sum, item) => sum + getMetricValue(item, metricType), 0);
    };

    const currentTotal = calculatePeriodMetrics(current);
    const previousTotal = calculatePeriodMetrics(prev);

    const percentDiff =
      previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    const chartData = [];
    const formatMetricValue = (value: number) => {
      if (metricType === 'er') {
        return Number(value.toFixed(1));
      }
      return Math.round(value);
    };
    const prevFormattedData = prev.map((item, index) => {
      const date = new Date(item.timestamp);
      const dayNumber = index + 1;
      const rawValue = getMetricValue(item, metricType);
      const value = formatMetricValue(rawValue);

      return {
        date: periodType === 'week' ? `День ${dayNumber}` : date.toLocaleDateString(),
        value,
        rawValue,
        period: 'Предыдущий период',
      };
    });

    const currentFormattedData = current.map((item, index) => {
      const date = new Date(item.timestamp);
      const dayNumber = index + 1;
      const rawValue = getMetricValue(item, metricType);
      const value = formatMetricValue(rawValue);

      return {
        date: periodType === 'week' ? `День ${dayNumber}` : date.toLocaleDateString(),
        value,
        rawValue,
        period: 'Текущий период',
      };
    });

    let label = '';
    switch (metricType) {
      case 'views':
        label = 'просмотров';
        break;
      case 'reactions':
        label = 'реакций';
        break;
      case 'comments':
        label = 'комментариев';
        break;
      case 'er':
        label = 'ER (%)';
        break;
    }

    return {
      currentPeriodData: currentFormattedData,
      previousPeriodData: prevFormattedData,
      percentChange: percentDiff,
      metricLabel: label,
      metricSummary: currentTotal.toFixed(metricType === 'er' ? 2 : 0),
      previousMetricSummary: previousTotal.toFixed(metricType === 'er' ? 2 : 0),
      comparisonData: [...prevFormattedData, ...currentFormattedData],
    };
  }, [data, periodType, metricType, platform]);

  useEffect(() => {
    if (!loading && chartRef.current && comparisonData.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const chart = new DualAxes(chartRef.current, {
        data: [comparisonData, comparisonData],
        xField: 'date',
        yField: ['value', 'value'],
        geometryOptions: [
          {
            geometry: 'column',
            isGroup: true,
            seriesField: 'period',
            columnWidthRatio: 0.5,
            columnStyle: {
              radius: [5, 5, 0, 0],
            },
            label: {
              position: displayMode === 'clean' ? 'middle' : 'top',
              style: {
                fontSize: 12,
                fill: 'rgba(0, 0, 0, 0.85)',
                textShadow: '0px 0px 2px rgba(255, 255, 255, 0.8)',
              },
              formatter: (data) => {
                if (displayMode === 'clean') return '';

                if (metricType === 'er') {
                  return `${data.value}%`;
                }
                if (data.value > 1000) {
                  return `${Math.round(data.value / 100) / 10}K`;
                }
                return `${data.value}`;
              },
            },
            color: ({ period }) => {
              return period === 'Текущий период' ? '#4096ff' : '#bae0ff';
            },
          },
          {
            geometry: 'line',
            seriesField: 'period',
            lineStyle: {
              lineWidth: 3,
              opacity: 1,
            },
            point: {
              shape: 'circle',
              size: 1,
            },
          },
        ],
        legend: {
          position: 'top',
        },
        xAxis: {
          title: {
            text: periodType === 'week' ? 'День' : 'Дата',
          },
        },
        yAxis: {
          value: {
            title: {
              text: metricLabel,
            },
            label: {
              formatter: (text: string) => {
                const v = parseFloat(text);
                if (metricType === 'er') {
                  return `${v}%`;
                }
                return v > 1000 ? `${Math.round(v / 1000)}K` : v;
              },
            },
          },
        },

        tooltip: {
          shared: true,
          formatter: (datum) => {
            const rawValue = datum.rawValue !== undefined ? datum.rawValue : datum.value;
            const value =
              metricType === 'er'
                ? `${Number(rawValue).toFixed(2)}%`
                : Number(rawValue).toLocaleString();
            return { name: datum.period, value };
          },
        },
        interactions: [{ type: 'element-highlight' }, { type: 'active-region' }],
        animation: {
          appear: {
            animation: 'wave-in',
            duration: 1000,
          },
        },
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
  }, [loading, comparisonData, metricType, periodType, displayMode]);

  const platformName = useMemo(() => {
    if (platform === 'all') return 'обеих платформ';
    if (platform === 'telegram') return 'Telegram';
    return 'ВКонтакте';
  }, [platform]);

  const periodName = useMemo(() => {
    return periodType === 'week' ? 'Недельное' : 'Месячное';
  }, [periodType]);

  return (
    <Card
      className={styles.analyticsCard}
      title={
        <Space>
          {`${periodName} сравнение ${metricLabel} для ${platformName}`}
          <Tooltip title='Сравнение показателей за текущий и предыдущий периоды'>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
      loading={loading}
    >
      <div className={styles.analyticsCardButtons}>
        <div className={styles.analyticsCardButton}>
          <Select
            value={periodType}
            onChange={setPeriodType}
            style={{ width: '100%' }}
            options={[
              { value: 'week', label: 'Неделя' },
              { value: 'month', label: 'Месяц' },
            ]}
          />
          <Select
            value={metricType}
            onChange={setMetricType}
            style={{ width: '100%' }}
            options={[
              { value: 'views', label: 'Просмотры' },
              { value: 'reactions', label: 'Реакции' },
              { value: 'comments', label: 'Комментарии' },
              { value: 'er', label: 'ER (%)' },
            ]}
          />
          <Select
            value={platform}
            onChange={setPlatform}
            style={{ width: '100%' }}
            options={[
              { value: 'all', label: 'Все платформы' },
              { value: 'telegram', label: 'Telegram' },
              { value: 'vk', label: 'ВКонтакте' },
            ]}
          />
        </div>
        <div className={styles.analyticsCardButton}>
          <Radio.Group
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value)}
            buttonStyle='solid'
          >
            <Radio.Button value='default'>С метками</Radio.Button>
            <Radio.Button value='clean'>Без меток</Radio.Button>
          </Radio.Group>
        </div>
      </div>

      <Row gutter={16} justify='center' style={{ marginBottom: '10px' }}>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Statistic
            title='Предыдущий период'
            value={previousMetricSummary}
            suffix={metricType === 'er' ? '%' : ''}
          />
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Statistic
            title='Изменение'
            value={percentChange.toFixed(1)}
            precision={1}
            valueStyle={{
              color: percentChange != 0 ? (percentChange > 0 ? '#3f8600' : '#cf1322') : '#ffc53d',
            }}
            prefix={
              percentChange != 0 ? (
                percentChange > 0 ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )
              ) : null
            }
            suffix='%'
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>
            {percentChange >= 0
              ? 'рост относительно предыдущего периода'
              : 'падение относительно предыдущего периода'}
          </div>
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Statistic
            title='Текущий период'
            value={metricSummary}
            valueStyle={{ fontWeight: 'bold' }}
            suffix={metricType === 'er' ? '%' : ''}
          />
        </Col>
      </Row>

      <Divider style={{ margin: '12px 0 24px' }} />

      <div style={{ height: '400px' }} ref={chartRef}></div>
    </Card>
  );
};

export default PeriodComparisonChart;
