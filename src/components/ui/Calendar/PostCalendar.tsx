import React, { useEffect, useState } from 'react';
import { Calendar, ConfigProvider, Popover, Spin, Typography } from 'antd';
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import { Post } from '../../../models/Post/types';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { getPosts } from '../../../api/api';
import styles from './styles.module.scss';
import PostComponent from '../../cards/Post/Post';
import utc from 'dayjs/plugin/utc';
import locale from 'antd/locale/ru_RU';
import {
  setPosts,
  setCalendarSelectedDate,
  setCalendarSelectedPosts,
} from '../../../stores/postsSlice';
import { Max_POSTS } from '../../../constants/appConfig';

dayjs.locale('ru');
dayjs.extend(utc);

const { Title } = Typography;

const PostCalendar: React.FC = () => {
  const [groupedPosts, setGroupedPosts] = useState<Record<string, Post[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [calendarMode, setCalendarMode] = useState<'month' | 'year'>('month');

  const teamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const dispatch = useAppDispatch();
  const posts = useAppSelector((state) => state.posts.posts);
  const activeFilter = useAppSelector((state) => state.posts.activePostFilter);
  const helpMode = useAppSelector((state) => state.settings.helpMode);

  const savedSelectedDate = useAppSelector((state) => state.posts.calendarSelectedDate);
  const savedSelectedPosts = useAppSelector((state) => state.posts.calendarSelectedPosts);

  useEffect(() => {
    if (savedSelectedDate) {
      setSelectedDate(savedSelectedDate);
      setSelectedPosts(savedSelectedPosts);
    }
  }, []);

  useEffect(() => {
    if (teamId === 0) return;

    const loadMonthPosts = async () => {
      setIsLoading(true);
      const startOfMonth = currentMonth.startOf('month').utc().format();

      try {
        let filter = undefined;
        if (activeFilter === 'published' || activeFilter === 'scheduled') {
          filter = activeFilter;
        }

        const result = await getPosts(teamId, Max_POSTS, startOfMonth, filter, false);
        if (result.posts) {
          const filteredPosts = result.posts.filter((post) => {
            const dateToUse = post.pub_datetime || post.created_at;
            if (!dateToUse) return false;

            const postDate = dayjs(dateToUse);
            return (
              postDate.month() === currentMonth.month() && postDate.year() === currentMonth.year()
            );
          });

          dispatch(setPosts(filteredPosts));
        } else {
          dispatch(setPosts([]));
        }
      } catch (error) {
        // ъ
      } finally {
        setIsLoading(false);
      }
    };

    loadMonthPosts();
  }, [teamId, currentMonth, activeFilter]);

  useEffect(() => {
    const grouped: Record<string, Post[]> = {};

    posts.forEach((post) => {
      const dateToUse = post.pub_datetime || post.created_at;
      if (dateToUse) {
        const dateKey = dayjs(dateToUse).format('YYYY-MM-DD');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(post);
      }
    });

    setGroupedPosts(grouped);

    if (selectedDate) {
      const postsForSelectedDate = grouped[selectedDate] || [];
      setSelectedPosts(postsForSelectedDate);

      dispatch(setCalendarSelectedDate(selectedDate));
      dispatch(setCalendarSelectedPosts(postsForSelectedDate));
    }
  }, [posts, selectedDate]);

  const handleSelect = (date: Dayjs) => {
    if (calendarMode === 'year') return;

    const dateKey = date.format('YYYY-MM-DD');
    setSelectedDate(dateKey);
    const postsForDate = groupedPosts[dateKey] || [];
    setSelectedPosts(postsForDate);

    dispatch(setCalendarSelectedDate(dateKey));
    dispatch(setCalendarSelectedPosts(postsForDate));
  };

  const onPanelChange = (date: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
    setCurrentMonth(date);
    setCalendarMode(mode as 'month' | 'year');
  };

  const getPostsForDate = (value: Dayjs) => {
    const dateKey = value.format('YYYY-MM-DD');
    return groupedPosts[dateKey] || [];
  };

  const sortedPostsByTime = (posts: Post[]): Post[] => {
    return [...posts].sort((a, b) => {
      const timeA = a.pub_datetime
        ? dayjs(a.pub_datetime).valueOf()
        : dayjs(a.created_at).valueOf();
      const timeB = b.pub_datetime
        ? dayjs(b.pub_datetime).valueOf()
        : dayjs(b.created_at).valueOf();
      return timeA - timeB;
    });
  };

  const dateCellRender = (value: Dayjs) => {
    const postsForDate = getPostsForDate(value);
    const sortedPosts = sortedPostsByTime(postsForDate);

    const content = (
      <ul className={styles.events}>
        {sortedPosts.map((post) => {
          const dateToUse = post.pub_datetime || post.created_at;
          const timeStr = dayjs(dateToUse).format('HH:mm');
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

    let tooltipText = 'Нажмите, чтобы увидеть снизу список постов на этот день';
    if (activeFilter === 'published') {
      tooltipText = 'Нажмите, чтобы увидеть снизу список опубликованных постов на этот день';
    } else if (activeFilter === 'scheduled') {
      tooltipText = 'Нажмите, чтобы увидеть снизу список запланированных постов на этот день';
    }

    return helpMode ? (
      <Popover
        content={<div className={styles['popover-content']}>{tooltipText}</div>}
        trigger='hover'
        mouseEnterDelay={0.5}
        color={'#fff'}
        placement='top'
        overlayClassName={styles.calendarTooltip}
      >
        {content}
      </Popover>
    ) : (
      content
    );
  };

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

  const getCalendarTitle = () => {
    if (activeFilter === 'all') return 'Календарь всех постов';
    if (activeFilter === 'published') return 'Календарь опубликованных постов';
    if (activeFilter === 'scheduled') return 'Календарь отложенных постов';
    return 'Календарь постов';
  };

  return teamId !== 0 ? (
    <div className={styles.calendarWrapper}>
      <Title level={3} className={styles.calendarTitle}>
        {getCalendarTitle()}
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
              fullscreen={true}
              validRange={[dayjs('2000-01-01'), dayjs('2100-12-31')]}
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
