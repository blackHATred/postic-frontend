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
  hasTelegram?: boolean;
  hasVk?: boolean;
}

type Platform = 'all' | 'telegram' | 'vk';

const TopEngagingPostsList: React.FC<TopEngagingPostsListProps> = ({
  data,
  loading,
  hasTelegram,
  hasVk,
}) => {
  const [platform, setPlatform] = useState<Platform>('all');
  const [postsData, setPostsData] = useState<PostAnalytics[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);

  const activePlatforms = useAppSelector((state) => state.teams.globalActivePlatforms);

  const isTelegramAvailable =
    hasTelegram !== undefined
      ? hasTelegram
      : activePlatforms.some((p) => p.platform === 'telegram' && p.isLinked);
  const isVkAvailable =
    hasVk !== undefined ? hasVk : activePlatforms.some((p) => p.platform === 'vk' && p.isLinked);

  const postIds = useMemo(() => {
    const ids = new Set<number>();
    data.forEach((item) => ids.add(item.post_union_id));
    return Array.from(ids);
  }, [data]);

  const loadPostsData = async () => {
    if (postIds.length === 0) return;

    setLocalLoading(true);
    try {
      const postsStats = [];

      for (const postId of postIds) {
        const postStatsRequest: PostReq = {
          team_id: selectedTeamId,
          post_union_id: postId,
        };

        try {
          const response = await GetPostStats(postStatsRequest);

          if (response?.resp) {
            postsStats.push(...response.resp);
          } else if (Array.isArray(response)) {
            postsStats.push(...response);
          } else if (response && typeof response === 'object') {
            const data = response as any;
            if (data.team_id && data.platform) {
              postsStats.push(data);
            } else if (Array.isArray(data.posts)) {
              postsStats.push(...data.posts);
            }
          }
        } catch (err) {}
      }

      const transformedData = transformPostStatsToAnalytics(postsStats);
      setPostsData(transformedData);
    } catch (error) {
      // хмм
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    const allPostsHaveData = postIds.every((id) =>
      postsData.some((post) => post.post_union_id === id),
    );

    if (postIds.length > 0 && !allPostsHaveData) {
      loadPostsData();
    }
  }, [postIds, selectedTeamId]);

  const filteredData = useMemo(() => {
    if (platform === 'telegram') {
      return postsData.filter(
        (post) => post.tg_views > 0 || post.tg_reactions > 0 || post.tg_comments > 0,
      );
    } else if (platform === 'vk') {
      return postsData.filter(
        (post) => post.vk_views > 0 || post.vk_reactions > 0 || post.vk_comments > 0,
      );
    }
    return postsData;
  }, [postsData, platform]);

  const calculateEngagementScore = (post: PostAnalytics): number => {
    let score = 0;

    if (platform === 'telegram') {
      // комментарии (вес 3) > реакции (вес 2) > просмотры (вес 1)
      score = post.tg_comments * 3 + post.tg_reactions * 2 + post.tg_views * 1;
    } else if (platform === 'vk') {
      score = post.vk_comments * 3 + post.vk_reactions * 2 + post.vk_views * 1;
    } else {
      score =
        (post.tg_comments + post.vk_comments) * 3 +
        (post.tg_reactions + post.vk_reactions) * 2 +
        (post.tg_views + post.vk_views) * 1;
    }

    return score;
  };

  const sortedData = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a))
      .slice(0, 5); // топ-5 постов
  }, [filteredData]);

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
        <Space style={{ whiteSpace: 'wrap', paddingRight: '10px' }}>
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

      <div className={styles.tableScrollContainer}>
        <ConfigProvider locale={ruRU}>
          <Table
            dataSource={sortedData}
            columns={columns}
            loading={loading || localLoading}
            pagination={{ pageSize: 10 }}
            rowKey='post_union_id'
          />
        </ConfigProvider>
      </div>
    </Card>
  );
};

export default TopEngagingPostsList;
