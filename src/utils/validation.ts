/**
 * Проверяет, что текст не пустой и соответствует минимальной длине.
 * @param text - Текст для проверки.
 * @param minLength - Минимальная длина текста.
 * @returns Сообщение об ошибке или null, если проверка пройдена.
 */
export const validateMinLength = (text: string, minLength: number): string | null => {
  if (!text.trim()) {
    return 'Поле не может быть пустым.';
  }
  if (text.trim().length < minLength) {
    return `Текст должен содержать не менее ${minLength} символов.`;
  }
  return null;
};

/**
 * Проверяет, что массив выбранных платформ соц сетей не пустой.
 * @param items - Массив выбранных платформ.
 * @returns Сообщение об ошибке или null, если проверка пройдена.
 */
export const validateNotEmptyPlatform = (items: any[]): string | null => {
  if (items.length === 0) {
    return 'Необходимо выбрать хотя бы одну платформу для публикации';
  }
  return null;
};

/**
 * Проверяет, является ли файл уже добавленным.
 * @param files - Список уже добавленных файлов.
 * @param file - Новый файл для проверки.
 * @returns true, если файл уже добавлен, иначе false.
 */
export const isFileAlreadyAdded = (files: File[], file: File): boolean => {
  return files.some((f) => f.name === file.name && f.size === file.size);
};

/**
 * Проверяет, превышает ли количество файлов максимальное значение.
 * @param files - Список файлов.
 * @param maxFiles - Максимальное количество файлов.
 * @returns true, если количество файлов превышает максимум, иначе false.
 */
export const exceedsMaxFiles = (files: File[], maxFiles: number): boolean => {
  return files.length > maxFiles;
};

export const validatePasswordSame = (pass1: string, pass2: string): string | null => {
  if (pass1 !== pass2) {
    return 'Пароли не совпадают';
  }

  if (pass1.length < 8) {
    return 'Пароль должен содержать не менее 8 символов';
  }

  if (pass1.length > 64) {
    return 'Пароль не должен превышать 64 символа';
  }

  return null;
};

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 64;

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
