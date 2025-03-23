import React, { useContext, useRef, useState } from "react";
import DialogBoxXInputs from "../../widgets/dialogBoxes/DialogBoxXInputs";
import { NotificationContext } from "../../../api/notification";
import { WebSocketContext } from "../../../api/comments";

interface ApiKeyBoxProps {
  showBox: boolean;
  setShowBox: React.Dispatch<React.SetStateAction<boolean>>;
}

const ApiKeyBox: React.FC<ApiKeyBoxProps> = (props: ApiKeyBoxProps) => {
  const NotificationManager = useContext(NotificationContext);
  const webSocketmanager = useContext(WebSocketContext);
  const [styleInp1, setStyleInp1] = useState<"" | "warning" | "error">("");
  const [styleInp2, setStyleInp2] = useState<"" | "warning" | "error">("");
  const [styleInp3, setStyleInp3] = useState<"" | "warning" | "error">("");
  const [errorText, setErrorText] = useState<string>("");
  return (
    <DialogBoxXInputs
      title={"Api keys"}
      text={"Введите ключи"}
      input_placeholders={{ id_tg: "id тг", id_vk: "id vk", vk_key: "Ключ vk" }}
      styles={{ id_tg: styleInp1, id_vk: styleInp2, vk_key: styleInp3 }}
      buttonText={"Задать"}
      onOkClick={(args: { [key: string]: string }) => {
        setStyleInp1("");
        setStyleInp2("");
        setStyleInp3("");
        setErrorText("");
        try {
          if (!args.id_tg || !args.id_vk || !args.vk_key) {
            setStyleInp1(args.id_tg ? "" : "error");
            setStyleInp2(args.id_tg ? "" : "error");
            setStyleInp3(args.id_tg ? "" : "error");
            setErrorText("введите все три поля");
            return;
          }
          if (isNaN(parseInt(args.id_tg))) {
            setStyleInp1("error");
            setErrorText("id тг должен быть числовой");
            return;
          }
          if (isNaN(parseInt(args.id_vk))) {
            setStyleInp2("error");
            setErrorText("id vk должен быть числовой");
            return;
          }

          let args_int = {
            tg_chat_id: parseInt(args.id_tg),
            vk_group_id: parseInt(args.id_vk),
            vk_key: args.vk_key,
          };

          webSocketmanager.sendJsonMessage(args_int);
          NotificationManager.createNotification(
            "success",
            "Данные успешно сохранены",
            ""
          );
          props.setShowBox(false);
        } catch (error: unknown) {
          NotificationManager.createNotification(
            "error",
            (error as Error).message,
            ""
          );
        }
      }}
      onCancelClick={async () => {
        props.setShowBox(false);
      }}
      setOpen={props.setShowBox}
      isOpen={props.showBox}
      errortext={errorText}
    />
  );
};

export default ApiKeyBox;
