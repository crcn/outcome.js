
### Old Way

```javascript
var fs = require('fs');

fs.stat('some/file.js', function(err, result) {
	
	if(err) {
		//do stuff, or throw
		return;
	}


	//do success stuff
});
```

## Outcome API


### .outcome(listeners)

- `listeners` - result, or error

```javascript


var resultHandler = outcome.error(function(err) {
	console.log(err);
});

//success
fs.stat(__filename, resultHandler.copy().result(function(result) {
	//do stuff
}));

//success
fs.stat(__filename, resultHandler.copy().result(function(result) {
	//do stuff
})); 

//this fails - error is passed to above func
fs.stat('s'+__filename, resultHandler.copy().result(function(result) {
	//do stuff
})); 


````

Or

```javascript
var onOutcome = outcome({
	result: function() {
		console.log("RESULT");
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


fs.stat(outcome({
	result: function(){}
}));
```





## CallChain API

### .done()

Called when on error/result. `Same as function(err, result) { }`


### .result(fn)

Called on success/result

```javascript
outcome.call(fs.stat).result(function(result) {
	
});
```

### .error(fn)

Called on error

```javascript
outcome.call(fs.stat).error(function(err) {
	//handle error
});
```