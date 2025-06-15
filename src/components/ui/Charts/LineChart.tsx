import React, { useEffect, useRef, useState } from 'react';
import { Card, Space, Spin, Tooltip, Radio } from 'antd';
import { Area } from '@antv/g2plot';
import { PostAnalytics } from '../../../models/Analytics/types';
import { InfoCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../../stores/hooks';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

interface LineChartProps {
  data: PostAnalytics[];
  loading?: boolean;
  height?: number;
  colors?: string[];
  hasTelegram?: boolean;
  hasVk?: boolean;
  showWeekSelector?: boolean;
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
  hasTelegram,
  hasVk,
  showWeekSelector = true,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Area | null>(null);

  const [currentWeek, setCurrentWeek] = useState<number>(0); // 0 - текущая, -1 - предыдущая, 1 - следующая

  const getWeekBoundaries = (weekOffset: number) => {
    const today = dayjs();

    const currentMonday = today.startOf('isoWeek');

    const startOfWeek = currentMonday.add(weekOffset * 7, 'day');
    const endOfWeek = startOfWeek.add(6, 'day');

    return [startOfWeek, endOfWeek];
  };

  const [weekStart, weekEnd] = getWeekBoundaries(currentWeek);

  const getWeekLabel = (weekOffset: number) => {
    switch (weekOffset) {
      case -1:
        return 'Предыдущая неделя';
      case 0:
        return 'Текущая неделя';
      case 1:
        return 'Следующая неделя';
      default:
        if (weekOffset < 0) {
          return `${Math.abs(weekOffset)} ${Math.abs(weekOffset) === 1 ? 'неделя' : 'недели'} назад`;
        }
        return `${weekOffset} ${weekOffset === 1 ? 'неделя' : 'недели'} вперед`;
    }
  };

  const goToPrevWeek = () => {
    setCurrentWeek(currentWeek - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeek(currentWeek + 1);
  };

  const activePlatforms = useAppSelector((state) => state.teams.globalActivePlatforms);

  const isTelegramAvailable =
    hasTelegram !== undefined
      ? hasTelegram
      : activePlatforms.some((p) => p.platform === 'tg' && p.isLinked);
  const isVkAvailable =
    hasVk !== undefined ? hasVk : activePlatforms.some((p) => p.platform === 'vk' && p.isLinked);

  useEffect(() => {
    if (!loading && chartRef.current && data.length > 0) {
      let sortedData = [...data].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      if (showWeekSelector) {
        const weekStartDate = weekStart.toDate();
        const weekEndDate = weekEnd.toDate();

        sortedData = sortedData.filter((item) => {
          const itemDate = new Date(item.timestamp);
          return itemDate >= weekStartDate && itemDate <= weekEndDate;
        });
      }

      const aggregatedByDay = new Map<
        string,
        {
          tg_views: number;
          tg_reactions: number;
          tg_comments: number;
          vk_views: number;
          vk_reactions: number;
          vk_comments: number;
        }
      >();

      sortedData.forEach((item) => {
        const dateObj = new Date(item.timestamp);
        const dateStr = dateObj.toISOString().split('T')[0];

        if (!aggregatedByDay.has(dateStr)) {
          aggregatedByDay.set(dateStr, {
            tg_views: 0,
            tg_reactions: 0,
            tg_comments: 0,
            vk_views: 0,
            vk_reactions: 0,
            vk_comments: 0,
          });
        }

        const current = aggregatedByDay.get(dateStr)!;
        if (isTelegramAvailable) {
          current.tg_views += item.tg_views;
          current.tg_reactions += item.tg_reactions;
          current.tg_comments += item.tg_comments;
        }
        if (isVkAvailable) {
          current.vk_views += item.vk_views;
          current.vk_reactions += item.vk_reactions;
          current.vk_comments += item.vk_comments;
        }
      });

      const transformedData: any[] = [];

      Array.from(aggregatedByDay.entries())
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .forEach(([dateStr, metrics]) => {
          const formattedDate = new Date(dateStr).toLocaleDateString('ru-RU');

          // Добавляем метрики только для подключенных платформ
          if (isTelegramAvailable) {
            transformedData.push({
              date: dateStr,
              formattedDate,
              value: metrics.tg_views,
              category: 'Просмотры TG',
              platform: 'Telegram',
            });

            transformedData.push({
              date: dateStr,
              formattedDate,
              value: metrics.tg_reactions,
              category: 'Реакции TG',
              platform: 'Telegram',
            });

            transformedData.push({
              date: dateStr,
              formattedDate,
              value: metrics.tg_comments,
              category: 'Комментарии TG',
              platform: 'Telegram',
            });
          }

          if (isVkAvailable) {
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
          }
        });

      if (chartInstance.current) {
        try {
          chartInstance.current.destroy();
          chartInstance.current = null;
        } catch (error) {
          console.error('Ошибка при уничтожении графика:', error);
        }
      }

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
  }, [
    data,
    loading,
    isTelegramAvailable,
    isVkAvailable,
    currentWeek,
    weekStart,
    weekEnd,
    showWeekSelector,
  ]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Spin size='large' />
      </div>
    );
  }

  // Если нет подключенных платформ, показываем уведомление
  if (!isTelegramAvailable && !isVkAvailable) {
    return (
      <Card title='Динамика активности'>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          Нет подключенных платформ для отображения метрик
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <span>Динамика активности</span>
          <Tooltip title='График показывает динамику метрик за выбранный период'>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
      extra={
        // если проп showWeekSelector установлен в true
        showWeekSelector ? (
          <Space>
            <Radio.Button onClick={goToPrevWeek}>
              <LeftOutlined />
            </Radio.Button>
            <Radio.Button disabled style={{ minWidth: '150px', textAlign: 'center' }}>
              {getWeekLabel(currentWeek)}
            </Radio.Button>
            <Radio.Button onClick={goToNextWeek}>
              <RightOutlined />
            </Radio.Button>
          </Space>
        ) : null
      }
      style={{ width: '100%' }}
    >
      {data.length > 0 ? (
        <div ref={chartRef} style={{ height }} />
      ) : (
        <div
          style={{
            height,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          Нет данных для отображения
        </div>
      )}
    </Card>
  );
};

export default LineChart;
