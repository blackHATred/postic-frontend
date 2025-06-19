const config = {
  api: {
    baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || 'https://postic.io/api',
    socketUrl: import.meta.env.VITE_REACT_APP_SOCKET_URL || 'https://postic.io/api/comment/ws',
    useMock: process.env.NODE_ENV === 'development' || process.env.REACT_APP_USE_MOCK === 'true',
  },
};

export const getSseUrl = (teamId: number, postId = 0): string => {
  return `${config.api.baseURL}/comment/subscribe?team_id=${teamId}&post_union_id=${postId}`;
};
export default config;

export const Max_POSTS = 100;
