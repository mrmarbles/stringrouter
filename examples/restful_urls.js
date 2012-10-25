var http = require('http'),
	stringrouter = require('stringrouter');

var router = stringrouter.getInstance();

router.bindPattern('/echo/{text}');
router.bindPattern('/hello/world.{extension}');

router.bindPattern('/hello/world', function(params, callback) {
	params.hello = 'world';
	callback.call(undefined, undefined, params);
});

/**
 * match this pattern with /user/1234
 */
router.bindPattern('/user/{id:[0-9]+}', function(params, callback) {
	console.log("You've hit the first /user/ url.");
	callback.call(undefined, undefined, params);
});

/**
 * Match this pattern with /user/some-user-name_here
 */
router.bindPattern('/user/{username:[\\w\\_\\-]+}', function(params, callback) {
	console.log("You've hit the second /user/ url.");
	// we can augment the initial params object here as well
	params.new_var = 'hello';
	callback.call(undefined, undefined, params);
});

router.bindPattern('/custom/error', function(params, callback) {
	console.log("You're about to provide a custom error object to the dispatch callback.");
	callback.call(undefined, {error: 'Custom Error'}, undefined);
});

http.createServer(function(req, res) {
	console.log('Attempting to match ' + req.url);
	router.dispatch(req.url, function(err, params) {
		if (err) {
			console.log('ERROR! ' + err.error);
			res.end(JSON.stringify(err));
		} else {
			console.log(params);
			res.end(JSON.stringify(params));
		}
	});
}).listen(3000);
console.log("Server listening on port 3000");