import React, { useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import './App.scss';
import '../styles/darkTheme.scss';
import NotificationManager from '../api/notification';
import { CookiesProvider } from 'react-cookie';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'dayjs/locale/ru';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import { AuthProvider } from './providers/AuthProvider';
import { AppRouter } from './AppRouter';
import { ModalsProvider } from './providers/ModalsProvider';
import { useAppSelector } from '../stores/hooks';

const queryClient = new QueryClient();

dayjs.locale('ru');
dayjs.extend(utc);

const App: React.FC = () => {
  const isDarkMode = useAppSelector((state) => state.settings.darkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  return (
    <div id='App'>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
        }}
      >
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
