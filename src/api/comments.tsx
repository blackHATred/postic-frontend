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
  const [message, setMessage] = useState<string>("");
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

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const newMessage = {};

      socket.send(JSON.stringify(newMessage));
      setMessage("");
      console.log("send keys");
    } else {
      console.error("WebSocket соединение не установлено");
    }
  };

  return (
    <div>
      <h1>WebSocket Тест</h1>
      <h2>Комментарии:</h2>
      <CommentList comments={comments} />
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите сообщение"
        />
        <button onClick={sendMessage}>Отправить</button>
      </div>
    </div>
  );
};

export default WebSocketComponent;
