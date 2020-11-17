const mongoose = require('mongoose');

//Creates the UserSchema and exports it
const MsgSchema  = new mongoose.Schema({
  user :{
      type  : String,
      required : true
  } ,
message :{
    type  : String,
    required : true
} ,
date :{
    type : Date,
    default : Date.now
}
});

const Message = mongoose.model("Message", MsgSchema);

module.exports = Message;