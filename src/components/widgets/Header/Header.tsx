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

interface ButtonHeaderProps {
  OnClick1: (...args: any) => any;
  OnClick2: (...args: any) => any;
  OnClickCreatePost: (...args: any) => any;
  activeTab: string;
  onTabChange: (key: string) => void;
}

const ButtonHeader: React.FC<ButtonHeaderProps> = ({
  OnClick1,
  OnClick2,
  OnClickCreatePost,
  activeTab,
  onTabChange,
}) => {
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
            onButtonClick={OnClickCreatePost}
          />
          <ClickableButton
            icon={<BellOutlined />}
            type="default"
            onButtonClick={OnClick2}
          />
          <ClickableButton
            icon={<UserOutlined />}
            type="default"
            onButtonClick={OnClick1}
          />
        </div>
      </div>
    </div>
  );
};

export default ButtonHeader;
