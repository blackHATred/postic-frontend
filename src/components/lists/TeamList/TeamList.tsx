import React from 'react';
import { List, Spin } from 'antd';
import styles from './styles.module.scss';
import TeamCard from '../../cards/TeamCard/TeamCard';
import { useAppSelector } from '../../../stores/hooks';
import { getTeamsFromStore } from '../../../stores/teamSlice';

interface TeamListProps {
  isLoading?: boolean;
  hasMore?: boolean;
}

const TeamList: React.FC<TeamListProps> = ({ isLoading, hasMore }) => {
  const teams = useAppSelector(getTeamsFromStore);
  return (
    <div className={styles.teamList} title='Команды'>
      {isLoading && (
        <div className={styles.spinnerContainer}>
          <Spin />
        </div>
      )}

      <div>
        <List
          dataSource={teams}
          renderItem={(team) => (
            <List.Item>
              <TeamCard teamcard={team} />
            </List.Item>
          )}
        />
      </div>

      {hasMore && (
        <div className={styles.spinnerContainer}>
          <Spin />
        </div>
      )}
    </div>
  );
};

export default TeamList;
