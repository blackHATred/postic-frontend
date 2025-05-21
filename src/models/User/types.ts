export interface RegisterResult {
  user_id: number;
  token: string;
}

export interface MeInfo {
  id: string;
  nickname?: string;
  email?: string;
}

export interface UserData {
  username: string;
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  nickname: string;
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}
