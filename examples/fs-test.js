var fs = require('fs'),
outcome = require('../');

outcome.on('unhandledError', function(err) {

	console.log("ERROR")
	console.error(err.message);
});


var onOutcome = outcome().result(function() {
	console.log("RESULT")
}).error(function() {
	console.log("ERROR");
});

var onOutcome2 = outcome().result(function() {
	console.log("RESULT");
})

fs.stat(__filename, onOutcome);
fs.stat(__filename+'d', onOutcome2);


outcome.call(fs.stat, __filename).done(function() {
	console.log("DONE")
}).result(function() {
	console.log("G")
})