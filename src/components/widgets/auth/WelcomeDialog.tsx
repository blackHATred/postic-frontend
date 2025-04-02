import React, { useContext, useRef, useState } from "react";
import DialogBoxXInputs from "../dialogBoxes/DialogBoxXInputs";
import { NotificationContext } from "../../../api/notification";
import { WebSocketContext } from "../../../api/WebSocket";
import DialogBox from "../../ui/dialogBoxOneButton/DialogBox";
import BlueDashedTextBox from "../../ui/BlueDashedTextBox/BlueDashedTextBox";
import Cookies from "universal-cookie";

export interface SimpleBoxProps {
  showBox: boolean;
  setShowBox: React.Dispatch<React.SetStateAction<boolean>>;
  onOkClick: ((...args: any) => void)[];
}

const WelcomeDialog: React.FC<SimpleBoxProps> = (props: SimpleBoxProps) => {
  const getButtons = () => {
    const cookies = new Cookies();
    const session = cookies.get("session");
    if (session) {
      return ["Выход"];
    }
    return ["Вход", "Регистраиция"];
  };

  return (
    <DialogBox
      title={"Добро Пожаловать!"}
      buttonText={getButtons()}
      onOkClick={props.onOkClick}
      onCancelClick={async () => {
        props.setShowBox(false);
      }}
      isOpen={props.showBox}
    >
      <BlueDashedTextBox isLoading={false}>
        <div>Вход - для пользователей с ID</div>
        <div>Регистрация - для новых пользователей</div>
      </BlueDashedTextBox>
    </DialogBox>
  );
};

export default WelcomeDialog;
