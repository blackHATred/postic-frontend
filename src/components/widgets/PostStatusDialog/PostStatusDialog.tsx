import { FC, useEffect, useState } from 'react';
import { Typography, Divider } from 'antd';
import DialogBox from '../../ui/dialogBox/DialogBox';
import Icon, { CheckCircleOutlined, LoadingOutlined, CloseCircleOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setPostStatusDialog } from '../../../stores/basePageDialogsSlice';
import { getPostStatus } from '../../../api/api';
import { postStatusResults } from '../../../models/Post/types';
import { LiaTelegram, LiaTwitter, LiaVk, LiaQuestionCircle } from 'react-icons/lia';

interface SocialStatus {
  platform: string;
  icon: React.ReactNode;
  status: 'wait' | 'process' | 'finish' | 'error';
}
const PostStatusDialog: FC = () => {
  const dispatch = useAppDispatch();
  const postId = useAppSelector((state) => state.posts.selectedPostId);
  const teamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const isOpen = useAppSelector((state) => state.basePageDialogs.postStatusDialog.isOpen);
  const selectedPlatforms = useAppSelector((state) => state.posts.posts.find((post) => post.id === postId)?.platforms);

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'vk':
        return <LiaVk />;
      case 'tg':
        return <LiaTelegram />;
      case 'twitter':
        return <LiaTwitter />;
    }
    return <LiaQuestionCircle />;
  };
  const { Text } = Typography;

  const mapStatuses = () => {
    return selectedPlatforms
      ? selectedPlatforms.map((platform) => ({
          platform,
          icon: getIcon(platform),
          status: 'wait' as const, // Начальный статус
        }))
      : [];
  };

  const [socialStatuses, setSocialStatuses] = useState<SocialStatus[]>([]);

  useEffect(() => {
    mapStatuses();
    if (isOpen) {
      getStatus();
    }
  }, [selectedPlatforms]);

  const onCancel = () => {
    dispatch(setPostStatusDialog(false));
  };

  const getStatus = async () => {
    if (postId)
      getPostStatus(postId, teamId).then((res: postStatusResults) => {
        res.status.forEach((status) => {
          switch (status.status) {
            case 'success': {
              const statusSuccess = socialStatuses.find((element: SocialStatus) => element.platform == status.platform);
              if (statusSuccess) {
                const index = socialStatuses.indexOf(statusSuccess);
                statusSuccess.status = 'finish';
                socialStatuses[index] = statusSuccess;
                setSocialStatuses(socialStatuses);
              } else {
                setSocialStatuses([
                  ...socialStatuses,
                  {
                    platform: status.platform,
                    icon: getIcon(status.platform),
                    status: 'finish',
                  },
                ]);
              }
              break;
            }
            case 'error': {
              const statE = socialStatuses.find((element: SocialStatus) => element.platform == status.platform);
              if (statE) {
                const index = socialStatuses.indexOf(statE);
                statE.status = 'error';
                socialStatuses[index] = statE;
                setSocialStatuses(socialStatuses);
              } else {
                setSocialStatuses([
                  ...socialStatuses,
                  {
                    platform: status.platform,
                    icon: getIcon(status.platform),
                    status: 'error',
                  },
                ]);
              }
              break;
            }
            case 'pending': {
              const statP = socialStatuses.find((element: SocialStatus) => element.platform == status.platform);
              if (statP) {
                const index = socialStatuses.indexOf(statP);
                statP.status = 'wait';
                socialStatuses[index] = statP;
              } else {
                setSocialStatuses([
                  ...socialStatuses,
                  {
                    platform: status.platform,
                    icon: getIcon(status.platform),
                    status: 'wait',
                  },
                ]);
              }
              setTimeout(() => getStatus(), 2000);
              setSocialStatuses(mapStatuses());
            }
          }
        });
        //Получили статус
      });
  };

  const getStatusIcon = (status: 'wait' | 'process' | 'finish' | 'error') => {
    switch (status) {
      case 'finish':
        return <Icon component={CheckCircleOutlined} style={{ color: 'green' }} />;
      case 'process':
        return <Icon component={LoadingOutlined} style={{ color: 'blue' }} />;
      case 'error':
        return <Icon component={CloseCircleOutlined} style={{ color: 'red' }} />;
      default:
        return <Icon component={LoadingOutlined} style={{ color: 'gray' }} />;
    }
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          text: 'Ок',
          onButtonClick: () => {
            dispatch(setPostStatusDialog(false));
          },
        },
      ]}
      isOpen={isOpen}
      onCancelClick={onCancel}
      title={'Публикация поста'}
    >
      <Divider>Статус публикации</Divider>
      <div className={styles.socialList}>
        {socialStatuses.map((social, index) => (
          <div
            className={styles.socialStatuses}
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            {social.icon}
            {getStatusIcon(social.status)}
          </div>
        ))}
      </div>
    </DialogBox>
  );
};

export default PostStatusDialog;
