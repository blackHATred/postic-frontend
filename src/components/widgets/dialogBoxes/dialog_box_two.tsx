
import  { useState } from "react";
import { FC } from "react";
import { Typography, Input } from "antd";
import DialogBoxOneButton, { DialogBoxModelOneButtonProps } from "../../ui/dialogBoxOneButton/DialogBoxOneButton";
import styles from "./styles.module.scss"

const { Text} = Typography;


export interface DialogBoxThreeInputProps extends DialogBoxModelOneButtonProps{
  setOpen : Function;
  text: string;
  input_placeholder_one: string;
  input_placeholder_two: string;
  input_placeholder_three: string;
}


const DialogBoxThreeInput: FC<DialogBoxThreeInputProps> =(props: DialogBoxThreeInputProps) => {
  
  const [input_data1, SetInputData1] = useState("");
  const [input_data2, SetInputData2] = useState("");
  const [input_data3, SetInputData3] = useState("");
  const [error_data, SetErrorData] = useState("");

  const onOk = ()=>{
    let res = props.onOk(input_data1, input_data2, input_data3);
    if (res === ""){
      props.setOpen(false);
    }else{
      SetErrorData(res);
    }
  }

  const onCancel = ()=>{
    props.onCancel();
    props.setOpen(false);
  }
  
  return(
    <DialogBoxOneButton onOk={onOk} isOpen={props.isOpen} onCancel={onCancel} buttonText={props.buttonText} title={props.title}>
            <Text>{props.text}</Text>
            <Input className={styles["input"]} placeholder={props.input_placeholder_one} variant="filled" onChange={(e) => {SetInputData1(e.target.value)}}/>
            <Input className={styles["input"]} placeholder={props.input_placeholder_two} variant="filled" onChange={(e) => {SetInputData2(e.target.value)}}/>
            <Input className={styles["input"]} placeholder={props.input_placeholder_three} variant="filled" onChange={(e) => {SetInputData3(e.target.value)}}/>
            <Text>{error_data}</Text>
    </DialogBoxOneButton>
  )
};

export default DialogBoxThreeInput;