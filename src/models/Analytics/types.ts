export interface PostAnalytics {
  post_union_id: number;
  tg_views: number;
  tg_reactions: number;
  tg_comments: number;
  vk_views: number;
  vk_reactions: number;
  vk_comments: number;
  user_id: number;
  timestamp: string;
}

export type GetPostStatsResponse = Array<{
  team_id: number;
  post_union_id: number;
  platform: string;
  views: number;
  comments: number;
  reactions: number;
}>;

export interface GetStatsReq {
  team_id: number;
  start: string;
  end: string;
}

export interface GetStatsResponse {
  posts: Array<{
    post_union_id: number;
    telegram: {
      views: number;
      comments: number;
      reactions: number;
    };
    vkontakte: {
      views: number;
      comments: number;
      reactions: number;
    };
  }>;
}

export interface PostReq {
  team_id: number;
  post_union_id: number;
}

export interface UserAnalytics {
  user_id: number;
  username: string;
  kpi: number;
  reactions: number;
  views: number;
  comments: number;
}

export interface GetUsersAnalyticsResponse {
  users: UserAnalytics[];
}

export const mockUsersAnalytics: GetUsersAnalyticsResponse = {
  users: [
    {
      user_id: 1,
      username: 'Ваня',
      kpi: 95,
      reactions: 10,
      views: 50,
      comments: 5,
    },
    {
      user_id: 2,
      username: 'Жожик',
      kpi: 78,
      reactions: 8,
      views: 35,
      comments: 12,
    },
    {
      user_id: 3,
      username: 'Постик',
      kpi: 87,
      reactions: 15,
      views: 120,
      comments: 8,
    },
    {
      user_id: 4,
      username: 'Иван иваныч',
      kpi: 62,
      reactions: 5,
      views: 25,
      comments: 3,
    },
    {
      user_id: 5,
      username: 'Админ',
      kpi: 91,
      reactions: 25,
      views: 150,
      comments: 20,
    },
  ],
};

export const mockDataGetStatsResponse: GetPostStatsResponse = [
  {
    team_id: 1,
    post_union_id: 1,
    platform: 'tg',
    views: 1000,
    comments: 50,
    reactions: 200,
  },
  {
    team_id: 1,
    post_union_id: 2,
    platform: 'tg',
    views: 800,
    comments: 30,
    reactions: 150,
  },
];

