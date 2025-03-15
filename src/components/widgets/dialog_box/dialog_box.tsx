import React from "react";
import { FC } from "react";
import { Button, Layout, Typography } from "antd";
import { Header, Footer, Content } from "antd/es/layout/layout";
import "./styles.css";
import { DialogBoxModel } from "../../../models/dialog_box/client";
import { Input, ConfigProvider } from "antd";
import BlueButton from "../../ui/Button/Button";
import {
  CloseOutlined
} from '@ant-design/icons';
const { Text, Title } = Typography;

const DialogBox: FC<DialogBoxModel> =({title, text, input_placeholder, onDialogClick, button_text, OnCloseClick}) => {
  return(
    <div className="blur">
      <Layout>
          <Header> 
              <Title level={4}>{title}</Title>
              <Button color="default" variant="text" onClick={OnCloseClick}><CloseOutlined /></Button>
          </Header >
          <Content>
            <Text>{text}</Text>
            <Input placeholder={input_placeholder} variant="filled" />
          </Content>
            <Footer>
                <BlueButton className="commitDialog" text={button_text} onButtonClick={onDialogClick} />
            </Footer>
      </Layout>
    </div>
  )
};

export default DialogBox;