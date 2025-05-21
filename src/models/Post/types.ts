import dayjs from 'dayjs';

export interface Post {
  id: number;
  text: string;
  platforms: string[] | null;
  pub_datetime: string | null;
  attachments: PostAttachment[];
  created_at: number;
  user_id: number;
  team_id: number;
}

export interface PostAttachment {
  id: number;
  file_path: string;
  file_type: string;
  uploaded_by_user_id: number;
  created_at: string;
}

export interface sendPost {
  text: string;
  attachments: string[];
  pub_datetime: string | undefined;
  platforms: string[];
  team_id: number;
}

export interface sendPostResult {
  post_id: number;
  status: string;
}

export interface PostEditReq {
  team_id: number;
  post_union_id: number;
  text: string;
}

export interface postStatusResults {
  status: {
    post_id: string;
    operation: string;
    platform: string;
    status: 'success' | 'error' | 'pending';
    err_message: string;
    created_at: string;
  }[];
}

export interface UploadResult {
  file_id: string;
  // filename: string;
  // size: number;
  // url: string;
}

export interface GenerateTextResult {
  text: string;
}

export const mockGenerateTextResult = {
  text: 'Привет всем! Я хочу похвастаться моим милым котиком! Он такой очаровашка, прям как мои любимые подписчики! 🐱❤️',
};

export const mockPosts: Post[] = [
  {
    id: 11,
    created_at: dayjs().unix(),
    user_id: 1,
    team_id: 1,
    text: 'Hello, this is a sample post.Hello, this is a sample postHello, this is a sample postHello, this is a sample post',
    attachments: [],
    platforms: ['tg', 'vk'],
    pub_datetime: null,
  },
  {
    id: 22,
    created_at: dayjs().unix(),
    user_id: 2,
    team_id: 2,
    text: 'Hello, this is a sample post\n , this is a sample postHello, this is a sample postHello, this is a sample post',
    attachments: [],
    platforms: ['tg'],
    pub_datetime: null,
  },
  {
    id: 33,
    created_at: dayjs().unix(),
    user_id: 3,
    team_id: 3,
    text: 'Hello, this is a sample post\n , this is a sample postHello, this is a sample postHello, this is a sample post',
    attachments: [],
    platforms: ['tg'],
    pub_datetime: null,
  },
  {
    id: 21,
    created_at: dayjs().unix(),
    user_id: 1,
    team_id: 1,
    text: 'Hello, this is a sample post.Hello, this is a sample postHello, this is a sample postHello, this is a sample post',
    attachments: [],
    platforms: ['tg', 'vk'],
    pub_datetime: null,
  },
  {
    id: 32,
    created_at: dayjs().unix(),
    user_id: 2,
    team_id: 2,
    text: 'Hello, this is a sample post\n , this is a sample postHello, this is a sample postHello, this is a sample post',
    attachments: [],
    platforms: ['tg'],
    pub_datetime: null,
  },
  {
    id: 43,
    created_at: dayjs().unix(),
    user_id: 3,
    team_id: 3,
    text: 'Hello, this is a sample post\n , this is a sample postHello, this is a sample postHello, this is a sample post',
    attachments: [],
    platforms: ['tg'],
    pub_datetime: null,
  },
];
