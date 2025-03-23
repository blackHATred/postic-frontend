import { useState } from "react";
import { FC } from "react";
import { Typography, Input } from "antd";
import DialogBox, {
  DialogBoxProps,
} from "../../ui/dialogBoxOneButton/DialogBox";
import styles from "./styles.module.scss";
import { red } from "@ant-design/colors";

const { Text } = Typography;

export interface DialogBoxXInputsProps extends DialogBoxProps {
  setOpen: Function;
  text: string;
  input_placeholders: { [key: string]: string };
  styles: { [key: string]: "" | "warning" | "error" };
  onOkClick: (args: { [key: string]: string }) => void;
  onCancelClick: (args: { [key: string]: string }) => void;
  errortext?: string;
}

const DialogBoxXInputs: FC<DialogBoxXInputsProps> = (
  props: DialogBoxXInputsProps
) => {
  const [input_data, SetInputData] = useState<{ [key: string]: string }>({});

  return (
    <DialogBox
      onOkClick={() => {
        props.onOkClick(input_data);
      }}
      isOpen={props.isOpen}
      onCancelClick={() => {
        props.onCancelClick(input_data);
      }}
      buttonText={props.buttonText}
      title={props.title}
      headerSubtext={props.headerSubtext}
    >
      <Text>{props.text}</Text>
      {Object.entries(props.input_placeholders).map(([key, value]) => (
        <Input
          status={props.styles[key]}
          className={styles["input"]}
          placeholder={value}
          variant="filled"
          onChange={(e) => {
            let d_1 = input_data;
            d_1[key] = e.target.value;
            SetInputData(d_1);
          }}
        />
      ))}
      <Text type="danger">{props.errortext}</Text>
    </DialogBox>
  );
};

export default DialogBoxXInputs;
