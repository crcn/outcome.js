```javascript

var fn = outcome.fn(function(data) {
	
	if(!data) throw new Error('Blarg');

	return result; //or this.result('success!');
});



fn(function(err, result) {
	
});
```