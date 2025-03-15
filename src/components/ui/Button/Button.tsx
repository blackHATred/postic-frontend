import React from "react";
import { Button } from "antd";

interface BlueButtonProps {
  text: string;
  icon?: React.ReactNode; // Опциональная иконка
}

const BlueButton: React.FC<BlueButtonProps> = ({ text, icon }) => {
  return (
    <Button
      type="primary"
      icon={icon}
      style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
    >
      {text}
    </Button>
  );
};

export default BlueButton;
