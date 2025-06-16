import { FILE_TYPES } from './types';

/**
 * Определяет тип файла на основе его расширения
 */
export const detectFileType = (file: File): string => {
  const fileName = file.name.toLowerCase();
  const extension = fileName.substring(fileName.lastIndexOf('.'));

  if (['.png', '.jpg', '.jpeg'].some((ext) => extension === ext)) {
    return FILE_TYPES.PHOTO;
  } else if (['.mp4', '.gif'].some((ext) => extension === ext)) {
    return FILE_TYPES.VIDEO;
  } else {
    return FILE_TYPES.ANY;
  }
};

/**
 * Создает превью для файла изображения
 */
export const createPreviewForFile = async (file: File): Promise<string> => {
  if (file.type && file.type.startsWith('image/')) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          resolve(e.target.result as string);
        } else {
          resolve('');
        }
      };
      reader.readAsDataURL(file);
    });
  }
  return Promise.resolve('');
};

/**
 * Очищает URL объекты для предотвращения утечек памяти
 */
export const revokeObjectURLs = (
  files: any[],
  dragPreviewFiles: { file: File; preview: string }[],
): void => {
  files.forEach((file) => {
    if (file.url && typeof file.url === 'string' && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url);
    }
  });

  dragPreviewFiles.forEach((item) => {
    if (
      item &&
      item.preview &&
      typeof item.preview === 'string' &&
      item.preview.startsWith('blob:')
    ) {
      URL.revokeObjectURL(item.preview);
    }
  });
};

/**
 * Создает уникальный идентификатор для файла
 */
export const generateFileUID = (): string => {
  return `rc-upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

/**
 * Переименовывает файл из буфера обмена, если необходимо
 */
export const renameClipboardFile = (file: File): File => {
  if (file.name === 'image.png' || !file.name) {
    const fileName = `clipboard_${new Date().toISOString().replace(/[:.]/g, '-')}.${
      file.type.split('/')[1]
    }`;
    return new File([file], fileName, { type: file.type });
  }
  return file;
};
