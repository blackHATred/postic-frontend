import { Comment } from '../models/Comment/types';
import { CommentWithChildren } from '../components/lists/CommentList/commentTree';

// Функция для генерации более разнообразных случайных дат
const getRandomDate = () => {
  const now = new Date();
  // Увеличиваем диапазон до 6 месяцев вместо 1
  const pastDate = new Date();
  pastDate.setMonth(now.getMonth() - 6);

  // Добавляем микросекунды для большего разнообразия дат
  const randomTimestamp =
    pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime()) + Math.random(); // Добавляем случайную дробную часть для микросекунд

  // Для еще большего разнообразия немного смещаем время в пределах выбранного дня
  const result = new Date(randomTimestamp);

  // Добавляем случайное количество секунд и миллисекунд
  result.setSeconds(Math.floor(Math.random() * 60));
  result.setMilliseconds(Math.floor(Math.random() * 1000));

  return result.toISOString();
};

/**
 * Создает генератор дат, равномерно распределенных в заданном временном диапазоне
 *
 * @param count Количество дат для генерации
 * @param startDate Начальная дата диапазона (по умолчанию: 12 месяцев назад)
 * @param endDate Конечная дата диапазона (по умолчанию: текущая дата)
 * @param withRandomization Добавлять ли случайное смещение к каждой дате
 * @returns Итератор, возвращающий даты в формате ISO строки
 */
function* createDateGenerator(
  count: number,
  startDate?: Date,
  endDate?: Date,
  withRandomization = false,
): Generator<string, void, unknown> {
  // Определяем границы временного диапазона
  const end = endDate || new Date();
  const start = startDate || new Date(end);
  if (!startDate) {
    // По умолчанию используем диапазон в 12 месяцев
    start.setFullYear(end.getFullYear() - 1);
  }

  const timeRange = end.getTime() - start.getTime();
  const step = timeRange / (count - 1 || 1); // Шаг между датами

  for (let i = 0; i < count; i++) {
    let timestamp = start.getTime() + step * i;

    // Добавляем случайное смещение если требуется (±10% от шага)
    if (withRandomization && i > 0 && i < count - 1) {
      const maxOffset = step * 0.1;
      timestamp += (Math.random() * 2 - 1) * maxOffset;
    }

    const date = new Date(timestamp);

    // Добавляем случайные секунды и миллисекунды для большего разнообразия
    if (withRandomization) {
      date.setSeconds(Math.floor(Math.random() * 60));
      date.setMilliseconds(Math.floor(Math.random() * 1000));
    }

    yield date.toISOString();
  }
}

// Кэш генераторов дат для повторного использования
const dateGeneratorCache: Record<string, Generator<string, void, unknown>> = {};

/**
 * Получает или создает генератор дат с заданными параметрами
 *
 * @param key Уникальный ключ для кэширования генератора
 * @param count Количество дат для генерации
 * @param startDate Начальная дата диапазона
 * @param endDate Конечная дата диапазона
 * @returns Итератор дат
 */
const getDateGenerator = (
  key: string,
  count: number,
  startDate?: Date,
  endDate?: Date,
): Generator<string, void, unknown> => {
  if (!dateGeneratorCache[key]) {
    dateGeneratorCache[key] = createDateGenerator(count, startDate, endDate);
  }
  return dateGeneratorCache[key];
};

