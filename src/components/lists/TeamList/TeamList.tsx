import React from 'react';
import { Spin } from 'antd';
import styles from './styles.module.scss';
import TeamCard from '../../cards/TeamCard/TeamCard';
import { useAppSelector } from '../../../stores/hooks';
import { getTeamsFromStore } from '../../../stores/teamSlice';
import { Team } from '../../../models/Team/types';

interface TeamListProps {
  isLoading?: boolean;
}

const TeamList: React.FC<TeamListProps> = ({ isLoading }) => {
  const teams = useAppSelector(getTeamsFromStore);
  const Scroll = React.lazy(() => import('../../ui/stickyScroll/batchLoadScroll'));

  return (
    <div className={styles.teamList} title='Команды'>
      {isLoading && (
        <div className={styles.spinnerContainer}>
          <Spin />
        </div>
      )}
      <React.Suspense fallback={<Spin className={styles['spin']} />}>
        <Scroll
          getObjectFromData={function (team: Team, index: number): React.ReactNode {
            return <TeamCard teamcard={team} key={index} />;
          }}
          data={teams}
          setData={() => {}}
          getNewData={() => {
            return new Promise(() => {
              return [];
            });
          }}
          initialScroll={0}
          frame_size={0}
          empty_text={'Нет комманд'}
        />
      </React.Suspense>
    </div>
  );
};

export default TeamList;
