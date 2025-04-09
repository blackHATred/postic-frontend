import axios from "axios";
import {
  Post,
  postStatusResults,
  sendPost,
  sendPostResult,
  UploadResult,
} from "../models/Post/types";
import {
  GetSummarizeMarkdownResponse,
  GetSummarizeResult,
} from "../models/Comment/types";
import { AxiosError, isAxiosError } from "axios";
import config from "../constants/appConfig";
import { MeInfo, RegisterResult } from "../models/User/types";

export const uploadFile = async (file: File): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "photo");

    const response = await axios.post<UploadResult>(
      `${config.api.baseURL}/upload/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    console.log("Файл успешно загружен:", response.data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      // do something
      // or just re-throw the error
      console.error("Ошибка загрузки файла:", (error as AxiosError).status);
      throw error;
    } else {
      // do something else
      // or creating a new error
      throw error;
    }
  }
};

export const getPosts = async (): Promise<{ posts: Post[] }> => {
  const response = await axios.get<{ posts: Post[] }>(
    `${config.api.baseURL}/posts/list`,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const getPostStatus = async (
  post_id: string,
  platform: string
): Promise<postStatusResults> => {
  const response = await axios.get<postStatusResults>(
    `${config.api.baseURL}/posts/status/` + post_id,
    {
      withCredentials: true,
      params: {
        platform: platform,
      },
    }
  );
  return response.data;
};

export const sendPostRequest = async (
  post: sendPost
): Promise<sendPostResult> => {
  const response = await axios.post<sendPostResult>(
    `${config.api.baseURL}/posts/add`,
    post,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const Register = async (): Promise<RegisterResult> => {
  const response = await axios.post<RegisterResult>(
    `${config.api.baseURL}/user/register`,
    { withCredentials: true }
  );

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
    }
  );

  return response.data;
};

export const getSummarize = async (
  postId: string
): Promise<GetSummarizeResult> => {
  try {
    const response = await axios.get<GetSummarizeResult>(
      `${config.api.baseURL}/get_summarize`,
      {
        params: {
          post_id: postId,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error))
      console.log("Error getting summarize: " + (error as AxiosError).status);
    throw error;
  }
};

export const Summarize = async (
  postId: string
): Promise<GetSummarizeMarkdownResponse | null> => {
  const response = await axios.post<GetSummarizeMarkdownResponse>(
    `${config.api.baseURL}/comment/summarize`,
    {
      post_id: postId,
    }
  );
  return response.data;
};
