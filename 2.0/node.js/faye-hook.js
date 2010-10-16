
FayeHook = new Class({
	// adds a hook to faye.
	_extendServer: function(stage, extension) {
		var object = { added: function() { this._active = true; } };
		object[stage] = function() {
		  extension.apply(this, arguments);
		};
		commChannel.addExtension(object);
	},

	// callback should have 2 params:message, callback.
	// fire callback(message) on success, don't to cancel.
	hookIncoming: function(cb) {
		// skip the default meta noise.
		this._extendServer('incoming', function(message, callback) 
		{
			if(message.channel.indexOf('/meta/') == 0) {
				return callback(message);
			} else {
				this.callbackFunc(message, callback);
			}
		}.bind({callbackFunc: cb}));
	},

	// callback should have 2 params:message, callback.
	// fire callback(message) on success, don't to cancel.
	hookOutgoing: function(cb) {
		this._extendServer('outgoing', function(message, callback) 
		{
			if(message.channel.indexOf('/meta/') == 0) {
				return callback(message);
			}
			else {
				this.callbackFunc(message, callback);
			}
		}.bind({callbackFunc: cb}));
	}
});