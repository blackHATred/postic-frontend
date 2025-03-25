import React, { useContext, useRef, useState } from "react";
import DialogBoxXInputs from "../dialogBoxes/DialogBoxXInputs";
import { NotificationContext } from "../../../api/notification";
import { WebSocketContext } from "../../../api/comments";
import DialogBox from "../../ui/dialogBoxOneButton/DialogBox";
import BlueDashedTextBox from "../../ui/BlueDashedTextBox/BlueDashedTextBox";
import { SimpleBoxProps } from "./WelcomeDialog";

const LoginDialog: React.FC<SimpleBoxProps> = (props: SimpleBoxProps) => {
  return (
    <DialogBoxXInputs
      text={"Введите ID"}
      title={"Вход"}
      input_placeholders={{ id: "ID" }}
      buttonText={["Ок"]}
      onOkClick={[() => {}]}
      onCancelClick={async () => {
        props.setShowBox(false);
      }}
      isOpen={props.showBox}
    />
  );
};

export default LoginDialog;
