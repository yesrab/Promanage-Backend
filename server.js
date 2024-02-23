const express = require("express");
require("dotenv").config();
require("express-async-errors");
const PORT = process.env.PORT || 8080;
const cors = require("cors");
const app = express();

app.use(cors());

//express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//import db
const connectDB = require("./db/connect");

app.get("/api/pingServer", (req, res) => {
  const startTime = new Date();
  res.status(200).json({
    msg: "pong",
    status: "Active",
    serverTime: startTime,
  });
});

//error handler
const errorHandler = require("./middleware/errorHandler");

//routes
const accountRoutes = require("./routes/account");
app.use("/api/v1/users/", accountRoutes);

const notesRoutes = require("./routes/notes");
app.use("/api/v1/notes/", notesRoutes);

//use error handler
app.use(errorHandler);

const start = async () => {
  try {
    // connectDB
    await connectDB(process.env.DB);
    console.log("Connected to DataBase");
    app.listen(PORT, () => console.log(`Server is listening port ${PORT}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
