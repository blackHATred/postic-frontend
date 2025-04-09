import React, { useEffect } from "react";
import DialogBox from "../../ui/dialogBox/DialogBox";
import BlueDashedTextBox from "../../ui/BlueDashedTextBox/BlueDashedTextBox";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { useCookies } from "react-cookie";
import {
  setLoginDialog,
  setRegiserDialog,
  setWelcomeDialog,
} from "../../../stores/basePageDialogsSlice";
import { ClickableButtonProps } from "../../ui/Button/Button";

const WelcomeDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(
    (state) => state.basePageDialogs.welcomeDialog.isOpen
  );
  const [cookies, _, removeCookie] = useCookies();

  const getButtons = (): ClickableButtonProps[] => {
    if (cookies["session"]) {
      //NOTE: Есть информация об аккаунте
      //TODO: Добавить проверку на бекэнд правильности логина
      return [
        {
          text: "Выход",
          onButtonClick: () => {
            removeCookie("session");
          },
        },
      ];
    }
    return [
      {
        text: "Вход",
        onButtonClick: () => {
          dispatch(setWelcomeDialog(false));
          dispatch(setLoginDialog(true));
        },
      },
      {
        text: "Регистраиция",
        onButtonClick: () => {
          dispatch(setWelcomeDialog(false));
          dispatch(setRegiserDialog(true));
        },
      },
    ];
  };

  return (
    <DialogBox
      title={"Добро Пожаловать!"}
      bottomButtons={getButtons()}
      onCancelClick={async () => {
        dispatch(setWelcomeDialog(false));
      }}
      isOpen={isOpen}
    >
      <BlueDashedTextBox isLoading={false}>
        {!cookies["session"] && <div>Вход - для пользователей с ID</div>}
        {!cookies["session"] && (
          <div>Регистрация - для новых пользователей</div>
        )}
        {cookies["session"] && <div>User ID : {cookies["session"]}</div>}
      </BlueDashedTextBox>
    </DialogBox>
  );
};

export default WelcomeDialog;
