import React, { useState } from "react";
import { FC } from "react";
import { Button, Layout, Typography } from "antd";
import { Header, Footer, Content } from "antd/es/layout/layout";
import "./styles.css";
import { DialogBoxModelWith1 } from "../../../models/dialog_box/client";
import { Input} from "antd";
import BlueButton from "../../ui/Button/Button";
import {
  CloseOutlined
} from '@ant-design/icons';
const { Text, Title } = Typography;

const DialogBox1: FC<DialogBoxModelWith1> =({title, text, input_placeholder, onDialogClick, button_text, OnCloseClick}) => {
  
  const [input_data, SetInputData] = useState("");
  const [error_data, SetErrorData] = useState("");

  const handleClick = ()=>{
    let res = onDialogClick(input_data);
    if (res === ""){
      OnCloseClick();
    }else{
      SetErrorData(res);
    }
  }
  
  return(
    <div className="blur">
      <Layout>
          <Header> 
              <Title level={4}>{title}</Title>
              <Button color="default" variant="text" onClick={OnCloseClick}><CloseOutlined /></Button>
          </Header >
          <Content>
            <Text>{text}</Text>
            <Input placeholder={input_placeholder} variant="filled" onChange={(e) => {SetInputData(e.target.value)}}/>
            <Text>{error_data}</Text>
          </Content>
            <Footer>
                <BlueButton className="commitDialog" text={button_text} onButtonClick={handleClick} />
            </Footer>
      </Layout>
    </div>
  )
};

export default DialogBox1;