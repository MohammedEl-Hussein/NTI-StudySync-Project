const express = require('express');

const app = express();
const mongoose = require('mongoose');
const port = 3001;

app.use(express.json());
const userRoutes = require('./routes/users');
app.use("/users",userRoutes);

mongoose.connect('mongodb://127.0.0.1:27017/studySync').then(()=> {
  console.log('Connected to MongoDB');
}).catch((err)=> {
  console.log('Error connecting to MongoDB', err);
});
app.listen(port , () => {
    console.log(`Server is running on port ${port}`);
 });