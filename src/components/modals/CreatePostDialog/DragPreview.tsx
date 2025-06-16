import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { DragPreviewItem } from './types';
import styles from './styles.module.scss';

interface DragPreviewProps {
  previewFiles: DragPreviewItem[];
}

/**
 * Компонент для отображения превью при перетаскивании файлов
 */
const DragPreview: React.FC<DragPreviewProps> = ({ previewFiles }) => {
  if (previewFiles.length === 0) {
    return (
      <>
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>Перетащите файлы сюда для загрузки</p>
        <p className='ant-upload-hint'>Поддерживается одиночная или массовая загрузка</p>
      </>
    );
  }

  return (
    <div className={styles['preview-container']}>
      {previewFiles.map((item, index) => (
        <div key={index} className={styles['preview-item']}>
          <img src={item.preview} alt={`Preview ${index}`} className={styles['preview-image']} />
          <p className={styles['preview-filename']}>{item.file.name}</p>
        </div>
      ))}
      <p className='ant-upload-text'>
        Отпустите {previewFiles.length > 1 ? 'файлы' : 'файл'} для загрузки
      </p>
    </div>
  );
};

export default DragPreview;
