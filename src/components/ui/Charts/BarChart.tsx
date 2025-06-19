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
  xField?: string;
  xAxisTitle?: string;
  metricType?: 'reactions' | 'comments';
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  loading = false,
  height = 400,
  colors = ['#4096ff', '#f759ab'],
  xField = 'date',
  xAxisTitle = 'Дата',
  metricType = 'reactions',
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Column | null>(null);

  useEffect(() => {
    if (!loading && chartRef.current && data.length > 0) {
      const transformedData: any[] = [];

      data.forEach((item) => {
        const xValue =
          item[xField as keyof PostAnalytics] || new Date(item.timestamp).toLocaleDateString();

        const safeViewsTg = item.tg_views || 0;
        const safeViewsVk = item.vk_views || 0;

        const tgMetric =
          metricType === 'reactions' ? item.tg_reactions || 0 : item.tg_comments || 0;
        const vkMetric =
          metricType === 'reactions' ? item.vk_reactions || 0 : item.vk_comments || 0;

        const tgER = safeViewsTg > 0 ? parseFloat(((tgMetric / safeViewsTg) * 100).toFixed(2)) : 0;

        const vkER = safeViewsVk > 0 ? parseFloat(((vkMetric / safeViewsVk) * 100).toFixed(2)) : 0;

        transformedData.push({
          [xField]: xValue,
          value: tgER,
          platform: 'Telegram',
        });

        transformedData.push({
          [xField]: xValue,
          value: vkER,
          platform: 'ВКонтакте',
        });
      });

      if (chartInstance.current) {
        try {
          chartInstance.current.destroy();
          chartInstance.current = null;
        } catch (error) {
          // хмм
        }
      }

      const newChart = new Column(chartRef.current, {
        data: transformedData,
        xField: xField,
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
          title: { text: xAxisTitle },
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
          // что-то тут было, но теперь этого нет
        }
      }
    };
  }, [data, loading, height, colors, xField, xAxisTitle]);

  return (
    <div className={styles.chartContainer} style={{ height }}>
      {loading ? <Spin size='large' className={styles.spinner} /> : null}
      <div ref={chartRef} className={styles.chart} />
    </div>
  );
};

export default BarChart;
