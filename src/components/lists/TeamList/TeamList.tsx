import React from 'react';
import { Spin } from 'antd';
import styles from './styles.module.scss';
import TeamCard from '../../cards/TeamCard/TeamCard';
import { useAppSelector } from '../../../stores/hooks';
import { getTeamsFromStore } from '../../../stores/teamSlice';

interface TeamListProps {
  isLoading?: boolean;
}

const Scroll = React.lazy(() => import('../../ui/stickyScroll/batchLoadScroll'));

const TeamList: React.FC<TeamListProps> = ({ isLoading }) => {
  const teams = useAppSelector(getTeamsFromStore);

  return (
    <div className={styles.teamList} title='Команды'>
      {isLoading && (
        <div className={styles.spinnerContainer}>
          <Spin />
        </div>
      )}
      <div className={styles['team-container']}>
        {teams.map((t) => (
          <TeamCard teamcard={t} />
        ))}
      </div>
    </div>
  );
};

export default TeamList;
