import React, { useEffect, useRef, useState } from 'react';
import { Card, Select, Spin, Space, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Radar } from '@antv/g2plot';
import { UserAnalytics } from '../../../models/Analytics/types';
import styles from './styles.module.scss';

interface RadarChartProps {
  data: UserAnalytics[];
  loading: boolean;
  height?: number;
}

const KPIRadarChart: React.FC<RadarChartProps> = ({ data, loading, height = 400 }) => {
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (data.length > 0) {
      setSelectedUserId(data[0].user_id);
    }
  }, [data]);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!loading && chartRef.current && data.length > 0 && selectedUserId) {
      const chartData = processDataForRadarChart(data, selectedUserId);

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const radar = new Radar(chartRef.current, {
        data: chartData,
        xField: 'item',
        yField: 'score',
        seriesField: 'user',
        meta: {
          score: {
            alias: 'Значение',
            min: 0,
            nice: true,
          },
        },
        xAxis: {
          line: null,
          tickLine: null,
        },
        yAxis: {
          label: false,
          grid: {
            alternateColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
        point: {
          size: 4,
        },
        area: {
          style: {
            fillOpacity: 0.3,
          },
        },
        legend: { position: 'bottom' },
      });

      radar.render();
      chartInstance.current = radar;
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data, loading, selectedUserId]);

  const processDataForRadarChart = (sourceData: UserAnalytics[], userId: number) => {
    const selectedUser = sourceData.find((user) => user.user_id === userId);

    if (!selectedUser) {
      return [];
    }

    // Нормализуем значения для радарного графика
    const maxValues = {
      likes: Math.max(...sourceData.map((u) => u.reactions), 1),
      views: Math.max(...sourceData.map((u) => u.views), 1),
      comments: Math.max(...sourceData.map((u) => u.comments), 1),
    };

    return [
      {
        item: 'Лайки',
        score: (selectedUser.reactions / maxValues.likes) * 100,
        user: `${selectedUser.user_id}`,
      },
      {
        item: 'Просмотры',
        score: (selectedUser.views / maxValues.views) * 100,
        user: `${selectedUser.user_id}`,
      },
      {
        item: 'Комментарии',
        score: (selectedUser.comments / maxValues.comments) * 100,
        user: `${selectedUser.user_id}`,
      },

      { item: 'Общий KPI', score: selectedUser.kpi, user: `${selectedUser.user_id}` },
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
          Показатели KPI пользователя
          <Tooltip title='Отображает различные метрики KPI выбранного пользователя'>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
    >
      <div style={{ marginBottom: '20px', display: 'flex', gap: '16px' }}>
        <Select
          value={selectedUserId}
          onChange={setSelectedUserId}
          style={{ width: '180px' }}
          options={data.map((user) => ({
            value: user.user_id,
            label: `Пользователь ${user.user_id}`,
          }))}
          placeholder='Выберите пользователя'
        />
      </div>

      <div ref={chartRef} style={{ height: height - 60 }} />
    </Card>
  );
};

export default KPIRadarChart;
