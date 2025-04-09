import React from "react";
import ClickableButton from "../../ui/Button/Button";
import {
  BellOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styles from "./styles.module.scss";
import { Image, Tabs, Select } from "antd";
import logo from "../../../styles/images/logo.png";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  setCreatePostDialog,
  setPersonalInfoDialog,
  setWelcomeDialog,
} from "../../../stores/basePageDialogsSlice";
import { getTeamsFromStore } from "../../../stores/teamSlice";
import { useCookies } from "react-cookie";
interface ButtonHeaderProps {
  activeTab?: string; // Сделаем необязательным, так как вкладки могут отсутствовать
  onTabChange?: (key: string) => void; // Сделаем необязательным
  isAuthorized: boolean; // Новый проп для определения авторизации
}

const ButtonHeader: React.FC<ButtonHeaderProps> = ({
  activeTab,
  onTabChange,
  isAuthorized,
}) => {
  const dispatch = useAppDispatch();
  const teams = useAppSelector(getTeamsFromStore);
  const [cookies, setCookie] = useCookies(["session"]);

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

  const teamOptions = teams.map((team) => ({
    value: team.id.toString(),
    label: team.name,
  }));

  const setCookiesUserID = () => {
    setCookie(
      "session",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NzU3MjY0MTZ9.0ZPFGSQYN8_qcmRM3w8IGwhwPBTt66HM8x9rSV7ERUk",
      { path: "/" }
    );
    console.log("Cookie 'session' set to 1");
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerComponents}>
        <Image src={logo} alt="logo" height={40} width={40} preview={false} />

        {/* Рендерим вкладки только для авторизованных пользователей */}
        {isAuthorized && (
          <div className={styles.tabs}>
            <Tabs
              activeKey={activeTab}
              items={tabItems}
              onChange={onTabChange}
            />
          </div>
        )}

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
            onButtonClick={setCookiesUserID}
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
