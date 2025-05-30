// Константа для имени токена в localStorage

/**
 * Сохраняет токен авторизации в localStorage
 */
export const saveAuthToken = (token: string): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  localStorage.setItem(process.env.AUTH_TOKEN, token);
};

/**
 * Получает токен авторизации из localStorage
 */
export const getAuthToken = (): string | null => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return localStorage.getItem(process.env.AUTH_TOKEN);
};

/**
 * Удаляет токен авторизации из localStorage
 */
export const removeAuthToken = (): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  localStorage.removeItem(process.env.AUTH_TOKEN);
};

/**
 * Проверяет, есть ли токен авторизации в localStorage
 */
export const hasAuthToken = (): boolean => {
  return !!getAuthToken();
};
