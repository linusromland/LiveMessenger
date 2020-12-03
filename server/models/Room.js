const mongoose = require("mongoose");

//Creates the RoomSchema and exports it
const RoomSchema = new mongoose.Schema({
  creator: {
    type: String,
    required: true,
  },
  roomName: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  maxUsers: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  messages: {
    user: {
      type: String,
    },
    message: {
      type: String,
    },
    date: {
      type: Date,
    },
  },
});

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;
