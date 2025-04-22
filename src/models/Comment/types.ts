import { CommentWithChildren } from '../../components/lists/CommentList/commentTree';

export interface Comments {
  comments: CommentWithChildren[];
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
  } | null;
  text: string;
  reply_to_comment_id: number | null;
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

export const mockComments: Comments = { comments: [], status: '' };
