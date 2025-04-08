import React from "react";
import styles from "./styles.module.scss";
import { Typography } from "antd";
import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import ClickableButton from "../../ui/Button/Button";

const { Text } = Typography;

interface SidebarProps {
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setActivePage }) => {
  const options = [
    {
      icon: <PlusOutlined className={styles["icon-primary"]} />,
      text: "Добавить пост",
      page: "add-post",
    },
    {
      icon: <TeamOutlined className={styles["icon-primary"]} />,
      text: "Команды",
      page: "teams",
    },
  ];

  return (
    <div className={styles["sidebar"]}>
      {options.map((option, index) => (
        <div
          key={index}
          className={styles["sidebar-options"]}
          onClick={() => setActivePage(option.page)} // Устанавливаем активную страницу
        >
          <ClickableButton
            color="default"
            type="text"
            text={option.text}
            icon={option.icon}
          />
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
