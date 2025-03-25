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
import { getSummarize, Summarize } from "../../../api/api";
import { GetSummarizeResult } from "../../../models/Comment/types";
import BlueDashedTextBox from "../../ui/BlueDashedTextBox/BlueDashedTextBox";

const { Text } = Typography;

interface SummaryBoxContent {
  setActive: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setPostID: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  postId: string;
}

export const SummaryBoxContext = createContext<SummaryBoxContent>({
  setActive: () => {},
  setLoading: () => {},
  setPostID: () => {},
  isLoading: false,
  postId: "",
});

const DialogBoxSummary: FC<
  Omit<DialogBoxProps, "onOkClick" | "onCancelClick" | "headerSubtext">
> = (
  props: Omit<DialogBoxProps, "onOkClick" | "onCancelClick" | "headerSubtext">
) => {
  const NotificationManager = useContext(NotificationContext);
  const SummaryBoxManager = useContext(SummaryBoxContext);
  const [summaryText, setSummaryText] = useState("");

  useEffect(() => {
    SummaryBoxManager.setLoading(true);
    if (props.isOpen) {
      getSummarize(SummaryBoxManager.postId)
        .then((summary: GetSummarizeResult) => {
          setSummaryText(summary.summary);
          SummaryBoxManager.setLoading(false);
        })
        .catch((error) => {
          NotificationManager.createNotification(
            "error",
            "Ошибка получения суммаризации",
            "ошибка подключения к серверу"
          );
          SummaryBoxManager.setLoading(false);
        });
    }
    //Получили id от комментария, делаем Get и потом можно async Post
  }, [SummaryBoxManager.postId]);

  const onRefresh = async () => {
    if (props.isOpen) {
      const summary = Summarize(SummaryBoxManager.postId)
        .then(() => {})
        .catch((error) => {
          NotificationManager.createNotification(
            "error",
            "Ошибка запроса суммарищации",
            "ошибка подключения к серверу"
          );
        });
    }
  };

  const onCancel = async () => {
    setSummaryText("");
    SummaryBoxManager.setActive(false);
  };

  const onHeaderClick = async () => {
    SummaryBoxManager.setActive(false);
    publish("PostSelected", { id: SummaryBoxManager.postId });
  };

  return (
    <DialogBox
      onOkClick={[onRefresh]}
      isOpen={props.isOpen}
      onCancelClick={onCancel}
      buttonText={props.buttonText}
      title={props.title}
      headerSubtext={"Пост #" + SummaryBoxManager.postId}
      headerSubtextOnClick={onHeaderClick}
      isCenter={true}
    >
      <BlueDashedTextBox isLoading={SummaryBoxManager.isLoading}>
        {summaryText}
      </BlueDashedTextBox>
    </DialogBox>
  );
};

export default DialogBoxSummary;
