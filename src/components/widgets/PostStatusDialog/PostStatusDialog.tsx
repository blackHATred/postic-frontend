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
  LiaWhatsapp,
  LiaTwitter,
  LiaFacebook,
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
    (state) => state.posts.posts.find((post) => post.ID === postId)?.Platforms
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
          case "success":
            const stat_s = socialStatuses.find(
              (element: SocialStatus) => element.platform == platform
            );
            if (stat_s) {
              const index = socialStatuses.indexOf(stat_s);
              stat_s.status = "finish";
              socialStatuses[index] = stat_s;
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
          case "error":
            const stat_e = socialStatuses.find(
              (element: SocialStatus) => element.platform == platform
            );
            if (stat_e) {
              const index = socialStatuses.indexOf(stat_e);
              stat_e.status = "error";
              socialStatuses[index] = stat_e;
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
          case "pending":
            const stat_p = socialStatuses.find(
              (element: SocialStatus) => element.platform == platform
            );
            if (stat_p) {
              const index = socialStatuses.indexOf(stat_p);
              stat_p.status = "wait";
              socialStatuses[index] = stat_p;
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
