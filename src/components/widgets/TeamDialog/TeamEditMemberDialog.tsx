import { useState } from "react";
import { Typography, Input, Divider, Form, Checkbox } from "antd";
import DialogBox, { DialogBoxProps } from "../../ui/dialogBox/DialogBox";
import styles from "./styles.module.scss";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { setEditMemberDialog } from "../../../stores/teamSlice";

const { Text } = Typography;

export interface TeamEditMemberDialogProps
  extends Omit<DialogBoxProps, "onCancelClick"> {
  setOpen: Function;
}

const TeamEditMemberDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.teams.editMemberDialog.isOpen);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState({
    comments: false,
    posts: false,
  });
  const selectedMemberId = useAppSelector(
    (state) => state.teams.selectedMemberId
  );

  const handleAdminChange = (checked: boolean) => {
    setIsAdmin(checked);
    if (checked) {
      setPermissions({ comments: true, posts: true });
    } else {
      setPermissions({ comments: false, posts: false });
    }
  };

  const handlePermissionChange = (
    key: "comments" | "posts",
    checked: boolean
  ) => {
    setPermissions((prev) => ({ ...prev, [key]: checked }));
  };

  const onOk = () => {};

  return (
    <DialogBox
      bottomButtons={[
        {
          text: "Сохранить",
          onButtonClick: onOk,
        },
      ]}
      isOpen={isOpen}
      onCancelClick={async () => {
        dispatch(setEditMemberDialog(false));
      }}
      title={"Изменение прав"}
      isCenter={true}
    >
      <Divider />

      <div className={styles["form"]}>
        <Form>
          <Form.Item
            label="ID участника"
            name="vertical"
            rules={[{ required: true }]}
            labelCol={{ span: 24 }}
          >
            <Input disabled placeholder={String(selectedMemberId)} />
          </Form.Item>
        </Form>

        <div className={styles["checkboxes"]}>
          <Text strong>Права доступа</Text>
          <Checkbox
            checked={permissions.comments}
            disabled={isAdmin}
            onChange={(e) =>
              handlePermissionChange("comments", e.target.checked)
            }
          >
            Комментарии
          </Checkbox>
          <Checkbox
            checked={permissions.posts}
            disabled={isAdmin}
            onChange={(e) => handlePermissionChange("posts", e.target.checked)}
          >
            Посты
          </Checkbox>
          <Checkbox
            checked={isAdmin}
            onChange={(e) => handleAdminChange(e.target.checked)}
          >
            Администратор
          </Checkbox>
        </div>
      </div>
    </DialogBox>
  );
};

export default TeamEditMemberDialog;
