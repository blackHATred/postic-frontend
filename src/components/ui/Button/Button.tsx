import React from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { BlueButtonProps } from "../../../models/Button/client";

const BlueButton: React.FC<BlueButtonProps> = ({
  text,
  icon,
  onButtonClick,
  className,
}) => {
  return (
    <Button
      className={className}
      type="primary"
      icon={icon}
      style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
      onClick={onButtonClick}
    >
      {text}
    </Button>
  );
};

export default BlueButton;
