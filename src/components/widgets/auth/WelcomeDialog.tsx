import React, { useContext, useRef, useState } from "react";
import DialogBoxXInputs from "../dialogBoxes/DialogBoxXInputs";
import { NotificationContext } from "../../../api/notification";
import { WebSocketContext } from "../../../api/comments";
import DialogBox from "../../ui/dialogBoxOneButton/DialogBox";
import BlueDashedTextBox from "../../ui/BlueDashedTextBox/BlueDashedTextBox";

export interface SimpleBoxProps {
  showBox: boolean;
  setShowBox: React.Dispatch<React.SetStateAction<boolean>>;
  onOkClick: ((...args: any) => void)[];
}

const WelcomeDialog: React.FC<SimpleBoxProps> = (props: SimpleBoxProps) => {
  return (
    <DialogBox
      title={"Добро Пожаловать!"}
      buttonText={["Вход", "Регистраиция"]}
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
