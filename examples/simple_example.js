var http = require('http'),
	stringrouter = require('stringrouter');

var router = stringrouter.getInstance();

router.bindPattern('/echo/{text}');
router.bindPattern('/hello/world.{extension}');

router.bindPattern('/hello/world', function(packet, callback) {
	packet.params.hello = 'world';
	callback.call(undefined, undefined, packet);
});

/**
 * match this pattern with /user/1234
 */
router.bindPattern('/user/{id:[0-9]+}', function(packet, callback) {
	console.log("You've hit the first /user/ url.");
	callback.call(undefined, undefined, packet);
});

/**
 * Match this pattern with /user/some-user-name_here
 */
router.bindPattern('/user/{username:[\\w\\_\\-]+}', function(packet, callback) {
	console.log("You've hit the second /user/ url.");
	// we can augment the initial params object here as well
	packet.params.salutation = 'hello';
	callback.call(undefined, undefined, packet);
});

router.bindPattern('/custom/error', function(packet, callback) {
	console.log("You're about to provide a custom error object to the dispatch callback.");
	callback.call(undefined, {error: 'Custom Error'}, packet);
});

http.createServer(function(req, res) {
	console.log('Attempting to match ' + req.url);
	router.dispatch(req.url, function(err, packet) {
		if (err) {
			console.log('ERROR!');
			console.log(err);
			res.end(JSON.stringify(err));
		} else {
			console.log(packet);
			res.end(JSON.stringify(packet));
		}
	});
}).listen(3000);
console.log("Server listening on port 3000");