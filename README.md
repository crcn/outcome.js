## Motivation:

- Error handling can be very redundant.
- I find it personally cleaner when error / success code are kept separate.
- It becomes an easy habit *not* to handle errors, or write code which handles errors poorly.


### Old Way

```javascript
var fs = require('fs');

fs.stat('some/file.js', function(err, data) {
	
	if(err) {

		//do stuff

		return;
	}


	//do success stuff
});
```

### The Outcome.js way:

```javascript

fs.stat('some/file.s', outcome.success(function(data) {
	
	//do something with the result

}).error(function(err) {
	
	//do stuff with the error

}));
```

Here's another example using the traditional method of error handling:

```javascript

var fs = require('fs');

function doSomething(path, callback) {

	fs.realpath(path, onRealPath);

	function onRealPath(err, path) {
		if(err) return callback(err);
		fs.lstat(path, onStat);
	}

	function onStat(err, stats) {
		if(err) return callback(err);
		callback(err, stats);
	}

}
```

The outcome way:

```javascript

var fs  = require('fs'),
outcome = require('outcome');

function doSomething(path, callback) {
	
	var onResult = outcome.error(callback);

	//on success, call onRealPath. Any errors caught will be sent back
	//automatically
	fs.realpath(path, onResult.success(onRealPath));

	function onRealPath(path) {

		//on successful call of lstat, call onStat
		fs.lstat(path, onResult.success(onStat));
	}

	function onStat(stats) {

		//no errors, so send a response back
		callback(null, stats);
	}
}
```

## API

### outcome(listeners)

- `listeners` - object of the listeners you want to attach to the callback

```javascript

var onResult = outcome({
	
	//called when an error is caught
	error: function(error) {
		
	},

	//called when an error is NOT present
	success: function(result, thirdParam) {
		
	},

	//called back when an error, or result is present
	callback: function(err, result, thirdParam) {
		
	}
})

```

By default, any unhandled errors are thrown. To get around this, you'll need to listen for an `unhandledError`:

```javascript
outcome.on('unhandledError', function(error) {
	//report bugs here..., then throw again.
});


//fails
fs.stat('s'+__filename, outcome.success( function() {


});
```

### .copy()

Copies the current call chain. Useful for using one error handler, and many result handlers. See first example.

### .callback()

Called when on error/success. `Same as function(err, data) { }`

```javascript

fs.stat(__filename, outcome.error(function(err) {
	//handle error
}).success(function(data) {
	//handle result
}.callback(function(err, result) {
	//called on fn complete
});

```

### .success(fn)

Called on success

```javascript
var onOutcome = outcome.success(function(data) {
	
});

onOutcome(null, "success!");
```

### .error(fn)

Called on error

```javascript

var onOutcome = outcome.error(function(err) {
	
});

onOutcome(new Error("ERR"));
```

### .handle(fn)

Custom response handler

```javascript

outcome.handle(function(response) {
	
	if(response.errors) this.error(response);
	if(response.data) this.success(response);
});

```

