// HelpContentComponents.tsx
import React, { useRef } from 'react';
import { Typography, Space, Image, Divider, Anchor } from 'antd';
import styles from './styles.module.scss';

const { Title, Text, Paragraph } = Typography;
const { Link } = Anchor;

const HelpContentBase: React.FC<{
  title: string;
  description: string;
  sections: { title: string; content: React.ReactNode }[];
}> = ({ title, description, sections }) => {
  const refer = useRef<HTMLDivElement>(null);
  return (
    <Space direction='vertical' className={styles.instructionSpace} size='small'>
      <Title level={4}>{title}</Title>
      <Paragraph>{description}</Paragraph>

      <Anchor
        className={styles.tableOfContents}
        affix={false}
        getContainer={() => refer.current || window}
        bounds={16}
      >
        {sections.map((section, index) => (
          <Link key={index} href={`#section-${index}`} title={section.title} />
        ))}
      </Anchor>

      {sections.map((section, index) => (
        <div key={index} id={`section-${index}`} className={styles.sectionContainer}>
          <Divider className={styles.customDivider} orientation='left'>
            {section.title}
          </Divider>
          <div className={styles.sectionContent}>{section.content}</div>
        </div>
      ))}
    </Space>
  );
};

export const PostHelpContent: React.FC = () => (
  <HelpContentBase
    title='Посты'
    description='Создание, редактирование и управление постами'
    sections={[
      {
        title: 'Меню поста',
        content: (
          <div>
            <ol>
              <li>Все посты - это список всех ваших публикаций.</li>
              <li>
                Опубликованные посты - это список всех ваших публикаций, которые уже опубликованы.
              </li>
              <li>
                Отложенные посты - это список всех ваших публикаций, которые запланированы на
                будущее.
              </li>
              <li>Вид отображения постов можно переключать между списком и календарем.</li>
            </ol>
            <Image
              src={`${process.env.PUBLIC_URL}/post/post_menu.png`}
              alt='Меню поста'
              className={styles.screenshot}
            />
          </div>
        ),
      },
      {
        title: 'Карточка поста',
        content: (
          <Paragraph>
            В карточке поста вы можете увидеть:
            <ul>
              <li>
                Заголовок поста:
                <ul>
                  <li>Автор поста</li>
                  <li>Дата публикации</li>
                  <li>Платформы, на которых опубликован пост</li>
                  <li>
                    Кнопка комментариев, нажав на которую вы можете просмотреть комментарии к посту
                  </li>
                </ul>
              </li>
              <li>Содержание поста: текст и вложения (изображения и файлы)</li>
              <li>
                Кнопки управления постом:
                <ul>
                  <li>Редактировать пост</li>
                  <li>Удалить пост</li>
                </ul>
              </li>
            </ul>
            <Image
              src={`${process.env.PUBLIC_URL}/post/post_card.png`}
              alt='Карточка поста'
              className={styles.screenshot}
            />
          </Paragraph>
        ),
      },
      {
        title: 'Страница поста',
        content: (
          <div>
            <Paragraph>На странице поста вы можете увидеть комментарии к посту.</Paragraph>
            <Image
              src={`${process.env.PUBLIC_URL}/post/post_id.png`}
              alt='Страница поста'
              className={styles.screenshot}
            />
            <Paragraph>
              Кнопка "Анализ комментариев" делает анализ комментариев под постом и предоставляет их
              краткое содержание, учитывая их тональность и частоту упоминания ключевых слов.
            </Paragraph>
            <Paragraph>Кнопка-стрелка рядом с постом возвращает вас к списку постов.</Paragraph>
          </div>
        ),
      },
      {
        title: 'Календарь постов',
        content: (
          <Paragraph>
            <Paragraph>
              Для того, чтобы посмотреть календарь публикаций, нажмите на переключатель в боковой
              панели. Отображение списка постов изменится на календарь, где вы можете увидеть те
              посты, которые выбрали на боковой панели(все посты, опубликованные или отложенные).
            </Paragraph>
            <Paragraph>
              Если нажать на ячейку календаря, то снизу календаря появится список постов,
              опубликованных или отложенных на этот день.
            </Paragraph>
            <Image
              src={`${process.env.PUBLIC_URL}/post/post_calendar.png`}
              alt='Создание поста'
              className={styles.screenshot}
            />
          </Paragraph>
        ),
      },
    ]}
  />
);

