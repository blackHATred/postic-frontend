export interface RegisterResult {
  user_id: number;
}

export interface MeInfo {
  user_id: string;
  username?: string;
}

export interface UserData {
  username: string;
  email: string;
  password: string;
}
