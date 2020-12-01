//imports
const express = require("express"),
  app = express(),
  port = process.env.PORT || 3006,
  cors = require("cors"),
  http = require("http").Server(app),
  io = require("socket.io")(http),
  MessageModel = require("./models/Message.js"),
  User = require("./models/User.js"),
  dBModule = require("./dbModule.js"),
  fs = require("fs"),
  bodyParser = require("body-parser");

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

app.get('/register', async (req, res) => {
  res.render('pages/register', {})
})


//POST ROUTES

app.post("/register", async (req, res) => {
  try {
    const userExist = await dBModule.findInDBOne(User, req.body.name);
    if (userExist == null) {
      dBModule.saveToDB(createUser(req.body.name, req.body.password));
      res.status(201).send();
    } else {
      return res.status(400).send("taken");
    }
  } catch {
    res.status(500).send();
  }
});

//Socket.IO ROUTES
io.on("connection", (socket) => {
  socket.on("msg", (msg) => {
    if (!(msg.msg == "" || msg.usr == "")) {
      dBModule.saveToDB(createMessage(msg.msg.substring(0, 50), msg.usr.substring(0, 10)));
      io.emit("msg", {
        msg: msg.msg.substring(0, 50),
        usr: msg.usr.substring(0, 10)
      });
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

function createUser(nameIN, passIN) {
  return new User({
    name: nameIN,
    password: passIN,
  });
}