import React, { RefObject } from "react";
import { List, Spin } from "antd";
import styles from "./styles.module.scss";
import { Post } from "../../../models/Post/types";
import PostComponent from "../../ui/Post/Post";
import TeamCard from "../../ui/TeamCard/TeamCard";
import { Team } from "../../../models/Team/types";

interface TeamListProps {
  team: Team[];
  isLoading?: boolean;
  hasMore?: boolean;
}

const TeamList: React.FC<TeamListProps> = ({
  team: teams,
  isLoading,
  hasMore,
}) => {
  return (
    <div className={styles.teamList} title="Команды">
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
