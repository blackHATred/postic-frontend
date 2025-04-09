import React, { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../../../api/notification";
import DialogBox from "../../ui/dialogBox/DialogBox";
import BlueDashedTextBox from "../../ui/BlueDashedTextBox/BlueDashedTextBox";
import { Me } from "../../../api/api";
import { MeInfo } from "../../../models/User/types";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { setPersonalInfoDialog } from "../../../stores/basePageDialogsSlice";

const MeDialog: React.FC = (props) => {
  const dispatch = useAppDispatch();
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(true);
  const isOpen = useAppSelector(
    (state) => state.basePageDialogs.personalInfoDialog.isOpen
  );
  const notificationManager = useContext(NotificationContext);

  useEffect(() => {
    setLoading(true);
    if (isOpen) {
      Me()
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
    }
  }, [isOpen]);

  return (
    <DialogBox
      title={"Личная информация"}
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
        <div>Ваш секретный ключ: {secretKey}</div>
      </BlueDashedTextBox>
    </DialogBox>
  );
};

export default MeDialog;