export const mockData: PostAnalytics[] = [
  {
    post_union_id: 1,
    tg_views: 120,
    tg_reactions: 15,
    tg_comments: 8,
    vk_views: 80,
    vk_reactions: 9,
    vk_comments: 4,
    user_id: 1,
    timestamp: '2023-01-01T00:22:00',
  },
  {
    post_union_id: 1,
    tg_views: 250,
    tg_reactions: 32,
    tg_comments: 14,
    vk_views: 120,
    vk_reactions: 18,
    vk_comments: 7,
    user_id: 1,
    timestamp: '2023-01-02T00:22:00',
  },
  {
    post_union_id: 1,
    tg_views: 380,
    tg_reactions: 45,
    tg_comments: 19,
    vk_views: 210,
    vk_reactions: 22,
    vk_comments: 10,
    user_id: 1,
    timestamp: '2023-01-03T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 450,
    tg_reactions: 58,
    tg_comments: 22,
    vk_views: 270,
    vk_reactions: 28,
    vk_comments: 12,
    user_id: 1,
    timestamp: '2023-01-04T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 520,
    tg_reactions: 67,
    tg_comments: 26,
    vk_views: 310,
    vk_reactions: 32,
    vk_comments: 14,
    user_id: 1,
    timestamp: '2023-01-05T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 750,
    tg_reactions: 95,
    tg_comments: 35,
    vk_views: 390,
    vk_reactions: 45,
    vk_comments: 17,
    user_id: 1,
    timestamp: '2023-01-06T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 820,
    tg_reactions: 105,
    tg_comments: 42,
    vk_views: 430,
    vk_reactions: 50,
    vk_comments: 19,
    user_id: 1,
    timestamp: '2023-01-07T00:11:00',
  },
  {
    post_union_id: 1,
    tg_views: 870,
    tg_reactions: 112,
    tg_comments: 45,
    vk_views: 460,
    vk_reactions: 53,
    vk_comments: 21,
    user_id: 1,
    timestamp: '2023-01-08T19:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 970,
    tg_reactions: 125,
    tg_comments: 48,
    vk_views: 490,
    vk_reactions: 58,
    vk_comments: 23,
    user_id: 1,
    timestamp: '2023-01-09T19:33:00',
  },
  {
    post_union_id: 1,
    tg_views: 1100,
    tg_reactions: 140,
    tg_comments: 55,
    vk_views: 520,
    vk_reactions: 65,
    vk_comments: 25,
    user_id: 1,
    timestamp: '2023-01-10T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 1250,
    tg_reactions: 160,
    tg_comments: 60,
    vk_views: 580,
    vk_reactions: 72,
    vk_comments: 28,
    user_id: 1,
    timestamp: '2023-01-11T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 1350,
    tg_reactions: 175,
    tg_comments: 65,
    vk_views: 610,
    vk_reactions: 78,
    vk_comments: 30,
    user_id: 1,
    timestamp: '2023-01-12T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 1500,
    tg_reactions: 195,
    tg_comments: 72,
    vk_views: 650,
    vk_reactions: 85,
    vk_comments: 33,
    user_id: 1,
    timestamp: '2023-01-13T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 1680,
    tg_reactions: 215,
    tg_comments: 80,
    vk_views: 710,
    vk_reactions: 95,
    vk_comments: 38,
    user_id: 1,
    timestamp: '2023-01-14T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 1850,
    tg_reactions: 235,
    tg_comments: 90,
    vk_views: 780,
    vk_reactions: 105,
    vk_comments: 42,
    user_id: 1,
    timestamp: '2023-01-15T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 1800,
    tg_reactions: 225,
    tg_comments: 85,
    vk_views: 760,
    vk_reactions: 102,
    vk_comments: 40,
    user_id: 1,
    timestamp: '2023-01-16T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 1920,
    tg_reactions: 240,
    tg_comments: 95,
    vk_views: 800,
    vk_reactions: 110,
    vk_comments: 45,
    user_id: 1,
    timestamp: '2023-01-17T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 2100,
    tg_reactions: 260,
    tg_comments: 105,
    vk_views: 850,
    vk_reactions: 120,
    vk_comments: 48,
    user_id: 1,
    timestamp: '2023-01-18T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 2300,
    tg_reactions: 290,
    tg_comments: 115,
    vk_views: 920,
    vk_reactions: 130,
    vk_comments: 52,
    user_id: 1,
    timestamp: '2023-01-19T00:00:00',
  },
  {
    post_union_id: 1,
    tg_views: 2450,
    tg_reactions: 310,
    tg_comments: 125,
    vk_views: 980,
    vk_reactions: 140,
    vk_comments: 58,
    user_id: 1,
    timestamp: '2023-01-20T00:00:00',
  },
  {
    post_union_id: 2,
    tg_views: 100,
    tg_reactions: 12,
    tg_comments: 5,
    vk_views: 70,
    vk_reactions: 7,
    vk_comments: 3,
    user_id: 1,
    timestamp: '2023-01-01T00:00:00',
  },
  {
    post_union_id: 2,
    tg_views: 230,
    tg_reactions: 28,
    tg_comments: 12,
    vk_views: 110,
    vk_reactions: 15,
    vk_comments: 6,
    user_id: 1,
    timestamp: '2023-01-02T00:00:00',
  },
  {
    post_union_id: 2,
    tg_views: 350,
    tg_reactions: 42,
    tg_comments: 17,
    vk_views: 190,
    vk_reactions: 20,
    vk_comments: 9,
    user_id: 1,
    timestamp: '2023-01-03T00:00:00',
  },
  {
    post_union_id: 2,
    tg_views: 420,
    tg_reactions: 53,
    tg_comments: 20,
    vk_views: 250,
    vk_reactions: 25,
    vk_comments: 11,
    user_id: 1,
    timestamp: '2023-01-04T00:00:00',
  },
  {
    post_union_id: 2,
    tg_views: 490,
    tg_reactions: 62,
    tg_comments: 24,
    vk_views: 290,
    vk_reactions: 30,
    vk_comments: 13,
    user_id: 1,
    timestamp: '2023-01-05T00:00:00',
  },

  // Посты с post_union_id: 3
  {
    post_union_id: 3,
    tg_views: 150,
    tg_reactions: 18,
    tg_comments: 7,
    vk_views: 90,
    vk_reactions: 10,
    vk_comments: 4,
    user_id: 1,
    timestamp: '2023-01-01T00:00:00',
  },
  {
    post_union_id: 3,
    tg_views: 270,
    tg_reactions: 35,
    tg_comments: 15,
    vk_views: 130,
    vk_reactions: 20,
    vk_comments: 8,
    user_id: 1,
    timestamp: '2023-01-02T00:00:00',
  },
  {
    post_union_id: 3,
    tg_views: 400,
    tg_reactions: 48,
    tg_comments: 20,
    vk_views: 220,
    vk_reactions: 25,
    vk_comments: 11,
    user_id: 1,
    timestamp: '2023-01-03T00:00:00',
  },
  {
    post_union_id: 3,
    tg_views: 480,
    tg_reactions: 60,
    tg_comments: 25,
    vk_views: 280,
    vk_reactions: 32,
    vk_comments: 14,
    user_id: 1,
    timestamp: '2023-01-04T00:00:00',
  },
  {
    post_union_id: 3,
    tg_views: 550,
    tg_reactions: 70,
    tg_comments: 28,
    vk_views: 330,
    vk_reactions: 38,
    vk_comments: 16,
    user_id: 1,
    timestamp: '2023-01-05T00:00:00',
  },

  // Посты с post_union_id: 4
  {
    post_union_id: 4,
    tg_views: 80,
    tg_reactions: 10,
    tg_comments: 4,
    vk_views: 60,
    vk_reactions: 6,
    vk_comments: 2,
    user_id: 1,
    timestamp: '2023-01-01T00:00:00',
  },
  {
    post_union_id: 4,
    tg_views: 200,
    tg_reactions: 25,
    tg_comments: 10,
    vk_views: 100,
    vk_reactions: 12,
    vk_comments: 5,
    user_id: 1,
    timestamp: '2023-01-02T00:00:00',
  },
  {
    post_union_id: 4,
    tg_views: 320,
    tg_reactions: 40,
    tg_comments: 16,
    vk_views: 180,
    vk_reactions: 18,
    vk_comments: 8,
    user_id: 1,
    timestamp: '2023-01-03T00:00:00',
  },
  {
    post_union_id: 4,
    tg_views: 390,
    tg_reactions: 50,
    tg_comments: 19,
    vk_views: 240,
    vk_reactions: 24,
    vk_comments: 10,
    user_id: 1,
    timestamp: '2023-01-04T00:00:00',
  },
  {
    post_union_id: 4,
    tg_views: 460,
    tg_reactions: 58,
    tg_comments: 23,
    vk_views: 290,
    vk_reactions: 28,
    vk_comments: 12,
    user_id: 1,
    timestamp: '2023-01-05T00:00:00',
  },
];

