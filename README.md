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

	//wrap the callback around an error handler so any errors in *this* function
	//bubble back up to the callback - I'm lazy and I don't wanna write this stuff...
	var onResult = outcome.error(callback);

	//on success, call onRealPath. Any errors caught will be sent back
	//automatically
	fs.realpath(path, onResult.success(onRealPath));

	function onRealPath(path) {

		//ONLY call onStat if we're successfuly grabbed the file stats
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

- `listeners` - object of the listeners you want to attach to outcome.

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

As shown in the example above, you can also wrap-around an existing callback:

```javascript
var onResult = outcome.error(function(error) {
	
}).
success(function(result, thirdParam) {
	
}).
callback(function(error, result, thirdParam) {
	
});
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

### .callback()

Called when on error/success. `Same as function(err, data) { }`

Here's a redundant example:

```javascript

fs.stat(__filename, outcome.error(function(err) {
	//handle error
}).success(function(data) {
	//handle result
}.callback(function(err, result) {
	//called on fn complete regardless if there's an error, or success
}));

```

### .success(fn)

Called on success

```javascript
var onOutcome = outcome.success(function(data, anotherParam, andAnotherParam) {
	//handle success data
});

onOutcome(null, "success!", "more data!", "more results..");
```

### .error(fn)

Called on error

```javascript

var onOutcome = outcome.error(function(err) {
	
});

onOutcome(new Error("something went wrong...")); 
```

### .handle(fn)

Custom response handler

```javascript

outcome.handle(function(response) {
	
	if(response.errors) this.error(response);
	if(response.data) this.success(response);
});

```

