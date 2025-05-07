const config = {
  api: {
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:80/api',
    socketUrl: process.env.REACT_APP_SOCKET_URL || 'http://localhost:80/api/comment/ws',
  },
};

export const getSseUrl = (teamId: number, postId = 0): string => {
  return `${config.api.baseURL}/comment/subscribe?team_id=${teamId}&post_union_id=${postId}`;
};
export default config;