// Мок-данные для аналитики за разные периоды времени
export const mockAnalyticsData: Record<string, GetStatsResponse> = {
  week: {
    posts: [
      {
        post_union_id: 1,
        telegram: {
          views: 2500,
          comments: 120,
          reactions: 350,
        },
        vkontakte: {
          views: 1800,
          comments: 75,
          reactions: 210,
        },
      },
      {
        post_union_id: 2,
        telegram: {
          views: 1900,
          comments: 80,
          reactions: 250,
        },
        vkontakte: {
          views: 1400,
          comments: 60,
          reactions: 180,
        },
      },
      {
        post_union_id: 3,
        telegram: {
          views: 3200,
          comments: 150,
          reactions: 420,
        },
        vkontakte: {
          views: 2100,
          comments: 95,
          reactions: 270,
        },
      },
    ],
  },

  // Данные за две недели (14 дней)
  twoWeeks: {
    posts: [
      {
        post_union_id: 1,
        telegram: {
          views: 4500,
          comments: 220,
          reactions: 650,
        },
        vkontakte: {
          views: 3200,
          comments: 145,
          reactions: 410,
        },
      },
      {
        post_union_id: 2,
        telegram: {
          views: 3800,
          comments: 180,
          reactions: 520,
        },
        vkontakte: {
          views: 2700,
          comments: 120,
          reactions: 360,
        },
      },
      {
        post_union_id: 4,
        telegram: {
          views: 5100,
          comments: 240,
          reactions: 730,
        },
        vkontakte: {
          views: 3800,
          comments: 170,
          reactions: 480,
        },
      },
    ],
  },

  // Данные за месяц (30 дней)
  month: {
    posts: [
      {
        post_union_id: 1,
        telegram: {
          views: 8500,
          comments: 420,
          reactions: 1250,
        },
        vkontakte: {
          views: 6200,
          comments: 310,
          reactions: 870,
        },
      },
      {
        post_union_id: 2,
        telegram: {
          views: 7300,
          comments: 370,
          reactions: 980,
        },
        vkontakte: {
          views: 5500,
          comments: 280,
          reactions: 710,
        },
      },
      {
        post_union_id: 5,
        telegram: {
          views: 9800,
          comments: 490,
          reactions: 1450,
        },
        vkontakte: {
          views: 7100,
          comments: 350,
          reactions: 920,
        },
      },
    ],
  },
};

