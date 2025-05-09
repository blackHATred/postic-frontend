import React, { ReactNode } from 'react';
import DialogBoxSummary from '../../components/modals/SummaryDialog/SummaryDialog';
import PostStatusDialog from '../../components/modals/PostStatusDialog/PostStatusDialog';
import CreatePostDialog from '../../components/modals/CreatePostDialog/CreatePostDialog';
import LoginDialog from '../../components/modals/auth/LoginDialog';
import RegisterDialog from '../../components/modals/auth/RegisterDialog';
import MeDialog from '../../components/modals/auth/keyDialog';
import WelcomeDialog from '../../components/modals/auth/WelcomeDialog';
import TeamAddMemberDialog from '../../components/modals/TeamDialog/TeamAddMemberDialog';
import TeamCreateDialog from '../../components/modals/TeamDialog/TeamCreateDialog';
import TeamEditMemberDialog from '../../components/modals/TeamDialog/TeamEditMemberDialog';
import TeamRenameDialog from '../../components/modals/TeamDialog/TeamRenameDialog';
import AnswerDialog from '../../components/modals/AnswerDialog/AnswerDialog';

interface ModalsProviderProps {
  children: ReactNode;
}

export const ModalsProvider = ({ children }: ModalsProviderProps) => {
  return (
    <>
      {children}
      <DialogBoxSummary />
      <PostStatusDialog />
      <CreatePostDialog />
      <LoginDialog />
      <RegisterDialog />
      <MeDialog />
      <WelcomeDialog />
      <TeamAddMemberDialog />
      <TeamCreateDialog />
      <TeamEditMemberDialog />
      <TeamRenameDialog />
      <AnswerDialog />
    </>
  );
};
