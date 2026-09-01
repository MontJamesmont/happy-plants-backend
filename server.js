const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors')
const passport = require("passport");
const config = require("./db");

const users = require("./routes/user");
const errorHandler = require("./middlewares/errorHandler");
const { getVerifyUserTokenSchema } = require("./validation/schemas/verifyUser");
const User = require("./models/User");

mongoose
  .connect(config.DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(
    () => {
      console.log("Database is connected");
    },
    (err) => {
      console.log("Can not connect to the database" + err);
    }
  );

process.on('uncaughtException', (err) => {
  console.log('UncaughtException happened.', err)
})

process.on('unhandledRejection', (err) => {
  console.log('UnhandledRejection happened.', err)
})

const app = express();
app.use(passport.initialize());
require("./passport")(passport);

app.use(
  bodyParser.urlencoded({
    limit: "2mb",
    extended: true,
  })
);
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({limit: '2.8mb'}));
app.use(express.urlencoded({limit: '2.8mb'}));
app.use(bodyParser.json({ limit: "2.8mb", extended: true }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use("/api/users", users);
app.use(errorHandler);

const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
