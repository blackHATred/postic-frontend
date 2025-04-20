export interface Comments {
  comments: Comment[];
  status: string;
}
export interface Comment {
  id: number;
  team_id: number;
  post_union_id: number;
  platform: string;
  post_platform_id: number;
  user_platform_id: number;
  comment_platform_id: number;
  full_name: string;
  username: string;
  avatar_mediafile: {
    id: number;
    file_path: string;
    file_type: string;
    created_at: string;
  };
  text: string;
  reply_to_comment_id: number;
  is_team_reply: boolean;
  created_at: string;
  attachments: CommentAttachments[];
}

interface CommentAttachments {
  id: number;
  comment_id: number;
  file_type: string;
  file_id: string;
  RawBytes: null | string;
}

export interface GetSummarizeResult {
  status: string;
  summarize: { markdown: string; post_union_id: number };
}

export interface GetSummarizeMarkdownResponse {
  markdown: string;
  post_union_id: number;
}

export interface CommentReply {
  team_id: number;
  comment_id: number;
  text: string;
  attachments: string[];
}

export interface QuickAnswer {
  ideas: string[];
}

export interface DeleteComment {
  team_id: number;
  post_comment_id: number;
  ban_user: boolean;
}

export interface Answ {
  team_id: number;
  comment_id: number;
}

export const mockAnswers: QuickAnswer[] = [
  {
    ideas: ['А ты кто?', 'И тебе привет', 'Я администратор тестового канала'],
  },
];

