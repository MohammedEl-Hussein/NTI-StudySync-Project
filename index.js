require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

const port = process.env.PORT

app.use(express.json());

const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
// const chatRoutes = require("./routes/chats");
// const messageRoutes = require("./routes/messages");
// const progressRoutes = require("./routes/progresses");
const roomMemberRoutes = require("./routes/roomMembers");
const roomRoutes = require("./routes/rooms");
// const supportMessageRoutes = require("./routes/supportMessages");
// const taskCompletionRoutes = require("./routes/taskCompletion");
// const taskRoutes = require("./routes/tasks");
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
// app.use("/chats", chatRoutes);
// app.use("/messages", messageRoutes);
// app.use("/progresses", progressRoutes);
app.use("/room-members", roomMemberRoutes);
app.use("/rooms", roomRoutes);
// app.use("/support-messages", supportMessageRoutes);
// app.use("/task-completion", taskCompletionRoutes);
// app.use("/tasks", taskRoutes);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB Atlas");
        
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB Atlas:", err.message);
    });