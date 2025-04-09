import React, { useEffect, useState } from "react";
import { Divider, Table, TableColumnsType, Typography } from "antd";
import styles from "./styles.module.scss";
import ClickableButton from "../Button/Button";
import { EditOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Team } from "../../../models/Team/types";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  setAddMemberDialog,
  setCurrentUserId,
  setEditMemberDialog,
  setOldTeamName,
  setRenameTeamDialog,
  setSelectedMemberId,
  setSelectedTeamId,
} from "../../../stores/teamSlice";
import { useCookies } from "react-cookie";
import { Me } from "../../../api/api";

const { Text } = Typography;

interface TeamCardProps {
  teamcard: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ teamcard }) => {
  const dispatch = useAppDispatch();
  const { id, name: team_name, users: team_members } = teamcard;
  const selectedMemberId = useAppSelector(
    (state) => state.teams.selectedMemberId
  );
  const selectedTeamId = useAppSelector((state) => state.teams.selectedTeamId);
  const oldTeamName = useAppSelector((state) => state.teams.oldTeamName);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [cookies, setCookie] = useCookies(["session"]);

  useEffect(() => {
    const selectedTeamId = teamcard.id;
    const oldTeamName = teamcard.name;
    const currentUserId = parseInt(cookies.session || "0");
    const userMember = team_members.find(
      (member) => String(member.user_id) === String(currentUserId)
    );
    const isAdmin = userMember?.roles.includes("admin") || false;

    setIsUserAdmin(isAdmin);
  }, [team_members, cookies.session]);

  const [currentUserId, setCurrentUserIdState] = useState<number | null>(null);

  useEffect(() => {
    Me()
      .then((userData) => {
        const userId = Number(userData.user_id);
        setCurrentUserIdState(userId); // Сохраняем ID пользователя
        dispatch(setCurrentUserId(userId)); // Обновляем в store
      })
      .catch((error) => {
        console.error("Ошибка при получении данных пользователя:", error);
      });
  }, []);

  // Проверяем, является ли текущий пользователь администратором команды
  useEffect(() => {
    if (currentUserId !== null) {
      const userMember = team_members.find(
        (member) => member.user_id === currentUserId
      );
      const isAdmin = userMember?.roles.includes("admin") || false;

      setIsUserAdmin(isAdmin);
      console.log("Текущий пользователь (ID):", currentUserId);
      console.log("Является администратором:", isAdmin);
    }
  }, [currentUserId, team_members]);

  const handleAddMember = () => {
    dispatch(setSelectedTeamId?.(id));
    dispatch(setAddMemberDialog(true));
  };

  const handleKick = () => {
    setCookie("session", "201", { path: "/" });
    console.log("Cookie 'session' set to 201");
  };

  const handleRename = () => {
    dispatch(setOldTeamName(oldTeamName));
    dispatch(setSelectedTeamId(selectedTeamId));
    dispatch(setRenameTeamDialog(true));
  };

  const onEditMemberClick = async (userId: number) => {
    // При нажатии кнопки смены доступа
    dispatch(setEditMemberDialog(true));
    dispatch(setSelectedMemberId(userId));
  };

  interface DataType {
    key: React.Key;
    member: string;
    id: number;
    access: string;
  }

  const columns: TableColumnsType<DataType> = [
    {
      title: "Участник",
      dataIndex: "member",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Права",
      dataIndex: "access",
      render: (access: string, row: DataType) => (
        <button
          onClick={() => onEditMemberClick(row.id)}
          style={{
            background: "none",
            border: "none",
            color: "#1890ff",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {access}
        </button>
      ),
    },
  ];

  const tabledata: DataType[] = team_members.map((member) => ({
    key: member.user_id,
    member: member.user_id.toString(),
    id: member.user_id,
    access: member.roles.join(", "),
  }));

  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    setPagination(newPagination);
  };

  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedData = tabledata.slice(startIndex, endIndex);

  return (
    <div className={styles["post"]}>
      {/* хедер*/}
      <div className={styles["post-header"]}>
        <div className={styles["post-header-info"]}>
          <div className={styles["post-header-info-text"]}>
            <Text strong>Команда: </Text>
            <Text className={styles["teamName"]} strong>
              {team_name}
            </Text>
          </div>
        </div>
        <div className={styles["post-header-buttons"]}>
          <ClickableButton
            type="text"
            variant="solid"
            icon={<EditOutlined />}
            onButtonClick={handleRename}
          />
          <ClickableButton
            text="Покинуть команду"
            type="primary"
            color="danger"
            variant="solid"
            icon={<MinusOutlined />}
            onButtonClick={handleKick}
          />
          {isUserAdmin && (
            <ClickableButton
              text="Добавить участника"
              icon={<PlusOutlined />}
              color="primary"
              onButtonClick={handleAddMember}
            />
          )}
        </div>
      </div>
      <Divider className={styles.customDivider} />
      <div className={styles["post-content"]}>
        <div className={styles["post-content-text"]}>
          <div>
            <Table<DataType>
              rowSelection={{
                type: "checkbox",
              }}
              columns={columns}
              dataSource={paginatedData}
              pagination={{
                ...pagination,
                total: tabledata.length,
              }}
              onChange={handleTableChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
