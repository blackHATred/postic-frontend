import React from 'react';
import { Upload, Space, Button, Dropdown, MenuProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  DownOutlined,
  FileImageOutlined,
  PaperClipOutlined,
  VideoCameraAddOutlined,
} from '@ant-design/icons';
import { menuItems, ExtendedFile } from './types';
import styles from './styles.module.scss';

const { Dragger } = Upload;

export const itemsWithIcons = menuItems
  ? [
      {
        ...menuItems[0],
        icon: <FileImageOutlined />,
      },
      {
        ...menuItems[1],
        icon: <VideoCameraAddOutlined />,
      },
    ]
  : [];

interface StandardUploaderProps {
  id: number;
  uploadedFiles: ExtendedFile[];
  fileTypes?: string;
  onRemove: (file: any) => void;
  onOpen: boolean;
  customRequest: (obj: any) => void;
  onPreview: (file: any) => void;
  uploaderRef: React.RefObject<HTMLDivElement | null>;
  menuClickHandler: MenuProps['onClick'];
  maxCount?: number;
}

export const StandardUploader: React.FC<StandardUploaderProps> = ({
  id,
  uploadedFiles,
  fileTypes,
  onRemove,
  onOpen,
  customRequest,
  onPreview,
  uploaderRef,
  menuClickHandler,
  maxCount = 10,
}) => {
  const menuProps = {
    items: itemsWithIcons,
    onClick: menuClickHandler,
  };

  return (
    <Upload
      key={id}
      listType='picture'
      multiple={true}
      fileList={uploadedFiles as UploadFile[]}
      onRemove={onRemove}
      maxCount={maxCount}
      accept={fileTypes}
      openFileDialogOnClick={onOpen}
      customRequest={customRequest}
      onPreview={onPreview}
    >
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <Dropdown menu={menuProps as MenuProps}>
          <Space ref={uploaderRef}>
            <Button icon={<PaperClipOutlined />} type='dashed'>
              Загрузить
              <DownOutlined />
            </Button>
          </Space>
        </Dropdown>
        <div className={styles['clipboard-hint']}>
          Перетащите файл сюда или вставьте из буфера обмена (Ctrl+V)
        </div>
      </div>
    </Upload>
  );
};

interface DragUploaderProps {
  id: number;
  uploadedFiles: ExtendedFile[];
  onRemove: (file: any) => void;
  customRequest: (obj: any) => void;
  onPreview: (file: any) => void;
  children: React.ReactNode;
  maxCount?: number;
}

export const DragUploader: React.FC<DragUploaderProps> = ({
  id,
  uploadedFiles,
  onRemove,
  customRequest,
  onPreview,
  children,
  maxCount = 10,
}) => {
  return (
    <Dragger
      key={`dragger-${id}`}
      listType='picture'
      multiple={true}
      fileList={uploadedFiles as UploadFile[]}
      onRemove={onRemove}
      maxCount={maxCount}
      accept='*/*'
      customRequest={customRequest}
      onPreview={onPreview}
      className={styles['file-dragger']}
    >
      {children}
    </Dragger>
  );
};
