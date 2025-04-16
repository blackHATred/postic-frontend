import axios from 'axios';
import config from '../constants/appConfig';
import {
  RenameTeamRequest,
  Team,
  TeamCreateResponse,
  TeamUserRole,
  KickUserRequest,
  TeamCreateRequest,
  MeSecretInfo,
} from '../models/Team/types';
import { routes } from './routers/routes';

export const MyTeams = async (): Promise<{ teams: Team[] }> => {
  const response = await axios.get<{ teams: Team[] }>(`${config.api.baseURL}${routes.teams()}/my_teams`, {
    withCredentials: true,
  });
  return response.data;
};

export const Rename = async (request: RenameTeamRequest): Promise<string> => {
  try {
    const response = await axios.put<string>(`${config.api.baseURL}${routes.teams()}/rename`, request, {
      withCredentials: true,
    });
    if (response.status === 200) {
      return 'Команда успешно переименована';
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data.error || 'Неизвестная ошибка';
    } else {
      return `Ошибка сети: ${(error as Error).message}`;
    }
  }
  return 'Произошла неизвестная ошибка';
};

export const TeamCreate = async (request: TeamCreateRequest): Promise<TeamCreateResponse> => {
  const response = await axios.post<TeamCreateResponse>(`${config.api.baseURL}${routes.teams()}/create`, request, {
    withCredentials: true,
  });
  return response.data;
};

export const Invite = async (userRole: TeamUserRole): Promise<string> => {
  try {
    const response = await axios.post<string>(`${config.api.baseURL}${routes.teams()}/invite`, userRole, {
      withCredentials: true,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data.error || 'Неизвестная ошибка';
    } else {
      return `Ошибка сети: ${(error as Error).message}`;
    }
  }
  return 'Произошла неизвестная ошибка';
};

export const UpdateRole = async (userRole: TeamUserRole): Promise<string> => {
  try {
    const response = await axios.put<string>(`${config.api.baseURL}${routes.teams()}/roles`, userRole, {
      withCredentials: true,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data.error || 'Неизвестная ошибка';
    } else {
      return `Ошибка сети: ${(error as Error).message}`;
    }
  }
  return 'Произошла неизвестная ошибка';
};

export const Kick = async (user: KickUserRequest): Promise<string> => {
  const response = await axios.post<string>(`${config.api.baseURL}${routes.teams()}/kick`, user, {
    withCredentials: true,
  });
  return response.data;
};

export const Secret = async (team_id: number): Promise<MeSecretInfo> => {
  const response = await axios.get<MeSecretInfo>(`${config.api.baseURL}${routes.teams()}/secret`, {
    params: { team_id },
    withCredentials: true,
  });
  return response.data;
};
