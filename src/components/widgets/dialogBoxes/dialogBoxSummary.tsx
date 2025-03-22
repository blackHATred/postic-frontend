import  { RefObject, useImperativeHandle, useState, useEffect } from "react";
import { FC } from "react";
import { Typography, Input, Layout, Spin } from "antd";
import DialogBoxOneButton, { DialogBoxModelOneButtonProps } from "../../ui/dialogBoxOneButton/DialogBoxOneButton";
import { theme } from 'antd';
import {blue} from '@ant-design/colors';

const { Text} = Typography;

export interface DialogBoxSummaryProps extends Omit<DialogBoxModelOneButtonProps, 'onOk' | 'onCancel' | 'headerSubtext'>{
  setOpen : Function,
  postRef?: RefObject<HTMLDivElement | null>,
  isLoading : Boolean,
  postId: string
}



const DialogBoxSummary: FC<DialogBoxSummaryProps> =(props: DialogBoxSummaryProps) => {
    const [summaryText, setSummaryText] = useState("");

    const BackgroundStyle: React.CSSProperties = {
        background: blue[0],
        borderStyle: "dashed",
        borderColor: blue[2],
        borderRadius: '5px',
        textAlign: 'center',
        minHeight: "100px",
        display: 'flex',
        alignItems: "center",
        flexDirection: "column",
    };

    useEffect(() =>{
        //Получили id от комментария, делаем Get и потом можно async Post 
    }, [props.postId])

  const onRefresh = async ()=>{
    setSummaryText("refreshed" + props.postId); // При нажатии повторного запроса
  }

  const onCancel = async ()=>{
    setSummaryText("");
    props.setOpen(false);
  }

  const onHeaderClick = async () =>{
    if (props.postRef?.current){
        props.setOpen(false);
        props.postRef.current.scrollIntoView({behavior : "smooth"});
        props.postRef.current.className += " selected"
        await setTimeout(() => {
            if (props.postRef?.current)
                props.postRef.current.className = props.postRef.current.className.replace(" selected", "")
        }, 3000);
        
    }

  }
  
  return(
    <DialogBoxOneButton onOk={onRefresh} isOpen={props.isOpen} onCancel={onCancel} 
                        buttonText={props.buttonText} title={props.title} headerSubtext={"Пост #" + props.postId}
                        headerSubtextOnClick={onHeaderClick}>
            <div style={BackgroundStyle}>
                { props.isLoading &&
                    <Spin />
                }
                <Text style={{color:blue[6], marginTop:"auto", marginBottom: "auto"}}>
                    {summaryText}
                </Text>
            </div>
    </DialogBoxOneButton>
  )
};

export default DialogBoxSummary;
