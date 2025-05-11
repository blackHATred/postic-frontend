import config from '../constants/appConfig';
import {
  RenameTeamRequest,
  Team,
  TeamCreateResponse,
  TeamUserRole,
  KickUserRequest,
  TeamCreateRequest,
  MeSecretInfo,
  PlatformsRequest,
  SetVKRequest,
} from '../models/Team/types';
import { routes } from './routers/routes';
import axiosInstance from './axiosConfig';
import { isAxiosError } from 'axios';

export const MyTeams = async (): Promise<{ teams: Team[] }> => {
  const response = await axiosInstance.get<{ teams: Team[] }>(`${routes.teams()}/my_teams`);
  return response.data;
};

export const Rename = async (request: RenameTeamRequest): Promise<string> => {
  try {
    const response = await axiosInstance.put<string>(`${routes.teams()}/rename`, request);
    if (response.status === 200) {
      return 'Команда успешно переименована';
    }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      return error.response.data.error || 'Неизвестная ошибка';
    } else {
      return `Ошибка сети: ${(error as Error).message}`;
    }
  }
  return 'Произошла неизвестная ошибка';
};

export const TeamCreate = async (request: TeamCreateRequest): Promise<TeamCreateResponse> => {
  const response = await axiosInstance.post<TeamCreateResponse>(
    `${config.api.baseURL}${routes.teams()}/create`,
    request,
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const Invite = async (userRole: TeamUserRole): Promise<string> => {
  try {
    const response = await axiosInstance.post<string>(
      `${config.api.baseURL}${routes.teams()}/invite`,
      userRole,
      {
        withCredentials: true,
      },
    );
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      return error.response.data.error || 'Неизвестная ошибка';
    } else {
      return `Ошибка сети: ${(error as Error).message}`;
    }
  }
  return 'Произошла неизвестная ошибка';
};

export const UpdateRole = async (userRole: TeamUserRole): Promise<string> => {
  try {
    const response = await axiosInstance.put<string>(
      `${config.api.baseURL}${routes.teams()}/roles`,
      userRole,
      {
        withCredentials: true,
      },
    );
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      return error.response.data.error || 'Неизвестная ошибка';
    } else {
      return `Ошибка сети: ${(error as Error).message}`;
    }
  }
  return 'Произошла неизвестная ошибка';
};

export const Kick = async (user: KickUserRequest): Promise<string> => {
  const response = await axiosInstance.post<string>(
    `${config.api.baseURL}${routes.teams()}/kick`,
    user,
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const Secret = async (team_id: number): Promise<MeSecretInfo> => {
  const response = await axiosInstance.get<MeSecretInfo>(
    `${config.api.baseURL}${routes.teams()}/secret`,
    {
      params: { team_id },
      withCredentials: true,
    },
  );
  return response.data;
};

export const Platforms = async (team_id: number): Promise<PlatformsRequest> => {
  const response = await axiosInstance.get<PlatformsRequest>(
    `${config.api.baseURL}${routes.teams()}/platforms`,
    {
      params: { team_id },
      withCredentials: true,
    },
  );
  return response.data;
};

export const SetVK = async (request: SetVKRequest): Promise<string> => {
  try {
    const response = await axiosInstance.put<string>(`${routes.teams()}/set_vk`, request);
    if (response.status === 200) {
      return 'ВК сообщество успешно привязано';
    }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      return error.response.data.error || 'Неизвестная ошибка';
    } else {
      return `Ошибка сети: ${(error as Error).message}`;
    }
  }
  return 'Произошла неизвестная ошибка';
};
