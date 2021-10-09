require("dotenv").config();
const express = require("express"),
  app = express(),
  helmet = require("helmet"),
  mongoose = require("mongoose"),
  authRoutes = require("./routes/auth"),
  pomodoroRoutes = require("./routes/pomodoro"),
  boardRoutes = require("./routes/board"),
  extensionRoutes = require("./routes/extensions"),
  passport = require("passport"),
  cors = require("cors"),
  errorMiddleware = require("./middleware/error").errorMiddleware,
  authStrategy = require("./passport");

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error) => {
    if (!error) {
      console.log("database connected");
    } else {
      console.log("database connection error:", error);
    }
  }
);
mongoose.set("useCreateIndex", true);

app.use(helmet());

let corsOptions = process.env.NODE_ENV == 'PRODUCTION' ? ({
  origin: 'https://prodapp.xyz/',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}) : {};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

passport.use(authStrategy);

app.use(errorMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/pomodoro", pomodoroRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/extensions", extensionRoutes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log("Server running on port " + port);
});
