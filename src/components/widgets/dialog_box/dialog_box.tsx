import React from "react";
import { FC } from "react";
import { Layout, Typography } from "antd";
import { Header, Footer, Content } from "antd/es/layout/layout";
import styles from "./styles.module.scss";
import { DialogBoxModel } from "../../../models/dialog_box/client";
import { Input } from "antd";
import BlueButton from "../../ui/Button/Button";

const { Text, Title } = Typography;

const DialogBox: FC<DialogBoxModel> =({title, text, input_placeholder, onDialogClick}) => {
  return(
    <div className={styles["blur"]}>
      <Layout className={styles["ant-layout"]}>
          <Header className={styles["ant-layout-header"]}> 
              <Title level={4}>{title}</Title>
          </Header >
          <Content className={styles["ant-layout-content"]}>
            <Text>{text}</Text>
            <Input placeholder={input_placeholder} variant="filled" />
          </Content>
          <Footer className={styles["ant-layout-footer"]}>
              <BlueButton onButtonClick={onDialogClick}/>
          </Footer>
      </Layout>
    </div>
  )
};

export default DialogBox;