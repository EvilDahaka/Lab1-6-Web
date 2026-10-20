
import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import { initSocket } from "./socket/index.js";

const PORT = process.env.PORT || 3000;

const server = createServer(app);
const io = initSocket(server);

app.set("io", io);

server.listen(PORT, () => {
  console.log(`Сервер запущено на порті ${PORT}`);
});

function shutdown() {
  io.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
