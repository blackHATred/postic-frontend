import React, { useContext, useState, useEffect } from 'react';
import { Image, Typography, Button, Checkbox, Spin, Space, Tooltip, message } from 'antd';
import { UploadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { useAppDispatch } from '../../../stores/hooks';
import { addFile } from '../../../stores/basePageDialogsSlice';
import { uploadFile } from '../../../api/api';
import { NotificationContext } from '../../../api/notification';

const { Text, Title } = Typography;

interface GeneratedImagesUploaderProps {
  images: string[];
  onUploadComplete: () => void;
  addFiles?: (id: string, file: any) => void;
}

const GeneratedImagesUploader: React.FC<GeneratedImagesUploaderProps> = ({
  images,
  onUploadComplete,
  addFiles,
}) => {
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: boolean }>({});
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const dispatch = useAppDispatch();
  const notificationManager = useContext(NotificationContext);

  useEffect(() => {
    if (images.length > 0) {
      const initialState: { [key: string]: boolean } = {};
      images.forEach((_, index) => {
        initialState[index.toString()] = false;
      });
      setSelectedImages(initialState);
    }
  }, [images]);

  const handleImageSelect = (index: string) => {
    setSelectedImages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const selectAllImages = () => {
    const newState: { [key: string]: boolean } = {};
    images.forEach((_, index) => {
      newState[index.toString()] = true;
    });
    setSelectedImages(newState);
  };

  const deselectAllImages = () => {
    const newState: { [key: string]: boolean } = {};
    images.forEach((_, index) => {
      newState[index.toString()] = false;
    });
    setSelectedImages(newState);
  };

  const uploadImageFile = async (imageUrl: string, index: string) => {
    try {
      setUploadingImages((prev) => ({
        ...prev,
        [index]: true,
      }));

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const fileName = `generated_image_${Date.now()}_${index}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      const uploadResult = await uploadFile(file, 'photo');

      dispatch(addFile(uploadResult.file_id));
      if (addFiles) {
        addFiles(uploadResult.file_id, file);
      }

      setUploadedImages((prev) => [...prev, uploadResult.file_id]);
      setUploadingImages((prev) => ({
        ...prev,
        [index]: false,
      }));

      return uploadResult.file_id;
    } catch (error) {
      notificationManager.createNotification(
        'error',
        'Ошибка загрузки',
        `Не удалось загрузить изображение ${parseInt(index) + 1}`,
      );

      setUploadingImages((prev) => ({
        ...prev,
        [index]: false,
      }));

      return null;
    }
  };

  const uploadSelectedImages = async () => {
    const selectedIndexes = Object.entries(selectedImages)
      .filter(([_, selected]) => selected)
      .map(([index]) => index);

    if (selectedIndexes.length === 0) {
      message.warning('Выберите хотя бы одно изображение');
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = selectedIndexes.map((index) =>
        uploadImageFile(images[parseInt(index)], index),
      );

      await Promise.all(uploadPromises);

      notificationManager.createNotification(
        'success',
        'Изображения загружены',
        `Загружено ${selectedIndexes.length} изображений`,
      );

      onUploadComplete();
    } catch (error) {
      notificationManager.createNotification(
        'error',
        'Ошибка загрузки',
        'Произошла ошибка при загрузке изображений',
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (images.length === 0) {
    return null;
  }

  const hasSelectedImages = Object.values(selectedImages).some((selected) => selected);

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
        <Text type='secondary'>
          Выбрано: {Object.values(selectedImages).filter(Boolean).length} из {images.length}
        </Text>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <Space>
          <Button
            size='small'
            icon={<UploadOutlined />}
            type='primary'
            onClick={uploadSelectedImages}
            loading={isUploading}
            disabled={!hasSelectedImages}
          >
            Загрузить выбранные
          </Button>
          <Button size='small' icon={<CheckOutlined />} onClick={selectAllImages}>
            Выбрать все
          </Button>
          <Button
            size='small'
            icon={<CloseOutlined />}
            onClick={deselectAllImages}
            disabled={!hasSelectedImages}
          >
            Снять выбор
          </Button>
        </Space>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        {images.map((image, index) => (
          <div key={index} style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: '4px',
                left: '4px',
                zIndex: 1,
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '2px',
                padding: '2px',
              }}
            >
              <Checkbox
                checked={selectedImages[index.toString()]}
                onChange={() => handleImageSelect(index.toString())}
              />
            </div>

            {uploadingImages[index.toString()] && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 2,
                }}
              >
                <Spin size='small' />
              </div>
            )}

            <Tooltip title={`Изображение ${index + 1}`}>
              <Image
                src={image}
                alt={`Сгенерированное изображение ${index + 1}`}
                width={100}
                height={100}
                style={{ objectFit: 'cover' }}
                preview={{
                  src: image,
                  mask: uploadedImages.includes(index.toString()) ? (
                    <div>
                      Загружено <CheckOutlined />
                    </div>
                  ) : undefined,
                }}
              />
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratedImagesUploader;
