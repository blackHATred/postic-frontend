import { useEffect, useState } from "react";
import CommentList from "../components/widgets/CommentList/CommentList";
import CommentsPage from "../components/pages/CommentsPage/CommentsPage";

interface Comment {
  type: string;
  username: string;
  time: string;
  platform: string;
  avatarUrl: string;
  text: string;
  replyToUrl?: string;
}

const WebSocketComponent: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  let socket: WebSocket;

  useEffect(() => {
    // Создаем WebSocket-соединение
    socket = new WebSocket("ws://localhost:8080/api/comments/ws");

    // Обработчик открытия соединения
    socket.onopen = () => {
      console.log("WebSocket соединение установлено");
    };

    // Обработчик входящих сообщений
    socket.onmessage = (event) => {
      try {
        console.log(event.data);
        const newComment = JSON.parse(event.data); // Парсим JSON

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
    };

    // Обработчик закрытия соединения
    socket.onclose = () => {
      console.log("WebSocket соединение закрыто");
    };

    // Обработчик ошибок
    socket.onerror = (error) => {
      console.error("WebSocket ошибка:", error);
    };

    // Очистка при размонтировании компонента
    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = (v1: string, v2: string, v3: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const newMessage = {
        tg_chat_id: parseInt(v1),
        vk_group_id: parseInt(v2),
        vk_key: v3,
      };

      socket.send(JSON.stringify(newMessage));
      return "";
    } else {
      return "bad";
    }
  };

  return (
    <div>
      <CommentsPage comments={comments} sendMessage={sendMessage} />
    </div>
  );
};

export default WebSocketComponent;
