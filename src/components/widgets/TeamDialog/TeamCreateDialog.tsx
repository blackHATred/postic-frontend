import { Typography, Input, Divider, Form } from "antd";
import DialogBox, { DialogBoxProps } from "../../ui/dialogBox/DialogBox";
import styles from "./styles.module.scss";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { setCreateTeamDialog } from "../../../stores/teamSlice";

const { Text } = Typography;

export interface TeamCreateDialogProps
  extends Omit<DialogBoxProps, "onCancelClick"> {
  setOpen: Function;
}

const TeamCreateDialog: React.FC = () => {
  const onOk = () => {};
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.teams.createTeamDialog.isOpen);

  return (
    <DialogBox
      bottomButtons={[
        {
          text: "Создать",
          onButtonClick: onOk,
        },
      ]}
      isOpen={isOpen}
      onCancelClick={async () => {
        dispatch(setCreateTeamDialog(false));
      }}
      title={"Создание команду"}
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
