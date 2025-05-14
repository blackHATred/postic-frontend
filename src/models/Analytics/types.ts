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
  id: number;
  total_kpi: number;
  likes: number;
  views: number;
  comments: number;
  posts: number;
}

export interface GetUsersAnalyticsResponse {
  users: UserAnalytics[];
}

export const mockUsersAnalytics: GetUsersAnalyticsResponse = {
  users: [
    {
      id: 1,
      total_kpi: 95,
      likes: 10,
      views: 50,
      comments: 5,
      posts: 7,
    },
    {
      id: 2,
      total_kpi: 78,
      likes: 8,
      views: 35,
      comments: 12,
      posts: 4,
    },
    {
      id: 3,
      total_kpi: 87,
      likes: 15,
      views: 120,
      comments: 8,
      posts: 10,
    },
    {
      id: 4,
      total_kpi: 62,
      likes: 5,
      views: 25,
      comments: 3,
      posts: 3,
    },
    {
      id: 5,
      total_kpi: 91,
      likes: 25,
      views: 150,
      comments: 20,
      posts: 12,
    },
    {
      id: 6,
      total_kpi: 91,
      likes: 25,
      views: 150,
      comments: 20,
      posts: 12,
    },
    {
      id: 7,
      total_kpi: 91,
      likes: 25,
      views: 150,
      comments: 20,
      posts: 12,
    },
    {
      id: 8,
      total_kpi: 91,
      likes: 25,
      views: 150,
      comments: 20,
      posts: 12,
    },
    {
      id: 9,
      total_kpi: 91,
      likes: 25,
      views: 150,
      comments: 20,
      posts: 12,
    },
    {
      id: 10,
      total_kpi: 91,
      likes: 25,
      views: 150,
      comments: 20,
      posts: 12,
    },
    {
      id: 11,
      total_kpi: 91,
      likes: 25,
      views: 150,
      comments: 20,
      posts: 12,
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
