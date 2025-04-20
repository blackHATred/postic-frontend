class Routes {
  posts = (): string => '/posts' as const;
  comments = (): string => '/comment' as const;
  teams = (): string => '/teams' as const;
  uploads = (): string => '/upload' as const;
}
export const routes = new Routes();
