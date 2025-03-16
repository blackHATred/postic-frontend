import  { useState } from "react";
import { FC } from "react";
import { Typography, Input } from "antd";
import DialogBoxOneButton, { DialogBoxModelOneButtonProps } from "../../ui/dialogBoxOneButton/DialogBoxOneButton";
import styles from "./styles.module.scss"

const { Text} = Typography;

export interface DialogBoxOneInputProps extends DialogBoxModelOneButtonProps{
  setOpen : Function;
  text: string;
  input_placeholder: string;
  onOk: (arg0: string) => Promise<string> 
  onCancel: () => Promise<string> 
}

const DialogBoxOneInput: FC<DialogBoxOneInputProps> =(props: DialogBoxOneInputProps) => {
  
  const [input_data, SetInputData] = useState("");
  const [error_data, SetErrorData] = useState("");

  const onOk = async ()=>{
    let res = await props.onOk(input_data);
    if (res === ""){
      props.setOpen(false);
    }else{
      SetErrorData(res);
    }
  }

  const onCancel = async ()=>{
    let res = await props.onCancel();
    if (res === ""){
      props.setOpen(false);
    }else{
      SetErrorData(res);
    }
  }
  
  return(
    <DialogBoxOneButton onOk={onOk} isOpen={props.isOpen} onCancel={onCancel} buttonText={props.buttonText} title={props.title}>
            <Text>{props.text}</Text>
            <Input className={styles["input"]} placeholder={props.input_placeholder} variant="filled" onChange={(e) => {SetInputData(e.target.value)}}/>
            <Text>{error_data}</Text>
    </DialogBoxOneButton>
  )
};

export default DialogBoxOneInput;