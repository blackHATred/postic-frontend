import axios from 'axios';
import { Post, postStatusResults, sendPost, sendPostResult, UploadResult } from '../models/Post/types';
import {
  Comment,
  Comments,
  CommentReply,
  DeleteComment,
  GetSummarizeMarkdownResponse,
  GetSummarizeResult,
  Answ,
} from '../models/Comment/types';
import { AxiosError, isAxiosError } from 'axios';
import config from '../constants/appConfig';
import { MeInfo, RegisterResult } from '../models/User/types';

export const uploadFile = async (file: File): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'photo');

    const response = await axios.post<UploadResult>(`${config.api.baseURL}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });

    console.log('Файл успешно загружен:', response.data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      // do something
      // or just re-throw the error
      console.error('Ошибка загрузки файла:', (error as AxiosError).status);
      throw error;
    } else {
      // do something else
      // or creating a new error
      throw error;
    }
  }
};

export const getPosts = async (team_id: number, limit: number, offset: string): Promise<{ posts: Post[] }> => {
  const response = await axios.get<{ posts: Post[] }>(`${config.api.baseURL}/posts/list`, {
    withCredentials: true,
    params: {
      team_id: team_id,
      limit: limit,
      offset: offset,
      before: true,
    },
  });
  return response.data;
};

export const getPost = async (team_id: number, post_id: number): Promise<{ post: Post }> => {
  const response = await axios.get<{ post: Post }>(`${config.api.baseURL}/posts/get`, {
    withCredentials: true,
    params: {
      team_id: team_id,
      post_union_id: post_id,
    },
  });
  return response.data;
};

export const getPostStatus = async (post_id: number, team_id: number): Promise<postStatusResults> => {
  const response = await axios.get<postStatusResults>(`${config.api.baseURL}/posts/status`, {
    withCredentials: true,
    params: {
      team_id: team_id,
      post_union_id: post_id,
    },
  });
  return response.data;
};

export const sendPostRequest = async (post: sendPost): Promise<sendPostResult> => {
  const response = await axios.post<sendPostResult>(`${config.api.baseURL}/posts/add`, post, {
    withCredentials: true,
  });
  return response.data;
};

export const Register = async (): Promise<RegisterResult> => {
  const response = await axios.post<RegisterResult>(`${config.api.baseURL}/user/register`, { withCredentials: true });

  return response.data;
};

export const Me = async (): Promise<MeInfo> => {
  const response = await axios.get<MeInfo>(`${config.api.baseURL}/user/me`, {
    withCredentials: true,
  });
  return response.data;
};

export const Login = async (id: number): Promise<RegisterResult> => {
  const response = await axios.post<RegisterResult>(
    `${config.api.baseURL}/user/login`,
    {
      user_id: id,
    },
    { withCredentials: true },
  );

  return response.data;
};

export const getSummarize = async (postId: number): Promise<GetSummarizeResult> => {
  try {
    const response = await axios.get<GetSummarizeResult>(`${config.api.baseURL}/comment/summarize`, {
      params: {
        team_id: 1,
        post_union_id: postId,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) console.log('Error getting summarize: ' + (error as AxiosError).status);
    throw error;
  }
};

export const Summarize = async (postId: number): Promise<GetSummarizeMarkdownResponse | null> => {
  const response = await axios.post<GetSummarizeMarkdownResponse>(`${config.api.baseURL}/comment/summarize`, {
    post_id: postId,
  });
  return response.data;
};

export const getComment = async (team_id: number, comment_id: number) => {
  const response = await axios.get<{ comment: Comment }>(`${config.api.baseURL}/comment/get`, {
    withCredentials: true,
    params: {
      team_id: team_id,
      comment_id: comment_id,
    },
  });
  return response.data;
};

export const getComments = async (selectedteamid: number, union_id: number, limit: number, offset?: string) => {
  const response = await axios.get<Comments>(`${config.api.baseURL}/comment/last`, {
    withCredentials: true,
    params: {
      team_id: selectedteamid,
      post_union_id: union_id,
      limit: limit,
      offset: offset,
    },
  });
  console.log(response);
  return response.data;
};

export const Reply = async (request: CommentReply) => {
  const response = await axios.post<string>(`${config.api.baseURL}/comment/reply`, request, {
    withCredentials: true,
  });
  return response.data;
};

export const Delete = async (request: DeleteComment) => {
  const response = await axios.delete<string>(`${config.api.baseURL}/comment/delete`, {
    data: request,
    withCredentials: true,
  });
  return response.data;
};

export const ReplyIdeas = async (req: Answ): Promise<{ ideas: string[] }> => {
  const response = await axios.get<{ ideas: string[] }>(`${config.api.baseURL}/comment/ideas`, {
    withCredentials: true,
    params: req,
  });
  return response.data;
};
