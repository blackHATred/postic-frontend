import React from "react";
import ClickableButton from "../../ui/Button/Button";
import {
  BellOutlined,
  CommentOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styles from "./styles.module.scss";
import { Image, Tabs } from "antd";
import logo from "../../../styles/images/logo.png";
import { useAppDispatch } from "../../../stores/hooks";
import {
  setCreatePostDialog,
  setPersonalInfoDialog,
  setPostStatusDialog,
  setWelcomeDialog,
} from "../../../stores/basePageDialogsSlice";

interface ButtonHeaderProps {
  activeTab: string;
  onTabChange: (key: string) => void;
}

const ButtonHeader: React.FC<ButtonHeaderProps> = ({
  activeTab,
  onTabChange,
}) => {
  const dispatch = useAppDispatch();
  const tabItems = [
    {
      key: "1",
      label: "Посты",
    },
    {
      key: "2",
      label: "Лента",
    },
  ];

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerComponents}>
        <Image
          src={logo}
          alt="logo"
          height={40}
          width={40}
          preview={false}
        ></Image>
        <Tabs activeKey={activeTab} items={tabItems} onChange={onTabChange} />
        <div className={styles.headerIcons}>
          <ClickableButton
            icon={<PlusOutlined />}
            type="default"
            onButtonClick={() => dispatch(setCreatePostDialog(true))}
          />
          <ClickableButton
            icon={<BellOutlined />}
            type="default"
            onButtonClick={() => dispatch(setPostStatusDialog(true))}
          />
          <ClickableButton
            icon={<UserOutlined />}
            type="default"
            onButtonClick={() => dispatch(setWelcomeDialog(true))}
          />
          <ClickableButton
            type="default"
            text="me"
            onButtonClick={() => dispatch(setPersonalInfoDialog(true))}
          />
        </div>
      </div>
    </div>
  );
};

export default ButtonHeader;
