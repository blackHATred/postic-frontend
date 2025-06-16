import { MenuProps } from 'antd';

export interface ExtendedFile extends File {
  uid?: string;
  url?: string;
  thumbUrl?: string;
  status?: string;
  percent?: number;
  originFileObj?: File;
}

export interface FileUploaderProps {
  addFiles: (id: string, file: any) => void;
  removeFile: (file: any) => any;
  files: any[];
}

export interface DragPreviewItem {
  file: File;
  preview: string;
}

export const menuItems: MenuProps['items'] = [
  {
    label: 'Фото',
    key: '1',
    icon: null,
  },
  {
    label: 'Видео',
    key: '2',
    icon: null,
  },
];

export const FILE_TYPES = {
  PHOTO: '.png,.jpg,.jpeg',
  VIDEO: '.mp4,.gif',
  ANY: '.',
};

export const FILE_SIZES = {
  MAX_SIZE: 20,
  MAX_PHOTO_SIZE: 10,
};

export const MAX_FILES = 10;
