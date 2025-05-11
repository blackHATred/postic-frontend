import React, { useEffect, useRef, useState } from 'react';
import { Divider } from 'antd';
import styles from './styles.module.scss';
import { Team } from '../../../models/Team/types';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  setAddMemberDialog,
  setEditMemberDialog,
  setGlobalActiveTeamId,
  setPlatformsDialog,
  setRenameTeamDialog,
  setSelectedMemberId,
  setSelectedPlatform,
  setSelectedTeamId,
  setTeams,
} from '../../../stores/teamSlice';
import { Kick, MyTeams, Platforms } from '../../../api/teamApi';
import { setPersonalInfoDialog } from '../../../stores/basePageDialogsSlice';
import { setComments } from '../../../stores/commentSlice';
import TeamMenu from './TeamMenu';
import TeamTable, { DataType } from './TeamTable';
import { PlatformsRequest } from '../../../models/Team/types';

interface TeamCardProps {
  teamcard: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ teamcard }) => {
  const dispatch = useAppDispatch();
  const { id, name: team_name, users: team_members } = teamcard;
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const currentUserId = useAppSelector((state) => state.teams.currentUserId);
  const [linkedPlatforms, setLinkedPlatforms] = useState<PlatformsRequest | null>(null);
  const refer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUserId !== null) {
      const userMember = team_members.find((member) => member.user_id === currentUserId);
      const isAdmin = userMember?.roles.includes('admin') || false;
      setIsUserAdmin(isAdmin);
    }
  }, [currentUserId, team_members]);

  const handleAddMember = () => {
    dispatch(setSelectedTeamId?.(id));
    dispatch(setAddMemberDialog(true));
  };

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const platforms = await Platforms(id);
        setLinkedPlatforms(platforms);
      } catch (error) {
        console.error('Ошибка при получении привязанных платформ:', error);
      }
    };

    fetchPlatforms();
  }, [id]);

  const handleKick = async () => {
    if (currentUserId !== null) {
      try {
        await Kick({ kicked_user_id: currentUserId, team_id: id });
        const response = await MyTeams();
        if (response) {
          if (refer.current) refer.current.className += ' animation';
          setTimeout(() => updateTeamList(), 350);
          dispatch(setComments([]));
        }
      } catch (error) {
        console.error('Ошибка при выходе из команды:', error);
      }
    } else {
      console.error('ID пользователя отсутствует. Невозможно выйти из команды.');
    }
  };

  const handleKickMember = (userId: number) => {
    if (userId !== null) {
      Kick({ kicked_user_id: userId, team_id: id }).then(() => {
        updateTeamList();
      });
    } else {
      console.error('Current user ID is null. Cannot kick user.');
    }
  };

  const updateTeamList = () => {
    MyTeams()
      .then((res: { teams: Team[] }) => {
        if (res.teams) {
          dispatch(setTeams(res.teams));
          dispatch(setGlobalActiveTeamId(0));
        }
      })
      .catch(() => {});
  };

  const handleRename = () => {
    dispatch(setRenameTeamDialog(true));
    dispatch(setSelectedTeamId?.(id));
  };

  const handleEditMember = (userId: number) => {
    dispatch(setEditMemberDialog(true));
    dispatch(setSelectedTeamId?.(id));
    dispatch(setSelectedMemberId(userId));
  };

  const handleKeyClick = () => {
    dispatch(setSelectedTeamId?.(id));
    dispatch(setPersonalInfoDialog(true));
  };

  const handlePlatformClick = (platform: string) => {
    dispatch(setSelectedTeamId?.(id));
    dispatch(setSelectedPlatform(platform));
    dispatch(setPlatformsDialog(true));
  };

  const tableData: DataType[] = team_members.map((member) => ({
    key: member.user_id,
    member: member.user_id.toString(),
    id: member.user_id,
    access: member.roles,
  }));

  return (
    <div className={styles['post']} ref={refer}>
      <TeamMenu
        teamName={team_name}
        teamID={id}
        isUserAdmin={isUserAdmin}
        onRename={handleRename}
        onKick={handleKick}
        onAddMember={handleAddMember}
        onKeyClick={handleKeyClick}
        onPlatformClick={handlePlatformClick}
        linkedPlatforms={linkedPlatforms}
      />
      <Divider className={styles.customDivider} />
      <div className={styles['post-content']}>
        <div className={styles['post-content-text']}>
          <div>
            <TeamTable
              members={tableData}
              isUserAdmin={isUserAdmin}
              currentUserId={currentUserId}
              onEditMember={handleEditMember}
              onKickMember={handleKickMember}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
