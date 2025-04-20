import React from 'react';
import { ConfigProvider, theme } from 'antd';
import './App.css';
import NotificationManager from '../api/notification';
import { CookiesProvider } from 'react-cookie';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './providers/AuthProvider';
import { AppRouter } from './AppRouter';
import { ModalsProvider } from './providers/ModalsProvider';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <div id='App'>
      <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
        <QueryClientProvider client={queryClient}>
          <CookiesProvider defaultSetOptions={{ path: '/', httpOnly: false }}>
            <NotificationManager>
              <AuthProvider>
                <ModalsProvider>
                  <AppRouter />
                </ModalsProvider>
              </AuthProvider>
            </NotificationManager>
          </CookiesProvider>
        </QueryClientProvider>
      </ConfigProvider>
    </div>
  );
};

export default App;
