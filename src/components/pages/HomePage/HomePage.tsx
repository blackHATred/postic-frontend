import React, { useEffect, useState } from 'react';
import { Typography, Button } from 'antd';
import {
  RocketOutlined,
  CommentOutlined,
  TagOutlined,
  AreaChartOutlined,
  DownOutlined,
} from '@ant-design/icons';
import styles from './styles.module.scss';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/App.routes';
import { useAppSelector } from '../../../stores/hooks';

const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const authorizeStatus = useAppSelector((state) => state.teams.authorize_status);
  const isAuthenticated = authorizeStatus === 'authorized';
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const handleStartClick = () => {
    if (isAuthenticated) {
      navigate(routes.teams());
    } else {
      navigate(routes.login());
    }
  };

  useEffect(() => {
    const checkScrollHeight = () => {
      const hasScroll = document.body.scrollHeight > window.innerHeight;
      setShowScrollIndicator(hasScroll && window.innerWidth <= 768);
    };

    checkScrollHeight();
    window.addEventListener('resize', checkScrollHeight);

    return () => {
      window.removeEventListener('resize', checkScrollHeight);
    };
  }, []);

  const handleScrollClick = () => {
    window.scrollBy({
      top: window.innerHeight * 0.6,
      behavior: 'smooth',
    });
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.heroSection}>
        <div className={styles.brushStroke}>
          <svg viewBox='0 0 1200 600' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M200,400 C300,300 400,550 600,350 C800,150 1000,450 1100,300'
              fill='none'
              stroke='url(#gradient)'
              strokeWidth='150'
              strokeLinecap='round'
              opacity='0.1'
            />
            <defs>
              <linearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                <stop offset='0%' stopColor='#13C2C2' />
                <stop offset='50%' stopColor='#73D13D' />
                <stop offset='100%' stopColor='#597EF7' />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className={styles.content}>
          <Title level={1} className={styles.title}>
            Postic
          </Title>
          <Title level={3} className={styles.subtitle}>
            Единая платформа для управления контентом
          </Title>
          <Paragraph className={styles.description}>
            Web-сервис для публикации контента, модерации и управления сообществами в соцсетях из
            одного места. Упростите ваш рабочий процесс с Postic.
          </Paragraph>

          <div className={styles.featuresContainer}>
            <div className={styles.featureCard}>
              <RocketOutlined className={styles.featureIcon} />
              <Title level={4} className={styles.featureTitle}>
                Публикация контента
              </Title>
              <Paragraph className={styles.featureParagraph}>
                Создавайте и планируйте посты для различных социальных сетей. Управляйте всеми
                публикациями из одной точки.
              </Paragraph>
            </div>
            <div className={styles.featureCard}>
              <CommentOutlined className={styles.featureIcon} />
              <Title level={4} className={styles.featureTitle}>
                Модерация комментариев
              </Title>
              <Paragraph className={styles.featureParagraph}>
                Централизованное управление комментариями со всех платформ. Оперативно реагируйте на
                отзывы пользователей.
              </Paragraph>
            </div>
            <div className={styles.featureCard}>
              <TagOutlined className={styles.featureIcon} />
              <Title level={4} className={styles.featureTitle}>
                Тикет-система
              </Title>
              <Paragraph className={styles.featureParagraph}>
                Эффективная организация рабочих процессов с помощью тикетов. Отслеживайте и решайте
                задачи вашей команды.
              </Paragraph>
            </div>
            <div className={styles.featureCard}>
              <AreaChartOutlined className={styles.featureIcon} />
              <Title level={4} className={styles.featureTitle}>
                Аналитика
              </Title>
              <Paragraph className={styles.featureParagraph}>
                Подробные отчеты и статистика для анализа эффективности ваших публикаций и
                активности аудитории.
              </Paragraph>
            </div>
          </div>

          <div className={styles.startButtonContainer}>
            <Button
              type='primary'
              size='large'
              className={styles.startButton}
              onClick={handleStartClick}
            >
              Начать работу
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Text type='secondary'>© 2025 Postic х VK Education</Text>
      </div>

      {showScrollIndicator && (
        <div className={styles.scrollIndicator} onClick={handleScrollClick}>
          <DownOutlined />
        </div>
      )}
    </div>
  );
};

export default HomePage;
