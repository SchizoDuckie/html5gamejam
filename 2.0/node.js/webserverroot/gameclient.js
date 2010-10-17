
var GameClient = new Class({
	
	Implements: [Options, Events],

	initialize: function( options) {
		this.setOptions(options);
		$('game').get('slide').hide();
		$('onlinewrap').get('slide').hide();
		$('gamestatus').get('slide').hide();
		$('username').focus();
		$(this.options.loginform).addEvent('submit', this.login.bind(this));
		$('postMessage').addEvent('submit', this.postToChat.bind(this));
		oldUnload = window.onbeforeunload;
		window.unbeforeunload = function() { this.logout(); oldUnload(); }.bind(this);
	},

	// execute publish an action to the server and init subCallback on subChannel on datareceive.
	pubSub: function(pubChannel, data, subChannel, subCallback, justOnce) {
		justOnce = justOnce || false;
		if(justOnce) {

			var subCall = subCallback;
			var subChan = subChannel;
			subCallback = function(message, callback) { 
				subCall(message,callback); 
				window.commServer.unsubscribe(subChan); 

			};
		}
		window.commServer.subscribe(subChannel, subCallback); 			
		window.commServer.publish(pubChannel, data);

	},
	
	login: function(e) {
		e.stop();
		this.username =  $('username').get('value');
		try
		{	
			var subChannel = '/login/ihazlogdin/'+encodeURIComponent(this.username)+'/*';
			this.pubSub('/login/canihazlogin',  {username:this.username, browser: [Browser.name, Browser.version] }, subChannel, this.handleAuthAction.bind(this));
		}
		catch (E)
		{
			if(E.toString().indexOf(' is not a valid channel name') > -1) {
				if(this.username == '') {
					this.showMessage("Please choose a username");
				} else {
					this.showMessage("Please choose a username without any funky characters or spaces. Allowed: A-Za-z0-9-_.");
				}
			} else {
				alert(E);
			}
		}

	
	},

	showLoginMessage: function(msg) {
		if(msg) {
			$('loginstatus').set('text', msg);
		}
	},

	showMessage: function(msg) {
		if(!slider) {
			var status = $('gamestatus');
			var slider = status.set('slide',{ link: 'chain' }).get('slide');
			slider.hide();

		}
		if(msg) {
			slider.slideIn();
			status.set('html', msg);
			slider.wait(3500).slideOut();
		}
	},

	handleAuthAction: function(message) {

		if(message.message) this.showMessage(message.message);
		if(message.options && message.options.callBack) {
		
			eval("cbFunc = "+message.options.callBack+";");
			cbFunc.bind(this)();
		}

	},

	handleChat: function(message) {

		new Element('li').set('html', '<b>'+message.username+'</b>'+new Date().getTime()+'<br>'+message.message).inject($('stream'), 'top');
	},

	logout: function() {
		window.commServer.publish('/login/kthxbye', { username: this.username });
	},


	handleOnlineUsers: function(message) {
	   if(message.message) {
			this.showMessage(message.message)
	   }	
 	   $('online').set('html', '');
		Hash.each(message.users, function(user, data) {
			 new Element('li').set('html', user.username+'<small>('+user.browser[0]+' v'+user.browser[1]+")</small>").injectInside($('online'));
		});

		if(message.kicked) {
			Hash.each(message.kicked, function(user) {
				if($(user)) { 
					$(user).get('slide').slideIn();
				}				
			});
		}
	},

	handleMockGames: function(games) {
		for (var username in games)
		{
			if(games[username].username && username != this.username) {
				if(!this.mockGames[username]) {
					var newContainer = new Element('DIV', {id: username}).injectInside($("mocks"));
					newContainer.set('html', '<strong>'+username+'</strong>');
					var remote = new Tetris.Remote();

					this.mockGames[username] = new Tetris({
						target: newContainer,
						renderer:	Tetris.CanvasRenderer,
						controller: remote,
						cols: 11,
						rows: 15,
						width: 110,
						height: 150
					});
				}
				// pass the new data to the game. It registered the newData event.
				this.mockGames[username].fireEvent('newData', games[username]);
			}
		}
	},
	

	postToChat: function(e) {
		e.stop();
		window.commServer.publish('/game/chat', {username: this.username, message: $('message').get('value')});
		$('message').set('value', '');
	},

	startGame: function() {

		$('loginForm').get('slide').slideOut();
		$('onlinewrap').get('slide').slideIn();
		$('game').get('slide').slideIn();

		var arrowKeys = new Tetris.Keyboard({ 
			map:{ 
				65: Tetris.ROTATE_LEFT,
				36: Tetris.ROTATE_LEFT,
				33: Tetris.ROTATE_RIGHT,
				38: Tetris.ROTATE_RIGHT,
				83: Tetris.ROTATE_RIGHT,
				37: Tetris.MOVE_LEFT, 
				39: Tetris.MOVE_RIGHT,
				40: Tetris.MOVE_DOWN,
				12: Tetris.DROP,
				32: Tetris.DROP
			}
		});


		var renderer = Browser.name == 'ie' ? Tetris.TextRenderer : Tetris.CanvasRenderer;
		if(Browser.name == 'ie') {
			new Element('p').addClass('ieFails').set('html', 'You have an inferior browser. Now bow to our ASCII Renderer!').injectInside(document.body).get('slide').hide().slideOut();
		}
		var mouse = new Tetris.Mouse();
		var player1 = new Tetris({
			target: $('game'),
			renderer:renderer,
			controller: arrowKeys,
			cols: 11,
			rows: 15,
			width: 220,
			height: 300
		});

		player1.addEvent('drop', this.publishGameState.bind(this));
		this.mockGames = {};

		this.pubSub('/game/chat', { username:this.username, message: 'Just entered the game room' }, '/game/chat', this.handleChat);
		this.pubSub('/game/getuserlist', { username: this.username }, '/game/userlist', this.handleOnlineUsers.bind(this));
		this.pubSub('/game/savestate/'+this.username, {username: this.username, timestamp: new Date().getTime()}, '/game/states', this.handleMockGames.bind(this));

	},

	cleanupKicked: function(kicked) {
		if(window.console) console.log("Received kicked message", kicked);
	},

	publishGameState: function(state) {
		window.commServer.publish('/game/savestate/'+this.username, { username: this.username, shape: state.shape.join('|'), model: state.model.join(''), timestamp: new Date().getTime()});
	}


});