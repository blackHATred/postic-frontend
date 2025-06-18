import React, { useEffect, useRef, useState } from 'react';
import { Card, Space, Spin, Tooltip, Select, Typography, Row, Col, Statistic } from 'antd';
import {
  InfoCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { DualAxes } from '@antv/g2plot';
import { PostAnalytics } from '../../../models/Analytics/types';
import styles from './styles.module.scss';
import { useAppSelector } from '../../../stores/hooks';

const { Text } = Typography;

interface PeriodComparisonChartProps {
  currentPeriodData: PostAnalytics[];
  previousPeriodData: PostAnalytics[];
  loading: boolean;
  height?: number;
  hasTelegram?: boolean;
  hasVk?: boolean;
  periodType: 'week' | 'month';
  onPeriodTypeChange: (type: 'week' | 'month') => void;
}

type MetricType = 'reactions' | 'views' | 'comments';

interface PeriodData {
  platform: string;
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
}

const PeriodComparisonChart1: React.FC<PeriodComparisonChartProps> = ({
  currentPeriodData,
  previousPeriodData,
  loading,
  height = 400,
  hasTelegram,
  hasVk,
  periodType,
  onPeriodTypeChange,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const [metricType, setMetricType] = useState<MetricType>('reactions');
  const [comparisonData, setComparisonData] = useState<PeriodData[]>([]);

  const activePlatforms = useAppSelector((state) => state.teams.globalActivePlatforms);

  const isTelegramAvailable =
    hasTelegram !== undefined
      ? hasTelegram
      : activePlatforms.some((p) => p.platform === 'telegram' && p.isLinked);
  const isVkAvailable =
    hasVk !== undefined ? hasVk : activePlatforms.some((p) => p.platform === 'vk' && p.isLinked);

  useEffect(() => {
    if (!loading && (currentPeriodData.length > 0 || previousPeriodData.length > 0)) {
      const currentTgMetrics = aggregateMetricsByPlatform(currentPeriodData, 'tg');
      const currentVkMetrics = aggregateMetricsByPlatform(currentPeriodData, 'vk');
      const previousTgMetrics = aggregateMetricsByPlatform(previousPeriodData, 'tg');
      const previousVkMetrics = aggregateMetricsByPlatform(previousPeriodData, 'vk');

      const tgViews = {
        current: currentTgMetrics.views,
        previous: previousTgMetrics.views,
        change: currentTgMetrics.views - previousTgMetrics.views,
        changePercent:
          previousTgMetrics.views === 0
            ? currentTgMetrics.views > 0
              ? 100
              : 0
            : ((currentTgMetrics.views - previousTgMetrics.views) / previousTgMetrics.views) * 100,
      };

      const tgReactions = {
        current: currentTgMetrics.reactions,
        previous: previousTgMetrics.reactions,
        change: currentTgMetrics.reactions - previousTgMetrics.reactions,
        changePercent:
          previousTgMetrics.reactions === 0
            ? currentTgMetrics.reactions > 0
              ? 100
              : 0
            : ((currentTgMetrics.reactions - previousTgMetrics.reactions) /
                previousTgMetrics.reactions) *
              100,
      };

      const tgComments = {
        current: currentTgMetrics.comments,
        previous: previousTgMetrics.comments,
        change: currentTgMetrics.comments - previousTgMetrics.comments,
        changePercent:
          previousTgMetrics.comments === 0
            ? currentTgMetrics.comments > 0
              ? 100
              : 0
            : ((currentTgMetrics.comments - previousTgMetrics.comments) /
                previousTgMetrics.comments) *
              100,
      };

      const vkViews = {
        current: currentVkMetrics.views,
        previous: previousVkMetrics.views,
        change: currentVkMetrics.views - previousVkMetrics.views,
        changePercent:
          previousVkMetrics.views === 0
            ? currentVkMetrics.views > 0
              ? 100
              : 0
            : ((currentVkMetrics.views - previousVkMetrics.views) / previousVkMetrics.views) * 100,
      };

      const vkReactions = {
        current: currentVkMetrics.reactions,
        previous: previousVkMetrics.reactions,
        change: currentVkMetrics.reactions - previousVkMetrics.reactions,
        changePercent:
          previousVkMetrics.reactions === 0
            ? currentVkMetrics.reactions > 0
              ? 100
              : 0
            : ((currentVkMetrics.reactions - previousVkMetrics.reactions) /
                previousVkMetrics.reactions) *
              100,
      };

      const vkComments = {
        current: currentVkMetrics.comments,
        previous: previousVkMetrics.comments,
        change: currentVkMetrics.comments - previousVkMetrics.comments,
        changePercent:
          previousVkMetrics.comments === 0
            ? currentVkMetrics.comments > 0
              ? 100
              : 0
            : ((currentVkMetrics.comments - previousVkMetrics.comments) /
                previousVkMetrics.comments) *
              100,
      };

      const data: PeriodData[] = [];

      if (isTelegramAvailable) {
        data.push({
          platform: 'Telegram',
          metric: getMetricTitle(metricType),
          currentValue:
            metricType === 'views'
              ? tgViews.current
              : metricType === 'reactions'
                ? tgReactions.current
                : tgComments.current,
          previousValue:
            metricType === 'views'
              ? tgViews.previous
              : metricType === 'reactions'
                ? tgReactions.previous
                : tgComments.previous,
          change:
            metricType === 'views'
              ? tgViews.change
              : metricType === 'reactions'
                ? tgReactions.change
                : tgComments.change,
          changePercent:
            metricType === 'views'
              ? tgViews.changePercent
              : metricType === 'reactions'
                ? tgReactions.changePercent
                : tgComments.changePercent,
        });
      }

      if (isVkAvailable) {
        data.push({
          platform: 'ВКонтакте',
          metric: getMetricTitle(metricType),
          currentValue:
            metricType === 'views'
              ? vkViews.current
              : metricType === 'reactions'
                ? vkReactions.current
                : vkComments.current,
          previousValue:
            metricType === 'views'
              ? vkViews.previous
              : metricType === 'reactions'
                ? vkReactions.previous
                : vkComments.previous,
          change:
            metricType === 'views'
              ? vkViews.change
              : metricType === 'reactions'
                ? vkReactions.change
                : vkComments.change,
          changePercent:
            metricType === 'views'
              ? vkViews.changePercent
              : metricType === 'reactions'
                ? vkReactions.changePercent
                : vkComments.changePercent,
        });
      }

      setComparisonData(data);
      renderChart(data);
    }
  }, [
    currentPeriodData,
    previousPeriodData,
    loading,
    metricType,
    isTelegramAvailable,
    isVkAvailable,
  ]);

  const aggregateMetricsByPlatform = (data: PostAnalytics[], platform: 'tg' | 'vk') => {
    const metrics = {
      views: 0,
      reactions: 0,
      comments: 0,
    };

    data.forEach((item) => {
      if (platform === 'tg') {
        metrics.views += item.tg_views;
        metrics.reactions += item.tg_reactions;
        metrics.comments += item.tg_comments;
      } else if (platform === 'vk') {
        metrics.views += item.vk_views;
        metrics.reactions += item.vk_reactions;
        metrics.comments += item.vk_comments;
      }
    });

    return metrics;
  };

  const getMetricTitle = (metric: MetricType): string => {
    switch (metric) {
      case 'reactions':
        return 'Реакции';
      case 'views':
        return 'Просмотры';
      case 'comments':
        return 'Комментарии';
    }
  };

  const renderChart = (data: PeriodData[]) => {
    if (!chartRef.current) return;

    const columnData = data
      .map((item) => ({
        platform: item.platform,
        type: 'Текущий период',
        value: item.currentValue,
      }))
      .concat(
        data.map((item) => ({
          platform: item.platform,
          type: 'Предыдущий период',
          value: item.previousValue,
        })),
      );

    const lineData = data.map((item) => ({
      platform: item.platform,
      change: item.changePercent,
    }));

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const chart = new DualAxes(chartRef.current, {
      data: [columnData, lineData],
      xField: 'platform',
      yField: ['value', 'change'],
      geometryOptions: [
        {
          geometry: 'column',
          isGroup: true,
          seriesField: 'type',
          columnWidthRatio: 0.6,
          columnStyle: {
            radius: [5, 5, 0, 0],
          },
          label: {
            position: 'middle',
            layout: [
              { type: 'interval-adjust-position' },
              { type: 'interval-hide-overlap' },
              { type: 'adjust-color' },
            ],
          },
        },
        {
          geometry: 'line',
          lineStyle: {
            lineWidth: 2,
            lineDash: [4, 4],
          },
          point: {
            size: 5,
            shape: 'circle',
            style: {
              fill: 'white',
              stroke: '#5B8FF9',
              lineWidth: 2,
            },
          },
          label: {
            formatter: (datum) => `${datum.change.toFixed(1)}%`,
          },
        },
      ],
      legend: {
        position: 'top',
      },
      tooltip: {
        showTitle: false,
        showMarkers: false,
      },
      interactions: [{ type: 'element-highlight' }, { type: 'active-region' }],
      animation: {
        appear: {
          animation: 'fade-in',
          duration: 800,
        },
      },
      yAxis: {
        value: {
          title: {
            text: 'Значение',
          },
        },
        change: {
          title: {
            text: 'Изменение (%)',
          },
          min: -100,
          max: 200,
        },
      },
      meta: {
        change: {
          formatter: (val: number) => `${val}%`,
        },
      },
    });

    chart.render();
    chartInstance.current = chart;
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return '#3f8600'; // зеленый для положительных изменений
    if (change < 0) return '#cf1322'; // красный для отрицательных изменений
    return '#faad14'; // желтый для нулевых изменений
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpOutlined />;
    if (change < 0) return <ArrowDownOutlined />;
    return <MinusOutlined />; // горизонтальная черта для нулевого изменения
  };

  const getChangeTextType = (change: number): 'success' | 'danger' | 'warning' => {
    if (change > 0) return 'success';
    if (change < 0) return 'danger';
    return 'warning';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Spin size='large' />
      </div>
    );
  }

  const metricTypeOptions = [
    { value: 'reactions', label: 'Реакции' },
    { value: 'views', label: 'Просмотры' },
    { value: 'comments', label: 'Комментарии' },
  ];

  const getPeriodTitle = () => {
    return 'Сравнение текущей недели с предыдущей';
  };

  return (
    <Card
      className={styles.analyticsCard}
      title={
        <Space>
          {getPeriodTitle()}
          <Tooltip title='Сравнивает показатели текущей недели с предыдущей с расчетом процентного изменения'>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
      extra={
        <Space>
          {/*
          <Select
            value={periodType}
            onChange={onPeriodTypeChange}
            options={periodTypeOptions}
            style={{ width: 100 }}
          />
          */}
          <Select
            value={metricType}
            onChange={setMetricType}
            options={metricTypeOptions}
            style={{ width: 120 }}
          />
        </Space>
      }
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {comparisonData.map((item, index) => (
          <Col span={12} key={index}>
            <Card>
              <Statistic
                title={`${item.platform} - ${item.metric}`}
                value={item.currentValue}
                precision={0}
                valueStyle={{ color: getChangeColor(item.change) }}
                prefix={getChangeIcon(item.change)}
                suffix={
                  <Text type={getChangeTextType(item.change)}>
                    {item.previousValue === 0 && item.currentValue > 0
                      ? '+100%'
                      : item.previousValue === 0
                        ? '0%'
                        : `${item.change > 0 ? '+' : ''}${item.changePercent.toFixed(1)}%`}
                  </Text>
                }
              />
              <Text type='secondary'>Предыдущее значение: {item.previousValue}</Text>
            </Card>
          </Col>
        ))}
      </Row>
      <div ref={chartRef} style={{ height: height - 120 }} />
    </Card>
  );
};

export default PeriodComparisonChart1;
