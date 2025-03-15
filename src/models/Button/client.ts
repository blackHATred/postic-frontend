import { MouseEventHandler } from "react";

export interface BlueButtonProps {
    text: string;
    icon?: React.ReactNode; // Опциональная иконка
    onButtonClick? : (...args: any) => any;
    className? : string;
  }
