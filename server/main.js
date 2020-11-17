//imports
const express = require('express'),
    app = express(),
    port = 3000,
    User = require('models/User.js'),
    Message = require('models/Message.js'),
    dbModule = require('dbModule.js')

//Connect to Mongo
connectToMongo("LiveMessenger")

//Sets and uses depedencies etc.
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
app.get('/', (req, res) => res.send('Live Messenger!'))

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


app.listen(port, () => console.log(`Example app listening on port port!`))

