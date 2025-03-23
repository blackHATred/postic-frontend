import { PropsWithChildren, useEffect, useRef, useState } from "react";
import BasePage from "../components/pages/CommentsPage/BasePage";
import { mockComments } from "../models/Comment/types";
import useWebSocket, { ReadyState } from "react-use-websocket"

interface Comment {
  type: string;
  username: string;
  time: string;
  platform: string;
  avatarUrl: string;
  text: string;
  replyToUrl?: string;
}

const WebSocketComponent: React.FC<PropsWithChildren> = (props: PropsWithChildren) => {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const WS_URL = "ws://127.0.0.1:8090/api/comments/ws"
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<string>(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    },
  )

  useEffect(() => {
    console.log("Connection state changed")
    if (readyState === ReadyState.OPEN) {
      console.log("WebSocket соединение установлено");
    }
    if (readyState === ReadyState.CLOSED) {
      console.log("WebSocket соединение закрыто");
    }
    
  }, [readyState])

  useEffect(() => {
    if (lastJsonMessage != null){
      try {
        const newComment = JSON.parse(lastJsonMessage); // Парсим JSON
  
        console.log("Новый комментарий:", newComment);
  
        // Проверяем, что newComment соответствует интерфейсу Comment
        if (
          newComment &&
          newComment.type &&
          newComment.username &&
          newComment.text
        ) {
          setComments((prev) => [...prev, newComment]);
        } else {
          console.error("Получен некорректный комментарий:", newComment);
        }
      } catch (error) {
        console.error("Ошибка при парсинге JSON:", error);
      }
    }
    
  }, [lastJsonMessage])

  const sendMessage = (args: {[key: string] : string}) => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage(JSON.stringify(args));
    } else {
      throw new Error("Connection not Established");
    }
  };

  return (
    <div>
      <BasePage comments={comments} sendMessage={sendMessage} />
    </div>
  );
};

export default WebSocketComponent;
