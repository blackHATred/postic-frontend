import React from "react";
import BlueButton from "../../ui/Button/Button";
import { CommentOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";

interface ButtonHeaderProps {
  OnClick1: (...args: any) => any;
  OnClick2: (...args: any) => any;
}

const ButtonHeader: React.FC<ButtonHeaderProps> = ({ OnClick1, OnClick2 }) => {
  return (
    <div className={styles.headerContainer}>
      <BlueButton
        text="api keys"
        icon={<CommentOutlined />}
        onButtonClick={OnClick1}
      />
      <BlueButton
        text="Суммаризация"
        icon={<CommentOutlined />}
        onButtonClick={OnClick2}
      />
    </div>
  );
};

export default ButtonHeader;
