import axios from "axios";
import { UploadResult } from "../models/Post/types";
import { SummarizeResult } from "../models/Comment/types";
import { AxiosError, isAxiosError } from "axios";
import config from "../constants/appConfig";

export const uploadFile = async (file: File): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post<UploadResult>(
      `${config.api.baseURL}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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

export const getSummarize = async (
  postId: string
): Promise<SummarizeResult | null> => {
  const response = await axios.get<SummarizeResult>(
    `${config.api.baseURL}/get_summarize`,
    {
      params: {
        post_id: postId,
      },
    }
  );
  return response.data;
};

export const Summarize = async (
  postId: string
): Promise<SummarizeResult | null> => {
  const response = await axios.post<SummarizeResult>(
    `${config.api.baseURL}/summarize`,
    {
      post_id: postId,
    }
  );
  return response.data;
};
