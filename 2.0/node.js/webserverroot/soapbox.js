Soapbox = {
  /**
   * Initializes the application, passing in the globally shared Bayeux
   * client. Apps on the same page should share a Bayeux client so
   * that they may share an open HTTP connection with the server.
   */
  init: function(bayeux) {
    var self = this;
    this._bayeux = bayeux;
    
    this._login   = $('#enterUsername');
    this._app     = $('#app');
    this._follow  = $('#addFollowee');
    this._post    = $('#postMessage');
    this._stream  = $('#stream');
    this._online = $('#online');
    this._app.hide();
    
	
    // When the user enters a username, store it and start the app
    this._login.submit(function() {
      self._username = $('#username').val();
      self.launch();
      return false;
    });
  },
  
  /**
   * Starts the application after a username has been entered. A
   * subscription is made to receive messages that mention this user,
   * and forms are set up to accept new followers and send messages.
   */
  launch: function() {
    var self = this;
    this._bayeux.subscribe('/mentioning/' + this._username, this.accept, this);
	this._bayeux.subscribe('/user/online', this.online, this);
	this.knownusers = {};
	var un = this._username;
	this.online({known: { un : { user: this._username, message: navigator.userAgent }}});
	this.post('this is an automatic test message from '+this._username);
	this.games = {};
	/*server = new Tetris.CometServer({
				username: this._username,
				commserver: this._bayeux,
				datachannel: 'tetris/game'})*/

	/*this.Tetris = new Tetris({
		target: document.body,
		renderer: Tetris.CanvasCometRenderer,
		factory: Tetris.ShapeFactory,
		dataserver: server,
		cols: 11,
		rows: 15,
		width: 220,
		height: 300
	});
	    */
    // Hide login form, show main application UI
    this._login.fadeOut('slow', function() {
      self._app.fadeIn('slow');
    });
    
    // When we add a follower, subscribe to a channel to which the
    // followed user will publish messages
   
    
    // When we enter a message, send it and clear the message field.
    this._post.submit(function() {
      var msg = $('#message');
      self.post(msg.val());
      msg.val('');
      return false;
    });
  },

  online: function(userlist) {
      needtoannounce = false;
	    for(hai in userlist.known) {
			hai = userlist.known[hai];
			if(!this.knownusers[hai.user]) {
				this.knownusers[hai.user] = hai;
				this._bayeux.subscribe('/from/' + hai.user, this.accept, this);
/*
				var game = new MockTris({
					target: document.body,
					renderer: Tetris.CanvasRenderer,
					dataclient: Tetris.CometClient,
					commserver: this._bayeux,
					datachannel: 'tetris/game',
					username: hai.user,
					cols: 11,
					rows: 15,
					width: 220,
					height: 300
				});

				this.games[hai.user].game = game;
*/
				needtoannounce = true;
				this._online.prepend('<li><b>'+hai.user+'</b><br><small style="font-size:9px; color: gray;">'+hai.message+'</small></li>');
			} 
		}
		if(needtoannounce || !userlist.known[this._username]) this._bayeux.publish('/user/online', { known: this.knownusers});
  },


  
  /**
   * Sends messages that the user has entered. The message is scanned for
   * @reply-style mentions of other users, and the message is sent to those
   * users' channels.
   */
  post: function(message) {
    var mentions = [],
        words    = message.split(/\s+/),
        self     = this,
        pattern  = /\@[a-z0-9]+/i;
    
    // Extract @replies from the message
    
    message = new Date().getTime()+'|||<small style="font-size:9px;">posted @'+new Date().toGMTString()+'</small><br>'+message+'';
    // Message object to transmit over Bayeux channels
    message = {user: this._username, message: message};
    
    // Publish to this user's 'from' channel, and to channels for any
    // @replies found in the message
    this._bayeux.publish('/from/' + this._username, message);
    $.each(mentions, function(i, name) {
      self._bayeux.publish('/mentioning/' + name, message);
    });
  },
  
  /**
   * Handler for messages received over subscribed channels. Takes the
   * message object sent by the post() method and displays it in
   * the user's message list.
   */
  accept: function(message) {
	  msg = message.message.split('|||');
	 origintime = msg[0];
		now = new Date().getTime()
    this._stream.prepend('<li><b>' + message.user + '</b> ' +
                                     msg[1] + '<br><small style="font-size:9px; font-style:italic" >Latency (client->server->client): '+(now - origintime) +"ms.</small></li>");
  }
};

