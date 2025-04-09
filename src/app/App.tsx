import MainPage from "../components/pages/MainPage/MainPage";
import React from "react";
import { ConfigProvider, theme } from "antd";
import WebSocketComponent from "../api/WebSocket";
import "./App.css";
import NotificationManager from "../api/notification";
import { Provider } from "react-redux";
import { store } from "../stores/store";
import { CookiesProvider } from "react-cookie";
import {
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

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
              <WebSocketComponent>
                <MainPage />
              </WebSocketComponent>
            </NotificationManager>
          </CookiesProvider>
        </QueryClientProvider>
      </ConfigProvider>
    </div>
  );
};

export default App;
