import React, { useContext, useEffect, useRef, useState } from "react";
import { Divider, Radio, Table, TableColumnsType, Tag, Typography } from "antd";
import styles from "./styles.module.scss";
import { Post } from "../../../models/Post/types";
import ClickableButton from "../Button/Button";
import Icon, {
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  MinusOutlined,
  PaperClipOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Team } from "../../../models/Team/types";

const { Text } = Typography;

interface TeamCardProps {
  teamcard: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ teamcard }) => {
  const { team_id, admin_id, team_name, team_members } = teamcard;
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<string | null>(null);

  const showModal = (access: string) => {
    setSelectedAccess(access);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedAccess(null);
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
      render: (access: string) => (
        <button
          onClick={() => showModal(access)}
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
    key: member.ID,
    member: member.name,
    id: member.ID,
    access: member.access,
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
            text="Удалить команду"
            type="primary"
            color="danger"
            variant="solid"
            icon={<MinusOutlined />}
          />
          <ClickableButton
            text="Добавить участника"
            icon={<PlusOutlined />}
            color="primary"
          />
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
