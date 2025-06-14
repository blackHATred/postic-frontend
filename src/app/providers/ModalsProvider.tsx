import React, { ReactNode } from 'react';
import DialogBoxSummary from '../../components/modals/SummaryDialog/SummaryDialog';
import PostStatusDialog from '../../components/modals/PostStatusDialog/PostStatusDialog';
import CreatePostDialog from '../../components/modals/CreatePostDialog/CreatePostDialog';
import MeDialog from '../../components/modals/auth/keyDialog';
import TeamAddMemberDialog from '../../components/modals/TeamDialog/TeamAddMemberDialog';
import TeamCreateDialog from '../../components/modals/TeamDialog/TeamCreateDialog';
import TeamEditMemberDialog from '../../components/modals/TeamDialog/TeamEditMemberDialog';
import TeamRenameDialog from '../../components/modals/TeamDialog/TeamRenameDialog';
import AnswerDialog from '../../components/modals/AnswerDialog/AnswerDialog';
import PlatformsDialog from '../../components/modals/PlatformsDialog/PlatformsDialog';
import UserRegisterDialog from '../../components/modals/auth/UserRegisterDialog';
import UserLoginDialog from '../../components/modals/auth/UserLoginDialog';
import HelpDialog from '../../components/modals/HelpDialog/HelpDialog';
import EditPostDialog from '../../components/modals/EditPostDialog/EditPostDialog';
import AIGeneratePostDialog from '../../components/modals/AIGeneratePostDialog/AIGeneratePostDialog';

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
      <MeDialog />
      <TeamAddMemberDialog />
      <TeamCreateDialog />
      <TeamEditMemberDialog />
      <TeamRenameDialog />
      <AnswerDialog />
      <PlatformsDialog />
      <UserRegisterDialog />
      <UserLoginDialog />
      <HelpDialog />
      <EditPostDialog />
      <AIGeneratePostDialog />
    </>
  );
};
