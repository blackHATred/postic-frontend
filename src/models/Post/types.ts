import dayjs from "dayjs";

export interface Post {
  id: string;
  text: string;
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
  team_id: number;
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
    id: "11",
    CreatedAt: dayjs().unix(),
    userID: "1 Moderator",
    text: "Hello, this is a sample post.Hello, this is a sample postHello, this is a sample postHello, this is a sample post",
    Attachments: [],
    Platforms: ["tg", "vk"],
    PubDate: dayjs().unix(),
  },
  {
    id: "22",
    CreatedAt: dayjs().unix(),
    userID: "2 Moderator",
    text: "Hello, this is a sample post\n , this is a sample postHello, this is a sample postHello, this is a sample post",
    Attachments: [],
    Platforms: ["tg"],
    PubDate: dayjs().unix(),
  },
  {
    id: "33",
    CreatedAt: dayjs().unix(),
    userID: "2 Moderator",
    text: "a\nb\nc\nd\ne\nf\nh\ni\nj\nk\nl",
    Attachments: [],
    Platforms: ["tg"],
    PubDate: dayjs().unix(),
  },
];
