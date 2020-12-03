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
    methodOverride = require("method-override");

//Connect to Mongo
connectToMongo("LiveMessenger");

//Sets and uses dependencies etc.
const clientDir = __dirname + "/client/";
app.set("view engine", "ejs");
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.static(clientDir));
app.use(flash());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        secret: "keyboard cat",
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

app.get("/lobby", checkAuthenticated, (req, res) => {
    res.render("pages/lobby");
});

app.get("/msgRoom", checkAuthenticated, async (req, res) => {
    let messages = await dBModule.findInDB(MessageModel);
    res.render("pages/msgRoom", {
        messages: messages,
    });
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
        const roomExist = await dBModule.findInDBOneRoom(Room, req.body.roomName, req.body.roomName);
        if (roomExist == null) {
            let maxUsers = req.body.maxUsers;
            if (!(maxUsers > 50 && maxUsers < 1)) {
                let tmp = await req.user;
                dBModule.saveToDB(createRoom(tmp.name, req.body.roomName, req.body.maxUsers));
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
io.on("connection", (socket) => {
    socket.on("msg", (msg) => {
        if (!(msg.msg === "" || msg.usr === "")) {
            dBModule.saveToDB(
                createMessage(msg.msg.substring(0, 50), msg.usr.substring(0, 10))
            );
            io.emit("msg", {
                msg: msg.msg.substring(0, 50),
                usr: msg.usr.substring(0, 10),
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
    return new MessageModel({
        message: Message,
        user: User,
    });
}

function createUser(nameIN, passIN) {
    return new User({
        name: nameIN,
        password: passIN,
    });
}

function createRoom(creator, roomName, maxUsers) {
    return new Room({
        creator: creator,
        roomName: roomName,
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
