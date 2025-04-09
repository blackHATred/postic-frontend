import React, { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../../../api/notification";
import DialogBox from "../../ui/dialogBox/DialogBox";
import BlueDashedTextBox from "../../ui/BlueDashedTextBox/BlueDashedTextBox";
import { MeInfo } from "../../../models/User/types";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { setPersonalInfoDialog } from "../../../stores/basePageDialogsSlice";
import { Secret } from "../../../api/teamApi";

const SecretDialog: React.FC = (props) => {
  const dispatch = useAppDispatch();
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(true);
  const isOpen = useAppSelector(
    (state) => state.basePageDialogs.personalInfoDialog.isOpen
  );
  const activeTeamId = useAppSelector(
    (state) => state.teams.globalActiveTeamId
  );
  const notificationManager = useContext(NotificationContext);

  useEffect(() => {
    setLoading(true);
    if (isOpen) {
      Secret(activeTeamId)
        .then((res: MeInfo) => {
          setSecretKey(res.user_id);
        })
        .catch(() => {
          notificationManager.createNotification(
            "error",
            "Ошибка пулечения личной информации",
            ""
          );
        });
      setLoading(false);
      console.log(activeTeamId);
    }
  }, [isOpen]);

  return (
    <DialogBox
      title={"сокретный ключ команды"}
      bottomButtons={[
        {
          text: "Ok",
          onButtonClick: () => {
            dispatch(setPersonalInfoDialog(false));
          },
        },
      ]}
      onCancelClick={async () => {
        dispatch(setPersonalInfoDialog(false));
      }}
      isOpen={isOpen}
    >
      <BlueDashedTextBox isLoading={loading}>
        <div>Секретный ключ: {secretKey}</div>
      </BlueDashedTextBox>
    </DialogBox>
  );
};

export default SecretDialog;
