import React from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { BlueButtonInterface } from "../../../models/Button/client";

const BlueButton: React.FC<BlueButtonInterface> = ({onButtonClick}) => {
  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }} // Настройте цвет кнопки
      onClick={onButtonClick}
    >
      Суммаризация
    </Button>
  );
};

export default BlueButton;
