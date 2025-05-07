// src/components/ui/Charts/BarChart.tsx
import React, { useEffect, useRef } from 'react';
import styles from './styles.module.scss';
import { Spin } from 'antd';
import { Column } from '@antv/g2plot';
import { PostAnalytics } from '../../../models/Analytics/types';

interface BarChartProps {
  data: PostAnalytics[];
  loading?: boolean;
  height?: number;
  colors?: string[];
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  loading = false,
  height = 400,
  colors = ['#4096ff', '#f759ab'],
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Column | null>(null);

  useEffect(() => {
    if (!loading && chartRef.current && data.length > 0) {
      const transformedData: any[] = [];

      data.forEach((item) => {
        const date = new Date(item.timestamp).toLocaleDateString();

        const tgER =
          item.tg_views > 0 ? ((item.tg_reactions / item.tg_views) * 100).toFixed(2) : '0';

        // ER для ВКонтакте
        const vkER =
          item.vk_views > 0 ? ((item.vk_reactions / item.vk_views) * 100).toFixed(2) : '0';

        transformedData.push({
          date,
          value: parseFloat(tgER),
          platform: 'Telegram',
        });

        transformedData.push({
          date,
          value: parseFloat(vkER),
          platform: 'ВКонтакте',
        });
      });

      if (chartInstance.current) {
        try {
          chartInstance.current.destroy();
          chartInstance.current = null;
        } catch (error) {
          console.error('Ошибка при уничтожении графика:', error);
        }
      }

      const newChart = new Column(chartRef.current, {
        data: transformedData,
        xField: 'date',
        yField: 'value',
        seriesField: 'platform',
        isGroup: true,
        columnWidthRatio: 0.8,
        label: {
          position: 'top',
          style: { opacity: 0.8 },
        },
        yAxis: {
          title: { text: 'Engagement Rate (%)' },
          min: 0,
        },
        xAxis: {
          title: { text: 'Дата' },
        },
        tooltip: {
          showMarkers: false,
        },
        legend: {
          position: 'top',
        },
        color: colors,
        animation: {
          appear: {
            animation: 'wave-in',
            duration: 1000,
          },
        },
      });

      newChart.render();
      chartInstance.current = newChart;
    }

    return () => {
      if (chartInstance.current) {
        try {
          chartInstance.current.destroy();
        } catch (error) {
          console.error('Ошибка при уничтожении графика:', error);
        }
        chartInstance.current = null;
      }
    };
  }, [loading, data, colors]);

  if (loading) {
    return (
      <div className={styles.analyticsCard}>
        <Spin size='large' />
      </div>
    );
  }

  return <div ref={chartRef} style={{ height }} />;
};

export default BarChart;
