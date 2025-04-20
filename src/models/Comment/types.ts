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
      id: 1,
      team_id: 1,
      post_union_id: 101,
      platform: 'tg',
      post_platform_id: 80,
      user_platform_id: 501,
      comment_platform_id: 1001,
      username: 'user1',
      full_name: 'User One',
      avatar_mediafile: null,
      text: 'Это первый комментарий в посте.',
      reply_to_comment_id: null,
      is_team_reply: false,
      created_at: '2025-04-12T10:00:00Z',
      attachments: [
        {
          id: 1,
          comment_id: 1001,
          file_type: 'image',
          file_id: 'img123',
          RawBytes: null,
        },
      ],
    },
    {
      id: 2,
      team_id: 1,
      post_union_id: 101,
      platform: 'tg',
      post_platform_id: 80,
      user_platform_id: 502,
      comment_platform_id: 1002,
      username: 'user2',
      full_name: 'User Two',
      avatar_mediafile: 'https://example.com/avatar2.jpg',
      text: 'Второй комментарий к посту.',
      reply_to_comment_id: null,
      is_team_reply: false,
      created_at: '2025-04-12T11:00:00Z',
      attachments: [],
    },
    {
      id: 3,
      team_id: 1,
      post_union_id: 101,
      platform: 'tg',
      post_platform_id: 80,
      user_platform_id: 503,
      comment_platform_id: 1003,
      username: 'user3',
      full_name: 'User Three',
      avatar_mediafile: null,
      text: 'Третий комментарий.',
      reply_to_comment_id: null,
      is_team_reply: false,
      created_at: '2025-04-12T12:00:00Z',
      attachments: [],
    },
    {
      id: 4,
      team_id: 1,
      post_union_id: 101,
      platform: 'tg',
      post_platform_id: 80,
      user_platform_id: 504,
      comment_platform_id: 1004,
      username: 'user4',
      full_name: 'User Four',
      avatar_mediafile: null,
      text: 'Ответ на первый комментарий!',
      reply_to_comment_id: 1,
      is_team_reply: false,
      created_at: '2025-04-12T13:15:00Z',
      attachments: [],
    },
    {
      id: 5,
      team_id: 1,
      post_union_id: 101,
      platform: 'tg',
      post_platform_id: 80,
      user_platform_id: 505,
      comment_platform_id: 1005,
      username: 'user5',
      full_name: 'User Five',
      avatar_mediafile: 'https://example.com/avatar5.jpg',
      text: 'И я тоже отвечу на первый комментарий.',
      reply_to_comment_id: 1,
      is_team_reply: false,
      created_at: '2025-04-12T14:22:00Z',
      attachments: [],
    },
    {
      id: 6,
      team_id: 1,
      post_union_id: 101,
      platform: 'tg',
      post_platform_id: 80,
      user_platform_id: 0,
      comment_platform_id: 1006,
      username: '',
      full_name: 'Ответ от имени команды',
      avatar_mediafile: null,
      text: 'Официальный ответ от команды на третий комментарий!',
      reply_to_comment_id: 3,
      is_team_reply: true,
      created_at: '2025-04-12T15:30:00Z',
      attachments: [],
    },
    {
      id: 7,
      team_id: 1,
      post_union_id: 101,
      platform: 'tg',
      post_platform_id: 80,
      user_platform_id: 504,
      comment_platform_id: 1007,
      username: 'user4',
      full_name: 'User Four',
      avatar_mediafile: null,
      text: 'Отвечаю на ответ команды!',
      reply_to_comment_id: 6,
      is_team_reply: false,
      created_at: '2025-04-12T16:45:00Z',
      attachments: [],
    },
  ],
  status: 'ok',
};
