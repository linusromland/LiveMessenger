//imports
let express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;
    User = require('./models/User.js'),
    Message = require('./models/Message.js'),
    dBModule = require('./dbModule.js'),
    fs = require('fs'),
    bodyParser = require("body-parser")

//Connect to Mongo
connectToMongo("LiveMessenger")

//Sets and uses depedencies etc.
const clientDir = __dirname + "/client/";
app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(clientDir));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


//GET ROUTES
app.get('/', (req, res) => {
  res.render('pages/index')
})

//POST ROUTES
//will be here l8r

//FUNCTIONS
function connectToMongo(dbName){
    if (fs.existsSync("mongoauth.json")) {
        dBModule.cnctDBAuth(dbName);
      } else {
        dBModule.cnctDB(dbName);
      }
}


app.listen(port, () => console.log(`Server listening on port ${port}!`))

