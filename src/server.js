import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  server.close(() => process.exit(0));
});
