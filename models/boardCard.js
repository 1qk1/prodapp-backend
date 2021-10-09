const mongoose = require("mongoose");

const boardCardSchema = new mongoose.Schema({
  text: String,
  owner: { type: mongoose.Types.ObjectId, ref: "user" },
  listId: { type: mongoose.Types.ObjectId, ref: "board.lists" },
  description: String,
  comments: [
    {
      comment: String,
      author: { type: mongoose.Types.ObjectId, ref: "user" },
      date: mongoose.SchemaTypes.Date
    }
  ]
});

const BoardCard = mongoose.model("boardCard", boardCardSchema);

module.exports = BoardCard;
