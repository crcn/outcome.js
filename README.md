
### Old Way

```javascript
var fs = require('fs');

fs.stat('some/file.js', function(err, data) {
	
	if(err) {
		//do stuff, or throw
		return;
	}


	//do success stuff
});
```

## Outcome API


### .outcome(listeners)

- `listeners` - success, or error

```javascript


var resultHandler = outcome.error(function(err) {
	console.log(err);
});

//success
fs.stat(__filename, resultHandler.copy().success(function(data) {
	//do stuff
}));

//success
fs.stat(__filename, resultHandler.copy().success(function(data) {
	//do stuff
})); 

//this fails - error is passed to above func
fs.stat('s'+__filename, resultHandler.copy().success(function(data) {
	//do stuff
})); 


````

Or

```javascript
var onOutcome = outcome({
	success: function() {
		console.log("SUCCESS");
	},
	error: function() {
		console.log("ERROR");
	}
});

fs.stat(__filename, onOutcome);

```


By default, any unhandled errors are thrown. To get around this, you'll need to listen for an `unhandledError`:

```javascript
outcome.on('unhandledError', function(error) {
	//report bugs here..., then throw again.
});


//fails
fs.stat('s'+__filename, outcome({
	success: function(){}
}));
```

### .copy()

Copies the current call chain. Useful for using one error handler, and many result handlers. See first example.

### .done()

Called when on error/success. `Same as function(err, data) { }`

```javascript

fs.stat(__filename, outcome.error(function(err) {
	//handle error
}).success(function(data) {
	//handle result
}.done(function(err, result) {
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

