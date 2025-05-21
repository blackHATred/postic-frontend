import { CommentWithChildren } from '../../components/lists/CommentList/commentTree';

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
  } | null;
  text: string;
  reply_to_comment_id: number | null;
  is_team_reply: boolean;
  created_at: string;
  attachments: CommentAttachments[];
  marked_as_ticket: boolean;
  is_deleted: boolean;
}

export interface CommentAttachments {
  id: number;
  comment_id: number;
  file_type: string;
  file_path: string;
  created_at: string;
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

export interface Ticket {
  team_id: number;
  comment_id: number;
  marked_as_ticket: boolean;
}

export const mockAnswers: QuickAnswer[] = [
  {
    ideas: ['А ты кто?', 'И тебе привет', 'Я администратор тестового канала'],
  },
];

export const mockComments: CommentWithChildren[] = [
  {
    id: 1,
    team_id: 1,
    post_union_id: 1,
    platform: 'tg',
    post_platform_id: 1,
    user_platform_id: 1,
    comment_platform_id: 1,
    full_name: 'Иванов Иван',
    username: 'ivanov_ivan',
    avatar_mediafile: null,
    text: 'Привет, как дела?',
    reply_to_comment_id: null,
    is_team_reply: false,
    created_at: '2023-10-01T12:00:00Z',
    attachments: [],
    marked_as_ticket: false,
    children: [],
    is_deleted: false,
  },
  {
    id: 2,
    team_id: 1,
    post_union_id: 1,
    platform: 'tg',
    post_platform_id: 1,
    user_platform_id: 2,
    comment_platform_id: 2,
    full_name: 'Петров Петр',
    username: 'petrov_petr',
    avatar_mediafile: null,
    text: 'Привет, все хорошо!',
    reply_to_comment_id: null,
    is_team_reply: true,
    created_at: '2023-10-01T12:01:00Z',
    attachments: [],
    marked_as_ticket: false,
    children: [],
    is_deleted: true,
  },
];
