import {
  RefObject,
  useImperativeHandle,
  useState,
  useEffect,
  useContext,
} from "react";
import React, { createContext, Dispatch, SetStateAction } from "react";
import { FC } from "react";
import { Typography, Spin } from "antd";
import DialogBox, {
  DialogBoxProps,
} from "../../ui/dialogBoxOneButton/DialogBox";
import { blue } from "@ant-design/colors";
import { NotificationContext } from "../../../api/notification";
import { publish } from "../../logic/event";

const { Text } = Typography;

export interface DialogBoxSummaryProps
  extends Omit<
    DialogBoxProps,
    "onOkClick" | "onCancelClick" | "headerSubtext"
  > {
  setOpen: Function;
  postRef?: RefObject<HTMLDivElement | null>;
  isLoading: Boolean;
  postId: string;
}

interface SummaryBoxContent {
  setActive: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setPostID: Dispatch<SetStateAction<string>>;
}

export const SummaryBoxContext = createContext<SummaryBoxContent>({
  setActive: () => {},
  setLoading: () => {},
  setPostID: () => {},
});

const DialogBoxSummary: FC<DialogBoxSummaryProps> = (
  props: DialogBoxSummaryProps
) => {
  const NotificationManager = useContext(NotificationContext);
  const [summaryText, setSummaryText] = useState("");

  const BackgroundStyle: React.CSSProperties = {
    background: blue[0],
    borderStyle: "dashed",
    borderColor: blue[2],
    borderRadius: "5px",
    textAlign: "center",
    minHeight: "100px",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  };

  useEffect(() => {
    //Получили id от комментария, делаем Get и потом можно async Post
  }, [props.postId]);

  const onRefresh = async () => {
    NotificationManager.createNotification(
      "error",
      "Ошибка подключения к серверу",
      ""
    );
    setSummaryText("refreshed" + props.postId); // При нажатии повторного запроса
  };

  const onCancel = async () => {
    setSummaryText("");
    props.setOpen(false);
  };

  const onHeaderClick = async () => {
    props.setOpen(false);
    publish("PostSelected", { id: props.postId });
  };

  return (
    <DialogBox
      onOkClick={onRefresh}
      isOpen={props.isOpen}
      onCancelClick={onCancel}
      buttonText={props.buttonText}
      title={props.title}
      headerSubtext={"Пост #" + props.postId}
      headerSubtextOnClick={onHeaderClick}
    >
      <div style={BackgroundStyle}>
        {props.isLoading && <Spin />}
        <Text
          style={{ color: blue[6], marginTop: "auto", marginBottom: "auto" }}
        >
          {summaryText}
        </Text>
      </div>
    </DialogBox>
  );
};

export default DialogBoxSummary;
