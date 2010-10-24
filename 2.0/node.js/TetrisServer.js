var fs    = require('fs'),
    path  = require('path'),
    sys   = require('sys'),
    http  = require('http'),
    faye  = require('./faye-node.js');
	mootools = require('./mootools-server.js');
	fayehook = require('./faye-hook.js');

require('./node-cli.js');

var PUBLIC_DIR  = path.dirname(__filename) + '/webserverroot',
    port        = '1234',
	contentTypes = { 'html' : 'text/html', 'css' : 'text/css', 'js' : 'text/javascript', 'png':'image/png' };

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
		//cli.move(0,4).clearLine().write("Incoming message for channel: "+message.channel);

		var channel = message.channel.split('/');
		channel.shift();

		switch(channel[0]) {
			case 'login':
				switch(channel[1]) {
					case 'canihazlogin':
						cli.move(3,4).clearLine().write("User wants to login: "+message.data.username);
						if(message.data.username && !this.users[message.data.username]) 
							{
								this.users[message.data.username] = {
									username: message.data.username,
									browser: message.data.browser,
									lastSeen: new Date().getTime()
								}
								this.users[message.data.username].index = this.getOnlineCount();
								FayeClient.publish('/login/ihazlogdin/'+encodeURIComponent(message.data.username)+'/ok', {'message': 'Welcome '+message.data.username+"! Hang on, starting the game.", users: this.users});
								FayeClient.publish('/login/ihazlogdin/'+encodeURIComponent(message.data.username)+'/performAction', { 
									message: 'starting game!!', options: { gameChannel: 'pimpmeister' , callBack: function() {  // this is executed on the client :D
										this.startGame();							
									}.toString()   }});
								FayeClient.publish('/game/userlist', {message: this.getOnlineCount()+' users online. Enjoy!', users: this.users });
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
						cli.move(5,4).clearLine().write("publishing users. "+this.getOnlineCount()+' online.');

						this.publishUserList({message: this.getOnlineCount()+' users online. Enjoy!'});
					break;
					case 'chat':
						message.data.message = message.data.message.replace('<', '&lt;').replace('>', '&gt;');
						cli.move(7,4).clearLine().write("[CHAT]: "+message.data.username+':'+ message.data.message);
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
				cli.move(3,4).clearLine().write("User want to logout: "+message.data.username);
			break;
			default: 
				cli.move(3,4).clearLine().write('Message received on unknown channel!', JSON.encode(channel), JSON.encode(message));
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
			cli.move(5,5).clearLine().write("Set game state found empty empty message, cancellng; ", JSON.encode(message));
			return;
		}
		if(!this.games[message.username] || message.timestamp){
			if(this.games[message.username]) {
				this.users[message.username].lastSeen= new Date().getTime();
				this.games[message.username] = message;
			}
			else {
				this.games[message.username] = message;

				if(!this.users[message.username]) {
					this.users[message.username] = this.users[message.username] = {
									username: message.username,
									browser: ['unknown',0],
									lastSeen: new Date().getTime()
								};
					this.users[message.username].index = this.getOnlineCount();
					this.publishUserList('New found: ', message.username);
				}
			}
		}
		if(!this.startedPublishing) { this.startPublishingGameStates(); }
		cli.move(3,4).clearLine().write("Game state for "+message.username+':');
		new CliRenderer(message.shapePoints, Rle.decode(message.model), this.users[message.username].index, message.username);
	},

	publishUserList: function(message, data) {
		FayeClient.publish('/game/userlist', Object.merge({message: message, users: this.users}, data));
	},

	getGameStates: function() {
		kicked = [];
		for(username in this.games) {
			if(this.users[username].lastSeen + 60 * 1000 < new Date().getTime()) {
					delete(this.games[username]);
					delete(this.users[username]);
					kicked.push(username);
					cli.move(4,4).clearLine().write(username+" kicked off server, last seen over a minute ago.");
			}
		}
		if(kicked.length > 0) this.publishUserList((kicked.length >1? 'Users '+kicked.join(',')+' were ' : 'User '+kicked[0]+' was ') + 'kicked due to inactivity', { kicked: kicked });
		return this.games;	
	},

	handleOutgoing: function(message, callback) {
		//cli.move(0,4).clearLine().write("Outgoing: \n", JSON.encode(message));
		
		callback(message);
	},



});

CliRenderer = new Class({
	
	initialize: function(shape,data, position, username) {
		this.username = username;
		this.position = position || 0;
		cli.move(14, 4 + ((this.position -1) * 15)).clearNext(15).write(this.username);
		this.data = data;
//		cli.move(0,4).clearLine().write(this.data);
		this.chars = [' ',
					'\x1B[0;34;44m▓\x1B[0;0m',
					'\x1B[0;35m▒\x1B[0;0m',
					'\x1B[0;36m☻\x1B[0;0m',
					'\x1B[0;33m#\x1B[0;0m',
					'\x1B[0;32m█\x1B[0;0m',
					'\x1B[0;35;35m☺\x1B[0;0m',
					'\x1B[0;31;31m░\x1B[0;0m'
		],
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
				// back c, down 1
				out[i] += '\033['+c+'D\033[1B';
			}
		}
		cli.move(15, 4 + (this.position -1)  * 15).write(out.join(''));
	},
		
	getChar: function(data) {
		return this.chars[data];
	},
});

/* custom rle encoder that maps our digits to aplphanum chars to make RLE encoding possible. */
var RLE = new Class({
	charMappings: {A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,L:11,M:12,N:13,O:14,P:15,Q:16,R:17,S:18,T:19,U:20,V:21,W:22,X:23,Y:24,Z:25},
	numberMappings: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],

	encode:function(input) {
		var encoding = "";

		Hash.each(input.match(/(.)\1*/g), function(substr){ encoding  += substr.length + "" +this.numberMappings[parseInt(substr[0])] }, this );
		this.decode(encoding);
		return encoding;
	},

	decode: function(encoded) {
		cli.move(35,4).clearLine().write(encoded);
		var output = "";
		Object.each(encoded.match(/([0-9]{1,})(\w)/g), function(a){
			var l = a.split(/([0-9]{1,})/g); 
			output += new Array(1 + parseInt(l[1])).join(this.charMappings[l[2]]);
		}, this );
		return output;
	}
});

Rle = new RLE();




new GameMaster('betatest');



cli.clear().move(38, 5).color('yellow', true, 'green').write('Node.js Tetris Server Listening on port:' + port).resetColor();
