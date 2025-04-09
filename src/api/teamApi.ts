import axios from "axios";
import config from "../constants/appConfig";
import {
  RenameTeamRequest,
  Team,
  TeamCreateResponse,
  TeamUserRole,
  KickUserRequest,
  TeamCreateRequest,
} from "../models/Team/types";
import { MeInfo } from "../models/User/types";

export const MyTeams = async (): Promise<{ teams: Team[] }> => {
  const response = await axios.get<{ teams: Team[] }>(
    `${config.api.baseURL}/teams/my_teams`,
    {
      withCredentials: true,
    }
  );
  console.log("Teams", response.data);
  return response.data;
};

export const Rename = async (request: RenameTeamRequest): Promise<string> => {
  try {
    const response = await axios.put<string>(
      `${config.api.baseURL}/teams/rename`,
      request,
      {
        withCredentials: true,
      }
    );
    if (response.status === 200) {
      return "Команда успешно переименована";
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data.error || "Неизвестная ошибка";
    } else {
      return `Ошибка сети: ${(error as Error).message}`;
    }
  }
  return "Произошла неизвестная ошибка";
};

export const TeamCreate = async (
  request: TeamCreateRequest
): Promise<TeamCreateResponse> => {
  const response = await axios.post<TeamCreateResponse>(
    `${config.api.baseURL}/teams/create`,
    request,
    {
      withCredentials: true,
    }
  );
  console.log("Результат:", response.data);
  return response.data;
};

export const Invite = async (userRole: TeamUserRole): Promise<string> => {
  try {
    const response = await axios.post<string>(
      `${config.api.baseURL}/teams/invite`,
      userRole,
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data.error || "Неизвестная ошибка";
    } else {
      return `Ошибка сети: ${(error as Error).message}`;
    }
  }
  return "Произошла неизвестная ошибка";
};

export const UpdateRole = async (userRole: TeamUserRole): Promise<string> => {
  try {
    const response = await axios.put<string>(
      `${config.api.baseURL}/teams/roles`,
      userRole,
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data.error || "Неизвестная ошибка";
    } else {
      return `Ошибка сети: ${(error as Error).message}`;
    }
  }
  return "Произошла неизвестная ошибка";
};

export const Kick = async (user: KickUserRequest): Promise<string> => {
  const response = await axios.post<string>(
    `${config.api.baseURL}/teams/kick`,
    user,
    {
      withCredentials: true,
    }
  );
  console.log("Результат:", response.data);
  return response.data;
};

export const Secret = async (): Promise<MeInfo> => {
  const response = await axios.get<MeInfo>(
    `${config.api.baseURL}/teams/secret`,
    {
      withCredentials: true,
    }
  );
  return response.data;
};
