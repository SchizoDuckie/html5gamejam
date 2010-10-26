
var GameClient = new Class({
	
	Implements: [Options, Events],

	initialize: function( options) {
		this.setOptions(options);
		$('game').get('slide').hide();
		$('onlinewrap').get('slide').hide();
		$('gamestatus').get('slide').hide();
		$('username').focus();
		$('loginbutton').removeProperty('disabled');
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

	tSpinTest: function() {
		dbg("Testing  T-Spin!");
		if(this.player1) {
			this.player1.model.data = RLE.decode('108A1G3A2G5A8G3A9G2A8G3A9G1A3G');
			this.player1.factory.queue[0] = this.player1.factory.newShape(5);
			this.player1.factory.queue[1] = this.player1.factory.newShape(5);
			this.player1.factory.queue[2] = this.player1.factory.newShape(5);
			this.player1.shape = this.player1.factory.newShape(5);
			this.player1.renderer.draw(this.player1.model, this.player1.shape);
		}
	},

	pause: function() {
		if(!this.stopped) {
			this.stopped = true;
			this.player1.stop(true);
			$("pause").set('value', 'resume');
		} else {
			this.stopped = false;
			this.player1.resume();
			$("pause").set('value', 'pause');
		}

	},
	
	login: function(e) {
		e.stop();
		this.username =  $('username').get('value');
		$('loginbutton').set('disabled', 'disabled');
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
				$('loginbutton').removeProperty('disabled');
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
			status.set('html', msg.message || msg);
			slider.wait(3500).slideOut();
		}
	},

	handleAuthAction: function(message) {
		if(message.message) this.showMessage(message.message);
		$('loginbutton').removeProperty('disabled');

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
				$(this.mockGames[user].renderer.getContainer()).getParent().destroy();
				this.mockGames[user] = null;
				delete this.mockGames[user];
			}, this);
		}
	},

	handleMockGames: function(games) {
		Hash.each(games, function(game, username) {
			var user = username;
			if(games[username].username && user != this.username) {
				if(!this.mockGames[user]) {
					try
					{
						var el;
						var remote = new Tetris.Remote();
						$("mocks").adopt(el = new Element('div', { html: '<strong>'+user+'</strong>' }));
						this.mockGames[user] = new Tetris({
							target: el,
							renderer:	Tetris.CanvasRenderer,
							controller: remote,
							cols: 11,
							rows: 15,
							width: 110,
							height: 150
						});

					}
					catch (E)
					{
						debugger;
					}
				} else {

					try
					{
					// pass the new data to the game. It registered the newData event.
						this.mockGames[user].fireEvent('newData', game);						
					}
					catch (E)
					{
						dbg(E);
					}

				}

			}
		}, this);
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
			103 : Tetris.ROTATE_LEFT,
			36: Tetris.ROTATE_LEFT,
			33: Tetris.ROTATE_RIGHT,
			38: Tetris.ROTATE_RIGHT,
			104: Tetris.ROTATE_RIGHT,
			83: Tetris.ROTATE_RIGHT,
			37: Tetris.MOVE_LEFT, 
			100: Tetris.MOVE_LEFT, 
			39: Tetris.MOVE_RIGHT,
			102: Tetris.MOVE_RIGHT,
			40: Tetris.MOVE_DOWN,
			98: Tetris.MOVE_DOWN,
			12: Tetris.DROP,
			101: Tetris.DROP,
			32: Tetris.DROP,
			80: Tetris.PAUSE
		}
		});


		var renderer = Browser.name == 'ie' ? Tetris.DivRenderer : Tetris.CanvasRenderer;
		if(Browser.name == 'ie') {
			new Element('p').addClass('ieFails').set('html', 'You have an inferior browser. Now bow to our ASCII Renderer!').injectInside(document.body).get('slide').hide().slideOut();
		}
		var mouse = new Tetris.Mouse();
		this.player1 = new Tetris({
			target: $('game'),
			renderer:renderer,
			controller: arrowKeys,
			cols: 11,
			rows: 15,
			width: 220,
			height: 300
		});

		this.player1.addEvent('heartbeat', this.publishGameState.bind(this));
		this.player1.addEvent('gameover', this.highScoreCheck.bind(this));
		this.mockGames = {};

		this.pubSub('/game/chat', { username:this.username, message: 'Just entered the game room' }, '/game/chat', this.handleChat);
		this.pubSub('/game/getuserlist', { username: this.username }, '/game/userlist', this.handleOnlineUsers.bind(this));
		this.pubSub('/game/savestate/'+this.username, {username: this.username, timestamp: new Date().getTime()}, '/game/states', this.handleMockGames.bind(this));

	},

	highScoreCheck: function() {
		var ls = new LocalStorage();
		if(this.player1.scoring.score >  ls.get('globalHighscore')) {
			if(confirm('New Highscore! Want to save your result of '+this.player1.scoring.score+' @ level'+this.player1.scoring.level+'?')) {
				ls.set('globalHighscore', this.player1.scoring.score);
				var highscores = ls.get('highscores') || new Array();
				var score = this.player1.scoring;
				score.timestamp = new Date().getTime();
				score.username = this.username;
				highscores.unshift(score);
				ls.set('highscores', highscores);
			}
		}
		if(confirm('Again?')) { this.player1.reset() } else { this.player1.stop(); }
	},

	showHighscores: function() {
		var ls = new LocalStorage();
		var highscores = ls.get('highscores');
		dbg('hiscores found!', highscores);
		if(highscores) {
			var out = "<tr><th>"+['Rank','Points','Level','User','Time'].join("</th><th>")+"</th></tr>";
			for(i=0; i<highscores.length; i++) {
				out += "<tr><td>"+["#"+(i +1),highscores[i].score,highscores[i].level,highscores[i].username,new Date(highscores[i].timestamp).toString().split(' ').slice(0,5).join(' ')].join("</td><td>") + "</td><tr>";
			}
			new Element('div', {id: 'highscores'}).adopt(
				new Element('h4', {text: 'Local highscores'}),
				new Element('table', {html: out}),
				new Element('button', {text:'close', events: {'click': function() { $('highscores').dispose(); }}})
				).inject(document.body,  'top');
		}
		else {
			alert("No highscores yet! Go play!");
		}
	},

	powerupTest: function() {

		this.player1.model.recursiveDrop();

	},


	cleanupKicked: function(kicked) {
		dbg("Received kicked message", kicked);
	},

	publishGameState: function(state) {
		window.commServer.publish('/game/savestate/'+this.username, { 
				username: this.username, 
				shapeData: state.shapeData, 
				shapePoints:state.shapePoints, 
				score: state.score,
				model: RLE.encode(state.model.join('')), 
				timestamp: new Date().getTime()
		});
	}




});


/* custom rle encoder that maps our digits to aplphanum chars to make RLE encoding possible. */
var RLE = new Class({
	numberMappings: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	
	encode:function(input) {
		var encoding = "", 
			enc = /(.)\1*/g, 
			m= input.match(enc);

		for(i=0;i<m.length;i++) {
			encoding += m[i].length + this.numberMappings[m[i][0]];
		}
		return encoding;
	},

	decode: function(encoded) {
		var output = "";
		var s = encoded.split(/([A-Z])/);
		for(i=0; i<s.length -1; i+=2) {
			output += new Array(1 + parseInt(s[i])).join(this.numberMappings.indexOf(s[i+1]));
		} 
		output = output.split('');
		for(i=0;i<output.length;i++) { output[i] = parseInt(output[i]); }
		return output;
	}
});

window.RLE = new RLE();