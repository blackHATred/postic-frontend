import { useEffect, useState } from "react";

const WebSocketComponent: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Создаем WebSocket-соединение
    const socket = new WebSocket("ws://localhost:8080");

    // Обработчик открытия соединения
    socket.onopen = () => {
      console.log("WebSocket соединение установлено");
      socket.send("Привет, сервер!"); // Отправляем сообщение на сервер
    };

    // Обработчик входящих сообщений
    socket.onmessage = (event) => {
      console.log("Сообщение от сервера:", event.data);
      setMessages((prev) => [...prev, event.data]); // Добавляем сообщение в состояние
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
      <h2>Сообщения от сервера:</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

export default WebSocketComponent;
