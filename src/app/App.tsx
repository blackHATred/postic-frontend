import MainPage from "../components/pages/MainPage/MainPage";
import React from "react";
import { ConfigProvider, theme } from "antd";
import "./App.css";
import NotificationManager from "../api/notification";
import { CookiesProvider } from "react-cookie";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <div id="App">
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
        }}
      >
        <QueryClientProvider client={queryClient}>
          <CookiesProvider defaultSetOptions={{ path: "/", httpOnly: false }}>
            <NotificationManager>
              <MainPage />
            </NotificationManager>
          </CookiesProvider>
        </QueryClientProvider>
      </ConfigProvider>
    </div>
  );
};

export default App;
