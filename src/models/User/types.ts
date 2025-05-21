export interface RegisterResult {
  user_id: number;
}

export interface MeInfo {
  user_id: string;
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