export const mockComments: Comments = {
  comments: [
    {
      id: 16,
      team_id: 1,
      post_union_id: 1,
      platform: 'tg',
      post_platform_id: 117,
      user_platform_id: 1087968824,
      comment_platform_id: 359,
      full_name: 'Group ',
      username: 'GroupAnonymousBot',
      avatar_mediafile: {
        id: 16,
        file_path: 'tg/812c9468-da71-4a05-9a1c-7330e0970e64.jpg',
        file_type: 'photo',
        created_at: '2025-04-19T19:51:18.382999Z',
      },
      text: 'М',
      reply_to_comment_id: 0,
      is_team_reply: false,
      created_at: '2025-04-19T19:51:05Z',
      attachments: [],
    },
    {
      id: 15,
      team_id: 1,
      post_union_id: 1,
      platform: 'tg',
      post_platform_id: 117,
      user_platform_id: 1087968824,
      comment_platform_id: 358,
      full_name: 'Group ',
      username: 'GroupAnonymousBot',
      avatar_mediafile: {
        id: 15,
        file_path: 'tg/911895e4-2d94-49a6-98e7-bad0f4b21f24.jpg',
        file_type: 'photo',
        created_at: '2025-04-19T19:51:02.035863Z',
      },
      text: 'Т',
      reply_to_comment_id: 0,
      is_team_reply: false,
      created_at: '2025-04-19T19:50:48Z',
      attachments: [],
    },
    {
      id: 14,
      team_id: 1,
      post_union_id: 1,
      platform: 'tg',
      post_platform_id: 117,
      user_platform_id: 1087968824,
      comment_platform_id: 357,
      full_name: 'Group ',
      username: 'GroupAnonymousBot',
      avatar_mediafile: {
        id: 14,
        file_path: 'tg/82ae9139-5ecb-4854-87af-1545e18268e5.jpg',
        file_type: 'photo',
        created_at: '2025-04-19T19:50:38.13628Z',
      },
      text: 'Т',
      reply_to_comment_id: 0,
      is_team_reply: false,
      created_at: '2025-04-19T19:50:24Z',
      attachments: [],
    },
    {
      id: 13,
      team_id: 1,
      post_union_id: 1,
      platform: 'tg',
      post_platform_id: 117,
      user_platform_id: 1087968824,
      comment_platform_id: 356,
      full_name: 'Group ',
      username: 'GroupAnonymousBot',
      avatar_mediafile: {
        id: 13,
        file_path: 'tg/76e4961a-8315-4af8-b3a3-c8d920f947c6.jpg',
        file_type: 'photo',
        created_at: '2025-04-19T19:49:44.027758Z',
      },
      text: 'И',
      reply_to_comment_id: 0,
      is_team_reply: false,
      created_at: '2025-04-19T19:49:30Z',
      attachments: [],
    },
    {
      id: 12,
      team_id: 1,
      post_union_id: 1,
      platform: 'tg',
      post_platform_id: 117,
      user_platform_id: 1087968824,
      comment_platform_id: 355,
      full_name: 'Group ',
      username: 'GroupAnonymousBot',
      avatar_mediafile: {
        id: 12,
        file_path: 'tg/5c9411f1-f142-4b00-8e09-643b26990e30.jpg',
        file_type: 'photo',
        created_at: '2025-04-19T19:48:59.323811Z',
      },
      text: 'З',
      reply_to_comment_id: 0,
      is_team_reply: false,
      created_at: '2025-04-19T19:48:45Z',
      attachments: [],
    },
    {
      id: 11,
      team_id: 1,
      post_union_id: 1,
      platform: 'tg',
      post_platform_id: 117,
      user_platform_id: 1087968824,
      comment_platform_id: 354,
      full_name: 'Group ',
      username: 'GroupAnonymousBot',
      avatar_mediafile: {
        id: 11,
        file_path: 'tg/d5b0eda4-a648-41f8-b32e-0ad64e2bd3cf.jpg',
        file_type: 'photo',
        created_at: '2025-04-19T19:47:10.752689Z',
      },
      text: 'А',
      reply_to_comment_id: 0,
      is_team_reply: false,
      created_at: '2025-04-19T19:46:57Z',
      attachments: [],
    },
    {
      id: 10,
      team_id: 1,
      post_union_id: 1,
      platform: 'tg',
      post_platform_id: 117,
      user_platform_id: 1087968824,
      comment_platform_id: 353,
      full_name: 'Group ',
      username: 'GroupAnonymousBot',
      avatar_mediafile: {
        id: 10,
        file_path: 'tg/0a4fd545-6d45-42bc-b632-3808fc14be38.jpg',
        file_type: 'photo',
        created_at: '2025-04-19T19:46:53.183616Z',
      },
      text: 'З',
      reply_to_comment_id: 0,
      is_team_reply: false,
      created_at: '2025-04-19T19:46:39Z',
      attachments: [],
    },
    {
      id: 9,
      team_id: 1,
      post_union_id: 1,
      platform: 'tg',
      post_platform_id: 117,
      user_platform_id: 1087968824,
      comment_platform_id: 352,
      full_name: 'Group ',
      username: 'GroupAnonymousBot',
      avatar_mediafile: {
        id: 9,
        file_path: 'tg/6f107353-8237-4456-9845-ad92a2138c23.jpg',
        file_type: 'photo',
        created_at: '2025-04-19T19:46:40.93536Z',
      },
      text: 'В',
      reply_to_comment_id: 0,
      is_team_reply: false,
      created_at: '2025-04-19T19:46:27Z',
      attachments: [],
    },
    {
      id: 8,
      team_id: 1,
      post_union_id: 1,
      platform: 'tg',
      post_platform_id: 117,
      user_platform_id: 1087968824,
      comment_platform_id: 351,
      full_name: 'Group ',
      username: 'GroupAnonymousBot',
      avatar_mediafile: {
        id: 8,
        file_path: 'tg/dcb37ced-273a-4074-95e2-c7dd669f7055.jpg',
        file_type: 'photo',
        created_at: '2025-04-19T19:46:17.268463Z',
      },
      text: 'Е',
      reply_to_comment_id: 0,
      is_team_reply: false,
      created_at: '2025-04-19T19:46:03Z',
      attachments: [],
    },
    {
      id: 7,
      team_id: 1,
      post_union_id: 1,
      platform: 'tg',
      post_platform_id: 117,
      user_platform_id: 1087968824,
      comment_platform_id: 350,
      full_name: 'Group ',
      username: 'GroupAnonymousBot',
      avatar_mediafile: {
        id: 7,
        file_path: 'tg/8ad03df2-24b9-4aa0-93fd-7380115d45c3.jpg',
        file_type: 'photo',
        created_at: '2025-04-19T19:45:52.29779Z',
      },
      text: 'Г',
      reply_to_comment_id: 0,
      is_team_reply: false,
      created_at: '2025-04-19T19:45:38Z',
      attachments: [],
    },
  ],
  status: 'ok',
};
