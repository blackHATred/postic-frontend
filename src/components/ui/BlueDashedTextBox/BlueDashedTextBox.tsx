import {
  PropsWithChildren,
} from "react";
import React from "react";
import { FC } from "react";
import { Typography, Spin } from "antd";
import { blue } from "@ant-design/colors";

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
    minHeight: "50px",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    width: "100%",
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
