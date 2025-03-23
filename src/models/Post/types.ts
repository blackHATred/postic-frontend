export interface Post {
  id: string;
  action_post_vk_id: string;
  action_post_tg_id: string;
  time: string;
  team_id: string;
  user_id: string;
  text: string;
  attachments: string[];
  pub_date: string;
}

export const mockPosts: Post[] = [
  {
    id: "11",
    action_post_vk_id: "12345",
    action_post_tg_id: "67890",
    time: "2025-03-15T10:00:00Z",
    team_id: "1",
    user_id: "1 Moderator",
    text: "Hello, this is a sample post.Hello, this is a sample postHello, this is a sample postHello, this is a sample post",
    attachments: [],
    pub_date: "2025-03-15T10:00:00Z",
  },
  {
    id: "22",
    action_post_vk_id: "54321",
    action_post_tg_id: "98765",
    time: "2025-03-15T10:30:00Z",
    team_id: "2",
    user_id: "2 Moderator",
    text: "Good morning, team! Have a great day!",
    attachments: ["image1.jpg", "image2.jpg"],
    pub_date: "2025-03-15T10:30:00Z",
  },
];
