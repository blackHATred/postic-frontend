import React from 'react';
import { Typography, Space } from 'antd';
import styles from './styles.module.scss';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  return (
    <div className={styles.homeContainer}>
      <Space direction='vertical' size='large' className={styles.content}>
        <Title level={1} className={styles.title}>
          Postic
        </Title>
        <Paragraph className={styles.description}>
          Web-сервис для публикации контента, модерации и управления сообществами в соцсетях из
          одного места
        </Paragraph>
        <div className={styles.featuresContainer}>
          <div className={styles.featureCard}>
            <Title level={4} className={styles.featureTitle}>
              Публикация контента
            </Title>
            <Paragraph className={styles.featureParagraph}>
              Создавайте и планируйте посты для различных социальных сетей
            </Paragraph>
          </div>
          <div className={styles.featureCard}>
            <Title level={4} className={styles.featureTitle}>
              Модерация комментариев
            </Title>
            <Paragraph className={styles.featureParagraph}>
              Централизованное управление комментариями со всех платформ
            </Paragraph>
          </div>
          <div className={styles.featureCard}>
            <Title level={4} className={styles.featureTitle}>
              Тикет-система
            </Title>
            <Paragraph className={styles.featureParagraph}>
              Эффективная организация рабочих процессов с помощью тикетов
            </Paragraph>
          </div>
          <div className={styles.featureCard}>
            <Title level={4} className={styles.featureTitle}>
              Аналитика
            </Title>
            <Paragraph className={styles.featureParagraph}>
              Подробные отчеты и статистика для анализа эффективности
            </Paragraph>
          </div>
        </div>
      </Space>
    </div>
  );
};

export default HomePage;
