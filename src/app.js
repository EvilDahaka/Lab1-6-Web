const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Task Manager API",
    endpoints: ["/api/health", "/api/users", "/api/projects", "/api/tasks", "/api/comments"]
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));

app.use((req, res) => {
  res.status(404).json({ error: "аршрут не знайдено" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "нутрішня помилка сервера" });
});

module.exports = app;