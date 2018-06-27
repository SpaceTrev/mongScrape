// Deps
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";
// Models for the article and comments
// const Comment = require('./models/comment.js');
// const Article = require('./models/article');
// scraping tools
// const cheerio = require('cheerio');
// const request = require('request');

// JS es6 Promises leveraged with mongoose
mongoose.Promise = Promise;

// Port Declaration
const port = process.env.PORT || 8080;

// Initialize express server
const app = express();

// Required for use of Morgan and Body-parser
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Servers static public content to the web page
app.use(express.static("public"));

// Handlebars set-up
const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({ defaultLayout: "main" }));
app.set('view engine', 'handlebars');

// Importing routes so server can access them
const routes = require('./controllers/scrapeControl');

app.use('/', routes);

mongoose.connect(MONGODB_URI);

const db = mongoose.connection;
// error catch
db.on('error', (error) =>  console.log(error));
// success log
db.once('open', () => console.log("Connection to db Success"));
app.listen(port, ()=> console.log("Runnin tha trap on Port " + port));