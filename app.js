require("dotenv").config();
const express = require("express");
const app = express();
const helmet = require("helmet");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const pomodoroRoutes = require("./routes/pomodoro");
const boardRoutes = require("./routes/board");
const extensionRoutes = require("./routes/extensions");
const passport = require("passport");
const cors = require("cors");
const errorMiddleware = require("./middleware/error").errorMiddleware;
const authStrategy = require("./passport");
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

mongoose.connect(process.env.MONGODB_URI,);

app.use(Sentry.Handlers.requestHandler());

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
app.use("/api/user", userRoutes);
app.use("/api/pomodoro", pomodoroRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/extensions", extensionRoutes);

app.use(Sentry.Handlers.errorHandler());

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log("Server running on port " + port);
});