// Компонент справки по работе с комментариями
export const CommentsHelpContent: React.FC = () => (
  <HelpContentBase
    title='Комментарии'
    description='Управление и работа с комментариями к постам'
    sections={[
      {
        title: 'Просмотр комментариев',
        content: (
          <Paragraph>
            Для просмотра комментариев нажмите на кнопку "Комментарии" под постом или "Все
            комментарии" в навигационном меню
          </Paragraph>
        ),
      },
      {
        title: 'Карточка комментария',
        content: (
          <Paragraph>
            В карточке комментария вы можете увидеть:
            <ul>
              <li>
                Заголовок комментария:
                <ul>
                  <li>Автор комментария</li>
                  <li>Дата отправки комментария</li>
                  <li>Платформа, с которой пользователь отправил комментарий</li>
                </ul>
              </li>
              <li>Содержание комментария: текст и вложения (изображения и файлы)</li>
              <li>
                Кнопки управления комментарием:
                <ul>
                  <li>
                    Ответить: открывает окно для ответа на комментарий, где вы можете ввести текст
                    или выбрать ответ среди быстрых ответов
                  </li>
                  <li>Удалить комментарий</li>
                  <li>Отметить комментарий как тикет: отправляет комментарий в тикет-систему</li>
                </ul>
              </li>
            </ul>
            <Image
              src={`${process.env.PUBLIC_URL}/comment/comment.png`}
              alt='Карточка поста'
              className={styles.screenshot}
            />
          </Paragraph>
        ),
      },
    ]}
  />
);

// Компонент справки по работе с тикетами
export const TicketsHelpContent: React.FC = () => (
  <HelpContentBase
    title='Тикеты'
    description='Система обработки запросов и обращений пользователей'
    sections={[
      {
        title: 'Решение тикета',
        content: (
          <Paragraph>
            Для решения тикета нужно нажать на кнопку в правом нижнем углу в карточке тикета. Он
            автоматически удалится из списка тикетов.
            <Image
              src={`${process.env.PUBLIC_URL}/comment/ticket.png`}
              alt='Карточка поста'
              className={styles.screenshot}
            />
          </Paragraph>
        ),
      },
    ]}
  />
);

// Компонент справки по аналитике
export const AnalyticsHelpContent: React.FC = () => (
  <HelpContentBase
    title='Аналитика'
    description='Статистика и анализ данных по публикациям и аудитории'
    sections={[
      {
        title: 'Обзор статистики',
        content: (
          <Paragraph>
            В разделе аналитики вы можете просматривать основные показатели эффективности ваших
            публикаций: количество просмотров, реакций и комментариев. Также вы можете увидеть KPI
            вашей команды и динамику роста аудитории.
            <div></div>
            <Image
              src={`${process.env.PUBLIC_URL}/analytics/analytics_menu.png`}
              alt='Обзор статистики'
              className={styles.screenshot}
            />
            <ul>
              <li>
                <Text strong>Общая сводка</Text> - показывает динамику активности по основням
                метрикам и их распределение по платформам
              </li>
              <li>
                <Text strong>Вовлеченность аудитории</Text> - анализ вовлеченности пользователей на
                основе отношения активности к просмотрам, список топовых постов по вовлеченности и
                анализ активности по дням недели
              </li>
              <li>
                <Text strong>Рост и динамика</Text> - сравнение роста аудитории по платформам за
                разные промежутки времени, процент прироста и сравнение по платформам
              </li>
              <li>
                <Text strong>KPI команды</Text> - анализ KPI вашей команды: индивидуальные
                показатели и по команде
              </li>
            </ul>
          </Paragraph>
        ),
      },
    ]}
  />
);

