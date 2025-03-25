import React, { useContext, useEffect, useRef, useState } from "react";
import DialogBoxXInputs from "../dialogBoxes/DialogBoxXInputs";
import { NotificationContext } from "../../../api/notification";
import { WebSocketContext } from "../../../api/comments";
import DialogBox from "../../ui/dialogBoxOneButton/DialogBox";
import BlueDashedTextBox from "../../ui/BlueDashedTextBox/BlueDashedTextBox";
import { SimpleBoxProps } from "./WelcomeDialog";

const RegisterDialog: React.FC<SimpleBoxProps> = (props: SimpleBoxProps) => {
  const [id, setID] = useState("");
  const [secKey, setSecKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (props.showBox) {
      console.log("close/open");
      setTimeout(() => setLoading(false), 1000);
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
        <div>Ваш секретный ключ: {secKey}</div>
      </BlueDashedTextBox>
    </DialogBox>
  );
};

export default RegisterDialog;
