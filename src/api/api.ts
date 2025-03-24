import axios from "axios";
import { UploadResult } from "../models/Post/types";

const API_BASE_URL = "localhost";

export const uploadFile = async (file: File): Promise<UploadResult | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post<UploadResult>(
      `${API_BASE_URL}/upload`,
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
    console.error("Ошибка загрузки файла:", error);
    return null;
  }
};
