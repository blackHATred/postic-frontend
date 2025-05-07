const apiKey = import.meta.env.VITE_API_BASE_URL;
const sock = import.meta.env.VITE_SOCKET_URL;
const config = {
  api: {
    baseURL: apiKey || 'http://localhost:80/api',
    socketUrl: sock || 'http://localhost:80/api/comment/ws',
  },
};

export const getSseUrl = (teamId: number, postId = 0): string => {
  return `${config.api.baseURL}/comment/subscribe?team_id=${teamId}&post_union_id=${postId}`;
};
export default config;
