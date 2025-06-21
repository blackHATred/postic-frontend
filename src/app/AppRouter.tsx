import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CommentsPage from '../components/pages/CommentsPage/CommentsPage';
import PostsPage from '../components/pages/PostsPage/PostsPage';
import { routes } from './App.routes';
import PageLayout from '../components/pages/Layout/Layout';
import PostDetailsPage from '../components/pages/PostDetailsPage/PostDetailsPage';
import TicketPage from '../components/pages/TicketPage/TicketPage';
import AnalyticsPage from '../components/pages/AnalyticstPage/AnalyticsPage';
import LoginPage from '../components/pages/LoginPage/LoginPage';
import RegisterPage from '../components/pages/RegisterPage/RegisterPage';
import VkAuthCallback from '../components/pages/VkAuthCallback/VkAuthCallback';
import HomePage from '../components/pages/HomePage/HomePage';
import HomePageLayout from '../components/pages/Layout/HomePageLayout';
import { useAppSelector } from '../stores/hooks';
import ProfilePage from '../components/pages/ProfilePage/ProfilePage';
import TeamDemo from '../components/pages/TeamDemo/TeamDemo';
import TeamsPage from '../components/pages/TeamsPage/TeamsPage';

export const AppRouter = () => {
  const isAuthorized = useAppSelector((state) => state.teams.authorize_status);

  return (
    <Routes>
      {/* Страницы авторизации */}
      <Route path={routes.login()} element={<LoginPage />} />
      <Route path={routes.register()} element={<RegisterPage />} />
      <Route path={routes.vkCallback()} element={<VkAuthCallback />} />
      <Route path={routes.home()} element={<HomePageLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* Защищенные маршруты Layout */}
      <Route path={routes.root()} element={<PageLayout />}>
        <Route index element={<Navigate to={routes.home()} replace />} />
        <Route path={routes.posts()} element={<PostsPage />} />
        <Route path={routes.post(':id')} element={<PostDetailsPage />} />
        <Route path={routes.comments()} element={<CommentsPage />} />
        <Route path={routes.ticket()} element={<TicketPage />} />
        <Route path={routes.analytics()} element={<AnalyticsPage />} />
        <Route path={routes.teams()} element={<TeamsPage />} />
        <Route path='/teams-demo' element={<TeamDemo />} />
        <Route path={routes.profile()} element={<ProfilePage />} />
      </Route>
    </Routes>
  );
};
