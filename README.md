
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
	error: outcome.throw,
	result: function(arg) {
		
	}
}));
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


### CallChain .call(fn[, target][, events])

Calls the given function

- `fn` - target function to be called
- `target` - target scope - for `this`

```javascript
outcome.call(fs.stat, null, fs).on({
	error: function() { },
	result: function() { }
});

//or
outcome.call(fs.stat, fs, {
	error: function() { },
	result: function() { }
})
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

### CallChain .listen(EventEmitter[, events])

Listens to the given event emitter.

```javascript
outcome.listen(em).on({
	someEvent: function(){}
});

//or

outcome.listen(em, {
	someEvent: function(){}
});
```

### CallChain .emit(EventEmitter)

Pipes events to target event emitter

```javascript
outcome.call(fs.stat).emit(em);
```

### CallChain .next()

Calls the next function after call - returns a new chain (flow-control).

```javascript
outcome.call(fs.stat, {
	result: function() {
		
	}
}).next(fs.readFile, {
	result: function() {
		
	}
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