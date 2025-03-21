export interface Comment {
  type: string;
  username: string;
  time: string;
  platform: string;
  avatarUrl: string;
  text: string;
  replyToUrl?: string;
}

export const mockComments: Comment[] = [
  {
    type: "comment",
    username: "john_doe",
    time: "2025-03-15T10:00:00Z",
    platform: "tg",
    avatarUrl: "https://example.com/avatars/john_doe.png",
    text: "This is a sample comment.",
    replyToUrl: "ляляля",
  },
  {
    type: "reply",
    username: "jane_smith",
    time: "2025-03-15T10:05:00Z",
    platform: "tg",
    avatarUrl: "https://example.com/avatars/jane_smith.png",
    text: "This is a reply to the sample comment.",
    replyToUrl: "https://example.com/comments/1",
  },
  {
    type: "comment",
    username: "alice_jones",
    time: "2025-03-15T10:10:00Z",
    platform: "vk",
    avatarUrl: "https://example.com/avatars/alice_jones.png",
    text: "Another sample comment.",
    replyToUrl: "",
  },
  {
    type: "comment",
    username: "alice_jones",
    time: "2025-03-15T10:10:00Z",
    platform: "vk",
    avatarUrl: "https://example.com/avatars/alice_jones.png",
    text: "Another sample comment.",
    replyToUrl: "",
  },
  {
    type: "comment",
    username: "alice_jones",
    time: "2025-03-15T10:10:00Z",
    platform: "vk",
    avatarUrl: "https://example.com/avatars/alice_jones.png",
    text: "Another sample comment.",
    replyToUrl: "",
  },
  {
    type: "comment",
    username: "alice_jones",
    time: "2025-03-15T10:10:00Z",
    platform: "vk",
    avatarUrl: "https://example.com/avatars/alice_jones.png",
    text: "Another sample comment.",
    replyToUrl: "",
  },
  {
    type: "comment",
    username: "alice_jones",
    time: "2025-03-15T10:10:00Z",
    platform: "vk",
    avatarUrl: "https://example.com/avatars/alice_jones.png",
    text: "Another sample comment.",
    replyToUrl: "",
  },
  {
    type: "comment",
    username: "alice_jones",
    time: "2025-03-15T10:10:00Z",
    platform: "vk",
    avatarUrl: "https://example.com/avatars/alice_jones.png",
    text: "Another sample comment.",
    replyToUrl: "",
  },
];
