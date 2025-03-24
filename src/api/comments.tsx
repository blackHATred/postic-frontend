import {
  createContext,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import BasePage from "../components/pages/CommentsPage/BasePage";
import { mockComments } from "../models/Comment/types";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { Comment } from "../models/Comment/types";

interface CommentContent {
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

export const CommentListContext = createContext<CommentContent>({
  comments: [],
  setComments: () => {},
});

interface WebSocketContent {
  sendJsonMessage: (args: { [key: string]: any }) => void;
  lastJsonMessage: string;
  readyState: ReadyState;
}

export const WebSocketContext = createContext<WebSocketContent>({
  lastJsonMessage: "",
  readyState: ReadyState.UNINSTANTIATED,
  sendJsonMessage: () => {},
});

const WebSocketComponent: React.FC<PropsWithChildren> = (
  props: PropsWithChildren
) => {
  const WS_URL = "ws://127.0.0.1:8090/api/comments/ws";
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<string>(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    console.log("Connection state changed");
    if (readyState === ReadyState.OPEN) {
      console.log("WebSocket соединение установлено");
    }
    if (readyState === ReadyState.CLOSED) {
      console.log("WebSocket соединение закрыто");
    }
  }, [readyState]);

  const sendMessage = (args: { [key: string]: string }) => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage(JSON.stringify(args));
    } else {
      throw new Error("Connection not Established");
    }
  };

  return (
    <div>
      <WebSocketContext.Provider
        value={{
          lastJsonMessage: lastJsonMessage,
          sendJsonMessage: sendMessage,
          readyState: readyState,
        }}
      >
        {props.children}
      </WebSocketContext.Provider>
    </div>
  );
};

export default WebSocketComponent;
