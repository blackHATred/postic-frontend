import React from "react";
import { Button } from "antd";
import styles from './styles.module.scss'

export interface BlueButtonProps {
  text: string;
  icon?: React.ReactNode; // Опциональная иконка
  onButtonClick? : (...args: any) => any;
}

const BlueButton: React.FC<BlueButtonProps> = ({ text, icon, onButtonClick }) => {
  return (
    <Button
      type="primary"
      icon={icon}
      onClick={onButtonClick}
      className={styles['blueButton']}
    >
      {text}
    </Button>
  );
};

export default BlueButton;
