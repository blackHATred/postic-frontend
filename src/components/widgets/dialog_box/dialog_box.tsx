import React from "react";
import { Layout } from "antd";
import { Header, Footer, Content } from "antd/es/layout/layout";
import styles from "./styles.module.scss";

const DialogBox = () => {
  return(
    <div className={styles["blur"]}>
      <Layout className={styles["ant-layout"]}>
          <Header > 
              Заголовок
          </Header>
          <Content>

          </Content>
          <Footer>
              Низ
          </Footer>
      </Layout>
    </div>
  )
};

export default DialogBox;