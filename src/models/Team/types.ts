export interface Team {
  team_id: number;
  admin_id: number;
  team_name: string;
  team_members: TeamMember[];
}

export interface TeamMember {
  name: string;
  ID: number;
  access: string;
}

export const mockTeams: Team[] = [
  {
    team_id: 1,
    admin_id: 101,
    team_name: "Development Team",
    team_members: [
      { name: "Alice Johnson", ID: 1, access: "admin" },
      { name: "Bob Smith", ID: 2, access: "editor" },
      { name: "Charlie Brown", ID: 3, access: "viewer" },
      { name: "Alice Johnson", ID: 4, access: "editor" },
      { name: "Bob Smith", ID: 5, access: "editor" },
      { name: "Charlie Brown", ID: 6, access: "viewer" },
      { name: "Alice Johnson", ID: 7, access: "editor" },
      { name: "Bob Smith", ID: 8, access: "editor" },
      { name: "Charlie Brown", ID: 9, access: "viewer" },
      { name: "Alice Johnson", ID: 10, access: "editor" },
      { name: "Bob Smith", ID: 11, access: "editor" },
      { name: "Charlie Brown", ID: 12, access: "viewer" },
      { name: "Alice Johnson", ID: 13, access: "editor" },
      { name: "Bob Smith", ID: 14, access: "editor" },
      { name: "Charlie Brown", ID: 15, access: "viewer" },
      { name: "Alice Johnson", ID: 16, access: "editor" },
      { name: "Bob Smith", ID: 17, access: "editor" },
      { name: "Charlie Brown", ID: 18, access: "viewer" },
    ],
  },
  {
    team_id: 2,
    admin_id: 102,
    team_name: "Marketing Team",
    team_members: [
      { name: "Diana Prince", ID: 301, access: "admin" },
      { name: "Eve Adams", ID: 302, access: "editor" },
      { name: "Frank Castle", ID: 303, access: "viewer" },
    ],
  },
  {
    team_id: 3,
    admin_id: 103,
    team_name: "Design Team",
    team_members: [
      { name: "Grace Hopper", ID: 401, access: "admin" },
      { name: "Hank Pym", ID: 402, access: "editor" },
      { name: "Ivy League", ID: 403, access: "viewer" },
    ],
  },
];
