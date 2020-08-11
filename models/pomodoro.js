const mongoose = require("mongoose");

const pomodoroSchema = new mongoose.Schema({
  userId: mongoose.SchemaTypes.ObjectId,
  date: {
    type: mongoose.SchemaTypes.Date,
    default: new Date(),
  },
});

const Pomodoro = mongoose.model("pomodoro", pomodoroSchema);

module.exports = Pomodoro;
