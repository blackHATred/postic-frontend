import { Carousel, Image, Spin, Typography } from 'antd';
import styles from './styles.module.scss';
import { Suspense, useEffect, useState } from 'react';
import React from 'react';
import { getUpload, getUploadUrl } from '../../../api/api';
import { CommentAttachments } from '../../../models/Comment/types';
import Lottie from 'lottie-react';
import { PostAttachment } from '../../../models/Post/types';

const { Text } = Typography;

interface MediaRenderer {
  attach_images: CommentAttachments[] | PostAttachment[];
}

const MediaRenderer: React.FC<MediaRenderer> = (props: MediaRenderer) => {
  const [sticker, setSticker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (props.attach_images[0].file_path.endsWith('.json')) {
      setIsLoading(true);
      setError(null);

      getUpload(props.attach_images[0].id)
        .then((data: any) => {
          setSticker(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Ошибка загрузки стикера:', err);
          setError('Ошибка загрузки стикера');
          setIsLoading(false);
        });
    }
  }, [props.attach_images]);

  const LazyVideo = React.lazy(() => import('react-player'));

  if (props.attach_images.length > 1) {
    return (
      <div className={styles['carousel-wrapper']}>
        <Carousel arrows infinite={false}>
          {props.attach_images.map((preview) => (
            <div key={preview.id}>
              {preview.file_path.endsWith('.webm') || preview.file_path.endsWith('.mp4') ? (
                <Suspense
                  fallback={
                    <div className={styles['video']}>
                      <Spin />
                    </div>
                  }
                >
                  <LazyVideo
                    controls
                    light
                    url={getUploadUrl(preview.id)}
                    height={250}
                    width={'100%'}
                  />
                </Suspense>
              ) : (
                <div className={styles['image-slide']}>
                  <Image
                    style={{ objectFit: 'contain' }}
                    height={250}
                    width={'100%'}
                    src={getUploadUrl(preview.id)}
                    preview={{
                      mask: <Text style={{ color: 'white' }}>Подробнее</Text>,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </Carousel>
      </div>
    );
  }
  if (props.attach_images[0].file_type == 'sticker') {
    if (props.attach_images[0].file_path.endsWith('.json')) {
      return (
        <div className={styles['image']}>
          {isLoading ? (
            <div className={styles['video']}>
              <Spin tip='Загрузка стикера...' />
            </div>
          ) : error ? (
            <div className={styles['error']}>
              <Text type='danger'>{error}</Text>
            </div>
          ) : sticker && typeof sticker === 'object' ? (
            <Lottie
              animationData={sticker}
              loop={true}
              onError={(err) => {
                console.error('Ошибка отображения Lottie анимации:', err);
                setError('Ошибка отображения стикера');
              }}
            />
          ) : (
            <div className={styles['error']}>
              <Text type='warning'>Некорректный формат стикера</Text>
            </div>
          )}
        </div>
      );
    }
    if (
      props.attach_images[0].file_path.endsWith('.webm') ||
      props.attach_images[0].file_path.endsWith('.mp4')
    ) {
      return (
        <Suspense
          fallback={
            <div className={styles['video']}>
              <Spin />
            </div>
          }
        >
          <LazyVideo
            loop
            controls
            light
            url={getUploadUrl(props.attach_images[0].id)}
            height={250}
            width={'100%'}
            className={styles['image']}
          />
        </Suspense>
      );
    }
  }
  if (
    props.attach_images[0].file_path.endsWith('.webm') ||
    props.attach_images[0].file_path.endsWith('.mp4')
  ) {
    return (
      <Suspense
        fallback={
          <div className={styles['video']}>
            <Spin />
          </div>
        }
      >
        <LazyVideo
          controls
          url={getUploadUrl(props.attach_images[0].id)}
          height={250}
          light
          withCredentials
          width={'100%'}
          className={styles['image']}
        />
      </Suspense>
    );
  }

  return (
    <div key={props.attach_images[0].id} className={styles['image']}>
      <Image
        height={250}
        width={'100%'}
        style={{ objectFit: 'contain' }}
        preview={{ mask: <Text style={{ color: 'white' }}>Подробнее</Text> }}
        src={getUploadUrl(props.attach_images[0].id)}
      />
    </div>
  );
};

export default MediaRenderer;