export const TeamHelpContent: React.FC = () => (
  <HelpContentBase
    title='Команды'
    description='Управление командами и участниками проекта'
    sections={[
      {
        title: 'Создание команды',
        content: (
          <>
            <Paragraph>
              Чтобы создать новую команду, перейдите в раздел "Команды" в левом меню и нажмите
              кнопку "Создать команду" в правой боковой панели. Введите название для вашей команды в
              появившемся диалоговом окне.
            </Paragraph>
          </>
        ),
      },
      {
        title: 'Карточка команды',
        content: (
          <Paragraph>
            После создания команды вы увидите её карточку.
            <Image
              src={`${process.env.PUBLIC_URL}/team/team_card.png`}
              alt='Создание команды'
              className={styles.screenshot}
            />
            В заголовке карточки команды отображается:
            <ul>
              <li>Название команды</li>
              <li>Платформы, привязанные к команде (при наличии)</li>
              <li>Кнопка с карандашом для редактирования названия команды</li>
            </ul>
            <Image
              src={`${process.env.PUBLIC_URL}/team/team_card_info.png`}
              alt='Создание команды'
              className={styles.screenshot}
            />
            Рядом расположены кнопки:
            <ul>
              <li>Добавить участника: открывает окно для добавления нового участника</li>
              <li>Покинуть команду</li>
              <li>
                Настройки: здесь можно посмотреть секретный ключ команды и привязать платформы
              </li>
            </ul>
            <Image
              src={`${process.env.PUBLIC_URL}/team/team_card_buttons.png`}
              alt='Создание команды'
              className={styles.screenshot}
            />
            Внизу карточки команды отображается список участников с их ролями:
            <Image
              src={`${process.env.PUBLIC_URL}/team/team_card_table.png`}
              alt='Создание команды'
              className={styles.screenshot}
            />
          </Paragraph>
        ),
      },
      {
        title: 'Добавление участников',
        content: (
          <>
            <Paragraph>
              Для добавления участников в команду:
              <ol>
                <li>Откройте карточку команды</li>
                <li>Нажмите кнопку "Добавить участника" в меню команды</li>
                <li>Введите ID пользователя, которого хотите пригласить</li>
                <li>На следующем шаге назначьте права доступа:</li>
              </ol>
            </Paragraph>
            <div style={{ marginLeft: '20px' }}>
              <Text strong>Доступные права:</Text>
              <ul>
                <li>
                  <Text strong>Администратор</Text> - полный доступ ко всем функциям
                </li>
                <li>
                  <Text strong>Посты</Text> - может создавать, редактировать и удалять посты
                </li>
                <li>
                  <Text strong>Комментарии</Text> - может просматривать, отвечать на комментарии и
                  отправлять их в тикет-систему
                </li>
                <li>
                  <Text strong>Аналитика</Text> - имеет доступ к просмотру аналитики
                </li>
              </ul>
            </div>
          </>
        ),
      },
      {
        title: 'Настройка платформ',
        content: (
          <>
            <Paragraph>
              Для публикации контента в социальных сетях необходимо настроить интеграции с
              платформами. В карточке команды нажмите на кнопку "Привязать платформу" и выберите
              платформу для настройки:
            </Paragraph>
            <div style={{ marginLeft: '20px' }}>
              <Text strong>Поддерживаемые платформы:</Text>
              <ul>
                <li>
                  <Text strong>ВКонтакте</Text> - требуется указать ID группы и ключи API
                </li>
                <li>
                  <Text strong>Telegram</Text> - требуется добавить бота администратором канала
                </li>
              </ul>
            </div>
            <Paragraph>
              Следуйте инструкциям, отображаемым при настройке каждой платформы.
            </Paragraph>
          </>
        ),
      },
      {
        title: 'Управление участниками',
        content: (
          <Paragraph>
            Администраторы команды могут:
            <ul>
              <li>Изменять роли участников - нажмите на права участника</li>
              <li>Удалять участников - нажмите на кнопку "-" напротив участника</li>
              <li>Передавать права администратора другим участникам</li>
            </ul>
            Покинуть команду могут все участники - нажмите на кнопку "Покинуть команду"
          </Paragraph>
        ),
      },
    ]}
  />
);

// Компонент справки по настройкам
export const SettingsHelpContent: React.FC = () => (
  <HelpContentBase
    title='Настройки'
    description='Управление настройками аккаунта и работы с интерфейсом'
    sections={[
      {
        title: 'Подсказки к функционалу интерфейса',
        content: (
          <Paragraph>
            Включите подсказки, чтобы при наведении курсора на элементы интерфейса получать
            информацию о их функционале.
          </Paragraph>
        ),
      },
    ]}
  />
);

// Компонент общей справки
export const GeneralHelpContent: React.FC = () => (
  <HelpContentBase
    title='Общая информация'
    description='Основные сведения о системе и часто задаваемые вопросы'
    sections={[
      {
        title: 'О платформе',
        content: (
          <Paragraph>
            Наша платформа предназначена для управления контентом в социальных сетях. Создавайте,
            планируйте и публикуйте материалы на разных платформах из единого интерфейса.
          </Paragraph>
        ),
      },
      {
        title: 'Первые шаги',
        content: (
          <Space direction='vertical'>
            <Paragraph type={'secondary'}>
              {' '}
              Совет: включите подсказки. Они будут пояснять неочевидный функционал при наведении
              курсора на элементы интерфейса.
            </Paragraph>
            <Paragraph strong>1. Создать команду</Paragraph>
            <Paragraph>
              Для создания команды перейдите в раздел "Команды" и нажмите кнопку "Создать команду".
            </Paragraph>
            <Paragraph strong>2. Привязать платформы (социальные сети)</Paragraph>
            <Paragraph>
              Для привязки платформ перейдите в карточку команды, нажмите на кнопку с шестеренкой,
              выберите "Привязать платформу" и следуйте инструкциям для настройки интеграции с
              ВКонтакте или Telegram.
            </Paragraph>
            <Paragraph strong>3. Опубликовать пост</Paragraph>
            <Paragraph>
              Перейдите в раздел "Посты", нажмите кнопку "Создать пост" и заполните необходимые
              поля: заголовок, текст, вложения.
            </Paragraph>
            <Paragraph strong>4. Планирование контента</Paragraph>
            <Paragraph>
              Вы можете планировать отложенные публикации, отслеживая их в календаре постов. Для
              того, чтобы перейти к календарю, нажмите на переключатель в боковой панели.
            </Paragraph>
          </Space>
        ),
      },
    ]}
  />
);
