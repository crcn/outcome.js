
### Old Way

```javascript
var fs = require('fs');

fs.stat('some/file.js', function(err, result) {
	
	if(err) {
		//do stuff
		return;
	}


	//do success stuff
});
```

## Outcome API

### Function .outcome(callbacks)

```javascript
fs.stat(outcome({
	error: function(){},
	result: function(){}
}));
````

### .throw(error)

Throws an exception. 

```javascript
var outcome = require('outcome');

fs.stat(outcome({
	error: result.throwError,
	result: function(arg) {
		
	}
}));
```

By default, any unhandled error is thrown. To get around this, you'll need to listen for an `unhandledError`:

```javascript
outcome.on('unhandledError', function() {
	//report bugs here...
});


fs.stat(outcome({
	result: function(){}
}));
```


### CallChain .call(fn[, target])

Calls the given function

- `fn` - target function to be called
- `target` - target scope - for `this`

```javascript
outcome.call(fs.stat, fs).on({
	error: function() { },
	result: function() { }
});
```

### CallChain .on(typeOrEvents[, callback])

Listens for any events emitted by outcome - primarily `unhandledError`

- `typeOrEvent` - type of event (string), or object of events
- `callback` - callback for the listener

```javascript
outcome.on('unhandledError', function() {
	//DO STUFF
});

```

### CallChain .listen(EventEmitter)

Listens to the given event emitter.

```javascript
outcome.call(em).on({
	someEvent: function(){}
});
```

### CallChain .dispose()

Disposes current call chain (listeners)

## CallChain API

Same as as above 

### CallChain .on(typeOrEvents[, callback])

Listens for results - `error`, and `result` primarily.

- `typeOrEvent` - type of event (string), or object of events
- `callback` - callback for the listener

```javascript
outcome.call(fs.stat).on('error', function() {
	
}).on('result', function() {
	
});

//or 

outcome.call(fs.stat).on({
	error: function() {},
	result: function() {}
})
```