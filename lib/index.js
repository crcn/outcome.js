var EventEmitter = require('events').EventEmitter,

//used for dispatching unhandledError messages
globalEmitter = new EventEmitter(),

Structr = require('structr');


/**
 */

var wrapResultFn = function(em) {

	if(!em) em = new EventEmitter();
	
	return function() {
		var args = Array.apply(null, arguments);

		//error should always be first args
		err = args.shift();


		//if there is an error, and a result is *not* present, then continue
		if(err && !args[0]) {

			//error handler present? Sweet! pass it on...
			if(em.listeners('error').length) {

				em.emit('error', err);

			//no error callback? check of unhandled error is present, or throw
			} else if(!globalEmitter.emit('unhandledError', err)) {

				throw err;

			}

		} else {
			
			//pass the result on
			em.emit.apply(em, ['result'].concat(args));
		}
	}
}


/**
 * Pipes one event emitter to another
 */


var pipeEmit = function(from, type, to) {
	
	to.addListener(type, function() {

		to.emit.apply(to, [type].concat(arguments));

	});

}



var Chain = function(em, ret) {

	if(!em) em = new EventEmitter();

	if(!ret) ret = {};

	var self = {
		
		/**
		 */

		'call': function(fn) {

			//pass the arguments onto the function we're wrapping around
			var args = Array.apply(null, arguments).slice(1),
			em = new EventEmitter();

			console.log(args);

			//push the callback we're gonna pipe to
			args.push(wrapResultFn(em));

			//need to do next tick incase the function is syncronous (must be async)
			process.nextTick(function() {
				
				fn.apply(null, args);
					
			});

			return Chain(em, ret);
		},

		/**
		 */

		on: function(listeners) {
			
			for(var type in listeners) {
				
				em.addListener(type, listeners[type]);
					
			}
			
			return ret;
				
		},

		/**
		 * listens to target event emitter against listeners
		 */

		listen: function(em, listeners) {
			
			var child = Chain(em, ret);

			if(listeners) child.on(listeners);

			return child;

		},

		/**
		 */

		'throw': function(err) {
			
			throw err;

		},

		/**
		 * listens for a result
		 */

		'result': function(fn) {
			
			em.on('result', fn);
				
			return ret;

		},

		/**
		 * listens for an error
		 */

		'error': function(fn) {
			
			em.on('error', fn);

			return ret;

		},

		/**
		 * regular fn(err, result);
		 */

		'done': function(fn) {
			
			self.on({
				result: function() {
					fn.apply(null, [null].concat(Array.apply(null, arguments)));
				},
				error: function(err) {
					fn(err);
				}
			});

			return ret;

		},

		/**
		 * pipes emit to another event emitter
		 */

		'emit': function(target) {
			
			for(var type in em._events) {

				pipeEmit(em, type, target);

			}	

			return ret;
			
		}
	};

	Structr.copy(self, ret);

	return ret || self;
}

module.exports = function(listeners) {
	var em = new EventEmitter();
	return Chain(em, wrapResultFn(em)).on(listeners);
}

Structr.copy(Chain(), module.exports);


module.exports.on = function() {

	globalEmitter.on.apply(globalEmitter, arguments);

}