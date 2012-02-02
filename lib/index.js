var EventEmitter = require('events').EventEmitter,

//used for dispatching unhandledError messages
globalEmitter = new EventEmitter(),

_ = require('underscore');


var Chain = function(listeners, parent) {

	if(!listeners) listeners = { };

	//var callbackListeners = [],
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
		

		/*callbackListeners.forEach(function(fn) {
			fn.apply(null, orgArgs);
		});*/
		
	};

	self.listeners = listeners;

	//deprecated
	self.done = function(fn) {

		return self.callback(fn);

	}

	self.callback = function(fn) {
		
		//callbackListeners.push(fn);
		listeners.callback = fn;
		return self;

	}
		
	self.copy =  function(childListeners) {

		return Chain(_.extend({}, listeners,  childListeners || {}), self);

	}

	self.handle = function(fn) {

		listeners.handle = 	fn;
		return self;
		
	}


	self.success = function(fn) {
			
		listeners.success = fn || function(){};

		return self;
	}

	self.error = function(fn) {

		listeners.error = fn || function(err) {

			//no error callback? check of unhandled error is present, or throw
			if(!globalEmitter.emit('unhandledError', err) && !listeners.callback) throw err;

		}
			
		return self;
	};

	self.error(listeners.error);

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




