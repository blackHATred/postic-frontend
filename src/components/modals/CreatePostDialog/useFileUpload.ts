import { useState, useRef, useContext, useEffect } from 'react';
import { isFileAlreadyAdded } from '../../../utils/validation';
import { uploadFile } from '../../../api/api';
import { NotificationContext } from '../../../api/notification';
import { isAxiosError } from 'axios';
import { ExtendedFile, FILE_SIZES, DragPreviewItem } from './types';
import {
  detectFileType,
  createPreviewForFile,
  revokeObjectURLs,
  generateFileUID,
  renameClipboardFile,
} from './fileUtils';

/**
 * Хук для обработки загрузки файлов
 */
export const useFileUpload = (
  addFiles: (id: string, file: any) => void,
  removeFile: (file: any) => any,
  files: any[],
) => {
  const NotificationManager = useContext(NotificationContext);
  const [id, setID] = useState(0);
  const [open_da, setOpenDia] = useState(false);
  const [file_types, setFileTypes] = useState<string>();
  const [isDragging, setIsDragging] = useState(false);
  const dragCountRef = useRef(0);
  const [dragPreviewFiles, setDragPreviewFiles] = useState<DragPreviewItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const ref_upload = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (files.length === 0) {
      setID(Math.random());
    }

    const filesWithPreview = [...files];

    const previewPromises = filesWithPreview.map((file) => {
      if (!file.url && file.originFileObj && file.type && file.type.startsWith('image/')) {
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target && e.target.result) {
              file.url = e.target.result as string;
              file.thumbUrl = e.target.result as string;
            }
            resolve();
          };
          reader.readAsDataURL(file.originFileObj);
        });
      }
      return Promise.resolve();
    });

    Promise.all(previewPromises).then(() => {
      setUploadedFiles(filesWithPreview);
    });
  }, [files]);

  useEffect(() => {
    return () => {
      revokeObjectURLs(uploadedFiles, dragPreviewFiles);
    };
  }, [uploadedFiles, dragPreviewFiles]);

  const handleMenuClick = (e: any) => {
    setOpenDia(true);
    switch (e.key) {
      case '1': {
        setFileTypes('.png,.jpg,.jpeg');
        break;
      }
      case '2': {
        setFileTypes('.mp4,.gif');
        break;
      }
      case '3': {
        setFileTypes('.');
        break;
      }
    }

    setTimeout(() => {
      ref_upload.current?.click();
      setOpenDia(false);
    }, 100);
  };

  const handleFileUpload = async (file: File) => {
    if (!file_types) {
      const detectedType = detectFileType(file);
      setFileTypes(detectedType);
    }

    if (!isFileAlreadyAdded(files, file)) {
      const sizeMb = file.size / 1024 / 1024;
      if (sizeMb > FILE_SIZES.MAX_SIZE) {
        NotificationManager.createNotification(
          'error',
          `Файл ${file.name} не загружен.`,
          'Размер файла превышает 20мб.',
        );
        return 'Размер файла превышает 20мб';
      }

      try {
        let t = '';
        const currentFileType = file_types || detectFileType(file);

        switch (currentFileType) {
          case '.png,.jpg,.jpeg': {
            t = 'photo';
            break;
          }
          case '.mp4,.gif': {
            t = 'video';
            break;
          }
          case '.': {
            t = 'raw';
          }
        }
        if (sizeMb > FILE_SIZES.MAX_PHOTO_SIZE && t === 'photo') {
          NotificationManager.createNotification(
            'error',
            `Файл ${file.name} не загружен.`,
            'Размер фото превышает 10мб',
          );
          return 'Размер фото превышает 10мб';
        }

        const fileForPreview = file as ExtendedFile;

        if (file.type && file.type.startsWith('image/') && !fileForPreview.url) {
          const dataUrl = await createPreviewForFile(file);
          fileForPreview.url = dataUrl;
          fileForPreview.thumbUrl = dataUrl;
        }

        const uploadResult = await uploadFile(file, t);

        addFiles(uploadResult.file_id, fileForPreview);

        setUploadedFiles((prev) => {
          return [...prev, fileForPreview];
        });

        return '';
      } catch (error: any) {
        if (isAxiosError(error)) {
          NotificationManager.createNotification(
            'error',
            `Файл ${file.name} не загружен.`,
            'Неверный тип файла. Допустимые типы: фото, видео',
          );
        } else {
          NotificationManager.createNotification(
            'error',
            `Файл ${file.name} не загружен.`,
            'Ошибка обработки файла',
          );
        }

        return 'Ошибка загрузки ресурса';
      }
    } else {
      NotificationManager.createNotification(
        'error',
        `Файл ${file.name} не загружен.`,
        'Дубликаты файлов не разрешены',
      );
      return 'Дубликаты не разрешены';
    }
  };

  const handleFileRemove = (file: any) => {
    try {
      removeFile(file);
      setUploadedFiles((prev) => prev.filter((f) => f.uid !== file.uid));
    } catch {}
  };

  // Обработчики перетаскивания файлов
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current += 1;
    setIsDragging(true);
    setDragPreviewFiles([]);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current -= 1;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const fileItems = Array.from(e.dataTransfer.items);

      const imageItems = fileItems.filter(
        (item) => item.kind === 'file' && item.type.startsWith('image/'),
      );

      if (imageItems.length > 0 && dragPreviewFiles.length === 0) {
        const newPreviewFiles: DragPreviewItem[] = [];

        imageItems.forEach((item) => {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target && e.target.result) {
                newPreviewFiles.push({
                  file,
                  preview: e.target.result as string,
                });

                if (newPreviewFiles.length === imageItems.length) {
                  setDragPreviewFiles(newPreviewFiles);
                }
              }
            };
            reader.readAsDataURL(file);
          }
        });
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current = 0;
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);

      setFileTypes(undefined);

      const uploadPromises: Promise<any>[] = [];

      for (const file of files) {
        const uploadPromise = handleFileUpload(file);
        uploadPromises.push(uploadPromise);
      }

      await Promise.all(uploadPromises);
      setDragPreviewFiles([]);
    }
  };

  // вставка из буфера
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const fileItems = Array.from(items).filter(
        (item) =>
          item.kind === 'file' &&
          (item.type.startsWith('image/') || item.type.startsWith('video/')),
      );

      if (fileItems.length > 0) {
        event.preventDefault();
        event.stopPropagation();

        const originalFileType = file_types;

        const uploadPromises: Promise<any>[] = [];

        for (const item of fileItems) {
          const file = item.getAsFile();
          if (!file) continue;

          const renamedFile = renameClipboardFile(file);
          const extendedFile = renamedFile as ExtendedFile;

          const fileType = detectFileType(extendedFile);
          setFileTypes(fileType);

          if (extendedFile.type && extendedFile.type.startsWith('image/')) {
            const reader = new FileReader();

            const previewPromise = new Promise<void>((resolve) => {
              reader.onload = (e) => {
                if (e.target && e.target.result) {
                  const dataUrl = e.target.result as string;
                  extendedFile.url = dataUrl;
                  extendedFile.thumbUrl = dataUrl;
                }
                resolve();
              };
              reader.readAsDataURL(extendedFile);
            });

            await previewPromise;
          }

          extendedFile.uid = generateFileUID();

          const uploadPromise = handleFileUpload(extendedFile);
          uploadPromises.push(uploadPromise);
        }

        await Promise.all(uploadPromises);
        setFileTypes(originalFileType);
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [files, file_types]);

  const getCustomRequestHandler = (file: File) => {
    return (async () => {
      const extendedFile = file as ExtendedFile;

      if (file.type && file.type.startsWith('image/')) {
        const dataUrl = await createPreviewForFile(file);
        extendedFile.url = dataUrl;
        extendedFile.thumbUrl = dataUrl;
      }

      return handleFileUpload(file);
    })();
  };

  const handlePreview = (file: any) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  return {
    id,
    ref_upload,
    open_da,
    file_types,
    isDragging,
    dragPreviewFiles,
    uploadedFiles,
    setUploadedFiles,
    handleMenuClick,
    handleFileUpload,
    handleFileRemove,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    getCustomRequestHandler,
    handlePreview,
  };
};
