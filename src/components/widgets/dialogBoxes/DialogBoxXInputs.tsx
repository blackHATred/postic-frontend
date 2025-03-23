import { useState } from "react";
import { FC } from "react";
import { Typography, Input } from "antd";
import DialogBoxOneButton, {
  DialogBoxModelOneButtonProps,
} from "../../ui/dialogBoxOneButton/DialogBoxOneButton";
import styles from "./styles.module.scss";

const { Text } = Typography;

export interface DialogBoxXInputsProps extends DialogBoxModelOneButtonProps {
  setOpen: Function;
  text: string;
  input_placeholders: {[key: string] : string};
  onOkClick: (args: {[key: string] : string}) => void;
  onCancelClick: (args: {[key: string] : string}) => void;
}

const DialogBoxXInputs: FC<DialogBoxXInputsProps> = (
  props: DialogBoxXInputsProps
) => {
  const [input_data, SetInputData] = useState<{[key: string] : string}>({});

  return (
    <DialogBoxOneButton
      onOkClick={() => {props.onOkClick(input_data)}}
      isOpen={props.isOpen}
      onCancelClick={() => {props.onOkClick(input_data)}}
      buttonText={props.buttonText}
      title={props.title}
      headerSubtext={props.headerSubtext}
    >
      <Text>{props.text}</Text>
      {Object.entries(props.input_placeholders).map(([key, value]) =>(
        <Input
        className={styles["input"]}
        placeholder={value}
        variant="filled"
        onChange={(e) => {
          let d_1 = input_data;
          d_1[key] = e.target.value
          SetInputData(d_1);
        }}
      />
      ))}
    </DialogBoxOneButton>
  );
};

export default DialogBoxXInputs;
