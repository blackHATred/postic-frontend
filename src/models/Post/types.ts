// @ts-ignore
import dayjs from 'dayjs'

export interface Post {
  ID: string;
  Text: string;
  userID: string;
  Attachments: PostAttachment[];
  Platforms?: string[];
  CreatedAt?: dayjs.Dayjs;
  PubDate: dayjs.Dayjs;
}

interface PostAttachment {
  id: string;
  file_path: string;
  file_type: string;
  uploaded_by_user_id: string;
  created_at: string;
}

export interface sendPost {
  text: string;
  attachments: string[];
  pub_time: number;
  platforms: string[];
}

export interface sendPostResult {
  post_id: string;
  status: string;
}

export interface UploadResult {
  file_id: string;
  // filename: string;
  // size: number;
  // url: string;
}

export const mockPosts: Post[] = [
  {
    ID: "11",
    CreatedAt: dayjs("2025-03-15T10:00:00Z"),
    userID: "1 Moderator",
    Text: "Hello, this is a sample post.Hello, this is a sample postHello, this is a sample postHello, this is a sample post",
    Attachments: [],
    Platforms: ["tg", "vk"],
    PubDate: dayjs("2025-03-15T10:00:00Z"),
  },
  {
    ID: "22",
    CreatedAt: dayjs("2025-03-15T10:00:00Z"),
    userID: "1 Moderator",
    Text: "Hello, this is a sample post.Hello, this is a sample postHello, this is a sample postHello, this is a sample post",
    Attachments: [],
    Platforms: ["tg"],
    PubDate: dayjs("2025-03-15T10:00:00Z"),
  },
];
