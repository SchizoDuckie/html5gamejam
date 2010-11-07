var fs    = require('fs'),
    path  = require('path'),
    sys   = require('sys'),
    http  = require('http'),
    faye  = require('./faye-node.js');
	mootools = require('./mootools-server.js'),
	fayehook = require('./faye-hook.js');

require('./node-cli.js');

var Tets = (function() {
	
	var _random = Math.random;
	
	/**
	 * Tets
	 */
	var Tets = new Class({
		Implements: [Events, Options],
	
		initialize: function () {
			this.events = new Tets.EventDispatcher(options);
			this.commserver = new Tets.CommServer(options);
			this.webserver = new Tets.WebServer(options);
			this.channelserver =  new Tets.ChannelServer(options);
			this.gameserver = new Tets.GameServer(options);
		
		}
	});


	// the target for all the events
	Tets.EventDispatcher = new Class({
		Implements: [Options, Events],

		initialize: function(options) {
			this.setOptions(options);
			this.addEvent('login', this.login)
		}
	});

	/**
	 * The HTTP Server that serves static files.
	 */
	Tets.WebServer = new Class({
		initialize: function() {
			this.server = http.createServer(this.callback);
		}
		
		callback: function(request, response) {

			  Monomi.detectBrowserType(request),


			var path = (request.url === '/') ? '/index.html' : request.url;
			fs.readFile(PUBLIC_DIR + path, function(err, content) {
			try {
				var contentType = contentTypes[path == '/index.html' ? 'html' : request.url.split('.').pop()] || 'text/html';

				response.writeHead(200, {'Content-Type': contentType });
				response.write(content);
				response.end();		  
			} catch (e) {  response.end();  }
			});	  
		}
	});

	/**
	 * The COMET Server, Currently running faye.NodeAdapter
	 * Knows about the users currently online, manages their online status
	 * Sends out messages to the clients and receives new events from them.
	 */
	Tets.CommServer = new Class({
		Extends: FayeHook,
		Implements: [Options, Events],
		defaultOptions: {
			mountpoint: '/tetsyourself',
				timeout: 500
		},
		initialize: function(options) {
			this.setOptions(options, this.defaultOptions);
			this.commChannel = new faye.NodeAdapter(this.options);		
			this.hookIncoming(this.handleIncoming.bind(this));
			this.hookOutgoing(this.handleOutgoing.bind(this));
		},

		setWebserver: function(server) {
			this.commChannel.attach(server);
		},


		handleIncoming: function(message, callback) {
			// dispatch incoming messages based on channels
			
			var channel = message.channel.split('/');
			channel.shift();

			callback(message);
		},
	

		handleOutgoing: function(message, callback) {
			//cli.move(0,4).clearLine().write("Outgoing: \n", JSON.encode(message));
			
			callback(message);
		},			

		handleOutgoing: function(message, callback) {
			//cli.move(0,4).clearLine().write("Outgoing: \n", JSON.encode(message));
			
			callback(message);
		}
	});


	Tets.UserList = new Class({


		addUser: function(user) {

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


		/**
		 * Chuck Roundhouse kicks inactive users.
		 */
		chuckNorris: function() {
			kicked = [];
			for(username in this.games) {
				if(this.users[username].lastSeen + 60 * 1000 < new Date().getTime()) {
						delete(this.games[username]);
						delete(this.users[username]);
						kicked.push(username);
						cli.move(4,4).clearLine().write(username+" kicked off server, last seen over a minute ago.");
				}
			}
			if(kicked.length > 0) this.events.fireEvent('users:kicked', { 
					message: 'Users '+ (kicked.length > 1 ? kicked.join(',')+' were ' : 'User '+kicked[0]+' was ') + 'kicked due to inactivity', 
					kicked: kicked 
			});
		},

		getUserList: function() {
			this.chuckNorris();
			this.events.fireEvent('users:userlist', this.users);

		}



	});


	/**
	 * The Channel Server, Handles both chat and game channels
	 */
	Tets.ChannelServer = new Class({

		
		incomingMessageFilter: function(message) {

			message.data.message = message.data.message.replace('<', '&lt;').replace('>', '&gt;');
			
		},

		publishUserList: function(message, data) {
			FayeClient.publish('/game/userlist', Object.merge({message: message, users: this.users}, data));
		},



	});

	/** 
	 * The Game Server, gets kicked in when one or more user from a channel start a game
     * Handles gamestates for all active games, dispatches game events like new, start, gameover, powerup distribution
	 */
	Tets.GameServer = new Class({
		

		saveGameState: function(message) {
			message.data.username = channel[2];
			if(message.data.model) {
				this.setGameState(message.data);
			}
		},
		
		publishGameStates: function() {
			if(!this.startedPublishing) {
				this.startPublishingGameStates();
			}
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


	});

	return Tets;

})();