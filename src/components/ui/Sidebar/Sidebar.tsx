// ui/Sidebar/Sidebar.tsx
import React from "react";
import styles from "./styles.module.scss";
import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import ClickableButton from "../../ui/Button/Button";
import { useAppDispatch } from "../../../stores/hooks";
import { setCreateTeamDialog } from "../../../stores/teamSlice";

interface SidebarProps {
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setActivePage }) => {
  const dispatch = useAppDispatch();
  return (
    <div className={styles["sidebar"]}>
      <div className={styles["sidebar-options"]}>
        <ClickableButton
          type="text"
          text={"Добавить команду"}
          icon={<PlusOutlined className={styles["icon-primary"]} />}
          onButtonClick={() => dispatch(setCreateTeamDialog(true))}
        />
      </div>
      <div
        className={styles["sidebar-options"]}
        onClick={() => setActivePage("teams")}
      >
        <ClickableButton
          type="text"
          text={"Команды"}
          icon={<TeamOutlined className={styles["icon-primary"]} />}
        />
      </div>
    </div>
  );
};

export default Sidebar;
