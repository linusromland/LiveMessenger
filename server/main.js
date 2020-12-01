//imports
let express = require("express");
let app = express();
let port = process.env.PORT || 3000;
let cors = require("cors");
let http = require("http").Server(app);
let io = require("socket.io")(http);
let MessageModel = require("./models/Message.js");
let dBModule = require("./dbModule.js");
let fs = require("fs");
let bodyParser = require("body-parser");

//Connect to Mongo
connectToMongo("LiveMessenger");

//Sets and uses depedencies etc.
const clientDir = __dirname + "/client/";
app.set("view engine", "ejs");
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(clientDir));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//GET ROUTES
app.get('/', async (req, res) => {
  let messages = await dBModule.findInDB(MessageModel)
  console.log(messages)
  res.render('pages/index', {
    messages: messages
  })
})


//Socket.IO ROUTES
io.on("connection", (socket) => {
  socket.on("msg", (msg) => {
    if (!(msg.msg == "" || msg.usr == "")) {
      dBModule.saveToDB(createMessage(msg.msg.substring(0, 50), msg.usr.substring(0, 10)));
      io.emit("msg", msg);
    }
  });
});

http.listen(port, function () {
  console.log("Server listening on port " + port);
});

//FUNCTIONS
function connectToMongo(dbName) {
  if (fs.existsSync("mongoauth.json")) {
    dBModule.cnctDBAuth(dbName);
  } else {
    dBModule.cnctDB(dbName);
  }
}

function createMessage(Message, User) {
  let tmp = new MessageModel({
    message: Message,
    user: User,
  });
  return tmp;
}
