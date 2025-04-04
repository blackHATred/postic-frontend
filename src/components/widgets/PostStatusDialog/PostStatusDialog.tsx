import { FC, useState } from "react";
import { Typography, Divider } from "antd";
import DialogBox from "../../ui/dialogBox/DialogBox";
import Icon, {
  WhatsAppOutlined,
  FacebookOutlined,
  TwitterOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import styles from "./styles.module.scss";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { setPostStatusDialog } from "../../../stores/basePageDialogsSlice";

const { Text } = Typography;

interface SocialStatus {
  platform: string;
  icon: React.ReactNode;
  status: "wait" | "process" | "finish" | "error";
}
const PostStatusDialog: FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(
    (state) => state.basePageDialogs.postStatusDialog.isOpen
  );
  const selectedPlatforms = useAppSelector(
    (state) => state.basePageDialogs.createPostDialog.selectedPlatforms
  );
  const [error_data, SetErrorData] = useState("");

  const onCancel = async () => {
    dispatch(setPostStatusDialog(false));
  };

  const socialStatuses: SocialStatus[] = selectedPlatforms.map((platform) => ({
    platform,
    icon:
      platform === "vk" ? (
        <Icon component={WhatsAppOutlined} />
      ) : platform === "tg" ? (
        <Icon component={FacebookOutlined} />
      ) : (
        <Icon component={TwitterOutlined} />
      ),
    status: "wait", // Начальный статус
  }));

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
      bottomButtons={[{}]}
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
            <Text>{social.platform}</Text>
            {getStatusIcon(social.status)}
          </div>
        ))}
      </div>

      <Text>{error_data}</Text>
    </DialogBox>
  );
};

export default PostStatusDialog;