// Функция для генерации случайного аватара (иногда null)
const getRandomAvatar = (id: number) => {
  if (Math.random() > 0.7) {
    return null;
  }

  return {
    id: 1,
    file_path: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/200/200`,
    file_type: 'image/jpeg',
    created_at: getRandomDate(),
  };
};

// Массив возможных текстов для случайных комментариев
const commentTexts = [
  'Спасибо за информацию, очень полезно!',
  'А когда будет обновление?',
  'Не могу понять, как это работает...',
  'Отличный пост, продолжайте в том же духе!',
  'Есть ли у вас другие материалы по этой теме?',
  'Можно подробнее о функционале?',
  'Планируется ли поддержка мобильных устройств?',
  'Как связаться с поддержкой?',
  'Хотелось бы больше примеров использования',
  'Работает отлично, спасибо разработчикам!',
  'Столкнулся с проблемой при использовании',
  'Когда планируется выход следующей версии?',
  'Можно ли использовать это в коммерческих проектах?',
  'Очень интересная статья, спасибо!',
  'Как это интегрировать с другими сервисами?',
];

// Функция для генерации случайного имени пользователя
const getRandomName = () => {
  const firstNames = [
    'Иван',
    'Мария',
    'Алексей',
    'Екатерина',
    'Сергей',
    'Анна',
    'Дмитрий',
    'Ольга',
    'Андрей',
    'Татьяна',
  ];
  const lastNames = [
    'Иванов',
    'Смирнова',
    'Кузнецов',
    'Попова',
    'Соколов',
    'Новикова',
    'Морозов',
    'Петрова',
    'Волков',
    'Соловьева',
  ];

  return `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${firstNames[Math.floor(Math.random() * firstNames.length)]}`;
};

// Функция для генерации случайного имени пользователя (username)
const getRandomUsername = () => {
  const usernames = [
    'user',
    'cool_person',
    'web_developer',
    'tech_fan',
    'coffee_lover',
    'gaming_master',
    'travel_enthusiast',
    'photo_pro',
    'music_lover',
    'book_worm',
  ];
  const randomNum = Math.floor(Math.random() * 1000);

  return `${usernames[Math.floor(Math.random() * usernames.length)]}${randomNum}`;
};

// Функция для генерации случайных вложений (1-3 или none)
const getRandomAttachments = (commentId: number) => {
  if (Math.random() > 0.3) {
    return [];
  }

  const count = Math.floor(Math.random() * 3) + 1;
  const attachments = [];

  for (let i = 0; i < count; i++) {
    attachments.push({
      id: commentId * 100 + i,
      comment_id: commentId,
      file_type: Math.random() > 0.5 ? 'image/jpeg' : 'application/pdf',
      file_path: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/800/600`,
      created_at: getRandomDate(),
    });
  }

  return attachments;
};

// Функция для генерации случайного int32 (положительные значения)
const getRandomInt32 = () => {
  return Math.floor(Math.random() * 2147483647) + 1; // От 1 до 2147483647 (максимальное положительное значение int32)
};

// Функция для генерации случайной платформы
const getRandomPlatform = () => {
  const platforms = ['tg', 'vk', 'ok', 'ig', 'fb'];
  return platforms[Math.floor(Math.random() * platforms.length)];
};

// Значения по умолчанию для количества комментариев
const DEFAULT_PARENT_COMMENTS_COUNT = 1000;
const DEFAULT_CHILD_COMMENTS_COUNT = 2000;

