import React, { useEffect, useRef, useState } from 'react';
import { Card, Select, Spin, Space, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Column } from '@antv/g2plot';
import { UserAnalytics } from '../../../models/Analytics/types';
import styles from './styles.module.scss';
import { GetProfile } from '../../../api/api';

const { Text } = Typography;

interface KPIRadarChartProps {
  data: UserAnalytics[];
  loading: boolean;
  height?: number;
}

interface UserNicknames {
  [userId: number]: string;
}

type KPIMetric = 'reactions' | 'views' | 'comments' | 'kpi';

const KPIColumnChart: React.FC<KPIRadarChartProps> = ({ data, loading, height = 400 }) => {
  const [selectedMetric, setSelectedMetric] = useState<KPIMetric>('reactions');
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const [userNicknames, setUserNicknames] = useState<UserNicknames>({});

  const isMockMode = typeof window !== 'undefined' && (window as any).MOCK_ANALYTICS === true;

  const safeCalculateTotalValue = () => {
    let total = 0;
    for (const user of data) {
      const value = user[selectedMetric];
      if (typeof value === 'number' && !isNaN(value)) {
        total += value;
      }
    }
    return total;
  };

  const totalValue = safeCalculateTotalValue();
  const averageValue = data.length > 0 ? totalValue / data.length : 0;

  useEffect(() => {
    if (data.length > 0) {
      if (isMockMode) {
        const nicknames: UserNicknames = {};
        for (const user of data) {
          nicknames[user.user_id] = user.nickname || `Пользователь ${user.user_id}`;
        }
        setUserNicknames(nicknames);
        return;
      }

      const loadUserNicknames = async () => {
        const nicknames: UserNicknames = {};

        for (const user of data) {
          try {
            const response = await GetProfile(user.user_id.toString());
            if (response && response.nickname) {
              nicknames[user.user_id] = response.nickname;
            }
          } catch (error) {
            console.error(`Ошибка при получении никнейма для пользователя ${user.user_id}:`, error);
          }
        }

        setUserNicknames(nicknames);
      };

      loadUserNicknames();
    }
  }, [data, isMockMode]);

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
              offsetY: -2,
              style: {
                textAlign: 'end',
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
  }, [data, loading, selectedMetric, averageValue, userNicknames]);

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

  const getUserDisplayName = (userId: number): string => {
    return (
      userNicknames[userId] ||
      data.find((user) => user.user_id === userId)?.username ||
      `Пользователь ${userId}`
    );
  };

  const processDataForColumnChart = (sourceData: UserAnalytics[], metric: KPIMetric) => {
    return sourceData
      .map((user) => ({
        user: getUserDisplayName(user.user_id),
        value: user[metric],
        userId: user.user_id,
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
