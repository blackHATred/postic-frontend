import { useState } from "react";
import { FC } from "react";
import { Typography, Input } from "antd";
import DialogBoxOneButton, {
  DialogBoxModelOneButtonProps,
} from "../../ui/dialogBoxOneButton/DialogBoxOneButton";
import styles from "./styles.module.scss";

const { Text } = Typography;

export interface DialogBoxThreeInputProps extends DialogBoxModelOneButtonProps {
  setOpen: Function;
  text: string;
  input_placeholder_one: string;
  input_placeholder_two: string;
  input_placeholder_three: string;
  onOk: (arg0: string, arg1: string, arg2: string) => Promise<string>;
  onCancel: () => Promise<string>;
}

const DialogBoxThreeInput: FC<DialogBoxThreeInputProps> = (
  props: DialogBoxThreeInputProps
) => {
  const [input_data1, SetInputData1] = useState("");
  const [input_data2, SetInputData2] = useState("");
  const [input_data3, SetInputData3] = useState("");
  const [error_data, SetErrorData] = useState("");

  const onOk = async () => {
    let res = await props.onOk(input_data1, input_data2, input_data3);
    if (res === "") {
      props.setOpen(false);
    } else {
      SetErrorData(res);
    }
  };

  const onCancel = async () => {
    let res = await props.onCancel();
    if (res === "") {
      props.setOpen(false);
    } else {
      SetErrorData(res);
    }
  };

  return (
    <DialogBoxOneButton
      onOk={onOk}
      isOpen={props.isOpen}
      onCancel={onCancel}
      buttonText={props.buttonText}
      title={props.title}
      headerSubtext={props.headerSubtext}
    >
      <Text>{props.text}</Text>
      <Input
        className={styles["input"]}
        placeholder={props.input_placeholder_one}
        variant="filled"
        onChange={(e) => {
          SetInputData1(e.target.value);
        }}
      />
      <Input
        className={styles["input"]}
        placeholder={props.input_placeholder_two}
        variant="filled"
        onChange={(e) => {
          SetInputData2(e.target.value);
        }}
      />
      <Input
        className={styles["input"]}
        placeholder={props.input_placeholder_three}
        variant="filled"
        onChange={(e) => {
          SetInputData3(e.target.value);
        }}
      />
      <Text>{error_data}</Text>
    </DialogBoxOneButton>
  );
};

export default DialogBoxThreeInput;
