import { createContext, PropsWithChildren, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import config from "../constants/appConfig";

interface WebSocketContent {
  sendJsonMessage: (args: { [key: string]: any }) => void;
  lastJsonMessage: any;
  readyState: ReadyState;
}

export const WebSocketContext = createContext<WebSocketContent>({
  lastJsonMessage: null,
  readyState: ReadyState.UNINSTANTIATED,
  sendJsonMessage: () => {},
});

interface commentWebsocket {
  comment: any;
}

const WebSocketComponent: React.FC<PropsWithChildren> = (
  props: PropsWithChildren
) => {
  const { sendMessage, lastMessage, readyState } = useWebSocket<string>(
    config.api.socketUrl,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    //console.log("Connection state changed")
    if (readyState === ReadyState.OPEN) {
      console.log("WebSocket соединение установлено");
    }
    if (readyState === ReadyState.CLOSED) {
      console.log("WebSocket соединение закрыто");
    }
  }, [readyState]);

  useEffect(() => {
    console.log("Recieved messgae:" + lastMessage);
  }, [lastMessage]);

  const sendmessage = (args: { [key: string]: any }) => {
    if (readyState === ReadyState.OPEN) {
      sendMessage(JSON.stringify(args));
    } else {
      throw new Error("Connection not Established");
    }
  };

  return (
    <div>
      <WebSocketContext.Provider
        value={{
          lastJsonMessage: lastMessage,
          sendJsonMessage: sendmessage,
          readyState: readyState,
        }}
      >
        {props.children}
      </WebSocketContext.Provider>
    </div>
  );
};

export default WebSocketComponent;
