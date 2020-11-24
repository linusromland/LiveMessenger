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
app.get("/", (req, res) => {
  res.render("pages/index");
});

//Socket.IO ROUTES
io.on("connection", (socket) => {
  socket.on("msg", (msg) => {
    dBModule.saveToDB(createMessage(msg.msg, msg.usr));
    io.emit("msg", msg);
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
