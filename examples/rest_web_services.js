var http = require('http'),
	stringrouter = require('stringrouter');

var router = stringrouter.getInstance({
	noMatch: 404	
});

// GET /echo/something
router.namespace('GET').bindPattern('/echo/{text}');

// POST /echo/something
router.namespace('POST').bindPattern('/echo/{text}', function(packet, callback) {
	packet.params.message = "You posted to this endpoint."; // add an arbitrary param key/value
	callback.call(undefined, undefined, packet);
});

http.createServer(function(req, res) {
	
	console.log(req.method + ' '+ req.url);
	var rawData = "";
	
	req.on('data', function(chunk) {
		rawData += chunk;
	});
	
	req.on('end', function() {
		
		router.namespace(req.method).dispatch(req.url, function(err, packet) {
			if (err) {
				console.log('ERROR!');
				console.log(err);
				res.writeHead(packet.config.noMatch);
				res.end();
			} else {
				console.log(packet);
				res.end(JSON.stringify(packet));
			}
		}, rawData);
		
	});
}).listen(3000);
console.log("Server listening on port 3000");