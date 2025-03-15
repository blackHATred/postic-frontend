import React from "react";
import BlueButton from "../../ui/Button/Button";
import { CommentOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";

const ButtonHeader: React.FC = () => {
  return (
    <div className={styles.headerContainer}>
      <BlueButton text="api key tg" icon={<CommentOutlined />} />
      <BlueButton text="Суммаризация" icon={<CommentOutlined />} />
      <BlueButton text="api key vk" icon={<CommentOutlined />} />
    </div>
  );
};

export default ButtonHeader;
