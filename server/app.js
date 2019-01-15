const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

const port = process.env.PORT || 5000;

// Mongoose
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/node-testing', {useNewUrlParser: true}, (err, res) => {
  if(err) {
    console.log('Error connecting to the database. ' + err);
  } else {
    console.log('Connected to Database!');
  }
});

// Routes
const birds = require('./routes/birds.js');
const feeders = require('./routes/feeders.js');
const events = require('./routes/events.js');
const waypoints = require('./routes/waypoints.js');
const recordTrack = require('./routes/recordTrack.js');
const time = require('./routes/time.js');
const ping = require('./routes/ping.js');
const update = require('./routes/update.js');
const login = require('./routes/login.js');

// Express instance
var app = express();

// Passport config
require('./config/passport')(passport);

// Config middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/admin', express.static(__dirname + '../../admin-client/build/'));

// Main routes
app.use('/api/', birds);
app.use('/api/', feeders);
app.use('/api/', events);
app.use('/api/', waypoints);
app.use('/api/', recordTrack);
app.use('/api/', time);
app.use('/api/', ping);
app.use('/api/', update);
app.use('/api/', login);

// Server configuration
var server = http.createServer(app);
server.listen(port, () => {
    console.log('INFO: Server started.');
    // TODO - Check if admin user exists. If it doesn't, create it.
});

module.exports = app;
