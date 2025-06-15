/**
 * Функция для ограничения времени выполнения промиса
 * @param promise Исходный промис
 * @param timeoutMs Время ожидания в миллисекундах
 * @returns Промис с результатом или ошибкой по таймауту
 */
export const withTimeout = <T>(promise: Promise<T>, timeoutMs = 50000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('TIMEOUT_ERROR'));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};
