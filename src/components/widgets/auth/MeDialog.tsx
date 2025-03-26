import React, { useContext, useEffect, useRef, useState } from "react";
import DialogBoxXInputs from "../dialogBoxes/DialogBoxXInputs";
import { NotificationContext } from "../../../api/notification";
import { WebSocketContext } from "../../../api/comments";
import DialogBox from "../../ui/dialogBoxOneButton/DialogBox";
import BlueDashedTextBox from "../../ui/BlueDashedTextBox/BlueDashedTextBox";
import { SimpleBoxProps } from "./WelcomeDialog";
import { Me, Register } from "../../../api/api";
import { MeInfo, RegisterResult } from "../../../models/User/types";
import Cookies from "universal-cookie";

const MeDialog: React.FC<SimpleBoxProps> = (props: SimpleBoxProps) => {
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(true);
  const notificationManager = useContext(NotificationContext);

  useEffect(() => {
    setLoading(true);
    if (props.showBox) {
      Me()
        .then((res: MeInfo) => {
          setSecretKey(res.secret_key);
        })
        .catch(() => {
          notificationManager.createNotification(
            "error",
            "Ошибка полечения личной информации",
            ""
          );
        });
      setLoading(false);
    }
  }, [props.showBox]);

  return (
    <DialogBox
      title={"Личная информация"}
      buttonText={["Ок"]}
      onOkClick={[() => {}]}
      onCancelClick={async () => {
        props.setShowBox(false);
      }}
      isOpen={props.showBox}
    >
      <BlueDashedTextBox isLoading={loading}>
        <div>Ваш секретный ключ: {secretKey}</div>
      </BlueDashedTextBox>
    </DialogBox>
  );
};

export default MeDialog;
