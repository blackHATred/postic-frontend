import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CommentsPage from '../components/pages/CommentsPage/CommentsPage';
import PostsPage from '../components/pages/PostsPage/PostsPage';
import TeamsPage from '../components/pages/TeamsPage/TeamsPage';
import { routes } from './App.routes';
import PageLayout from '../components/pages/Layout/Layout';
import PostDetailsPage from '../components/pages/PostDetailsPage/PostDetailsPage';
import TicketPage from '../components/pages/TicketPage/TicketPage';
import AnalyticsPage from '../components/pages/AnalyticstPage/AnalyticsPage';
import LoginPage from '../components/pages/LoginPage/LoginPage';
import RegisterPage from '../components/pages/RegisterPage/RegisterPage';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Защищенные маршруты с Layout */}
      <Route path={routes.root()} element={<PageLayout />}>
        <Route index element={<Navigate to={routes.teams()} replace />} />
        <Route path={routes.posts()} element={<PostsPage />} />
        <Route path={routes.post(':id')} element={<PostDetailsPage />} />
        <Route path={routes.comments()} element={<CommentsPage />} />
        <Route path={routes.ticket()} element={<TicketPage />} />
        <Route path={routes.analytics()} element={<AnalyticsPage />} />
        <Route path={routes.teams()} element={<TeamsPage />} />
        <Route path={routes.login()} element={<LoginPage />} />
        <Route path={routes.register()} element={<RegisterPage />} />
      </Route>
    </Routes>
  );
};
