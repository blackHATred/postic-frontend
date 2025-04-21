// src/components/ui/Charts/TopEngagingPostsList.tsx
import React, { useState, useMemo } from 'react';
import { Card, Table, Select, Space, Tooltip, ConfigProvider } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { PostAnalytics } from '../../../models/Analytics/types';
import styles from './styles.module.scss';
import { SortOrder } from 'antd/es/table/interface';
import ruRU from 'antd/locale/ru_RU';

interface TopEngagingPostsListProps {
  data: PostAnalytics[];
  loading: boolean;
}

type Platform = 'all' | 'telegram' | 'vk';

const TopEngagingPostsList: React.FC<TopEngagingPostsListProps> = ({ data, loading }) => {
  const [platform, setPlatform] = useState<Platform>('all');

  // Группируем данные по post_union_id и берем последние записи
  const postsData = useMemo(() => {
    const postsMap = new Map();

    // Сгруппируем данные по post_union_id
    data.forEach((item) => {
      if (
        !postsMap.has(item.post_union_id) ||
        new Date(postsMap.get(item.post_union_id).timestamp) < new Date(item.timestamp)
      ) {
        postsMap.set(item.post_union_id, { ...item });
      }
    });

    // Преобразуем Map в массив
    return Array.from(postsMap.values()).map((post) => {
      const tgER = post.tg_views > 0 ? (post.tg_reactions / post.tg_views) * 100 : 0;
      const vkER = post.vk_views > 0 ? (post.vk_reactions / post.vk_views) * 100 : 0;
      const totalViews = post.tg_views + post.vk_views;
      const totalER =
        totalViews > 0 ? ((post.tg_reactions + post.vk_reactions) / totalViews) * 100 : 0;

      return {
        ...post,
        tgER,
        vkER,
        totalER,
        totalReactions: post.tg_reactions + post.vk_reactions,
        totalComments: post.tg_comments + post.vk_comments,
        totalViews,
        key: post.post_union_id,
      };
    });
  }, [data]);

  // Фильтрация данных по выбранной платформе
  const filteredData = useMemo(() => {
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
      title: 'Дата',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => new Date(text).toLocaleDateString(),
      sorter: (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: 'Просмотры',
      key: 'views',
      render: (record: any) => {
        if (platform === 'telegram') return record.tg_views;
        if (platform === 'vk') return record.vk_views;
        return record.totalViews;
      },
      sorter: (a: any, b: any) => {
        if (platform === 'telegram') return a.tg_views - b.tg_views;
        if (platform === 'vk') return a.vk_views - b.vk_views;
        return a.totalViews - b.totalViews;
      },
      defaultSortOrder: 'descend' as SortOrder,
    },
    {
      title: 'Реакции',
      key: 'reactions',
      render: (record: any) => {
        if (platform === 'telegram') return record.tg_reactions;
        if (platform === 'vk') return record.vk_reactions;
        return record.totalReactions;
      },
      sorter: (a: any, b: any) => {
        if (platform === 'telegram') return a.tg_reactions - b.tg_reactions;
        if (platform === 'vk') return a.vk_reactions - b.vk_reactions;
        return a.totalReactions - b.totalReactions;
      },
    },
    {
      title: 'Комментарии',
      key: 'comments',
      render: (record: any) => {
        if (platform === 'telegram') return record.tg_comments;
        if (platform === 'vk') return record.vk_comments;
        return record.totalComments;
      },
      sorter: (a: any, b: any) => {
        if (platform === 'telegram') return a.tg_comments - b.tg_comments;
        if (platform === 'vk') return a.vk_comments - b.vk_comments;
        return a.totalComments - b.totalComments;
      },
    },
    {
      title: 'ER (%)',
      key: 'er',
      render: (record: any) => {
        if (platform === 'telegram') return record.tgER.toFixed(2);
        if (platform === 'vk') return record.vkER.toFixed(2);
        return record.totalER.toFixed(2);
      },
      sorter: (a: any, b: any) => {
        if (platform === 'telegram') return a.tgER - b.tgER;
        if (platform === 'vk') return a.vkER - b.vkER;
        return a.totalER - b.totalER;
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
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey='post_union_id'
        />
      </ConfigProvider>
    </Card>
  );
};

export default TopEngagingPostsList;
