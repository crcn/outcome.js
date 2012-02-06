var EventEmitter = require('events').EventEmitter,

//used for dispatching unhandledError messages
globalEmitter = new EventEmitter();


var Chain = function(listeners) {

	if(!listeners) listeners = { };


	var self = function() {

		var args = Array.apply(null, arguments), orgArgs = arguments;

		if(listeners.callback) {

			listeners.callback.apply(this, args);

		}

		if(listeners.handle) {
			
			listeners.handle.apply(listeners, args);

		} else {

			//error should always be first args
			err = args.shift();

			//on error
			if(err) {

				listeners.error.call(this, err);

			} else
			if(listeners.success) {
				
				listeners.success.apply(this, args);

			}

		}	
		
	};

	self.listeners = listeners;

	//DEPRECATED
	self.done = function(fn) {

		return self.callback(fn);

	}

	
		
	self.copy =  function(childListeners) {

		//copy these listeners to a new chain
		for(var type in listeners) {
			
			if(childListener[type]) continue;

			childListeners[type] = listeners[type];

		}

		return Chain(childListeners);

	}


	self.handle = function(fn) {

		return self.copy({ handle: fn });
		
	}


	self.callback = function(fn) {
		
		return self.copy({ callback: fn });

	}


	self.success = function(fn) {
			
		return self.copy({ success: fn });

	}

	self.error = function(fn) {

		return self.copy({ error: fn });

	};


	//error does not exist? set the default which throws one
	if(!listeners.error) {
		listeners.error = function(err) {

			//no error callback? check of unhandled error is present, or throw
			if(!globalEmitter.emit('unhandledError', err) && !listeners.callback) throw err;

		}
	}

	//self.error(listeners.error);

	return self;
}


module.exports = function(listeners) {
	return Chain(listeners);
}


//ability to listen for unhandledError
module.exports.on = function() {

	globalEmitter.on.apply(globalEmitter, arguments);

}

module.exports.chain = Chain;

var chain = Chain();

Object.keys(chain).forEach(function(prop) {
	
	module.exports[prop] = function() {
		
		var child = Chain();

		return child[prop].apply(child, arguments);
	}
})




