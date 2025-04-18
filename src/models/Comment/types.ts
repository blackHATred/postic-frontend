export interface Comments {
  comments: Comment[];
  status: string;
}
export interface Comment {
  id: number;
  post_union_id: number;
  platform: string;
  comment_id: number;
  user_id: number;
  username: string;
  text: string;
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
      post_union_id: 101,
      platform: 'Twitter',
      comment_id: 1001,
      user_id: 501,
      username: 'user1',
      text: 'This is a mock comment for post 101.',
      created_at: '2025-04-12T10:00:00',
      attachments: [
        {
          id: 1,
          comment_id: 1001,
          file_type: 'image',
          file_id: 'img123',
          RawBytes: null,
        },
        {
          id: 2,
          comment_id: 1001,
          file_type: 'video',
          file_id: 'vid456',
          RawBytes: null,
        },
      ],
    },
    {
      id: 2,
      post_union_id: 102,
      platform: 'Facebook',
      comment_id: 1002,
      user_id: 502,
      username: 'user2',
      text: 'Another mock comment for post 102.',
      created_at: '2025-04-12T11:00:00',
      attachments: [
        {
          id: 3,
          comment_id: 1002,
          file_type: 'document',
          file_id: 'doc789',
          RawBytes: null,
        },
      ],
    },
    {
      id: 3,
      post_union_id: 103,
      platform: 'Instagram',
      comment_id: 1003,
      user_id: 503,
      username: 'user3',
      text: 'Mock comment without attachments.',
      created_at: '2025-04-12T12:00:00',
      attachments: [],
    },
    {
      id: 3,
      post_union_id: 103,
      platform: 'Instagram',
      comment_id: 1003,
      user_id: 503,
      username: 'user3',
      text: '',
      created_at: '2025-04-12T12:00:00',
      attachments: [],
    },
  ],
  status: 'ok',
};
