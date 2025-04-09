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
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  setCreatePostDialog,
  setPersonalInfoDialog,
  setPostStatusDialog,
  setWelcomeDialog,
} from "../../../stores/basePageDialogsSlice";
import { getTeamsFromStore } from "../../../stores/teamSlice";

interface ButtonHeaderProps {
  activeTab: string;
  onTabChange: (key: string) => void;
}

const ButtonHeader: React.FC<ButtonHeaderProps> = ({
  activeTab,
  onTabChange,
}) => {
  const dispatch = useAppDispatch();
  const teams = useAppSelector(getTeamsFromStore);
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

  const handleChange = (value: string) => {};

  interface TeamOption {
    value: string;
    label: React.ReactNode;
    icon: React.ReactNode;
  }

  const teamOptions = teams.map((team) => ({
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
