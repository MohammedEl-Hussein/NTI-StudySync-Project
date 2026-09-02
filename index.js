require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
require("./cron/taskReminders");
const port = process.env.PORT || 3000;

// إعداد خادم HTTP وربط Socket.io به
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// خريطة لتخزين المستخدمين المتصلين: userId -> socketId
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected via Socket:", socket.id);

  socket.on("register", (userId) => {
    connectedUsers.set(userId.toString(), socket.id);
    socket.userId = userId.toString();
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
  });
});

// إتاحة io و connectedUsers للـ controllers
app.set("io", io);
app.set("connectedUsers", connectedUsers);

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const chatRoutes = require("./routes/chats");
const messageRoutes = require("./routes/messages");
const progressRoutes = require("./routes/progresses");
const roomMemberRoutes = require("./routes/roomMembers");
const roomRoutes = require("./routes/rooms");
const supportMessageRoutes = require("./routes/supportMessages");
const taskCompletionRoutes = require("./routes/taskCompletion");
const taskRoutes = require("./routes/tasks");
const notificationRoutes = require("./routes/notifications");

app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);
app.use("/progresses", progressRoutes);
app.use("/room-members", roomMemberRoutes);
app.use("/rooms", roomRoutes);
app.use("/support-messages", supportMessageRoutes);
app.use("/task-completion", taskCompletionRoutes);
app.use("/tasks", taskRoutes);
app.use("/notifications", notificationRoutes);

// الاتصال بقاعدة البيانات ثم تشغيل الخادم
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB Atlas:", err.message);
  });

//   mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log("Connected to MongoDB Atlas");

//     app.listen(port, () => {
//       console.log(`Server is running on port ${port}`);
//     });
//   })
//   .catch((err) => {
//     console.log("Error connecting to MongoDB Atlas:", err.message);
//   });