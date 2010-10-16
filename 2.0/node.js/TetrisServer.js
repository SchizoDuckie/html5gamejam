var fs    = require('fs'),
    path  = require('path'),
    sys   = require('sys'),
    http  = require('http'),
    faye  = require('./faye-node.js');
	mootools = require('./mootools-server.js');
	fayehook = require('./faye-hook.js');

var PUBLIC_DIR  = path.dirname(__filename) + '/webserverroot',
    port        = '1234',
	contentTypes = { 'html' : 'text/html', 'css' : 'text/css', 'js' : 'text/javascript' };

// create a webserver
var server = http.createServer(function(request, response) {

	var path = (request.url === '/') ? '/index.html' : request.url;
	fs.readFile(PUBLIC_DIR + path, function(err, content) {
	try {
		var contentType = contentTypes[path == '/index.html' ? 'html' : request.url.split('.').pop()] || 'text/html';

		response.writeHead(200, {'Content-Type': contentType });
		response.write(content);
		response.end();		  
	} catch (e) {  response.end();  }
	});	  

});
server.listen(Number(port))

commChannel = new faye.NodeAdapter({mount: '/tetrisdemo', timeout: 20});		
commChannel.attach(server);

FayeClient = commChannel.getClient();

GameMaster = new Class({
	Extends: FayeHook,

	initialize: function(channel) {

		this.basechannel = channel;		
		this.users = [];
		this.games = [];

		this.hookIncoming(this.handleIncoming.bind(this));
		this.hookOutgoing(this.handleOutgoing.bind(this));


		
	},

	handleIncoming: function(message, callback) {
		var channel = message.channel.split('/');
		channel.shift();
		console.log("Incoming message for channel: "+channel.join('\\'));
		switch(channel[0]) {
			case 'login':
				switch(channel[1]) {
					case 'canihazlogin':
						console.log("User wants to login: ", JSON.encode(message));
						if(message.data.username) 
							{
							//this.users[message.data.username] = message.data.browser;
							FayeClient.publish('/login/ihazlogdin/'+encodeURIComponent(message.data.username)+'/ok', {'message': 'Welcome '+message.data.username+"! Hang on, starting the game.", users: this.users});
							FayeClient.publish('/login/ihazlogdin/'+encodeURIComponent(message.data.username)+'/performAction', { 
									message: 'Woeha!',
									options: { gameChannel: 'pimpmeister' , callBack: function() {
									
									
									this.startGame();
																	
									}.toString()   }});
						}
						else {
							FayeClient.publish('/login/ihazlogdin/'+encodeURIComponent(message.data.username)+'/nok', {'message': 'Sorry, somebody with that nickname is already online. Please pick another.'});
						}
					break;
				}
			break;
			case 'kthxbye':
				console.log("User want to logout: "+message.data.username);
			break;
			default: 
				console.log('Message received on unknown channel!', JSON.encode(channel), JSON.encode(message));
			return;

		}
		callback(message);
	},

	handleOutgoing: function(message, callback) {
		//console.log("Outgoing: \n", JSON.encode(message));
		
		callback(message);
	},



});

new GameMaster('betatest');


sys.puts('Listening on ' + port);
