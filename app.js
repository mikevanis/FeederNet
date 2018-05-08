const express = require('express');
const mysql = require('mysql');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);

var mysqlConnection = mysql.createConnection({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DB_NAME
});

// Connected feeder array
var connectedFeeders = new Array();

// Connect to MySQL database
mysqlConnection.connect(function(err) {
    if (err) {
        console.log("ERROR: Database connection failed: " + err.stack);
        return;
    }
    console.log("INFO: Connected to database.");
});

mysqlConnection.end();

function logTrack(name, timedate, rfid) {
    // Connect to MySQL database
    var mysqlConnection = mysql.createConnection({
        host: process.env.RDS_HOSTNAME,
        user: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD,
        port: process.env.RDS_PORT,
        database: process.env.RDS_DB_NAME
    });
    mysqlConnection.connect(function(err) {
        if (err) {
            console.log("ERROR: Database connection failed: " + err.stack);
            return;
        }
        var sql = "INSERT INTO log VALUES ?";
        var values = {feedername: name, timedate: timedate, rfid: rfid};
        mysqlConnection.query(sql, values, function (err, result) {
            if (err) {
                console.log("ERROR: SQL insertion failed.");
                return;
            }
            console.log("INFO: Inserted: " + result.affectedRows);
            mysqlConnection.end();
        });
    });

}

// Express setup
app.set('port', process.env.PORT || 8080);
app.use(express.static(__dirname + '/public'));

// Server setup
server.listen(app.get('port'), function() {
    console.log('Node version: ' + process.versions.node);
    console.log('Server listening on port ' + app.get('port'));
});

// Socket events
io.on('connection', function(socket) {
    console.log("INFO: New socket connection opened.");

    // Emit an ID request to the current socket to see if it's a feeder.
    socket.emit('idRequest', " ");

    // Insert feeder data to database.
    socket.on('newTrack', function(data) {
        console.log("INFO: Received new track event from feeder " + data.feederName);
        console.log("INFO: Timestamp: " + data.timedate + " | " + "RFID: " + data.rfid);
        logTrack(data.feederName, data.timedate, data.rfid);
    });

    // Receive new feeder's ID.
    socket.on('idTransmit', function(data) {
        console.log("INFO: Received new feeder ID " + data.feederName);
        connectedFeeders.push({feederName: data.feederName, socketID: socket.id});
        console.log("INFO: Associated " + data.feederName + " with ID " + socket.id);
    });

    // Detect disconnected feeder.
    socket.on('disconnect', function() {
        console.log("INFO: Socket disconnected. Socket ID: " + socket.id);
        for (var key in connectedFeeders) {
            if (connectedFeeders[key].socketID == socket.id) {
                console.log("INFO: Feeder " + connectedFeeders[key].feederName + " disconnected.");
                delete connectedFeeders[key];
            }
        }
    });
});
