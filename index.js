//Import modules required
var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
var mysql = require('mysql')

const app = express();
const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }))

//CSS
app.use(express.static(__dirname + '/public'));

//Express commands
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

//Define data
var plannerData = {plannerName: "EventPlanner"}
require("./routes/main")(app, plannerData);

// Start the web app listening
app.listen(port, () => console.log(`Listening on port ${port}!`))

//Define the database connection
var db = mysql.createConnection ({
    host: 'localhost',
    user: 'appuser',
    password: 'app2027',
    database: 'eventplanner'
});

//Connect to database
db.connect((err) => {
    if(err) {
        throw err;
    }

    console.log('Connected to the database')
})

global.db = db;
