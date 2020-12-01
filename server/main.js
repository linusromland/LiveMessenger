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
  bodyParser = require("body-parser"),
  passport = require('passport'),
  flash = require('express-flash'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  methodOverride = require('method-override');


//Connect to Mongo
connectToMongo("LiveMessenger");

//Sets and uses depedencies etc.
const clientDir = __dirname + "/client/";
app.set("view engine", "ejs");
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(clientDir));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true 
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const initializePassport = require('./config/passport.js')
initializePassport(
  passport,
  name => User.find(user => user.name === name),
  id => User.find(user => user.id === id)
)

//Check if production or debug
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

//GET ROUTES
app.get('/', (req, res) => {
  res.render('pages/index')
})

app.get('/msgRoom', async (req, res) => {
  let messages = await dBModule.findInDB(MessageModel)
  res.render('pages/msgRoom', {
    messages: messages
  })
})

app.get('/register', checkNotAuthenticated, async (req, res) => {
  res.render('pages/register', {})
})

app.get('/auth', checkAuthenticated, async (req, res) => {
  res.render('pages/auth', {})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('pages/login')
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

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

//Logout request
app.delete('/logout', (req, res) => {
  req.logOut()  
  res.redirect('/login')
})

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

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}