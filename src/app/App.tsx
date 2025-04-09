import MainPage from "../components/pages/MainPage/MainPage";
import React, { useState } from "react";
import { ConfigProvider, theme } from "antd";
import "./App.css";
import NotificationManager from "../api/notification";
import { CookiesProvider } from "react-cookie";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthenticatedSSE from "../api/SSE";
import { useAppSelector } from "../stores/hooks";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const selectedteamid = useAppSelector(
    (state) => state.teams.globalActiveTeamId
  );
  const [isAuthorized, setIsAuthorized] = useState(false);
  const url =
    "http://localhost:80/api/comment/subscribe?team_id=" + selectedteamid;
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
              <AuthenticatedSSE url={url} onMessage={() => {}}>
                <MainPage />
              </AuthenticatedSSE>
            </NotificationManager>
          </CookiesProvider>
        </QueryClientProvider>
      </ConfigProvider>
    </div>
  );
};

export default App;
