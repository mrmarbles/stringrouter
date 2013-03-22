var routerFactory = require('../lib/stringrouter');

module.exports = {
	
  setUp: function(callback) {
    this.router = routerFactory.getInstance();
    callback();
  },
	
	"Test simple pattern - has match": function(test) {
		
		this.router.bindPattern("/hello/world");
		test.ok(this.router.hasMatch("/hello/world"));
		test.done();
		
	},
	
	"Test simple pattern - no match": function(test) {
		
		this.router.bindPattern("/hello/world");
		test.ok(!this.router.hasMatch("/hello/worl"));
		test.done();
		
	},
	
	"Test complex pattern - has match": function(test) {
		
		this.router.bindPattern("/user/{name}");
		test.ok(this.router.hasMatch("/user/brian"));
		test.done();
		
	},
	
	"Test complex pattern - no match": function(test) {
		
		this.router.bindPattern("/user/{name:[0-9]+}");
		test.ok(!this.router.hasMatch("/user/brian"));
		test.done();
		
	},
	
	"Test simple string pattern with dispatch": function(test) {
		
		this.router.bindPattern("/hello/world");
		this.router.dispatch("/hello/world", function(err, packet) {
			test.ok(!err);
			test.ok(packet);
			test.ok(packet.params); // will be empty object
			test.ok(!packet.data); // data will be undefined
			test.ok(packet.config);
			test.done();
		});

	},
	
	"Test simple string pattern - no match (1 of 2)": function(test) {
		
		this.router.bindPattern("/hello/world");
		
		this.router.dispatch("/hello/worl", function(err, packet) {
			test.ok(err);
			test.ok(packet);
			test.ok(!packet.params); // params will be undefined
			test.done();
		});

	},
	
	"Test simple string pattern - no match (2 of 2)": function(test) {
		
		this.router.bindPattern("/hello/world");
		
		this.router.dispatch("/hello/world/", function(err, packet) {
			test.ok(err);
			test.ok(!packet.params) // params will be undefined
			test.done();
		});

	},
	
	"Test string pattern with variable (1 of 2)": function(test) {
		
		this.router.bindPattern("/user/{id}");
		
		this.router.dispatch("/user/1234", function(err, packet) {
			test.ok(!err);
			test.ok(packet);
			test.ok(packet.params.id);
			test.equals(packet.params.id, 1234);
			test.done();
		});

	},
	
	"Test string pattern with variable (2 of 2)": function(test) {
		
		this.router.bindPattern("/user/{id}");
		
		this.router.dispatch("/user/abcd", function(err, packet) {
			test.ok(!err);
			test.ok(packet.params);
			test.ok(packet.params.id);
			test.equals(packet.params.id, "abcd");
			test.done();
		});

	},
	
	
	"Test string pattern with multiple variables": function(test) {
		
		this.router.bindPattern("/one/{two}/three/{four}");
		
		this.router.dispatch("/one/1234/three/werbenjagermanjensen", function(err, packet) {
			test.ok(!err);
			test.ok(packet.params);
			test.ok(packet.params.two);
			test.ok(packet.params.four);
			test.equals(packet.params.two, 1234);
			test.equals(packet.params.four, "werbenjagermanjensen");
			test.done();
		});

	},
	
	
	"Test string pattern with variables and user provided regex": function(test) {
		
		this.router.bindPattern("/one/{two:[A-Z]{1}}/three/{four:[0-9]{3}}");
		
		this.router.dispatch("/one/A/three/547", function(err, packet) {
			test.ok(!err);
			test.ok(packet.params);
			test.ok(packet.params.two);
			test.ok(packet.params.four);
			test.equals(packet.params.two, "A");
			test.equals(packet.params.four, 547);
			test.done();
		});

	},
	
	"Test string pattern with variables and user provided regex - no match (1 of 3)": function(test) {
		
		this.router.bindPattern("/one/{two:[A-Z]{1}}/three/{four:[0-9]{3}}");
		
		this.router.dispatch("/one/a/three/547", function(err, packet) {
			test.ok(err);
			test.done();
		});

	},
	
	"Test string pattern with variables and user provided regex - no match (2 of 3)": function(test) {
		
		this.router.bindPattern("/one/{two:[A-Z]{1}}/three/{four:[0-9]{3}}");
		
		this.router.dispatch("/one/A/three/5427", function(err, packet) {
			test.ok(err);
			test.done();
		});

	},
	
	"Test string pattern with variables and user provided regex - no match (3 of 3)": function(test) {
		
		this.router.bindPattern("/one/{two:[A-Z]{1}}/three/{four:[0-9]{3}}");
		
		this.router.dispatch("/one/A/three/12a", function(err, packet) {
			test.ok(err);
			test.done();
		});

	},
	
	"Test simple string pattern with binding": function(test) {
		
		this.router.bindPattern("/hello/world", function(packet, callback) {
			packet.params.foo = "bar";
			callback.call(undefined, undefined, packet);
		});
		
		this.router.dispatch("/hello/world", function(err, packet) {
			test.ok(!err);
			test.ok(packet.params);
			test.ok(packet.params.foo);
			test.equals(packet.params.foo, "bar");
			test.done();
		});		
		
	},
	
	"Test string pattern with variable and function binding": function(test) {
		
		this.router.bindPattern("/user/{id}", function(packet, callback) {
			packet.params.foo = "bar";
			callback.call(undefined, undefined, packet);
		});
		
		this.router.dispatch("/user/mrmarbles", function(err, packet) {
			test.ok(!err);
			test.ok(packet.params);
			test.ok(packet.params.foo);
			test.ok(packet.params.id);
			test.equals(packet.params.id, "mrmarbles");
			test.equals(packet.params.foo, "bar");
			test.done();
		});		
		
	},
	
	"Test string pattern with multiple variables and function binding": function(test) {
		
		this.router.bindPattern("/one/{two}/three/{four}", function(packet, callback) {
			packet.params.foo = "bar";
			callback.call(undefined, undefined, packet);
		});
		
		this.router.dispatch("/one/1234/three/asdf", function(err, packet) {
			test.ok(!err);
			test.ok(packet.params);
			test.ok(packet.params.two);
			test.ok(packet.params.four);
			test.ok(packet.params.foo);
			test.equals(packet.params.two, 1234);
			test.equals(packet.params.four, "asdf");
			test.equals(packet.params.foo, "bar");
			test.done();
		});		
		
	},
	
	"Test simple string pattern with default no match object": function(test) {
		
		this.router.bindPattern("/hello/world");
		
		this.router.dispatch("/hello/worldd", function(err, packet) {
			test.ok(err);
			test.ok(err.error);
			test.equals(err.error, "No Match");
			test.done();
		});		
		
	},
	
	"Test simple string pattern default with configured no match object": function(test) {
		
		var router = routerFactory.getInstance({
			noMatch: {hello: "world"}
		});
		
		router.bindPattern("/hello/world");
		
		router.dispatch("/hello/worldd", function(err, packet) {
			test.ok(err);
			test.ok(err.hello);
			test.equals(err.hello, "world");
			test.done();
		});		
		
	},
	
	"Test simple string pattern with binding and passed-through error object": function(test) {
		
		this.router.bindPattern("/hello/world", function(packet, callback) {
			callback.call(undefined, {smitty: "werbenjagermanjensen"}, undefined);
		});
		
		this.router.dispatch("/hello/world", function(err, packet) {
			test.ok(err);
			test.ok(err.smitty)
			test.equals(err.smitty, "werbenjagermanjensen");
			test.done();
		});		
		
	},

  "Test simple string patter with custom namespace - not found": function(test) {

    this.router.ns('custom').bindPattern("/hello/world");

    this.router.dispatch("/hello/world", function(err, packet) {
      test.ok(err);
      test.ok(err.error);
      test.equals(err.error, "No Match");
      test.done();
    });

  },

  "Test simple string patter with custom namespace - found": function(test) {

    this.router.namespace('custom').bindPattern("/hello/world", undefined);

    this.router.namespace('custom').dispatch("/hello/world", function(err, packet) {
      test.ok(!err);
      test.ok(packet);
      test.done();
    });

  },
    
  "Test dispatch data pass-through": function(test) {

    this.router.bindPattern("/hello/world", undefined);

    this.router.dispatch("/hello/world", function(err, packet) {
      test.ok(!err);
      test.ok(packet.params);
      test.ok(packet.data);
      test.ok(packet.data.one);
      test.ok(packet.data.three);
      test.equals("two", packet.data.one);
      test.equals("four", packet.data.three);
      test.done();
    }, {
      one: 'two',
      three: 'four'
    });

  },
    
  "Test dispatch data pass-through to interstitial function": function(test) {

    this.router.bindPattern("/hello/world", function(packet, callback) {
      packet.data.five = "six";
      callback.call(undefined, undefined, packet);
    });

    this.router.dispatch("/hello/world", function(err, packet) {
      test.ok(!err);
      test.ok(packet.params);
      test.ok(packet.data);
      test.ok(packet.data.one);
      test.ok(packet.data.three);
      test.ok(packet.data.five);
      test.equals("two", packet.data.one);
      test.equals("four", packet.data.three);
      test.equals("six", packet.data.five);
      test.done();
    }, {
      one: 'two',
      three: 'four'
    });

  },
    
  "Test not found data pass-through": function(test) {

    this.router.bindPattern("/hello/world", undefined);

    this.router.dispatch("/invalid/string", function(err, packet) {
      test.ok(err);
      test.ok(packet.data);
      test.ok(packet.data.one);
      test.ok(packet.data.three);
      test.equals("two", packet.data.one);
      test.equals("four", packet.data.three);
      test.done();
    }, {
      one: 'two',
      three: 'four'
    });

  },
    
  "Test basic configuration": function(test) {

    var router = routerFactory.getInstance({
      noMatch: 'Test',
      arbitraryKey: 'Brian'
    });

    var cfg = router.getConfig();

    test.ok(cfg);
    test.ok(cfg.noMatch);
    test.ok(cfg.arbitraryKey);
    test.equals('Test', cfg.noMatch);
    test.equals('Brian', cfg.arbitraryKey);
    test.done();

  },

  "Test unbind pattern": function(test) {

    this.router.bindPattern('/hello/world');
    test.ok(this.router.hasMatch("/hello/world"));
    this.router.unBindPattern('/hello/world');
    test.ok(this.router.hasMatch('/hello/world') === false);
    test.done();

  },

  tearDown: function(callback) {
    this.router = null;
    callback();
  }
		
};