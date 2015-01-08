/**
 * Ahungry Tactics - Free as in Freedom multiplayer tactics/TCG game
 * Copyright (C) 2013 Matthew Carter
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var port = 1037;
var listen_on = 1038;
/**
 * Dispatch a tcp request to an arbitrary port
 *
 * In this case we are doing it with lisp running
 * on the back end to handle certain function processing
 * for us.
 *
 * @param string action The backend function to call
 * @param object json An object to be serialized as json
 */
function	tcp_request (socket, action, json) {
    var net = require('net');
    var big_data = '';
    var tcp_socket = net.connect({port: port},
				 function () { //'connect' listener
				     console.log('connected');
				     tcp_socket.write(action+'\r\n');
				     tcp_socket.write(JSON.stringify(json)+'\r\n');
				     console.log('Sending in: '+action+'\r\n'+JSON.stringify(json)+'\r\n');
				 });
    tcp_socket.on('data', function (data) {
	big_data += data;
    });
    tcp_socket.on('end', function () {
	json = JSON.parse(big_data);
	e = json.emit;
	b = json.broadcast;

	console.log('From lisp: '+action);

	if(typeof(e) !== 'undefined' && e.action != 'nil')
	    socket.emit(e.action, e.data );
	if(typeof(b) !== 'undefined' && b.action != 'nil')
	    socket.broadcast.emit(b.action, b.data);
	
	console.log('lisp disconnect');
    });
}

var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')

app.listen(listen_on);

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
		function (err, data) {
		    if(err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		    }

		    res.writeHead(200);
		    res.end(data);
		});
}

//What happens on connection/connected events?
io.sockets.on('connection', function (socket) {

    console.log('connected');
    var web_socket = socket;

    //Someone is joining the game, yay
    socket.on('join-game', function (data) {
	console.log('received join game');
	tcp_request(socket, 'join-game', data);
    });

    //Someone wants to do an action
    socket.on('set-action', function (data) {
	tcp_request(socket, 'set-action', data);
    });

    socket.on('zone-change', function(data) {
	tcp_request(socket, 'zone-change', data);
    });

    socket.on('draw-card', function (data) {
	tcp_request(socket, 'draw-card', data);
    });

    // Card related
    socket.on('request-cards', function (data) {
	tcp_request(socket, 'request-cards', data);
    });

    socket.on('request-hand', function (data) {
	tcp_request(socket, 'request-hand', data);
    });
    socket.on('request-deck', function (data) {
	tcp_request(socket, 'request-deck', data);
    });

    socket.on('request-chat', function (data) {
	tcp_request(socket, 'request-chat', data);
    });
    socket.on('request-signin', function (data) {
	data.client_ip = socket.handshake.address.address;
	tcp_request(socket, 'request-signin', data);
    });
    socket.on('request-change-job', function (data) {
	tcp_request(socket, 'request-change-job', data);
    });
    socket.on('request-jobs', function (data) {
	tcp_request(socket, 'request-jobs', data);
    });
    socket.on('request-give-card', function (data) {
	tcp_request(socket, 'request-give-card', data);
    });
});
