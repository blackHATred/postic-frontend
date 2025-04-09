import { useState } from "react";
import { FC } from "react";
import { Typography, Input } from "antd";
import DialogBox, { DialogBoxProps } from "../../ui/dialogBox/DialogBox";
import styles from "./styles.module.scss";
import { ClickableButtonProps } from "../../ui/Button/Button";

const { Text } = Typography;

export interface DialogBoxXInputsProps extends DialogBoxProps {
  text: string;
  input_placeholders: { [key: string]: string };
  styles?: { [key: string]: "" | "warning" | "error" };
  errortext?: string;
}

const DialogBoxXInputs: FC<DialogBoxXInputsProps> = (
  props: DialogBoxXInputsProps
) => {
  const [input_data, SetInputData] = useState<{ [key: string]: string }>({});

  return (
    <DialogBox
      {...props}
      onCancelClick={() => {
        props.onCancelClick(input_data);
      }}
      bottomButtons={
        props.bottomButtons &&
        props.bottomButtons.map((button: ClickableButtonProps) => {
          const cl = button.onButtonClick;
          if (cl) {
            button.onButtonClick = () => cl(input_data);
          }
          return button;
        })
      }
    >
      <Text>{props.text}</Text>
      {Object.entries(props.input_placeholders).map(([key, value]) => (
        <Input
          key={key}
          status={props.styles ? props.styles[key] : ""}
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
