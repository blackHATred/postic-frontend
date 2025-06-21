import React, { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

// Lazily loaded components
const App = lazy(() => import('./App'));
const TeamsPage = lazy(() => import('../components/pages/TeamsPage/TeamsPage'));
const TeamDemo = lazy(() => import('../components/pages/TeamDemo/TeamDemo'));

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

export type RoutesValues = ReturnType<Routes[keyof Routes]>;

const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Navigate to='/posts' replace />,
      },
      {
        path: '/home',
        element: <div>Home Page</div>,
      },
      {
        path: '/posts',
        element: <div>Posts Page</div>,
      },
      {
        path: '/comments',
        element: <div>Comments Page</div>,
      },
      {
        path: '/teams',
        element: <TeamsPage />,
      },
      {
        path: '/teams/:id',
        element: <TeamsPage />,
      },
      {
        path: '/teams-demo',
        element: <TeamDemo />,
      },
      {
        path: '/ticket',
        element: <div>Ticket Page</div>,
      },
      {
        path: '/analytics',
        element: <div>Analytics Page</div>,
      },
      {
        path: '/profile',
        element: <div>Profile Page</div>,
      },
      {
        path: '/login',
        element: <div>Login Page</div>,
      },
      {
        path: '/register',
        element: <div>Register Page</div>,
      },
      {
        path: '/vk/callback',
        element: <div>VK Callback Page</div>,
      },
    ],
  },
];

export default appRoutes;
