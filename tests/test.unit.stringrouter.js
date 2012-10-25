var routerFactory = require('../lib/stringrouter');

module.exports = {
	
	setUp: function(callback) {
		this.router = routerFactory.getInstance();
		callback();
	},
	
	"Test simple string pattern": function(test) {
		
		this.router.bindPattern("/hello/world");
		this.router.dispatch("/hello/world", function(err, params) {
			test.ok(!err);
			test.ok(params); // will be empty object
			test.done();
		});

	},
	
	"Test simple string pattern - no match (1 of 2)": function(test) {
		
		this.router.bindPattern("/hello/world");
		
		this.router.dispatch("/hello/worl", function(err, params) {
			test.ok(err);
			test.ok(!params);
			test.done();
		});

	},
	
	"Test simple string pattern - no match (2 of 2)": function(test) {
		
		this.router.bindPattern("/hello/world");
		
		this.router.dispatch("/hello/world/", function(err, params) {
			test.ok(err);
			test.ok(!params);
			test.done();
		});

	},
	
	"Test string pattern with variable (1 of 2)": function(test) {
		
		this.router.bindPattern("/user/{id}");
		
		this.router.dispatch("/user/1234", function(err, params) {
			test.ok(!err);
			test.ok(params);
			test.ok(params.id);
			test.equals(params.id, 1234);
			test.done();
		});

	},
	
	"Test string pattern with variable (2 of 2)": function(test) {
		
		this.router.bindPattern("/user/{id}");
		
		this.router.dispatch("/user/abcd", function(err, params) {
			test.ok(!err);
			test.ok(params);
			test.ok(params.id);
			test.equals(params.id, "abcd");
			test.done();
		});

	},
	
	"Test string pattern with multiple variables": function(test) {
		
		this.router.bindPattern("/one/{two}/three/{four}");
		
		this.router.dispatch("/one/1234/three/werbenjagermanjensen", function(err, params) {
			test.ok(!err);
			test.ok(params);
			test.ok(params.two);
			test.ok(params.four);
			test.equals(params.two, 1234);
			test.equals(params.four, "werbenjagermanjensen");
			test.done();
		});

	},
	
	"Test string pattern with variables and user provided regex": function(test) {
		
		this.router.bindPattern("/one/{two:[A-Z]{1}}/three/{four:[0-9]{3}}");
		
		this.router.dispatch("/one/A/three/547", function(err, params) {
			test.ok(!err);
			test.ok(params);
			test.ok(params.two);
			test.ok(params.four);
			test.equals(params.two, "A");
			test.equals(params.four, 547);
			test.done();
		});

	},
	
	"Test string pattern with variables and user provided regex - no match (1 of 3)": function(test) {
		
		this.router.bindPattern("/one/{two:[A-Z]{1}}/three/{four:[0-9]{3}}");
		
		this.router.dispatch("/one/a/three/547", function(err, params) {
			test.ok(err);
			test.ok(!params); // empty object
			test.done();
		});

	},
	
	"Test string pattern with variables and user provided regex - no match (2 of 3)": function(test) {
		
		this.router.bindPattern("/one/{two:[A-Z]{1}}/three/{four:[0-9]{3}}");
		
		this.router.dispatch("/one/A/three/5427", function(err, params) {
			test.ok(err);
			test.ok(!params); // empty object
			test.done();
		});

	},
	
	"Test string pattern with variables and user provided regex - no match (3 of 3)": function(test) {
		
		this.router.bindPattern("/one/{two:[A-Z]{1}}/three/{four:[0-9]{3}}");
		
		this.router.dispatch("/one/A/three/12a", function(err, params) {
			test.ok(err);
			test.ok(!params); // empty object
			test.done();
		});

	},
	
	"Test simple string pattern with binding": function(test) {
		
		this.router.bindPattern("/hello/world", function(params, callback) {
			params.foo = "bar";
			callback.call(undefined, undefined, params);
		});
		
		this.router.dispatch("/hello/world", function(err, params) {
			test.ok(!err);
			test.ok(params);
			test.ok(params.foo);
			test.equals(params.foo, "bar");
			test.done();
		});		
		
	},
	
	"Test string pattern with variable and function binding": function(test) {
		
		this.router.bindPattern("/user/{id}", function(params, callback) {
			params.foo = "bar";
			callback.call(undefined, undefined, params);
		});
		
		this.router.dispatch("/user/mrmarbles", function(err, params) {
			test.ok(!err);
			test.ok(params);
			test.ok(params.foo);
			test.ok(params.id);
			test.equals(params.id, "mrmarbles");
			test.equals(params.foo, "bar");
			test.done();
		});		
		
	},
	
	"Test string pattern with multiple variables and function binding": function(test) {
		
		this.router.bindPattern("/one/{two}/three/{four}", function(params, callback) {
			params.foo = "bar";
			callback.call(undefined, undefined, params);
		});
		
		this.router.dispatch("/one/1234/three/asdf", function(err, params) {
			test.ok(!err);
			test.ok(params);
			test.ok(params.two);
			test.ok(params.four);
			test.ok(params.foo);
			test.equals(params.two, 1234);
			test.equals(params.four, "asdf");
			test.equals(params.foo, "bar");
			test.done();
		});		
		
	},
	
	"Test simple string pattern with default no match object": function(test) {
		
		this.router.bindPattern("/hello/world");
		
		this.router.dispatch("/hello/worldd", function(err, params) {
			test.ok(err);
			test.ok(!params);
			test.ok(err.error)
			test.equals(err.error, "No Match");
			test.done();
		});		
		
	},
	
	"Test simple string pattern default with configured no match object": function(test) {
		
		var router = routerFactory.getInstance({
			noMatch: {hello: "world"}
		});
		
		router.bindPattern("/hello/world");
		
		router.dispatch("/hello/worldd", function(err, params) {
			test.ok(err);
			test.ok(!params);
			test.ok(err.hello)
			test.equals(err.hello, "world");
			test.done();
		});		
		
	},
	
	"Test simple string pattern with binding and passed-through error object": function(test) {
		
		this.router.bindPattern("/hello/world", function(params, callback) {
			callback.call(undefined, {smitty: "werbenjagermanjensen"}, undefined);
		});
		
		this.router.dispatch("/hello/world", function(err, params) {
			test.ok(err);
			test.ok(!params);
			test.ok(err.smitty)
			test.equals(err.smitty, "werbenjagermanjensen");
			test.done();
		});		
		
	},

	tearDown: function(callback) {
		this.router = null;
		callback();
	}
		
};