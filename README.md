

## Motivation:

- Error handling can be very redundant.
- I find it cleaner, and easier to maintain when error / success code are kept separate.
- It becomes an easy habit *not* to handle errors, or write code which handles errors poorly.


#### The old way:

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

doSomething('/path/to/something', function(err, result) {
	
	if(err) {
		//do something with error
		return;
	}

	//do something with result
})
```

#### The outcome.js way:

```javascript

var fs  = require('fs'),
outcome = require('outcome');

function doSomething(path, callback) {

	//wrap the callback around an error handler so any errors in *this* function
	//bubble back up to the callback - I'm lazy and I don't wanna write this stuff...
	var on = outcome.error(callback);

	//on success, call onRealPath. Any errors caught will be sent back
	//automatically
	fs.realpath(path, on.success(onRealPath));

	function onRealPath(path) {

		//ONLY call onStat if we're successfuly grabbed the file stats
		fs.lstat(path, on.success(onStat));
	}

	function onStat(stats) {

		//no errors, so send a response back
		callback(null, stats);
	}
}


var on = outcome.error(function(error) {
	//do something with error
});

doSomething('/path/to/something', on.success(function(response) {
	//do something with result
}));

```

## API

### outcome(listeners)

- `listeners` - Object of listeners you want to attach to outcome.

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

Here's how I like to do it:

```javascript

function doSomething(ops, callback) {
	
	//the FIRST part of the function wraps around the callback for errors
	var on = outcome.error(callback);

	//the "on" var is then passed to other async functions only to handle results. 
	//Errors are ALWAYS bubbled up to the original caller, or handled wherever it 
	//seems logical.

	//example:
	fs.stat(ops.path, on.success(onStatSuccess));

	//The result handler. No error handling here! 
	function onStatSuccess(stats) {
		
	}

}

```

By default, any unhandled errors are thrown. To get around this, you'll need to listen for an `unhandledError`:

```javascript
outcome.on('unhandledError', function(error) {
	//report bugs here..., then throw again.
});


//fails
fs.stat('s'+__filename, outcome.success(function() {


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

Called on Success.

```javascript
var onOutcome = outcome.success(function(data, anotherParam, andAnotherParam) {
	//handle success data
});

onOutcome(null, "success!", "more data!", "more results..");
```

### .error(fn)

Called on error.

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


### Note

Calling `.error()`, `.success()`, `.callback()` generates a new function which copies the previous listeners. 
Checkout [fs-test](outcome.js/blob/master/examples/fs-test.js) in the [examples](outcome.js/blog/master/examples) folder.
