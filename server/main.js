//imports
<<<<<<< HEAD
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
  auth = require("./auth.js"),
  bodyParser = require("body-parser");
=======
let express = require("express");
let app = express();
let port = process.env.PORT || 3006;
let cors = require("cors");
let http = require("http").Server(app);
let io = require("socket.io")(http);
let MessageModel = require("./models/Message.js");
let dBModule = require("./dbModule.js");
let fs = require("fs");
let bodyParser = require("body-parser");
>>>>>>> parent of 169c1a0... Added User Registration with Client Side Hash and Salt

//Config Import
require('./config/passport');
require('dotenv').config()
expressJwt({ secret: "secret", algorithms: ['RS256'] });

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

<<<<<<< HEAD
app.get('/register', async (req, res) => {
  res.render('pages/register', {})
})


//POST ROUTES
app.post("/register", async (req, res) => {
  try {
    const userExist = await dBModule.findInDBOne(User, req.body.name);
    if (userExist == null) {
      dBModule.saveToDB(createUser(req.body.name, req.body.password, req.body.email));
      res.status(201).send();
    } else {
      return res.status(400).send("taken");
    }
  } catch {
    res.status(500).send();
  }
});

app.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();

      return res.json({ user: user.toAuthJSON() });
    }

    return status(400).info;
  })(req, res, next);
});


=======
>>>>>>> parent of 169c1a0... Added User Registration with Client Side Hash and Salt
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
<<<<<<< HEAD

function createUser(nameIN, passIN, emailIN) {
  return new User({
    name: nameIN,
    password: passIN,
    email: emailIN
  });
}
=======
>>>>>>> parent of 169c1a0... Added User Registration with Client Side Hash and Salt
