
var GameClient = new Class({
	
	Implements: [Options, Events],

	initialize: function( options) {
		this.setOptions(options);
		$('game').get('slide').hide();
		$('onlinewrap').get('slide').hide();

		$(this.options.loginform).addEvent('submit', this.login.bind(this));
		$('postMessage').addEvent('submit', this.postToChat.bind(this));
 		window.addEvent('beforeunload', this.logout.bind(this));
//this.startGame();
	},
	
	login: function(e) {
		e.stop();
		this.username =  $('username').get('value');
		try
		{
			window.commServer.publish('/login/canihazlogin', { username:this.username, browser: [Browser.name, Browser.version] });
			window.commServer.subscribe('/login/ihazlogdin/'+encodeURIComponent(this.username)+'/*', this.handleAuthAction.bind(this), this); 			
		}
		catch (E)
		{
			if(E.toString().indexOf(' is not a valid channel name') > -1) {
				if(this.username == '') {
					this.showMessage("Please choose a username");
				} else {
					this.showMessage("Please choose a username without weird characters.");
				}
			} else {
				alert(E);
			}
		}

	
	},

	showMessage: function(msg) {
		if(msg) {
			$('loginstatus').set('text', msg).get('slide').slideIn();
		}
	},

	handleAuthAction: function(message) {
		console.debug('New message received! ', message)

		if(message.options && message.options.callBack) {
		
			eval("cbFunc = "+message.options.callBack+";");
			cbFunc.bind(this)();

		}

	},

	logout: function() {
		window.commServer.publish('/login/kthxbye', { username: this.username });
	},

	

	userlist: function() {
		

	},



	postToChat: function(e) {
		e.stop();
		window.commServer.publish('/game/chat/', {message: $('postMessage').value});
		$('postMessage').value = '';
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

	}
	


});