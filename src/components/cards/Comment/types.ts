export const FILE_TYPES = {
  PHOTO: 'photo',
  VIDEO: 'video',
  ANY: 'raw',
};

export const MAX_FILES = 10;

export const FILE_SIZES = {
  MAX_SIZE: 20,
};

export interface FileUploaderProps {
  addFiles: (fileId: string) => void;
  removeFile: (fileId: string) => void;
  files: string[];
  inlineMode?: boolean;
}
