//imports
const express = require("express"),
  app = express(),
  port = process.env.PORT || 3006,
  cors = require("cors"),
  http = require("http").Server(app),
  io = require("socket.io")(http),
  MessageModel = require("./models/Message.js"),
  User = require("./models/User.js"),
  Room = require("./models/Room.js"),
  dBModule = require("./dbModule.js"),
  fs = require("fs"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  flash = require("express-flash"),
  session = require("express-session"),
  methodOverride = require("method-override"),
  cookie = require("cookies"),
  passportSocketIo = require("passport.socketio"),
  cookieParser = require("cookie-parser"),
  sessionstore = require("sessionstore");

//Connect to Mongo
let store;
connectToMongo("LiveMessenger");

//Users Connected Currently
let usersConnectedName = [];
let usersConnectedNumber = [];

//Sets and uses dependencies etc.
const clientDir = __dirname + "/client/";
app.set("view engine", "ejs");
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(clientDir));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    secret: "keyboard cat",
    store: store,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize(undefined));
app.use(passport.session(undefined));
app.use(methodOverride("_method"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: "connect.sid",
    secret: "keyboard cat",
    store: store,
  })
);

const { isNumber } = require("util");
const initializePassport = require("./config/passport.js");
initializePassport(
  passport,
  (name) => User.find((user) => user.name === name),
  (id) => User.find((user) => user.id === id)
);

//Check if production or debug
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//GET ROUTES
app.get("/", checkNotAuthenticated, (req, res) => {
  res.render("pages/index");
});

app.get("/lobby", checkAuthenticated, async (req, res) => {
  res.render("pages/lobby", {
    rooms: await dBModule.findInDB(Room),
  });
});

app.get("/msgRoom", checkAuthenticated, async (req, res) => {
  let room = req.query.room;
  let messages = await dBModule.findRoomInDB(Room, room);
  if (room && messages) {
    let tmp = messages.messages;
    res.render("pages/msgRoom", {
      messages: tmp.toJSON(),
      room: room,
    });
  } else {
    res.redirect("/lobby");
  }
});

app.get("/register", checkNotAuthenticated, async (req, res) => {
  res.render("pages/register", {});
});

app.get("/newRoom", checkAuthenticated, async (req, res) => {
  res.render("pages/newRoom", {});
});

app.get("/auth", checkAuthenticated, async (req, res) => {
  res.render("pages/auth", {});
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("pages/login");
});

//POST ROUTES
app.post("/register", checkNotAuthenticated, async (req, res) => {
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

app.post("/newRoom", checkAuthenticated, async (req, res) => {
  try {
    const roomExist = await dBModule.findInDBOneRoom(
      Room,
      req.body.roomName,
      req.body.roomName
    );
    if (roomExist == null) {
      let maxUsers = req.body.maxUsers;
      if (!(maxUsers > 50 && maxUsers < 1)) {
        let tmp = await req.user;
        dBModule.saveToDB(
          createRoom(
            tmp.name,
            req.body.roomName,
            req.body.desc,
            req.body.maxUsers
          )
        );
        res.status(201).send();
      } else {
        res.status(500).send();
      }
    } else {
      return res.status(400).send("taken");
    }
  } catch {
    res.status(500).send();
  }
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

//Logout request
app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

//Socket.IO ROUTES
io.on("connection", async (socket) => {
  let tmp = await socket.request.user;
  let rooms = await dBModule.findInDB(Room);
  for (let index = 0; index < rooms.length; index++) {
    socket.on(rooms[index].roomName, async (msg) => {
      if (msg && msg.connected) {
        addUserToRoom(tmp.name, rooms[index].roomName);
        console.log(
          `${tmp.name} has connected in room ${rooms[index].roomName}`
        ); //new code
      } else {
        if (!(msg.msg === "" || tmp.name === "")) {
          createMessage(
            msg.msg.substring(0, 50),
            tmp.name,
            rooms[index].roomName
          );
          io.emit(rooms[index].roomName, {
            msg: msg.msg.substring(0, 50),
            usr: tmp.name,
          });
        }
      }
    });
  }
  socket.on("disconnect", async () => {
    let tmp = await socket.request.user;
    let rooms = await dBModule.findInDB(Room);
    for (let index = 0; index < rooms.length; index++) {
      removeUserFromRoom(tmp.name, rooms[index].roomName);
    }
    console.log(`${tmp.name} has disconnected`);
  });
});

http.listen(port, function () {
  console.log("Server listening on port " + port);
});

//FUNCTIONS
function connectToMongo(dbName) {
  if (fs.existsSync("mongoauth.json")) {
    const mongAuth = require("./mongoauth.json");
    dBModule.cnctDBAuth(dbName);
    store = sessionstore.createSessionStore({
      type: "mongodb",
      authSource: "admin",
      username: mongAuth.username,
      password: mongAuth.pass,
    });
  } else {
    dBModule.cnctDB(dbName);
    store = sessionstore.createSessionStore({ type: "mongodb" });
  }
}

function createMessage(Message, User, roomName) {
  let tmp = { message: Message, user: User, date: Date.now() };
  dBModule.addMessageToRoom(Room, roomName, tmp);
}

function createUser(nameIN, passIN) {
  return new User({
    name: nameIN,
    password: passIN,
  });
}

function createRoom(creator, roomName, desc, maxUsers) {
  return new Room({
    creator: creator,
    roomName: roomName,
    desc: desc,
    maxUsers: maxUsers,
  });
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/lobby");
  }
  next();
}

function addUserToRoom(userName, roomName) {
  if (usersConnectedName.length == 0) {
    usersConnectedName.push(roomName);
    usersConnectedNumber.push(1);
  } else {
    for (let index = 0; index < usersConnectedName.length; index++) {
      if (usersConnectedName[index] == roomName) {
        usersConnectedNumber[index]++;
      } else {
        usersConnectedName.push(roomName);
        usersConnectedNumber.push(1);
      }
    }
  }
  console.log(usersConnectedName);
  console.log(usersConnectedNumber);
}

function removeUserFromRoom(userName, roomName) {
  console.log("disconnect");
  for (let index = 0; index < usersConnectedName.length; index++) {
    if (usersConnectedName[index] == roomName) {
      console.log(usersConnectedNumber[index]);
      if (usersConnectedNumber[index] > 0) {
        usersConnectedNumber[index] = usersConnectedNumber[index] - 1;
      }
    }
  }

  console.log(usersConnectedNumber);
}