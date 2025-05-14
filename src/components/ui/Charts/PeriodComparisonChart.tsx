export interface PeriodComparisonChartProps {
  loading: boolean;
}
/*
import React, { useState, useMemo } from 'react';
import { Card, Select, Row, Col, Statistic, Divider, Space, Tooltip, Radio, Empty } from 'antd';
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
    hasPreviousPeriodData,
    comparisonData,
    debugInfo,
  } = useMemo(() => {
    // Отладочная информация
    const debugLog: string[] = [];

    // Определяем временные границы для текущего и предыдущего периодов
    let currentPeriodStart: Date, previousPeriodStart: Date, previousPeriodEnd: Date;

    if (periodType === 'week') {
      // Вычисляем начало текущей недели (сегодня - 6 дней)
      currentPeriodStart = new Date(now);
      currentPeriodStart.setDate(now.getDate() - 6);
      currentPeriodStart.setHours(0, 0, 0, 0);

      // Предыдущая неделя: день перед началом текущей недели - 7 дней до него
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      previousPeriodEnd.setHours(23, 59, 59, 999);

      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 6);
      previousPeriodStart.setHours(0, 0, 0, 0);
    } else {
      // Текущий месяц: с 1-го числа до сегодня
      currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Предыдущий месяц
      previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      previousPeriodEnd.setHours(23, 59, 59, 999);
    }

    // Сортируем данные по дате для более точной обработки
    const sortedData = [...data].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    // Фильтруем данные по периодам
    const currentPeriodItems = sortedData.filter((item) => {
      const itemDate = new Date(item.timestamp);
      const isInPeriod = itemDate >= currentPeriodStart && itemDate <= now;

      return isInPeriod;
    });

    const previousPeriodItems = sortedData.filter((item) => {
      const itemDate = new Date(item.timestamp);
      const isInPeriod = itemDate >= previousPeriodStart && itemDate <= previousPeriodEnd;

      return isInPeriod;
    });

    const hasPreviousPeriodData = previousPeriodItems.length > 0;

    // Вычисляем значение метрики для конкретного элемента
    const getMetricValue = (item: PostAnalytics, metricKey: MetricType): number => {
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

      return 0;
    };

    // Подготавливаем структуру дней для периода
    const generateDaysForPeriod = (startDate: Date, endDate: Date): Map<string, Date> => {
      const days = new Map<string, Date>();
      const current = new Date(startDate);

      while (current <= endDate) {
        const dateKey = current.toISOString().split('T')[0];
        days.set(dateKey, new Date(current));
        current.setDate(current.getDate() + 1);
      }

      return days;
    };

    // Создаём структуру дней для текущего и предыдущего периодов
    const currentDays = generateDaysForPeriod(currentPeriodStart, now);
    const previousDays = generateDaysForPeriod(previousPeriodStart, previousPeriodEnd);

    // Группируем данные по дням
    const groupDataByDay = (
      periodItems: PostAnalytics[],
      days: Map<string, Date>,
    ): Map<string, number> => {
      const dailyMetrics = new Map<string, number>();

      // Инициализируем каждый день нулевым значением
      days.forEach((date, dateKey) => {
        dailyMetrics.set(dateKey, 0);
      });

      // Агрегируем метрики по дням
      for (const item of periodItems) {
        const itemDate = new Date(item.timestamp);
        const dateKey = itemDate.toISOString().split('T')[0];

        if (dailyMetrics.has(dateKey)) {
          const metricValue = getMetricValue(item, metricType);
          const currentValue = dailyMetrics.get(dateKey) || 0;
          const newValue = currentValue + metricValue;
          dailyMetrics.set(dateKey, newValue);
        } else {
        }
      }

      return dailyMetrics;
    };

    // Получаем агрегированные метрики по дням для обоих периодов
    const currentDailyMetrics = groupDataByDay(currentPeriodItems, currentDays);
    const previousDailyMetrics = groupDataByDay(previousPeriodItems, previousDays);

    // Форматируем значение метрики
    const formatMetricValue = (value: number) => {
      if (metricType === 'er') {
        return Number(value.toFixed(1));
      }
      return Math.round(value);
    };

    // Форматируем данные для текущего периода
    const currentFormattedData = Array.from(currentDays.entries()).map(([dateKey, date]) => {
      const value = currentDailyMetrics.get(dateKey) || 0;
      const formattedValue = formatMetricValue(value);
      const dayName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()];
      const formattedDate = `${date.getDate()}.${date.getMonth() + 1}`;

      const displayDate = periodType === 'week' ? `${dayName} (${formattedDate})` : formattedDate;

      return {
        date: displayDate,
        value: formattedValue,
        rawValue: value,
        period: 'Текущий период',
        dateKey,
        sortDate: date.getTime(), // для сортировки
      };
    });

    // Форматируем данные для предыдущего периода
    const previousFormattedData = Array.from(previousDays.entries()).map(([dateKey, date]) => {
      const value = previousDailyMetrics.get(dateKey) || 0;
      const formattedValue = formatMetricValue(value);
      const dayName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()];
      const formattedDate = `${date.getDate()}.${date.getMonth() + 1}`;

      const displayDate = periodType === 'week' ? `${dayName} (${formattedDate})` : formattedDate;

      return {
        date: displayDate,
        value: formattedValue,
        rawValue: value,
        period: 'Предыдущий период',
        dateKey,
        sortDate: date.getTime(), // для сортировки
      };
    });

    // Сортировка данных по дате для правильного отображения
    currentFormattedData.sort((a, b) => a.sortDate - b.sortDate);
    previousFormattedData.sort((a, b) => a.sortDate - b.sortDate);

    // Вычисляем суммарные значения для обоих периодов
    const currentTotal = Array.from(currentDailyMetrics.values()).reduce(
      (sum, val) => sum + val,
      0,
    );
    const previousTotal = Array.from(previousDailyMetrics.values()).reduce(
      (sum, val) => sum + val,
      0,
    );

    // Вычисляем процент изменения
    const percentDiff =
      previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    // Определяем метку метрики для отображения
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

    // Объединяем данные обоих периодов для графика
    const allData = hasPreviousPeriodData
      ? [...previousFormattedData, ...currentFormattedData]
      : [...currentFormattedData];

    return {
      currentPeriodData: currentFormattedData,
      previousPeriodData: previousFormattedData,
      percentChange: percentDiff,
      metricLabel: label,
      metricSummary: currentTotal.toFixed(metricType === 'er' ? 2 : 0),
      previousMetricSummary: previousTotal.toFixed(metricType === 'er' ? 2 : 0),
      hasPreviousPeriodData,
      comparisonData: allData,
      debugInfo: debugLog,
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
            columnWidthRatio: 0.6,
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
              lineWidth: 2,
              opacity: 0.8,
            },
            smooth: true,
            point: {
              shape: 'circle',
              size: 4,
            },
          },
        ],
        legend: {
          position: 'top',
        },
        xAxis: {
          type: 'cat',
          title: {
            text: periodType === 'week' ? 'День недели' : 'Дата',
          },
          label: {
            formatter: (text) => {
              // Убедимся что все даты отображаются
              return text;
            },
            autoRotate: true,
            autoHide: false,
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
          {!hasPreviousPeriodData && (
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>
              Нет данных за предыдущий период
            </div>
          )}
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Statistic
            title='Изменение'
            value={hasPreviousPeriodData ? percentChange.toFixed(1) : '-'}
            precision={1}
            valueStyle={{
              color: percentChange !== 0 ? (percentChange > 0 ? '#3f8600' : '#cf1322') : '#ffc53d',
            }}
            prefix={
              hasPreviousPeriodData && percentChange !== 0 ? (
                percentChange > 0 ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )
              ) : null
            }
            suffix={hasPreviousPeriodData ? '%' : ''}
          />
          {hasPreviousPeriodData && (
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>
              {percentChange >= 0
                ? 'рост относительно предыдущего периода'
                : 'падение относительно предыдущего периода'}
            </div>
          )}
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

      {comparisonData.length > 0 ? (
        <div style={{ height: '400px' }} ref={chartRef}></div>
      ) : (
        <Empty description='Нет данных для отображения' />
      )}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#999', display: 'none' }}>
          <details>
            <summary>Отладочная информация</summary>
            <pre>{debugInfo?.join('\n')}</pre>
          </details>
        </div>
      )}
    </Card>
  );
};

export default PeriodComparisonChart;
*/