export const createMockStatsForPeriod = (req: GetStatsReq): GetStatsResponse => {
  const startDate = new Date(req.start);
  const endDate = new Date(req.end);
  const diffInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const postTemplates = [
    {
      post_union_id: 1,
      telegram: {
        viewsBase: 250,
        commentsBase: 15,
        reactionsBase: 45,
      },
      vkontakte: {
        viewsBase: 180,
        commentsBase: 10,
        reactionsBase: 30,
      },
    },
    {
      post_union_id: 2,
      telegram: {
        viewsBase: 300,
        commentsBase: 20,
        reactionsBase: 50,
      },
      vkontakte: {
        viewsBase: 220,
        commentsBase: 12,
        reactionsBase: 35,
      },
    },
    {
      post_union_id: 3,
      telegram: {
        viewsBase: 400,
        commentsBase: 25,
        reactionsBase: 60,
      },
      vkontakte: {
        viewsBase: 250,
        commentsBase: 15,
        reactionsBase: 40,
      },
    },
  ];

  const response: GetStatsResponse = {
    posts: postTemplates.map((template) => {
      const multiplier = diffInDays <= 7 ? 1 : diffInDays <= 14 ? 2 : 4;

      return {
        post_union_id: template.post_union_id,
        telegram: {
          views: template.telegram.viewsBase * multiplier * diffInDays,
          comments: template.telegram.commentsBase * multiplier,
          reactions: template.telegram.reactionsBase * multiplier,
        },
        vkontakte: {
          views: template.vkontakte.viewsBase * multiplier * diffInDays,
          comments: template.vkontakte.commentsBase * multiplier,
          reactions: template.vkontakte.reactionsBase * multiplier,
        },
      };
    }),
  };

  return response;
};
