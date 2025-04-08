// @ts-ignore
import dayjs from "dayjs";

export interface Post {
  ID: string;
  Text: string;
  userID: string;
  Attachments: PostAttachment[];
  Platforms?: string[];
  CreatedAt?: number;
  PubDate: number;
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

export interface postStatusResults {
  status: {
    post_id: string;
    platform: string;
    status: "success" | "error" | "pending";
    err_message: string;
  };
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
    CreatedAt: dayjs().unix(),
    userID: "1 Moderator",
    Text: "Hello, this is a sample post.Hello, this is a sample postHello, this is a sample postHello, this is a sample post",
    Attachments: [],
    Platforms: ["tg", "vk"],
    PubDate: dayjs().unix(),
  },
  {
    ID: "22",
    CreatedAt: dayjs().unix(),
    userID: "2 Moderator",
    Text: "Hello, this is a sample post\n , this is a sample postHello, this is a sample postHello, this is a sample post",
    Attachments: [],
    Platforms: ["tg"],
    PubDate: dayjs().unix(),
  },
  {
    ID: "33",
    CreatedAt: dayjs().unix(),
    userID: "2 Moderator",
    Text: "a\nb\nc\nd\ne\nf\nh\ni\nj\nk\nl",
    Attachments: [],
    Platforms: ["tg"],
    PubDate: dayjs().unix(),
  },
];
