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

const { Text } = Typography;

interface PeriodComparisonChartProps {
  data: PostAnalytics[];
  loading: boolean;
  height?: number;
}

type PeriodType = 'week' | 'month';
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
  data,
  loading,
  height = 400,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const [periodType, setPeriodType] = useState<PeriodType>('week');
  const [metricType, setMetricType] = useState<MetricType>('reactions');
  const [comparisonData, setComparisonData] = useState<PeriodData[]>([]);

  useEffect(() => {
    if (!loading && data.length > 0) {
      console.log(
        'Исходные данные для анализа:',
        data.map((item) => ({
          timestamp: item.timestamp,
          post_id: item.post_union_id,
        })),
      );

      const currentDate = new Date();

      let currentPeriodStart: Date, currentPeriodEnd: Date;
      let previousPeriodStart: Date, previousPeriodEnd: Date;

      if (periodType === 'week') {
        const dayOfWeek = currentDate.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        currentPeriodEnd = new Date(currentDate);
        currentPeriodEnd.setDate(currentDate.getDate() + (7 - daysFromMonday - 1));
        currentPeriodEnd.setHours(23, 59, 59, 999);

        currentPeriodStart = new Date(currentPeriodEnd);
        currentPeriodStart.setDate(currentPeriodEnd.getDate() - 6);
        currentPeriodStart.setHours(0, 0, 0, 0);

        previousPeriodEnd = new Date(currentPeriodStart);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
        previousPeriodEnd.setHours(23, 59, 59, 999);

        previousPeriodStart = new Date(previousPeriodEnd);
        previousPeriodStart.setDate(previousPeriodEnd.getDate() - 6);
        previousPeriodStart.setHours(0, 0, 0, 0);
      } else {
        currentPeriodStart = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
          0,
          0,
          0,
          0,
        );

        currentPeriodEnd = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );

        previousPeriodStart = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1,
          0,
          0,
          0,
          0,
        );

        previousPeriodEnd = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0,
          23,
          59,
          59,
          999,
        );
      }

      console.log(
        'Границы периодов:',
        '\nТекущий период:',
        currentPeriodStart.toISOString(),
        'до',
        currentPeriodEnd.toISOString(),
        '\nПредыдущий период:',
        previousPeriodStart.toISOString(),
        'до',
        previousPeriodEnd.toISOString(),
      );

      const currentPeriodData = data.filter((item) => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= currentPeriodStart && itemDate <= currentPeriodEnd;
      });

      const previousPeriodData = data.filter((item) => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= previousPeriodStart && itemDate <= previousPeriodEnd;
      });

      console.log(
        'Отфильтрованные данные:',
        '\nТекущий период:',
        currentPeriodData.length,
        'записей',
        '\nПредыдущий период:',
        previousPeriodData.length,
        'записей',
      );

      const aggregatedData: PeriodData[] = [];

      const tgCurrentMetric = calculateMetricSum(currentPeriodData, 'tg', metricType);
      const tgPreviousMetric = calculateMetricSum(previousPeriodData, 'tg', metricType);
      const tgChange = tgCurrentMetric - tgPreviousMetric;
      const tgChangePercent =
        tgPreviousMetric === 0 && tgCurrentMetric > 0
          ? 100
          : tgPreviousMetric === 0
            ? 0
            : (tgChange / tgPreviousMetric) * 100;

      const vkCurrentMetric = calculateMetricSum(currentPeriodData, 'vk', metricType);
      const vkPreviousMetric = calculateMetricSum(previousPeriodData, 'vk', metricType);
      const vkChange = vkCurrentMetric - vkPreviousMetric;
      const vkChangePercent =
        vkPreviousMetric === 0 && vkCurrentMetric > 0
          ? 100
          : vkPreviousMetric === 0
            ? 0
            : (vkChange / vkPreviousMetric) * 100;

      console.log('TG метрики:', {
        текущее: tgCurrentMetric,
        предыдущее: tgPreviousMetric,
        изменение: tgChange,
        процентИзменения: tgChangePercent,
      });

      console.log('VK метрики:', {
        текущее: vkCurrentMetric,
        предыдущее: vkPreviousMetric,
        изменение: vkChange,
        процентИзменения: vkChangePercent,
      });

      aggregatedData.push({
        platform: 'Telegram',
        metric: getMetricTitle(metricType),
        currentValue: tgCurrentMetric,
        previousValue: tgPreviousMetric,
        change: tgChange,
        changePercent: tgChangePercent,
      });

      aggregatedData.push({
        platform: 'ВКонтакте',
        metric: getMetricTitle(metricType),
        currentValue: vkCurrentMetric,
        previousValue: vkPreviousMetric,
        change: vkChange,
        changePercent: vkChangePercent,
      });

      setComparisonData(aggregatedData);
      renderChart(aggregatedData);
    }
  }, [data, loading, periodType, metricType]);

  const calculateMetricSum = (
    periodData: PostAnalytics[],
    platform: string,
    metricType: MetricType,
  ): number => {
    let sum = 0;

    periodData.forEach((item) => {
      if (platform === 'tg') {
        if (metricType === 'reactions') sum += item.tg_reactions;
        else if (metricType === 'views') sum += item.tg_views;
        else if (metricType === 'comments') sum += item.tg_comments;
      } else if (platform === 'vk') {
        if (metricType === 'reactions') sum += item.vk_reactions;
        else if (metricType === 'views') sum += item.vk_views;
        else if (metricType === 'comments') sum += item.vk_comments;
      }
    });

    return sum;
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

  return (
    <Card
      className={styles.analyticsCard}
      title={
        <Space>
          Сравнение активности по периодам
          <Tooltip title='Сравнивает показатели текущего и предыдущего периодов с расчетом процентного изменения'>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
      extra={
        <Space>
          <Select
            value={periodType}
            onChange={setPeriodType}
            options={[
              { value: 'week', label: 'Неделя' },
              { value: 'month', label: 'Месяц' },
            ]}
            style={{ width: 100 }}
          />
          <Select
            value={metricType}
            onChange={setMetricType}
            options={[
              { value: 'reactions', label: 'Реакции' },
              { value: 'views', label: 'Просмотры' },
              { value: 'comments', label: 'Комментарии' },
            ]}
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
