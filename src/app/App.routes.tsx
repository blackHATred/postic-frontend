class Routes {
  root = () => '/' as const;
  home = () => '/home' as const;
  posts = () => '/posts' as const;
  comments = () => '/comments' as const;
  teams = () => '/teams' as const;
  ticket = () => '/ticket' as const;
  analytics = () => '/analytics' as const;
  profile = () => '/profile' as const;

  post = (id: string | number) => `/posts/${id}` as const;
  login = () => '/login' as const;
  register = () => '/register' as const;
  vkCallback = () => '/vk/callback' as const;
}

export const routes = new Routes();
