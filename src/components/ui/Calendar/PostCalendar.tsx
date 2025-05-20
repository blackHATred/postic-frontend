import React, { useEffect, useState } from 'react';
import { Calendar, ConfigProvider, Spin, Typography } from 'antd';
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import { Post } from '../../../models/Post/types';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { useAppSelector } from '../../../stores/hooks';
import { getPosts } from '../../../api/api';
import styles from './styles.module.scss';
import PostComponent from '../../cards/Post/Post';
import utc from 'dayjs/plugin/utc';
import locale from 'antd/locale/ru_RU';

dayjs.locale('ru');
dayjs.extend(utc);

const { Title } = Typography;

interface PostCalendarProps {
  posts_props: Post[];
}

const PostCalendar: React.FC<PostCalendarProps> = ({ posts_props }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [groupedPosts, setGroupedPosts] = useState<Record<string, Post[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [calendarMode, setCalendarMode] = useState<'month' | 'year'>('month');
  const teamId = useAppSelector((state) => state.teams.globalActiveTeamId);

  // Обрабатываем изначальные посты из props
  useEffect(() => {
    if (posts_props && posts_props.length > 0) {
      // Отфильтруем только отложенные посты с датой публикации в будущем
      const scheduledPosts = posts_props.filter((post) => {
        if (!post.pub_datetime) return false;

        const postDate = dayjs(post.pub_datetime);
        const now = dayjs();

        // Проверяем, что пост запланирован на будущее
        return postDate.isAfter(now);
      });

      setPosts(scheduledPosts);
    } else {
      // Если посты не переданы, загрузим их сами
      loadMonthPosts();
    }
  }, [posts_props]);

  // Загружаем посты для выбранного месяца при его изменении
  useEffect(() => {
    if (posts_props.length === 0) {
      loadMonthPosts();
    }
  }, [currentMonth, teamId]);

  // Функция загрузки постов для выбранного месяца
  const loadMonthPosts = async () => {
    if (teamId === 0) return;

    setIsLoading(true);

    try {
      const startOfMonth = currentMonth.startOf('month').utc().format();
      const result = await getPosts(teamId, 100, startOfMonth, 'scheduled', true);

      const filteredPosts = result.posts.filter((post) => {
        if (!post.pub_datetime) return false;

        const postDate = dayjs(post.pub_datetime);
        const now = dayjs();

        return (
          postDate.month() === currentMonth.month() &&
          postDate.year() === currentMonth.year() &&
          postDate.isAfter(now)
        );
      });

      setPosts(filteredPosts);
    } catch (error) {
      console.error('Ошибка при загрузке постов для календаря:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Группируем посты по датам
  useEffect(() => {
    const grouped: Record<string, Post[]> = {};

    posts.forEach((post) => {
      if (post.pub_datetime) {
        const dateKey = dayjs(post.pub_datetime).format('YYYY-MM-DD');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(post);
      }
    });

    setGroupedPosts(grouped);
  }, [posts]);

  // Обновляем выбранные посты при изменении даты или группировки
  useEffect(() => {
    if (selectedDate) {
      setSelectedPosts(groupedPosts[selectedDate] || []);
    }
  }, [selectedDate, groupedPosts]);

  // Обработчик выбора даты
  const handleSelect = (date: Dayjs) => {
    if (calendarMode === 'year') return;

    const dateKey = date.format('YYYY-MM-DD');
    setSelectedDate(dateKey);
  };

  // Обработчик изменения месяца/года
  const onPanelChange = (date: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
    setCurrentMonth(date);
    setCalendarMode(mode as 'month' | 'year');
    setSelectedDate(null);
  };

  const getPostsForDate = (value: Dayjs) => {
    const dateKey = value.format('YYYY-MM-DD');
    return groupedPosts[dateKey] || [];
  };

  // Сортируем посты по времени
  const sortedPostsByTime = (posts: Post[]): Post[] => {
    return [...posts].sort((a, b) => {
      const timeA = a.pub_datetime ? dayjs(a.pub_datetime).valueOf() : 0;
      const timeB = b.pub_datetime ? dayjs(b.pub_datetime).valueOf() : 0;
      return timeA - timeB;
    });
  };

  // Рендер ячейки дня
  const dateCellRender = (value: Dayjs) => {
    const postsForDate = getPostsForDate(value);
    const sortedPosts = sortedPostsByTime(postsForDate);

    return (
      <ul className={styles.events}>
        {sortedPosts.map((post) => {
          const timeStr = dayjs(post.pub_datetime).format('HH:mm');
          const platforms = post.platforms?.join(', ') || '';

          return (
            <li key={post.id}>
              <span className={styles.eventTime}>{timeStr}</span>
              <span className={styles.eventPlatform}>{platforms}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  // Рендер ячейки месяца
  const monthCellRender = (value: Dayjs) => {
    const month = value.month();
    const year = value.year();

    let postCount = 0;

    Object.keys(groupedPosts).forEach((dateKey) => {
      const date = dayjs(dateKey);
      if (date.month() === month && date.year() === year) {
        postCount += groupedPosts[dateKey].length;
      }
    });

    return postCount > 0 ? (
      <div className={styles.notesMonth}>
        <section>{postCount}</section>
        <span>Посты месяца</span>
      </div>
    ) : null;
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    if (info.type === 'month') return monthCellRender(current);
    return info.originNode;
  };

  return teamId !== 0 ? (
    <div className={styles.calendarWrapper}>
      <Title level={3} className={styles.calendarTitle}>
        Календарь отложенных постов
      </Title>
      <div className={styles.calendarContainer}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size='large' />
          </div>
        ) : (
          <ConfigProvider locale={locale}>
            <Calendar
              cellRender={cellRender}
              onSelect={handleSelect}
              onPanelChange={onPanelChange}
              value={currentMonth}
              mode={calendarMode}
              className={calendarMode === 'year' ? styles.yearViewCalendar : ''}
            />
          </ConfigProvider>
        )}
      </div>

      {selectedDate && (
        <div className={styles.selectedDatePosts}>
          <Title level={4} className={styles.selectedDateTitle}>
            Посты на {dayjs(selectedDate).format('DD MMMM YYYY')}
          </Title>
          {selectedPosts.length > 0 ? (
            <div className={styles.postsList}>
              {sortedPostsByTime(selectedPosts).map((post) => (
                <PostComponent key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className={styles.noPostsMessage}>На этот день нет запланированных постов</div>
          )}
        </div>
      )}
    </div>
  ) : null;
};

export default PostCalendar;
