var fs = require('fs'),
outcome = require('../'),
EventEmitter = require('events').EventEmitter;


var onResult = outcome.error(function(err) {
	console.log(err);
}).success(function(result) {
	console.log(result)
});



var onResult2 = onResult.copy().success(function(result) {
	
	console.log("RESULT")
}).done(function(err, result) {
	console.log('DONE')
})
 
fs.stat(__filename, onResult);
fs.stat(__filename, onResult2);
fs.stat('s'+__filename, onResult2);

