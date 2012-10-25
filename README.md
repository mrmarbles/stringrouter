StringRouter : Simple restful URL matching and parsing.
=======
StringRouter is a restful URL parsing micro-module.  Modularity is the name of the game here.  Feel free
to use StringRouter as a stand-alone means to build sets of restful webservice endpoints without requiring
the weight of a full-stack framework or integrate it into your own framework to provide enhanced URL parsing and
routing capabilities.

Installation
---------------
	npm install stringrouter
	
Basic URL Pattern Binding and Function Dispatching
---------------
The below code is intended only to demonstrate basic `StringRouter` usage.  
Here, the string `/people` is effectively registered as a string
pattern that the router will recognize so that future calls to `dispatch()` 
will attempt to match the provided string with previously registered patterns, and invoke
a callback method when a match is detected.

	var stringrouter = require('stringrouter');
	
	var router = stringrouter.getInstance();
	
	router.bindPattern('/people');

	router.dispatch('/people', function(err, params) {
		/**
		 * Both the err and params objects passed to the 
		 * callback in this case will be undefined because
		 * no variables were defined in the string pattern
		 * and the provided '/people' string will 'find' the
		 * previously registered string '/people'.
		 */		
	});
	
Any number of patterns can be declared for a given instance of `StringRouter`.

Understanding dispatch()
---------------
Once one or more patterns have been configured for your `StringRouter` instance, an invocation of
`dispatch()` is required in order to determine matches to the patterns.  That method accepts
two arguments; the first is a string against which all previously registered patterns will be compared,
in order to determine if the second argument, a provided callback should be invoked.
	
Using URL Variables
---------------
Below is an example of a pattern with a declared variable.  String variables (URL variables) are declared
inside of the pattern as a name, demarcated with surrounding curly-braces `{myvariable}`.  As a rule,
variables will match any alphanumeric character set including dashes and underscores.

	var stringrouter = require('stringrouter');
	
	var router = stringrouter.getInstance();
	
	router.bindPattern('/user/{id}');

The above pattern is indicating that anything succeeding `/user/` will be considered a variable, and match
the pattern.  The name you give your variable is important, as it will be provided to the `dispatch()` function as an object literal
with properties whose values represent the value of the URL variables;

	var stringrouter = require('stringrouter');
	
	var router = stringrouter.getInstance();
	
	router.bindPattern('/user/{id}');
	
	router.dispatch('/user/1234', function(err, params) {
		/**
		 * This string will match the user/{id} pattern, as as such,
		 * the params argument provided to this callback will contain
		 * an object with a property named 'id' with the integer value
		 * '1324'.
		 */
	});
	
	router.dispatch('/user/brian', function(err, params) {
		/**
		 * This string will also match the previously registered
		 * pattern.  In this case, params.id will have the value
		 * 'brian'.
		 */
	});
	
Any number of variables can be delcared in a single string

	router.bindPattern('/one/{two}/three/{four}');
	
Using Custom Matching Rules
---------------
There will be cases when you'll want to hone how matches are considered for any provided
pattern.  This can be done easily by providing a regular expression inside of your URL variable
	
	router.bindPattern('/user/{id:[0-9]{5}}');
	
Anything succeeding the colon `:` in a named variable will be used as a regular expression in order to determine
matches for the given pattern.  Remember to keep it contained within the curly braces.  In the above example, the pattern
is indicating only 5-digit numeric values will be matched as the URL variable.

This is useful when you want to avoid URL collisions.  Consider the following scenario;

	router.bindPattern('/user/{id}');
	router.bindPattern('/user/{username}');
	
The above patterns are functionally equivalent.  Which means that if you needed matches to the 
the second pattern to execute different logic than the first (see the section on interstitial callbacks),
you would need to specify a different pattern entirely.  Of course that's not necessary with `StringRouter`, you can simply
make the matching rules more specific according to your needs;

	router.bindPattern('/user/{id:some regex here}');
	router.bindPattern('/user/{username:another regex here}');

Interstitial Callbacks
---------------
Chances are you'll want to be able to execute code specific to a given route.  This can be done easily
with the introduction of an interstitial callback that is bound to the pattern itself;

	router.bindPattern('/user/{id}', function(params, callback) {
	
	});
	
You'll notice there's no `err` object available to provided callback.  That's because the match to the pattern
is guaranteed.  If a string that doesn't match the pattern is provided to `dispatch()`, then of course the interstitial
callback is never invoked.

The `params` argument is an object containing the key/value pairs for the parsed URL variables of the provided
string to `dispatch`.

The `callback` argument is the callback provded as the second argument to `dispatch()`.  It is the responsibility of
the interstitial callback to invoke the `dispatch()` callback with the appropriate arguments 
if control is to be handed back to that function.

	router.bindPattern('/user/{id}', function(params, callback) {
		/**
		 * Execute logic specific to this pattern here.  You have access
		 * to the params object.  Also, don't forget to invoke the provided
		 * dispatch callback to provide control to that function.
		 *
		 * In the below example, we need to ensure that scope, and the errors
		 * object are what that callback expects.
		 */
		callback.call(undefined, undefined, params);
	});
	
Not Found
---------------
In the cases when the first argument to `dispatch()` is a string that does not match
any previously registered patterns, then the callback provided to that method will be
invoked with an `err` object passed as the first argument.  This object will contain a single
property named `error` containing the string 'No Match'.

License
---------------
The MIT License

Copyright (c) 2012 Brian Carr

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

