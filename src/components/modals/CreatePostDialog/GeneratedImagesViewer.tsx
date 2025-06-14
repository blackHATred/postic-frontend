import React, { useContext, useState, useEffect } from 'react';
import { Image, Typography, Button, List, Modal } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { useAppDispatch } from '../../../stores/hooks';
import { removeFile } from '../../../stores/basePageDialogsSlice';
import { NotificationContext } from '../../../api/notification';

const { Text, Title } = Typography;

interface GeneratedImagesViewerProps {
  images: string[];
  uploadedFileIds: string[];
}

const GeneratedImagesViewer: React.FC<GeneratedImagesViewerProps> = ({
  images,
  uploadedFileIds,
}) => {
  const dispatch = useAppDispatch();
  const notificationManager = useContext(NotificationContext);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  console.log('GeneratedImagesViewer - received uploadedFileIds:', uploadedFileIds);
  console.log('GeneratedImagesViewer - received images:', images);

  useEffect(() => {
    if (images && images.length > 0 && uploadedFileIds && uploadedFileIds.length > 0) {
      const newImageMap: Record<string, string> = {};

      if (uploadedFileIds.length === 1 && typeof uploadedFileIds[0] === 'object') {
        const fileIdObj = uploadedFileIds[0] as any;
        if (fileIdObj && fileIdObj.file_id) {
          const fileId = String(fileIdObj.file_id);
          newImageMap[fileId] = images[0];
          console.log('Обработан объект с file_id:', fileId);
        }
      } else {
        uploadedFileIds.forEach((fileId, index) => {
          if (index < images.length) {
            const idStr = typeof fileId === 'string' ? fileId : String(fileId);
            newImageMap[idStr] = images[index];
          }
        });
      }

      console.log('Созданная карта соответствия ID-URL:', newImageMap);
      setImageMap(newImageMap);
    }
  }, [images, uploadedFileIds]);

  const handleImageRemove = (fileId: string) => {
    dispatch(removeFile(fileId));

    setImageMap((prevMap) => {
      const newMap = { ...prevMap };
      delete newMap[fileId];
      return newMap;
    });

    notificationManager.createNotification(
      'success',
      'Изображение удалено',
      'Изображение успешно удалено из публикации',
    );
  };

  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  if (Object.keys(imageMap).length === 0) {
    return (
      <div className={styles['post']}>
        <Title level={5} style={{ margin: 0 }}>
          Сгенерированные изображения
        </Title>
        <Text type='secondary'>
          Нет данных для отображения. UploadedFileIds: {JSON.stringify(uploadedFileIds)}
        </Text>
      </div>
    );
  }

  return (
    <div className={styles['post']}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Сгенерированные изображения
        </Title>
        <Text type='secondary'>Количество: {Object.keys(imageMap).length}</Text>
      </div>

      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={Object.entries(imageMap)}
        renderItem={([fileId, imageUrl]) => (
          <List.Item>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  zIndex: 1,
                  background: 'rgba(255, 255, 255, 0.7)',
                  padding: '4px',
                  borderRadius: '0 0 0 4px',
                  display: 'flex',
                  gap: '4px',
                }}
              >
                <Button
                  size='small'
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(imageUrl)}
                  type='text'
                />
                <Button
                  size='small'
                  icon={<DeleteOutlined />}
                  onClick={() => handleImageRemove(fileId)}
                  danger
                  type='text'
                />
              </div>
              <Image
                src={imageUrl}
                alt={`Сгенерированное изображение ${fileId}`}
                style={{ objectFit: 'cover', width: '100%', height: 'auto', borderRadius: '4px' }}
                preview={false}
              />
            </div>
          </List.Item>
        )}
      />

      <Modal open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
        <img alt='Предпросмотр' style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default GeneratedImagesViewer;
