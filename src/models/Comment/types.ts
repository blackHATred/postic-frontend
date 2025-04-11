import dayjs, { Dayjs } from "dayjs";

export interface Comment {
  comment: {
    id: number;
    post_union_id?: number;
    platform: string;
    comment_id: number;
    user_id: number;
    username: string;
    text: string;
    created_at: Dayjs;
    attachments: CommentAttachments[];
  };
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

export const mockComments: Comment[] = [];
