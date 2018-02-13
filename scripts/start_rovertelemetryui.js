/*
 Copyright (c) 2017 FH Dortmund.
 All rights reserved. This program and the accompanying materials
 are made available under the terms of the Eclipse Public License v1.0
 which accompanies this distribution, and is available at
 http://www.eclipse.org/legal/epl-v10.html

 Description:
    rover-telemetry-ui | Express web server, socket.io server, and MQTT module

 Author:
    M. Ozcelikors <mozcelikors@gmail.com>
*/

// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5055;
var mqtt = require('mqtt');
var use_credentials_f = 0;
var username_ = "";
var password_ = "";

var mqtt_client;
var mqtt_addr;
var rover_id;
var rover_speed = 480;

var mqtt_connected_f = 0;
var mqtt_trying_to_connect_f = 0;

/* MQTT settings */
drivingTopicPrefix = 'rover/';
drivingTopicPostfix = '/RoverDriving/control';

var telemetryTopicPrefix = 'rover/';
var telemetryTopicPostfix = '/telemetry';

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, '..')));


io.on('connection', function (socket) {
	console.log ('A client is connected to socket.io server');
	console.log ('Go to your browser and enter http://<your host>:5055/rovertelemetryui.html');
	/* MQTT connection failed */
	function connectionFailed ()
	{
		if (mqtt_connected_f == 0)
		{
			console.log('Connection failed');
			socket.emit('console_', 'Connection failed');
		}
	}

	/* Speed data received */
	socket.on('speed', function (data) {
		rover_speed = data;
		console.log('Speed is set to '+rover_speed);
		socket.emit('console_', 'Speed is set to '+rover_speed);
	});

	/* Control data received */
	socket.on('control', function (data) {

		if (mqtt_connected_f == 1)
		{
			var topic = drivingTopicPrefix+rover_id+drivingTopicPostfix;
			var publish_data = {
									"mode":0,
				 					"command":data,
									"speed":parseInt(rover_speed)
				 				};
			var publish_data = JSON.stringify(publish_data);
			/* Publish MQTT data */
			mqtt_client.publish(drivingTopicPrefix+rover_id+drivingTopicPostfix, publish_data);

			console.log('Publishing '+publish_data+' to topic '+topic);
			socket.emit('console_', 'Publishing '+publish_data+' to topic '+topic);
		}
		/*socket.broadcast.emit('new message', {
			username: socket.username,
			message: data
		});*/
	});

	/* MQTT connect event received */
	socket.on('mqtt_connect', function(data)
	{
		rover_id = data.roverID;
		use_credentials_f = data.useCredentials;
		username_ = data.username;
		password_ = data.password;

		if (typeof(mqtt_client) != 'undefined')
		{
			mqtt_client.end();
			mqtt_connected_f = 0;
		}

		if (mqtt_connected_f == 0)
		{
			console.log('Trying to connect MQTT broker @', data.addr);
			socket.emit('console_', 'Trying to connect MQTT broker @'+data.addr+' with rover ID '+rover_id);
			mqtt_trying_to_connect_f = 1;
		}

		if (mqtt_trying_to_connect_f == 1)
		{
			setTimeout(connectionFailed, 5000); //5 seconds timeout
			mqtt_trying_to_connect_f = 0;
		}

		mqtt_addr = data.addr;

		/* Connect */
		if (use_credentials_f == 0)
		{
			mqtt_client = mqtt.connect(mqtt_addr);
		}
		else
		{
			mqtt_client = mqtt.connect(mqtt_addr, {username:username_, password:password_});
		}

		mqtt_client.on ('connect', function(){
			if (mqtt_connected_f == 0)
			{
				/* If connection succeeds */
				console.log('Connected to MQTT broker @'+mqtt_addr);
				socket.emit('console_', 'Connected to MQTT broker @'+mqtt_addr+' with rover ID '+rover_id);

				/* Send mqtt connected event */
				socket.emit ('mqtt_connected', 1);

				mqtt_connected_f = 1;
				mqtt_trying_to_connect_f = 0;

				/* Subscribe to RoverSensor */
				mqtt_client.subscribe(telemetryTopicPrefix+rover_id+telemetryTopicPostfix);
				console.log('Subscribing to '+telemetryTopicPrefix+rover_id+telemetryTopicPostfix);
				socket.emit('console_', 'Subscribing to '+telemetryTopicPrefix+rover_id+telemetryTopicPostfix);

			}
		});

		mqtt_client.on('message', function (topic, message) {
			// message is Buffer
		  console.log('Received '+message.toString()+' from '+topic);
			socket.emit('console_', 'Received '+message.toString()+' from '+topic);

			if (topic.includes(telemetry_topic))
			{
				try
				{
					var json_data = JSON.parse(message.toString());

					//var myval = json_data.dht22.temperature;
					//socket.emit('temperature_update', myval);

					//var myval = json_data.dht22.humidity;
					//socket.emit('humidity_update', myval);

					var myval = json_data.infrared.rearright;
					socket.emit('irr_update', myval);

					var myval = json_data.infrared.rearleft;
					socket.emit('irl_update', myval);

					var myval = json_data.infrared.frontright;
					socket.emit('ifr_update', myval);

					var myval = json_data.infrared.frontleft;
					socket.emit('ifl_update', myval);

					var myval = json_data.ultrasonic.front;
					socket.emit('uf_update', myval);

					var myval = json_data.ultrasonic.rear;
					socket.emit('ur_update', myval);

					var myval = json_data.hmc5883l.bearing;
					socket.emit('hmcb_update', myval);

					var myval = json_data.gy521.gyro.x;
					socket.emit('gyrox_update', myval);

					var myval = json_data.gy521.gyro.y;
					socket.emit('gyroy_update', myval);

					var myval = json_data.gy521.gyro.z;
					socket.emit('gyroz_update', myval);

					var myval = json_data.gy521.accel.x;
					socket.emit('accelx_update', myval);

					var myval = json_data.gy521.accel.y;
					socket.emit('accely_update', myval);

					var myval = json_data.gy521.accel.z;
					socket.emit('accelz_update', myval);

					var myval = json_data.gy521.angle.x;
					socket.emit('anglex_update', myval);

					var myval = json_data.gy521.angle.y;
					socket.emit('angley_update', myval);

					var myval = json_data.gy521.angle.z;
					socket.emit('anglez_update', myval);

					var myval = json_data.cores.core0;
					socket.emit('core0_update', myval);

					var myval = json_data.cores.core1;
					socket.emit('core1_update', myval);

					var myval = json_data.cores.core2;
					socket.emit('core2_update', myval);

					var myval = json_data.cores.core3;
					socket.emit('core3_update', myval);

					var myval = json_data.cores.core4;
					socket.emit('core4_update', myval);
				}
				catch(ex)
				{
					return;
				}
			}
		})

		mqtt_client.on ('reconnect', function(){
			if (mqtt_connected_f == 1)
			{
				/* Send mqtt connected event */
				socket.emit ('mqtt_connected', 1);
			}
		});

		mqtt_client.on ('close', function(){
			if (mqtt_connected_f == 1)
			{
				/* If connection succeeds */
				console.log('Disconnected from MQTT broker @'+mqtt_addr);
				socket.emit('console_', 'Disconnected from MQTT broker @'+mqtt_addr);

				/* Send mqtt connected event */
				socket.emit ('mqtt_disconnected', 1);

				mqtt_connected_f = 0;
				mqtt_trying_to_connect_f = 0;
			}

		});

		mqtt_client.on ('error', function(){
			console.log('Error occured @'+mqtt_addr);
			socket.emit('console_', 'Error occured @'+mqtt_addr);
		});

	});

});
