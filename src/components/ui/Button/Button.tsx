import React from "react";
import { Button } from "antd";
import styles from "./styles.module.scss";

export interface ClickableButtonProps {
  type?: "primary" | "default" | "dashed" | "text" | "link"; // Ограничиваем типы
  text?: string;
  icon?: React.ReactNode;
  variant?: "dashed" | "text" | "link" | "outlined" | "solid" | "filled";
  size?: "large" | "middle" | "small";
  color?:
    | "primary"
    | "default"
    | "danger"
    | "blue"
    | "purple"
    | "cyan"
    | "green"
    | "magenta"
    | "pink"
    | "red"
    | "orange"
    | "yellow"
    | "volcano"
    | "geekblue"
    | "lime"
    | "gold";
  onButtonClick?: (...args: any) => any;
}

const ClickableButton: React.FC<ClickableButtonProps> = ({
  type = "primary",
  text,
  icon,
  color,
  variant,
  size,
  onButtonClick,
}) => {
  return (
    <Button
      type={type}
      icon={icon}
      color={color}
      variant={variant}
      onClick={onButtonClick}
      size={size}
      className={styles["blueButton"]}
    >
      {text}
    </Button>
  );
};

export default ClickableButton;
