import { useState, useContext } from "react";
import { Typography, Input, Divider, Form } from "antd";
import DialogBox, { DialogBoxProps } from "../../ui/dialogBox/DialogBox";
import styles from "./styles.module.scss";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { setRenameTeamDialog } from "../../../stores/teamSlice";
import { Rename } from "../../../api/teamApi";
import { NotificationContext } from "../../../api/notification";

const { Text } = Typography;

export interface TeamCreateDialogProps
  extends Omit<DialogBoxProps, "onCancelClick"> {
  setOpen: Function;
}

const TeamRenameDialog: React.FC = () => {
  const [form] = Form.useForm();
  const [teamName, setTeamName] = useState("");
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.teams.renameTeamDialog.isOpen);
  const notificationManager = useContext(NotificationContext);
  const teamId = useAppSelector((state) => state.teams.selectedTeamId);
  const oldName = useAppSelector((state) => state.teams.oldTeamName);

  const onOk = () => {
    if (!teamName.trim()) {
      form.validateFields();
      return;
    }

    const renameRequest = {
      team_id: teamId,
      new_name: teamName,
    };
    Rename(renameRequest)
      .then((response) => {
        notificationManager.createNotification(
          "success",
          "Команда переименована",
          `Команда "${teamName}" успешно переименована`
        );

        dispatch(setRenameTeamDialog(false));

        form.resetFields();
        setTeamName("");
      })
      .catch((error) => {
        notificationManager.createNotification(
          "error",
          "Ошибка создания команды",
          error.message || "Не удалось создать команду"
        );
      });
  };

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
        form.resetFields();
        setTeamName("");
        dispatch(setRenameTeamDialog(false));
      }}
      title={"Смена названия команды"}
      isCenter={true}
    >
      <Divider />

      <div className={styles["form"]}>
        <Form form={form}>
          <Form.Item
            label="Название команды"
            name="teamName"
            rules={[
              {
                required: true,
                message: "Пожалуйста, введите название команды",
              },
            ]}
            labelCol={{ span: 24 }}
          >
            <Input
              placeholder="Введите название команды"
              defaultValue={oldName}
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </Form.Item>
        </Form>
      </div>
    </DialogBox>
  );
};

export default TeamRenameDialog;
