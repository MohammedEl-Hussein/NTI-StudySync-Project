require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

const port = process.env.PORT

app.use(express.json());

const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

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