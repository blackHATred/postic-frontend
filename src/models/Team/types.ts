export interface Team {
  id: number;
  name: string;
  users: TeamUserRole[];
  created_at: string;
}

export interface TeamCreateRequest {
  team_name: string;
}

export interface TeamUserRole {
  user_id: number;
  team_id: number;
  roles: string[];
}

export interface RenameTeamRequest {
  team_id: number;
  new_name: string;
}

export interface TeamCreateResponse {
  team_id: number;
}

export interface KickUserRequest {
  kicked_user_id: number;
  team_id: number;
}

export interface MeSecretInfo {
  secret: string;
}

export const mockTeams: Team[] = [
  {
    id: 1,
    name: 'Development Team',
    users: [
      { user_id: 101, team_id: 1, roles: ['admin', 'edit'] },
      { user_id: 102, team_id: 1, roles: ['view'] },
      { user_id: 103, team_id: 1, roles: ['edit', 'view'] },
    ],
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Marketing Team',
    users: [
      { user_id: 201, team_id: 2, roles: ['admin'] },
      { user_id: 202, team_id: 2, roles: ['edit', 'view'] },
      { user_id: 203, team_id: 2, roles: ['view'] },
    ],
    created_at: '2023-01-02T00:00:00Z',
  },
  {
    id: 3,
    name: 'Design Team',
    users: [
      { user_id: 301, team_id: 3, roles: ['admin', 'edit'] },
      { user_id: 302, team_id: 3, roles: ['edit'] },
      { user_id: 303, team_id: 3, roles: ['view'] },
    ],
    created_at: '2023-01-03T00:00:00Z',
  },
];
