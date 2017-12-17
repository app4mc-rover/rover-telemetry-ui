/*
 Copyright (c) 2017 FH Dortmund.
 All rights reserved. This program and the accompanying materials
 are made available under the terms of the Eclipse Public License v1.0
 which accompanies this distribution, and is available at
 http://www.eclipse.org/legal/epl-v10.html

 Description:
    rover-telemetry-ui | Express web server, socket.io server, and MQTT module

 Designed and realized by:
    M. Ozcelikors <mozcelikors@gmail.com>
*/

// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5055;

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, '..')));


io.on('connection', function (socket) {

	/* Control data received */
	socket.on('control', function (data) {
		console.log('Data received', data);
		/*socket.broadcast.emit('new message', {
			username: socket.username,
			message: data
		});*/
	});
	
});
