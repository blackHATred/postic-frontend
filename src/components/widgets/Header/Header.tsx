import React from "react";
import BlueButton from "../../ui/Button/Button";
import { CommentOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";

interface ButtonHeaderProps {
  SendKeys: (...args: any) => any;
  Summarise: (...args: any) => any;
}

const ButtonHeader: React.FC<ButtonHeaderProps> = ({ SendKeys, Summarise }) => {
  return (
    <div className={styles.headerContainer}>
      <BlueButton
        text="api keys"
        icon={<CommentOutlined />}
        onButtonClick={SendKeys}
      />
      <BlueButton
        text="Суммаризация"
        icon={<CommentOutlined />}
        onButtonClick={Summarise}
      />
    </div>
  );
};

export default ButtonHeader;
