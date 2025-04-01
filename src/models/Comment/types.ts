import dayjs, {Dayjs, isDayjs} from 'dayjs'

export interface Comment {
  id: number;
  post_union_id?: number;
  comment_id: number;
  user_id: number;
  user: UserProf;
  text: string;
  created_at: Dayjs;
  attachments: CommentAttachments[];
}

interface UserProf {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  photo_file_id: string;
}

interface CommentAttachments {
  id: number;
  comment_id: number;
  file_type: string;
  file_id: string;
  RawBytes: null | string;
}

export interface GetSummarizeResult {
  summary: string;
  lastUpdate: Dayjs;
}

export interface GetSummarizeMarkdownResponse {
  markdown: string;
  post_union_id: number;
}

export const mockComments: Comment[] = [
  {
    id: 2,
    post_union_id: 1,
    comment_id: 96,
    user_id: 1087968824,
    user: {
      id: 1087968824,
      username: "GroupAnonymousBot",
      first_name: "Group",
      last_name: "",
      photo_file_id:
        "AgACAgEAAxUAAWfj3Q3mvhWkn-KwWnrmNCBWG4_zAAKqqDEbI4uZRx5gN0uMmlfkAQADAgADYQADNgQ",
    },
    text: "",
    created_at: dayjs("2025-03-26T13:55:57+03:00"),
    attachments: [
      {
        id: 0,
        comment_id: 96,
        file_type: "sticker",
        file_id:
          "CAACAgIAAyEFAASLJqO-AANgZ-PdPeP_VN8Yx-6NlmLHV8dpRzQAAvxeAAK2tLBLdtfQ6qfjemw2BA",
        RawBytes: null,
      },
    ],
  },
];
