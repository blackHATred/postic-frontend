import React from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const BlueButton: React.FC = () => {
  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }} // Настройте цвет кнопки
    >
      Суммаризация
    </Button>
  );
};

export default BlueButton;
