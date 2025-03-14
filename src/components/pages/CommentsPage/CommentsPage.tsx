import React from "react";
import { DatePicker } from "antd";
import styles from "./styles.module.scss";

const CommentsPage: React.FC = () => {
  return (
    <div className={styles["comments-page"]}>
      <h1>Календарик</h1>
      <DatePicker />
    </div>
  );
};

export default CommentsPage;
