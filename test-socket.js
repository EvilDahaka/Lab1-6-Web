
import { io } from "socket.io-client";

const token = process.env.ACCESS_TOKEN;

if (!token) {
  console.error("Не задано ACCESS_TOKEN");
  process.exit(1);
}

const socket = io("http://localhost:3000", {
  auth: { token },
  timeout: 5000
});

socket.on("connect", () => {
  console.log("Підключено до Socket.IO:", socket.id);
});

socket.on("connected", (data) => {
  console.log("Авторизацію підтверджено:", data);
  console.log("Очікуємо сповіщення про завдання...");
});

socket.on("task:created", (data) => {
  console.log("НОВЕ ЗАВДАННЯ:", data);
});

socket.on("task:updated", (data) => {
  console.log("ЗАВДАННЯ ОНОВЛЕНО:", data);
});

socket.on("task:deleted", (data) => {
  console.log("ЗАВДАННЯ ВИДАЛЕНО:", data);
});

socket.on("connect_error", (error) => {
  console.error("Помилка підключення:", error.message);
});
