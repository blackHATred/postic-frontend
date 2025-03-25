import {
  RefObject,
  useImperativeHandle,
  useState,
  useEffect,
  useContext,
  PropsWithChildren,
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

const { Text } = Typography;

export interface BlueDashedTextBoxProps {
  isLoading: boolean;
}

const BlueDashedTextBox: FC<PropsWithChildren<BlueDashedTextBoxProps>> = (
  props: PropsWithChildren<BlueDashedTextBoxProps>
) => {
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

  return (
    <div
      style={{ display: "flex", alignItems: "center", flexDirection: "column" }}
    >
      {props.isLoading && <Spin />}
      {!props.isLoading && (
        <div style={BackgroundStyle}>
          <Text
            style={{ color: blue[6], marginTop: "auto", marginBottom: "auto" }}
          >
            {props.children}
          </Text>
        </div>
      )}
    </div>
  );
};

export default BlueDashedTextBox;
