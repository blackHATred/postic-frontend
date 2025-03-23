import { FC, useState } from "react";
import { Typography, Divider, Steps } from "antd";
import DialogBoxOneButton, {
  DialogBoxModelOneButtonProps,
} from "../../ui/dialogBoxOneButton/DialogBoxOneButton";
import Icon, {
  WhatsAppOutlined,
  FacebookOutlined,
  TwitterOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import styles from "./styles.module.scss";

export interface PostStatusDialogProps extends DialogBoxModelOneButtonProps {
  setOpen: Function;
  onCancel: () => Promise<string>;
  selectedPlatforms: string[];
}

const { Text } = Typography;

interface SocialStatus {
  platform: string;
  icon: React.ReactNode;
  status: "wait" | "process" | "finish" | "error";
}
const PostStatusDialog: FC<PostStatusDialogProps> = (
  props: PostStatusDialogProps
) => {
  const [error_data, SetErrorData] = useState("");

  const onOk = () => {
    console.log("Ok button clicked");
  };

  const onCancel = async () => {
    let res = await props.onCancel();
    if (res === "") {
      props.setOpen(false);
    } else {
      SetErrorData(res);
    }
  };

  const socialStatuses: SocialStatus[] = props.selectedPlatforms.map(
    (platform) => ({
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
    })
  );

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
    <DialogBoxOneButton
      onOk={onOk}
      isOpen={props.isOpen}
      onCancel={onCancel}
      buttonText={props.buttonText}
      title={props.title}
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
    </DialogBoxOneButton>
  );
};

export default PostStatusDialog;
