import { FC, useState } from "react";
import {
  Typography,
  Input,
  Divider,
  Select,
  Switch,
  TimePicker,
  Form,
} from "antd";
import DialogBox, {
  DialogBoxProps,
} from "../../ui/dialogBoxOneButton/DialogBox";
import styles from "./styles.module.scss";

const { Text } = Typography;

export interface TeamCreateDialogProps
  extends Omit<DialogBoxProps, "onCancelClick"> {
  setOpen: Function;
}

const TeamCreateDialog: FC<TeamCreateDialogProps> = (
  props: TeamCreateDialogProps
) => {
  const onOk = () => {};

  const onCancel = async () => {
    props.setOpen(false);
  };

  return (
    <DialogBox
      onOkClick={[onOk]}
      isOpen={props.isOpen}
      onCancelClick={onCancel}
      buttonText={props.buttonText}
      title={props.title}
      isCenter={true}
    >
      <Divider />

      <div className={styles["form"]}>
        <Form>
          <Form.Item
            label="Название команды"
            name="vertical"
            rules={[{ required: true }]}
            labelCol={{ span: 24 }}
          >
            <Input placeholder="Введите название команды" />
          </Form.Item>
        </Form>
      </div>
    </DialogBox>
  );
};

export default TeamCreateDialog;
