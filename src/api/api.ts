import {
  Post,
  PostEditReq,
  postStatusResults,
  sendPost,
  sendPostResult,
  UploadResult,
  GeneratePostResult,
  FixPostResult,
} from '../models/Post/types';
import {
  Comment,
  CommentReply,
  DeleteComment,
  GetSummarizeMarkdownResponse,
  GetSummarizeResult,
  Answ,
  Ticket,
} from '../models/Comment/types';
import { AxiosError, isAxiosError } from 'axios';
import config from '../constants/appConfig';
import { MeInfo, RegisterResult, RegisterRequest } from '../models/User/types';
import { routes } from './routers/routes';

import axiosInstance from './axiosConfig';
import axios from 'axios';
import {
  PostReq,
  GetPostStatsResponse,
  GetStatsReq,
  GetStatsResponse,
  UserAnalytics,
  createMockStatsForPeriod,
} from '../models/Analytics/types';

export const getVkAuthUrl = async (): Promise<{ auth_url: string }> => {
  const response = await axiosInstance.get<{ auth_url: string }>(
    `${config.api.baseURL}/user/vk/auth`,
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const uploadFile = async (file: File, type: string): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axiosInstance.post<UploadResult>(
      `${config.api.baseURL}/upload/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error('Ошибка загрузки файла:', (error as AxiosError).status);
      throw error;
    } else {
      throw error;
    }
  }
};

export const getPosts = async (
  team_id: number,
  limit: number,
  offset: string,
  filter?: 'published' | 'scheduled',
  before = true,
): Promise<{ posts: Post[] }> => {
  const response = await axiosInstance.get<{ posts: Post[] }>(
    `${config.api.baseURL}${routes.posts()}/list`,
    {
      withCredentials: true,
      params: {
        team_id: team_id,
        limit: limit,
        offset: offset,
        before: before,
        filter: filter,
      },
    },
  );
  return response.data;
};

export const postEdit = async (
  post: PostEditReq,
): Promise<{ actionIds: number[]; status: string }> => {
  const response = await axiosInstance.post<{ actionIds: number[]; status: string }>(
    `${config.api.baseURL}${routes.posts()}/edit`,
    post,
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const getPost = async (team_id: number, post_id: number): Promise<{ post: Post }> => {
  const response = await axiosInstance.get<{ post: Post }>(
    `${config.api.baseURL}${routes.posts()}/get`,
    {
      withCredentials: true,
      params: {
        team_id: team_id,
        post_union_id: post_id,
      },
    },
  );
  return response.data;
};

export const getPostStatus = async (
  post_id: number,
  team_id: number,
): Promise<postStatusResults> => {
  const response = await axiosInstance.get<postStatusResults>(
    `${config.api.baseURL}${routes.posts()}/status`,
    {
      withCredentials: true,
      params: {
        team_id: team_id,
        post_union_id: post_id,
      },
    },
  );
  return response.data;
};

export const sendPostRequest = async (post: sendPost): Promise<sendPostResult> => {
  const response = await axiosInstance.post<sendPostResult>(
    `${config.api.baseURL}${routes.posts()}/add`,
    post,
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const Register = async (): Promise<RegisterResult> => {
  const response = await axiosInstance.post<RegisterResult>(`${config.api.baseURL}/user/register`, {
    withCredentials: true,
  });

  return response.data;
};

export const Me = async (): Promise<MeInfo> => {
  const response = await axiosInstance.get<MeInfo>(`${config.api.baseURL}/user/me`, {
    withCredentials: true,
  });
  return response.data;
};

export const Login = async (email: string, password: string): Promise<RegisterResult> => {
  const response = await axiosInstance.post<RegisterResult>(
    `${config.api.baseURL}/user/login`,
    {
      email,
      password,
    },
    { withCredentials: true },
  );

  return response.data;
};

export const Logout = async (): Promise<null> => {
  const response = await axiosInstance.post<null>(`${config.api.baseURL}/user/logout`, {
    withCredentials: true,
  });

  return response.data;
};

export const getSummarize = async (teamId: number, postId: number): Promise<GetSummarizeResult> => {
  const response = await axiosInstance.get<GetSummarizeResult>(
    `${config.api.baseURL}${routes.comments()}/summarize`,
    {
      params: {
        team_id: teamId,
        post_union_id: postId,
      },
      withCredentials: true,
    },
  );
  return response.data;
};

export const Summarize = async (postId: number): Promise<GetSummarizeMarkdownResponse | null> => {
  const response = await axiosInstance.post<GetSummarizeMarkdownResponse>(
    `${config.api.baseURL}${routes.comments()}/summarize`,
    {
      post_id: postId,
    },
  );
  return response.data;
};

export const getComment = async (team_id: number, comment_id: number) => {
  const response = await axiosInstance.get<{ comment: Comment }>(
    `${config.api.baseURL}${routes.comments()}/get`,
    {
      withCredentials: true,
      params: {
        team_id: team_id,
        comment_id: comment_id,
      },
    },
  );
  return response.data;
};

export const getComments = async (
  selectedteamid: number,
  union_id: number,
  limit: number,
  offset?: string,
  before = true,
  marked_as_ticket?: boolean,
) => {
  try {
    const response = await axiosInstance.get<{ comments: Comment[] }>(
      `${config.api.baseURL}${routes.comments()}/last`,
      {
        withCredentials: true,
        params: {
          team_id: selectedteamid,
          post_union_id: union_id,
          limit: limit,
          offset: offset,
          before: before,
          marked_as_ticket: marked_as_ticket,
        },
      },
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error('Ошибка при получении комментариев:', error.response?.data || error.message);
    } else {
      console.error('Неизвестная ошибка:', error);
    }
    throw error;
  }
};

export const Reply = async (request: CommentReply) => {
  const response = await axiosInstance.post<{ comment_id: number; status: string }>(
    `${config.api.baseURL}${routes.comments()}/reply`,
    request,
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const Delete = async (request: DeleteComment) => {
  const response = await axiosInstance.delete<string>(
    `${config.api.baseURL}${routes.comments()}/delete`,
    {
      data: request,
      withCredentials: true,
    },
  );
  return response.data;
};

export const ReplyIdeas = async (req: Answ): Promise<{ ideas: string[] }> => {
  const response = await axiosInstance.get<{ ideas: string[] }>(
    `${config.api.baseURL}${routes.comments()}/ideas`,
    {
      withCredentials: true,
      params: req,
    },
  );
  return response.data;
};

export const MarkAsTicket = async (req: Ticket): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>(
    `${config.api.baseURL}${routes.comments()}/mark`,
    req,
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const getMockStats = async (req: GetStatsReq): Promise<GetStatsResponse> => {
  console.log('Используются мок-данные для аналитики');

  const mockData = createMockStatsForPeriod(req);

  await new Promise((resolve) => setTimeout(resolve, 500));

  return mockData;
};

export const GetStats = async (req: GetStatsReq): Promise<GetStatsResponse> => {
  // моковые данные
  return getMockStats(req);

  // исходный реквест
  // const response = await axiosInstance.get<GetStatsResponse>(
  //   `${config.api.baseURL}${routes.analytics()}/stats`,
  //   {
  //     withCredentials: true,
  //     params: req,
  //   },
  // );
  // return response.data;
};

export const GetPostStats = async (req: PostReq): Promise<{ resp: GetPostStatsResponse }> => {
  const response = await axiosInstance.get<{ resp: GetPostStatsResponse }>(
    `${config.api.baseURL}${routes.analytics()}/stats/post`,
    {
      withCredentials: true,
      params: req,
    },
  );
  return response.data;
};

export const UpdateStats = async (req: PostReq): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>(
    `${config.api.baseURL}${routes.analytics()}/stats/update`,
    req,
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const getUpload = async (id: number): Promise<any> => {
  const response = await axiosInstance.get<{ message: string }>(getUploadUrl(id), {
    withCredentials: true,
    responseType: 'json',
  });
  return response.data;
};

export const getUploadUrl = (ID: number): string => {
  return `${config.api.baseURL}/upload/get/${ID}`;
};

export const DeletePost = async (req: PostReq): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `${config.api.baseURL}${routes.posts()}/delete`,
    {
      withCredentials: true,
      data: req,
    },
  );
  return response.data;
};

export const RegisterWithUserData = async (userData: RegisterRequest): Promise<RegisterResult> => {
  const response = await axiosInstance.post<RegisterResult>(
    `${config.api.baseURL}/user/register`,
    userData,
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const getKPI = async (
  req: GetStatsReq,
): Promise<{ kpi?: UserAnalytics | UserAnalytics[]; users?: UserAnalytics[] }> => {
  const response = await axiosInstance.get<{
    kpi?: UserAnalytics | UserAnalytics[];
    users?: UserAnalytics[];
  }>(`${config.api.baseURL}${routes.analytics()}/kpi`, {
    withCredentials: true,
    params: req,
  });
  return response.data;
};

export const generatePublication = async (query: string): Promise<GeneratePostResult> => {
  const response = await axios.post<GeneratePostResult>(
    'http://leave-doing.gl.at.ply.gg:31585/publication',
    { query },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};

export const fixPublication = async (text: string): Promise<FixPostResult> => {
  const response = await axios.post<FixPostResult>(
    'http://leave-doing.gl.at.ply.gg:31585/fix',
    { text },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};

export const GetProfile = async () => {
  const response = await axiosInstance.get(`${config.api.baseURL}/user/profile`, {
    withCredentials: true,
  });
  return response.data;
};

export const UpdateProfile = async (nickname: string, email: string) => {
  const response = await axiosInstance.put(
    `${config.api.baseURL}/user/update/profile`,
    { nickname, email },
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const UpdatePassword = async (oldPassword: string, newPassword: string) => {
  const response = await axiosInstance.put(
    `${config.api.baseURL}/user/update/password`,
    { old_password: oldPassword, new_password: newPassword },
    {
      withCredentials: true,
    },
  );
  return response.data;
};
