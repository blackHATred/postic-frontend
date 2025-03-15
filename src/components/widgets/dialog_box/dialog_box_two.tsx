import React, { useState } from "react";
import { FC } from "react";
import { Button, Layout, Typography } from "antd";
import { Header, Footer, Content } from "antd/es/layout/layout";
import "./styles.css";
import { Input, ConfigProvider } from "antd";
import BlueButton from "../../ui/Button/Button";
import { CloseOutlined } from "@ant-design/icons";
import { DialogBoxModelWith2 } from "../../../models/dialog_box/clients";
const { Text, Title } = Typography;

const DialogBox2: FC<DialogBoxModelWith2> = ({
  title,
  text,
  input_placeholder1,
  input_placeholder2,
  onDialogClick,
  button_text,
  OnCloseClick,
}) => {
  const [input_data1, SetInputData1] = useState("");
  const [input_data2, SetInputData2] = useState("");
  const [error_data, SetErrorData] = useState("");

  const handleClick = () => {
    let res = onDialogClick(input_data1 + "\n" + input_data2);
    if (res === "") {
      OnCloseClick();
    } else {
      SetErrorData(res);
    }
  };

  return (
    <div className="blur">
      <Layout>
        <Header>
          <Title level={4}>{title}</Title>
          <Button color="default" variant="text" onClick={OnCloseClick}>
            <CloseOutlined />
          </Button>
        </Header>
        <Content>
          <Text>{text}</Text>
          <Input placeholder={input_placeholder1} variant="filled" />
          <Input placeholder={input_placeholder2} variant="filled" />
          <Text>{error_data}</Text>
        </Content>
        <Footer>
          <BlueButton
            className="commitDialog"
            text={button_text}
            onButtonClick={handleClick}
          />
        </Footer>
      </Layout>
    </div>
  );
};

export default DialogBox2;
