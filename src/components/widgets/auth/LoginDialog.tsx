import React, { useContext, useRef, useState } from "react";
import DialogBoxXInputs from "../dialogBoxes/DialogBoxXInputs";
import { NotificationContext } from "../../../api/notification";
import { WebSocketContext } from "../../../api/WebSocket";
import DialogBox from "../../ui/dialogBoxOneButton/DialogBox";
import BlueDashedTextBox from "../../ui/BlueDashedTextBox/BlueDashedTextBox";
import { SimpleBoxProps } from "./WelcomeDialog";
import Cookies from "universal-cookie";
import { RegisterResult } from "../../../models/User/types";
import { Login } from "../../../api/api";

const LoginDialog: React.FC<SimpleBoxProps> = (props: SimpleBoxProps) => {
  const notificationManager = useContext(NotificationContext);
  return (
    <DialogBoxXInputs
      text={"Введите ID"}
      title={"Вход"}
      input_placeholders={{ id: "ID" }}
      buttonText={["Ок"]}
      onOkClick={[
        (args) => {
          if (args["id"])
            Login(parseInt(args["id"]))
              .then((res: RegisterResult) => {
                const cookies = new Cookies();
                cookies.set("session", res.user_id.toString(), { path: "/" });
              })
              .catch(() => {
                notificationManager.createNotification(
                  "error",
                  "Ошибка регистрации",
                  ""
                );
              });
          else {
          }
        },
      ]}
      onCancelClick={async () => {
        props.setShowBox(false);
      }}
      isOpen={props.showBox}
    />
  );
};

export default LoginDialog;
