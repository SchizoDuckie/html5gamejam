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

commChannel = new faye.NodeAdapter({mount: '/tetrisdemo', timeout: 500});		
commChannel.attach(server);

FayeClient = commChannel.getClient();

GameMaster = new Class({
	Extends: FayeHook,
	startedPublishing: false,

	initialize: function(channel) {

		this.basechannel = channel;		
		this.users = {};
		this.games = {};

		this.hookIncoming(this.handleIncoming.bind(this));
		this.hookOutgoing(this.handleOutgoing.bind(this));
		
	},

	handleIncoming: function(message, callback) {
		//console.log("Incoming message for channel: "+message.channel);

		var channel = message.channel.split('/');
		channel.shift();

		switch(channel[0]) {
			case 'login':
				switch(channel[1]) {
					case 'canihazlogin':
						console.log("User wants to login: "+message.data.username);
						if(message.data.username && !this.users[message.data.username]) 
							{
								this.users[message.data.username] = {
									username: message.data.username,
									browser: message.data.browser,
									lastSeen: new Date().getTime()
								}
								FayeClient.publish('/login/ihazlogdin/'+encodeURIComponent(message.data.username)+'/ok', {'message': 'Welcome '+message.data.username+"! Hang on, starting the game.", users: this.users});
								FayeClient.publish('/login/ihazlogdin/'+encodeURIComponent(message.data.username)+'/performAction', { 
									message: 'starting game!!', options: { gameChannel: 'pimpmeister' , callBack: function() {  // this is executed on the client :D
										this.startGame();							
									}.toString()   }});
								FayeClient.publish('/game/users', this.users);
						}
						else {
							FayeClient.publish('/login/ihazlogdin/'+encodeURIComponent(message.data.username)+'/nok', {'message': 'Sorry, somebody with that nickname is already online. Please pick another.'});
						}
					break;
				}
			break;
			case 'game':
				switch(channel[1]){ 
					case 'getuserlist':
						console.log("publishing users. "+this.getOnlineCount()+' online.');

						FayeClient.publish('/game/userlist', {message: this.getOnlineCount()+' users online. Enjoy!', users: this.users });
					break;
					case 'chat':
						message.data.message = message.data.message.replace('<', '&lt;').replace('>', '&gt;');
						console.log("[CHAT]: "+message.data.username,':', message.data.message);
					break;
					case 'savestate':
						message.data.username = channel[2];
						if(message.data.model) {
							this.setGameState(message.data);
						}
					break;
					case 'states':

						if(!this.startedPublishing) {
							this.startPublishingGameStates();
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

	getOnlineCount:function() {
		 var obj = this.users, count = 0;
		  for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
			  count++;
			}
		  }


		return count;
	},

	startPublishingGameStates: function() {
		if(this.getOnlineCount() > 0) {
			this.startedPublishing = true;
			FayeClient.publish('/game/states', this.getGameStates());
			setTimeout(this.startPublishingGameStates.bind(this), 850);
		}
		else {
			this.startedPublishing = false;
		}
	},

	setGameState: function(message) {
		if(!message || !message.username) {
			console.log("Set game state found empty empty message, cnacellig; ", JSON.encode(message));
			return;
		}
		if(!this.games[message.username] || message.timestamp){
			if(this.games[message.username] && this.games[message.username].timestamp < message.timestamp) {
				this.games[message.username] = message;
				if(!this.users[message.username]) {
					this.users[message.username] = this.users[message.username] = {
									username: message.username,
									browser: ['uknown',0],
									lastSeen: new Date().getTime()
								};
				}
			}
			else {
				this.games[message.username] = message;
			}
		}
		if(!this.startedPublishing) { this.startPublishingGameStates(); }
		console.log("Logged game state for "+message.username);
		new CliRenderer(message.shape.split('|'), message.model.split(''));
	},

	getGameStates: function() {
		kicked = [];
		for(username in this.games) {
			if(this.games[username].timestamp + 60 * 1000 < new Date().getTime()) {
					delete(this.games[username]);
					delete(this.users[username]);
					kicked.push(username);
					console.log(username+" kicked off server, last seen over a minute ago.");
			}
		}
		if(kicked.length > 0) FayeClient.publish('/game/userlist', {message:'Users '+kicked.join(',')+' were kicked.', users: this.users, kicked: kicked });
		return this.games;	
	},

	handleOutgoing: function(message, callback) {
		//console.log("Outgoing: \n", JSON.encode(message));
		
		callback(message);
	},



});

CliRenderer = new Class({

	initialize: function(shape,data) {
		this.data = data;
		this.chars = [' ','▓','▒','☻','#','█','☺','░'],
		this.draw(shape,data);
	},

	draw: function(points, data) {

		var insert = [];
		var c = 11;
		var l = points.length;

		for(var p,i=0; i<l; i++) {
			p = points[i];
			var at = p[0] + (p[1] * c);
			insert[at] = data;
		}

		var out = [];
		var l = 165;
		for(var i=0; i<l; i++) {
			var chara = this.getChar(insert[i] || data[i] || 0);
			out[i] = this.getChar(data[i] || 0);
			if((i + 1) % c == 0) {
				out[i] += "\n";
			}
		}
		console.log(out.join(''));
	},
		
	getChar: function(data) {
		return this.chars[data];
	},
});


new GameMaster('betatest');


sys.puts('Listening on ' + port);