// Функция для имитации вызова API getComments
export const getMockComments = async (
  selectedteamid: number,
  union_id: number,
  limit: number,
  offset?: string,
  before = true,
  marked_as_ticket?: boolean,
  parentCommentsCount: number = DEFAULT_PARENT_COMMENTS_COUNT,
  childCommentsCount: number = DEFAULT_CHILD_COMMENTS_COUNT,
): Promise<CommentWithChildren[]> => {
  // Имитируем задержку сети
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));

  // Создаем время отсечки из параметра offset
  const offsetTime = offset ? new Date(offset) : new Date();

  // Создаем или получаем генератор дат для родительских комментариев
  const parentDatesKey = `parent_${selectedteamid}_${union_id}`;
  const parentDateGenerator = getDateGenerator(
    parentDatesKey,
    10000, // Создаем больше дат, чем нужно, для фильтрации
    new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // Последний год
    new Date(),
  );

  // Создаем или получаем генератор дат для дочерних комментариев
  const childDatesKey = `child_${selectedteamid}_${union_id}`;
  const childDateGenerator = getDateGenerator(
    childDatesKey,
    10000,
    new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    new Date(),
  );

  // Генерируем все родительские комментарии (больше, чем нужно, для фильтрации)
  const allParentComments: Comment[] = [];
  const usedIds = new Set<number>(); // Для отслеживания уже использованных ID

  for (let i = 1; i <= parentCommentsCount; i++) {
    // Генерируем уникальный случайный ID
    let id = getRandomInt32();
    while (usedIds.has(id)) {
      id = getRandomInt32();
    }
    usedIds.add(id);

    // Используем дату из генератора или создаем случайно, если генератор исчерпан
    let commentDate;
    const nextDate = parentDateGenerator.next();
    if (!nextDate.done) {
      commentDate = nextDate.value;
    } else {
      commentDate = getRandomDate(); // Запасной вариант, если генератор исчерпан
    }

    allParentComments.push({
      id,
      team_id: selectedteamid,
      post_union_id: union_id,
      platform: getRandomPlatform(),
      post_platform_id: getRandomInt32(),
      user_platform_id: getRandomInt32(),
      comment_platform_id: getRandomInt32(),
      full_name: getRandomName(),
      username: getRandomUsername(),
      avatar_mediafile: getRandomAvatar(id),
      text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
      reply_to_comment_id: null,
      is_team_reply: false,
      created_at: commentDate,
      attachments: getRandomAttachments(id),
      marked_as_ticket: marked_as_ticket ? Math.random() > 0.7 : false,
    });
  }

  // Фильтруем комментарии по времени и применяем limit
  let filteredParentComments = [...allParentComments];

  // Фильтруем по времени в зависимости от параметра before
  if (before) {
    // Если before=true, берем комментарии, созданные до offsetTime
    filteredParentComments = filteredParentComments.filter(
      (comment) => new Date(comment.created_at) < offsetTime,
    );
  } else {
    // Если before=false, берем комментарии, созданные после offsetTime
    filteredParentComments = filteredParentComments.filter(
      (comment) => new Date(comment.created_at) > offsetTime,
    );
  }

  // Сортируем по времени (новые сначала)
  filteredParentComments.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // Применяем ограничение по количеству (limit)
  const parentComments = filteredParentComments.slice(0, limit);

  // Генерируем дочерние комментарии только для отфильтрованных родительских
  const childComments: Comment[] = [];
  const parentIds = parentComments.map((comment) => comment.id);

  // Для каждого родительского комментария генерируем случайное количество дочерних
  parentIds.forEach((parentId) => {
    // Случайное количество дочерних комментариев для каждого родителя (от 0 до 5)
    const childCount = Math.floor(
      Math.random() * Math.min(5, childCommentsCount / parentIds.length),
    );

    for (let i = 0; i < childCount; i++) {
      // Генерируем уникальный случайный ID
      let id = getRandomInt32();
      while (usedIds.has(id)) {
        id = getRandomInt32();
      }
      usedIds.add(id);

      // Используем дату из генератора дочерних комментариев
      let commentDate;
      const nextChildDate = childDateGenerator.next();
      if (!nextChildDate.done) {
        commentDate = nextChildDate.value;
      } else {
        commentDate = getRandomDate(); // Запасной вариант
      }

      childComments.push({
        id,
        team_id: selectedteamid,
        post_union_id: union_id,
        platform: getRandomPlatform(),
        post_platform_id: getRandomInt32(),
        user_platform_id: getRandomInt32(),
        comment_platform_id: getRandomInt32(),
        full_name: getRandomName(),
        username: getRandomUsername(),
        avatar_mediafile: getRandomAvatar(id),
        text: `Ответ на комментарий #${parentId}: ${commentTexts[Math.floor(Math.random() * commentTexts.length)]}`,
        reply_to_comment_id: parentId,
        is_team_reply: Math.random() > 0.7, // 30% шанс, что это ответ от команды
        created_at: commentDate,
        attachments: getRandomAttachments(id),
        marked_as_ticket: false, // дочерние комментарии не маркируются как тикеты
      });
    }
  });

  // Объединяем все комментарии
  const allComments = [...parentComments, ...childComments];

  // Создаем дерево комментариев
  const map: Record<number, CommentWithChildren> = {};
  const roots: CommentWithChildren[] = [];

  allComments.forEach((comment) => {
    map[comment.id] = { ...comment, children: [], realLevel: 0 };
  });

  allComments.forEach((comment) => {
    if (comment.reply_to_comment_id === null) {
      roots.push(map[comment.id]);
    } else if (map[comment.reply_to_comment_id]) {
      const parent = map[comment.reply_to_comment_id];
      map[comment.id].realLevel = (parent.realLevel || 0) + 1;
      parent.children.push(map[comment.id]);
    } else {
      roots.push(map[comment.id]);
    }
  });

  // Сортируем комментарии по дате (сначала новые)
  const sortNodeChildren = (node: CommentWithChildren) => {
    if (node.children.length > 0) {
      node.children.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      node.children.forEach(sortNodeChildren);
    }
  };

  roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  roots.forEach(sortNodeChildren);

  return roots;
};
