import { useEffect, useState } from "react";
import CommentList from "../components/widgets/CommentList/CommentList";

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

  useEffect(() => {
    // Создаем WebSocket-соединение
    const socket = new WebSocket("ws://localhost:8080");

    // Обработчик открытия соединения
    socket.onopen = () => {
      console.log("WebSocket соединение установлено");
    };

    // Обработчик входящих сообщений
    socket.onmessage = (event) => {
      try {
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

  return (
    <div>
      <h1>WebSocket Тест</h1>
      <h2>Комментарии:</h2>
      <CommentList comments={comments} />
    </div>
  );
};

export default WebSocketComponent;
