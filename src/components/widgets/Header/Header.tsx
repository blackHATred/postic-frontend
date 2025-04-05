import React from "react";
import ClickableButton from "../../ui/Button/Button";
import {
  BellOutlined,
  CommentOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styles from "./styles.module.scss";
import { Image, Menu, MenuProps, Tabs, Select, SelectProps } from "antd";
import logo from "../../../styles/images/logo.png";
import { mockTeams } from "../../../models/Team/types";

interface ButtonHeaderProps {
  OnClick1: (...args: any) => any;
  OnClick2: (...args: any) => any;
  OnClickCreatePost: (...args: any) => any;
  OnClickMe: (...args: any) => any;
  activeTab: string;
  onTabChange: (key: string) => void;
}

const ButtonHeader: React.FC<ButtonHeaderProps> = ({
  OnClick1,
  OnClick2,
  OnClickCreatePost,
  OnClickMe,
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
      label: "Комментарии",
    },
  ];

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  interface TeamOption {
    value: string;
    label: React.ReactNode;
    icon: React.ReactNode;
  }

  const teamOptions = mockTeams.map((team) => ({
    value: team.team_id.toString(),
    label: team.team_name,
  }));

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerComponents}>
        <Image src={logo} alt="logo" height={40} width={40} preview={false} />
        <Tabs activeKey={activeTab} items={tabItems} onChange={onTabChange} />
        <div className={styles.headerIcons}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <TeamOutlined style={{ color: "#1890ff" }} />{" "}
            <Select
              defaultValue={teamOptions[0]?.value}
              style={{
                width: 150,
                margin: 5,
              }}
              variant="borderless"
              onChange={handleChange}
              options={teamOptions}
            />
          </div>
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
          <ClickableButton type="default" text="me" onButtonClick={OnClickMe} />
        </div>
      </div>
    </div>
  );
};

export default ButtonHeader;
