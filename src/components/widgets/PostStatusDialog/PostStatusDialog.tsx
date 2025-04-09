import { FC, useEffect, useState } from "react";
import { Typography, Divider } from "antd";
import DialogBox from "../../ui/dialogBox/DialogBox";
import Icon, {
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import styles from "./styles.module.scss";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { setPostStatusDialog } from "../../../stores/basePageDialogsSlice";
import { getPostStatus } from "../../../api/api";
import { postStatusResults } from "../../../models/Post/types";
import {
  LiaTelegram,
  LiaTwitter,
  LiaVk,
  LiaQuestionCircle,
} from "react-icons/lia";

interface SocialStatus {
  platform: string;
  icon: React.ReactNode;
  status: "wait" | "process" | "finish" | "error";
}
const PostStatusDialog: FC = () => {
  const dispatch = useAppDispatch();
  const postId = useAppSelector((state) => state.posts.selectedPostId);
  const isOpen = useAppSelector(
    (state) => state.basePageDialogs.postStatusDialog.isOpen
  );
  const selectedPlatforms = useAppSelector(
    (state) => state.posts.posts.find((post) => post.id === postId)?.Platforms
  );
  const [error_data, SetErrorData] = useState("");

  const getIcon = (platform: string) => {
    switch (platform) {
      case "vk":
        return <LiaVk />;
      case "tg":
        return <LiaTelegram />;
      case "twitter":
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
          status: "wait" as const, // Начальный статус
        }))
      : [];
  };

  const [socialStatuses, setSocialStatuses] = useState<SocialStatus[]>(
    mapStatuses()
  );

  useEffect(() => {
    if (isOpen && selectedPlatforms) {
      selectedPlatforms.forEach((platform) => getStatus(platform));
    }
  }, [selectedPlatforms]);

  const onCancel = () => {
    dispatch(setPostStatusDialog(false));
  };

  const getStatus = async (platform: string) => {
    if (postId)
      getPostStatus(postId, platform).then((res: postStatusResults) => {
        //Получили статус
        switch (res.status.status) {
          case "success": {
            const statusSuccess = socialStatuses.find(
              (element: SocialStatus) => element.platform == platform
            );
            if (statusSuccess) {
              const index = socialStatuses.indexOf(statusSuccess);
              statusSuccess.status = "finish";
              socialStatuses[index] = statusSuccess;
              setSocialStatuses(socialStatuses);
            } else {
              setSocialStatuses([
                ...socialStatuses,
                {
                  platform: res.status.platform,
                  icon: getIcon(res.status.platform),
                  status: "finish",
                },
              ]);
            }
            break;
          }
          case "error": {
            const statE = socialStatuses.find(
              (element: SocialStatus) => element.platform == platform
            );
            if (statE) {
              const index = socialStatuses.indexOf(statE);
              statE.status = "error";
              socialStatuses[index] = statE;
              setSocialStatuses(socialStatuses);
            } else {
              setSocialStatuses([
                ...socialStatuses,
                {
                  platform: res.status.platform,
                  icon: getIcon(res.status.platform),
                  status: "error",
                },
              ]);
            }
            break;
          }
          case "pending": {
            const statP = socialStatuses.find(
              (element: SocialStatus) => element.platform == platform
            );
            if (statP) {
              const index = socialStatuses.indexOf(statP);
              statP.status = "wait";
              socialStatuses[index] = statP;
              setTimeout(() => setSocialStatuses(socialStatuses), 5000);
            } else {
              setSocialStatuses([
                ...socialStatuses,
                {
                  platform: res.status.platform,
                  icon: getIcon(res.status.platform),
                  status: "wait",
                },
              ]);
            }
            getStatus(platform);
            setSocialStatuses(mapStatuses());
          }
        }
      });
  };

  const getStatusIcon = (status: "wait" | "process" | "finish" | "error") => {
    switch (status) {
      case "finish":
        return (
          <Icon component={CheckCircleOutlined} style={{ color: "green" }} />
        );
      case "process":
        return <Icon component={LoadingOutlined} style={{ color: "blue" }} />;
      case "error":
        return (
          <Icon component={CloseCircleOutlined} style={{ color: "red" }} />
        );
      default:
        return <Icon component={LoadingOutlined} style={{ color: "gray" }} />;
    }
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          text: "Ок",
          onButtonClick: () => {
            dispatch(setPostStatusDialog(false));
          },
        },
      ]}
      isOpen={isOpen}
      onCancelClick={onCancel}
      title={"Публикация поста"}
    >
      <Divider>Статус публикации</Divider>
      <div className={styles.socialList}>
        {socialStatuses.map((social, index) => (
          <div
            className={styles.socialStatuses}
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            {social.icon}
            {getStatusIcon(social.status)}
          </div>
        ))}
      </div>

      <Text>{error_data}</Text>
    </DialogBox>
  );
};

export default PostStatusDialog;
