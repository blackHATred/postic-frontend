import React, { useEffect, useRef } from 'react';
import { Card, Space, Spin, Tooltip } from 'antd';
import { Area } from '@antv/g2plot';
import { PostAnalytics } from '../../../models/Analytics/types';
import { InfoCircleOutlined } from '@ant-design/icons';

interface LineChartProps {
  data: PostAnalytics[];
  loading?: boolean;
  height?: number;
  colors?: string[];
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  loading = false,
  height = 400,
  colors = [
    '#4096ff', // Просмотры TG
    '#1d39c4', // Реакции TG
    '#36cfc9', // Комментырии TG
    '#f759ab', // Просмотры VK
    '#b37feb', // Реакции VK
    '#ffadd2', // Комментарии VK
  ],
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Area | null>(null);

  useEffect(() => {
    if (!loading && chartRef.current && data.length > 0) {
      // Сначала сортируем данные по дате
      const sortedData = [...data].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      // Создаем Map для агрегации данных по датам
      const aggregatedData = new Map();

      sortedData.forEach((item) => {
        const dateObj = new Date(item.timestamp);
        const dateStr = dateObj.toISOString().split('T')[0]; // Формат YYYY-MM-DD

        if (!aggregatedData.has(dateStr)) {
          aggregatedData.set(dateStr, {
            tg_views: 0,
            tg_reactions: 0,
            tg_comments: 0,
            vk_views: 0,
            vk_reactions: 0,
            vk_comments: 0,
          });
        }

        const current = aggregatedData.get(dateStr);
        current.tg_views += item.tg_views;
        current.tg_reactions += item.tg_reactions;
        current.tg_comments += item.tg_comments;
        current.vk_views += item.vk_views;
        current.vk_reactions += item.vk_reactions;
        current.vk_comments += item.vk_comments;
      });

      // Преобразуем данные для графика
      const transformedData: any[] = [];

      // Преобразуем Map в массив в хронологическом порядке
      Array.from(aggregatedData.entries())
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .forEach(([dateStr, metrics]) => {
          const formattedDate = new Date(dateStr).toLocaleDateString();

          // Данные для TG
          transformedData.push({
            date: dateStr,
            formattedDate,
            value: metrics.tg_views,
            category: 'Просмотры TG',
            platform: 'Telegram',
          });

          // И так далее для остальных метрик...
          transformedData.push({
            date: dateStr,
            formattedDate,
            value: metrics.tg_reactions,
            category: 'Реакции TG',
            platform: 'Telegram',
          });

          // Добавьте остальные метрики аналогично
          transformedData.push({
            date: dateStr,
            formattedDate,
            value: metrics.tg_comments,
            category: 'Комментарии TG',
            platform: 'Telegram',
          });

          // VK метрики
          transformedData.push({
            date: dateStr,
            formattedDate,
            value: metrics.vk_views,
            category: 'Просмотры VK',
            platform: 'ВКонтакте',
          });

          transformedData.push({
            date: dateStr,
            formattedDate,
            value: metrics.vk_reactions,
            category: 'Реакции VK',
            platform: 'ВКонтакте',
          });

          transformedData.push({
            date: dateStr,
            formattedDate,
            value: metrics.vk_comments,
            category: 'Комментарии VK',
            platform: 'ВКонтакте',
          });
        });

      // Если график уже создан, уничтожаем его
      if (chartInstance.current) {
        try {
          chartInstance.current.destroy();
          chartInstance.current = null;
        } catch (error) {
          console.error('Ошибка при уничтожении графика:', error);
        }
      }

      // Создаем новый график
      const newChart = new Area(chartRef.current, {
        data: transformedData,
        xField: 'date',
        yField: 'value',
        seriesField: 'category',
        slider: {
          start: 0,
          end: 1,
          trendCfg: {
            isArea: true,
          },
        },
        meta: {
          date: {
            formatter: (val) =>
              transformedData.find((item) => item.date === val)?.formattedDate || val,
          },
        },
        yAxis: {
          title: {
            text: 'Количество',
          },
        },
        xAxis: {
          title: {
            text: 'Дата',
          },
        },
        tooltip: {
          showMarkers: true,
        },
        legend: {
          position: 'top',
        },
        color: colors,
        smooth: true,
        animation: {
          appear: {
            animation: 'path-in',
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
      <Card
        title={
          <Space>
            Топ вовлекающих постов
            <Tooltip title='График показывает общую динамику активности по всем соцсетям'>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        }
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
          <Spin size='large' />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          Топ вовлекающих постов
          <Tooltip title='График показывает общую динамику активности по всем соцсетям'>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
    >
      <div ref={chartRef} style={{ height }} />
    </Card>
  );
};

export default LineChart;
