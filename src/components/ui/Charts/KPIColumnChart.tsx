import React, { useEffect, useRef, useState } from 'react';
import { Card, Select, Spin, Space, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Column } from '@antv/g2plot';
import { UserAnalytics } from '../../../models/Analytics/types';
import styles from './styles.module.scss';

const { Text } = Typography;

interface KPIRadarChartProps {
  data: UserAnalytics[];
  loading: boolean;
  height?: number;
}

type KPIMetric = 'reactions' | 'views' | 'comments' | 'kpi';

const KPIColumnChart: React.FC<KPIRadarChartProps> = ({ data, loading, height = 400 }) => {
  const [selectedMetric, setSelectedMetric] = useState<KPIMetric>('reactions');
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  const totalValue = data.reduce((sum, user) => sum + user[selectedMetric], 0);
  const averageValue = data.length > 0 ? totalValue / data.length : 0;

  useEffect(() => {
    if (!loading && chartRef.current && data.length > 0) {
      const chartData = processDataForColumnChart(data, selectedMetric);

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const column = new Column(chartRef.current, {
        data: chartData,
        xField: 'user',
        yField: 'value',
        seriesField: 'user',
        label: {
          position: 'top',
        },
        xAxis: {
          label: {
            autoRotate: true,
          },
        },
        meta: {
          value: {
            alias: getMetricTitle(selectedMetric),
          },
        },
        appendPadding: 40,
        annotations: [
          {
            type: 'line',
            start: ['min', averageValue],
            end: ['max', averageValue],
            style: {
              stroke: '#ff4d4f',
              lineDash: [4, 4],
              lineWidth: 2,
            },
            text: {
              content: `Среднее: ${averageValue.toFixed(2)}`,
              position: 'end',
              offsetY: -25,
              style: {
                textAlign: 'center',
                fill: '#ff4d4f',
                fontSize: 12,
              },
            },
          },
        ],
        interactions: [{ type: 'element-active' }],
        legend: false,
        animation: {
          appear: {
            animation: 'wave-in',
            duration: 1000,
          },
        },
      });

      column.render();
      chartInstance.current = column;
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data, loading, selectedMetric, averageValue]);

  const getMetricTitle = (metric: KPIMetric): string => {
    switch (metric) {
      case 'reactions':
        return 'Лайки';
      case 'views':
        return 'Просмотры';
      case 'comments':
        return 'Комментарии';
      case 'kpi':
        return 'KPI';
    }
  };

  const processDataForColumnChart = (sourceData: UserAnalytics[], metric: KPIMetric) => {
    return sourceData
      .map((user) => ({
        user: user.username || `Пользователь ${user.user_id}`,
        value: user[metric],
      }))
      .sort((a, b) => b.value - a.value);
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
          Показатели KPI пользователей
          <Tooltip title='Отображает метрики KPI всех пользователей'>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
    >
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Select
          value={selectedMetric}
          onChange={setSelectedMetric}
          style={{ width: '180px' }}
          options={[
            { value: 'kpi', label: 'KPI' },
            { value: 'reactions', label: 'Лайки' },
            { value: 'views', label: 'Просмотры' },
            { value: 'comments', label: 'Комментарии' },
          ]}
        />
        <Space direction='vertical' align='end'>
          <Text strong>Суммарно: {totalValue}</Text>
          <Text strong>Среднее значение: {averageValue.toFixed(2)}</Text>
        </Space>
      </div>

      <div ref={chartRef} style={{ height: height - 60 }} />
    </Card>
  );
};

export default KPIColumnChart;
