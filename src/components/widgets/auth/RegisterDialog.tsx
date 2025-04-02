import React, { useContext, useEffect, useRef, useState } from "react";
import DialogBoxXInputs from "../dialogBoxes/DialogBoxXInputs";
import { NotificationContext } from "../../../api/notification";
import { WebSocketContext } from "../../../api/WebSocket";
import DialogBox from "../../ui/dialogBoxOneButton/DialogBox";
import BlueDashedTextBox from "../../ui/BlueDashedTextBox/BlueDashedTextBox";
import { SimpleBoxProps } from "./WelcomeDialog";
import { Register } from "../../../api/api";
import { RegisterResult } from "../../../models/User/types";
import Cookies from "universal-cookie";

const RegisterDialog: React.FC<SimpleBoxProps> = (props: SimpleBoxProps) => {
  const [id, setID] = useState("");
  const [loading, setLoading] = useState(true);
  const notificationManager = useContext(NotificationContext);

  useEffect(() => {
    setLoading(true);
    if (props.showBox) {
      Register()
        .then((res: RegisterResult) => {
          setID(res.user_id.toString());
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
      setLoading(false);
    }
  }, [props.showBox]);

  return (
    <DialogBox
      title={"Регистрация"}
      buttonText={["Ок"]}
      onOkClick={[() => {}]}
      onCancelClick={async () => {
        props.setShowBox(false);
      }}
      isOpen={props.showBox}
    >
      <BlueDashedTextBox isLoading={loading}>
        <div>Ваш ID: {id}</div>
      </BlueDashedTextBox>
    </DialogBox>
  );
};

export default RegisterDialog;
