// Константа для имени токена в localStorage
const AUTH_TOKEN_KEY = 'postic_auth_token';

/**
 * Сохраняет токен авторизации в localStorage
 */
export const saveAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Получает токен авторизации из localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Удаляет токен авторизации из localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Проверяет, есть ли токен авторизации в localStorage
 */
export const hasAuthToken = (): boolean => {
  return !!getAuthToken();
};
