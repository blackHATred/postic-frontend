import React, { useState, useMemo, useEffect } from 'react';
import { Card, Table, Select, Space, Tooltip, ConfigProvider, Button } from 'antd';
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { PostAnalytics, PostReq } from '../../../models/Analytics/types';
import styles from './styles.module.scss';
import { SortOrder } from 'antd/es/table/interface';
import ruRU from 'antd/locale/ru_RU';
import { GetPostStats } from '../../../api/api';
import { transformPostStatsToAnalytics } from '../../../utils/transformData';
import { useAppSelector } from '../../../stores/hooks';

interface TopEngagingPostsListProps {
  data: PostAnalytics[];
  loading: boolean;
}

type Platform = 'all' | 'telegram' | 'vk';

const TopEngagingPostsList: React.FC<TopEngagingPostsListProps> = ({ data, loading }) => {
  const [platform, setPlatform] = useState<Platform>('all');
  const [postsData, setPostsData] = useState<PostAnalytics[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);

  // Получаем уникальные ID постов из данных
  const postIds = useMemo(() => {
    const ids = new Set<number>();
    data.forEach((item) => ids.add(item.post_union_id));
    return Array.from(ids);
  }, [data]);

  // Загружаем детализированную статистику для топ-постов
  const loadPostsData = async () => {
    if (postIds.length === 0) return;

    setLocalLoading(true);
    try {
      // Собираем все статистические данные для постов
      const postsStats = [];

      // Делаем запросы для каждого поста (можно оптимизировать, создав групповой запрос на бэкенде)
      for (const postId of postIds) {
        const postStatsRequest: PostReq = {
          team_id: selectedTeamId,
          post_union_id: postId,
        };

        try {
          const response = await GetPostStats(postStatsRequest);
          if (response.resp) {
            postsStats.push(...response.resp);
          }
        } catch (err) {
          console.error(`Ошибка при загрузке статистики для поста ID ${postId}:`, err);
        }
      }

      // Преобразуем данные для отображения
      const transformedData = transformPostStatsToAnalytics(postsStats);
      setPostsData(transformedData);
    } catch (error) {
      console.error('Ошибка при загрузке статистики постов:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Загружаем данные при первом рендере или изменении списка ID постов
  useEffect(() => {
    loadPostsData();
  }, [data, selectedTeamId]);

  const filteredData = useMemo(() => {
    if (platform === 'telegram') {
      return postsData.filter(
        (post) =>
          (post.tg_views !== undefined && post.tg_views !== null) ||
          post.tg_reactions > 0 ||
          post.tg_comments > 0,
      );
    } else if (platform === 'vk') {
      return postsData.filter(
        (post) =>
          (post.vk_views !== undefined && post.vk_views !== null) ||
          post.vk_reactions > 0 ||
          post.vk_comments > 0,
      );
    }
    return postsData;
  }, [postsData, platform]);

  const columns = [
    {
      title: '№',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Пост ID',
      dataIndex: 'post_union_id',
      key: 'post_union_id',
    },
    {
      title: 'Просмотры',
      key: 'views',
      render: (record: any) => {
        if (platform === 'telegram') return record.tg_views;
        if (platform === 'vk') return record.vk_views;
        return record.tg_views + record.vk_views;
      },
      sorter: (a: any, b: any) => {
        if (platform === 'telegram') return a.tg_views - b.tg_views;
        if (platform === 'vk') return a.vk_views - b.vk_views;
        return a.tg_views + a.vk_views - (b.tg_views + b.vk_views);
      },
      defaultSortOrder: 'descend' as SortOrder,
    },
    {
      title: 'Реакции',
      key: 'reactions',
      render: (record: any) => {
        if (platform === 'telegram') return record.tg_reactions;
        if (platform === 'vk') return record.vk_reactions;
        return record.tg_reactions + record.vk_reactions;
      },
      sorter: (a: any, b: any) => {
        if (platform === 'telegram') return a.tg_reactions - b.tg_reactions;
        if (platform === 'vk') return a.vk_reactions - b.vk_reactions;
        return a.tg_reactions + a.vk_reactions - (b.tg_reactions + b.vk_reactions);
      },
    },
    {
      title: 'Комментарии',
      key: 'comments',
      render: (record: any) => {
        if (platform === 'telegram') return record.tg_comments;
        if (platform === 'vk') return record.vk_comments;
        return record.tg_comments + record.vk_comments;
      },
      sorter: (a: any, b: any) => {
        if (platform === 'telegram') return a.tg_comments - b.tg_comments;
        if (platform === 'vk') return a.vk_comments - b.vk_comments;
        return a.tg_comments + a.vk_comments - (b.tg_comments + b.vk_comments);
      },
    },
    {
      title: 'ER (%)',
      key: 'er',
      render: (record: any) => {
        let er = 0;
        if (platform === 'telegram') {
          er = record.tg_views > 0 ? (record.tg_reactions / record.tg_views) * 100 : 0;
        } else if (platform === 'vk') {
          er = record.vk_views > 0 ? (record.vk_reactions / record.vk_views) * 100 : 0;
        } else {
          const totalViews = record.tg_views + record.vk_views;
          const totalReactions = record.tg_reactions + record.vk_reactions;
          er = totalViews > 0 ? (totalReactions / totalViews) * 100 : 0;
        }
        return er.toFixed(2);
      },
      sorter: (a: any, b: any) => {
        let erA = 0,
          erB = 0;

        if (platform === 'telegram') {
          erA = a.tg_views > 0 ? (a.tg_reactions / a.tg_views) * 100 : 0;
          erB = b.tg_views > 0 ? (b.tg_reactions / b.tg_views) * 100 : 0;
        } else if (platform === 'vk') {
          erA = a.vk_views > 0 ? (a.vk_reactions / a.vk_views) * 100 : 0;
          erB = b.vk_views > 0 ? (b.vk_reactions / b.vk_views) * 100 : 0;
        } else {
          const totalViewsA = a.tg_views + a.vk_views;
          const totalReactionsA = a.tg_reactions + a.vk_reactions;
          erA = totalViewsA > 0 ? (totalReactionsA / totalViewsA) * 100 : 0;

          const totalViewsB = b.tg_views + b.vk_views;
          const totalReactionsB = b.tg_reactions + b.vk_reactions;
          erB = totalViewsB > 0 ? (totalReactionsB / totalViewsB) * 100 : 0;
        }

        return erA - erB;
      },
    },
  ];

  return (
    <Card
      className={styles.analyticsCard}
      title={
        <Space>
          Топ вовлекающих постов
          <Tooltip title='Посты, отсортированные по метрикам вовлеченности'>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
      extra={
        <Button icon={<ReloadOutlined />} onClick={loadPostsData} loading={localLoading}>
          Обновить
        </Button>
      }
    >
      <div style={{ marginBottom: '20px' }}>
        <span style={{ marginRight: '8px' }}>Платформа:</span>
        <Select
          value={platform}
          onChange={(value) => setPlatform(value)}
          style={{ width: 120 }}
          options={[
            { value: 'all', label: 'Все' },
            { value: 'telegram', label: 'Telegram' },
            { value: 'vk', label: 'ВКонтакте' },
          ]}
        />
      </div>

      <ConfigProvider locale={ruRU}>
        <Table
          dataSource={filteredData}
          columns={columns}
          loading={loading || localLoading}
          pagination={{ pageSize: 10 }}
          rowKey='post_union_id'
        />
      </ConfigProvider>
    </Card>
  );
};

export default TopEngagingPostsList;
