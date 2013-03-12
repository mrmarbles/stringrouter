[![Build Status](https://travis-ci.org/mrmarbles/stringrouter.png)](https://travis-ci.org/mrmarbles/stringrouter)

stringrouter
=======
StringRouter is a high-level routing API that parses, parameterizes and binds string patterns to the invocation of
callback functions. Can be easily used to deploy restful web service endpoints without the overhead of a full-stack framework or simply
parse path-info from URL strings.  See the examples for more details.

Installation
---------------
	npm install stringrouter

Testing
---------------
    npm test
	
### Basic API
---------------
The below code is intended only to demonstrate basic `StringRouter` usage.  
Here, the string `some string` is registered as a simple string
pattern that the router will recognize so that future calls to `dispatch()` (more details on that method below)
will attempt to match the provided string with previously registered patterns, and invoke
a callback method when a match is detected.

```javascript
var stringrouter = require('stringrouter');

var router = stringrouter.getInstance();

router.bindPattern('/people');

router.dispatch('/people', function(err, packet) {
	/*
	 * Both the err and packet objects passed to the 
	 * callback in this case will be undefined because
	 * no variables were defined in the string pattern
	 * and the provided '/people' string will 'find' the
	 * previously registered string '/people'.
	 */		
});
```
	
Any number of patterns can be declared for a given instance of `StringRouter`.

### What does the 'packet' contain?

The `packet` argument passed to the dispatch callback is a representation of several pieces
of information collected during the execution lifecycle.  It is an object containing three keys;

* **config**: If you configured this specific instance of your `StringRouter`, then that configuration
will be represented here.

* **params**: This is a key/value hash representing each configured string variable for the matched pattern.  See the
'Using String Variables' section.

* **data**: An optional and abitrary data type passed through from the call to `dispatch();`.

### The dispatch() method in detail

The method signature for dispatch is as follows `dispatch(string, callback, data);`

Once one or more patterns have been configured for your `StringRouter` instance, an invocation of
`dispatch()` is required in order to determine matches to the patterns.  That method accepts up to three arguments;

* **string**: String against which all previously registered patterns will be evaluated to determine a match.

* **callback**: A callback method that will be invoked regardless as to whether or not a match for the `string` argument was found.  The method
signature for this function is `callback(err, packet)`.  The `err` argument will only be defined if no registered pattern was matched
for the first string argument of `dispatch()`.  The `packet` argument will always be defined, and contain contextual and runtime information
as described in the 'What does the packet contain' section above.

* **data**: Any arbitrary data that you would like to pass through the function execution lifecycle.  
This data will be represented inside of the `packet` with a key named `data` and can be accessed and/or manipulated
at any point in the execution lifecycle - inside of a matched pattern-bound callback or inside of the callback function
provided to the `dispatch()` method itself. 
	
### Using String Variables

Below is an example of a pattern with a declared variable.  String variables are declared
inside of the pattern as a name, demarcated with surrounding curly-braces `{myvariable}`.  As a rule,
variables will match any alphanumeric character set including dashes and underscores.

```javascript
var stringrouter = require('stringrouter');

var router = stringrouter.getInstance();

router.bindPattern('/do/{something}');
```

The above pattern is indicating that anything succeeding `/do/..` will be considered a variable, and match
the pattern.  The name you give your variable is important, as it will be provided to the `dispatch()` function as an object literal
with properties whose values represent the value of the URL variables;

```javascript
var stringrouter = require('stringrouter');

var router = stringrouter.getInstance();

router.bindPattern('/hello/{hello}');

router.dispatch('/hello/world', function(err, packet) {
	/*
	 * This string will match the /hello/world pattern, as as such,
	 * the packet.params argument provided to this callback will contain
	 * an object with a property named 'hello' with the value 'world'.
	 */
});

router.dispatch('/hello/brian', function(err, packet) {
	/*
	 * This string will also match the previously registered
	 * pattern.  In this case, packet.params.hello will have the value
	 * 'brian'.
	 */
});
```
	
Any number of variables can be delcared in a single string

```javascript
router.bindPattern('/one/{two}/three/{four}');
```
	
### Using Custom Matching Rules

There will be cases when you'll want to hone how matches are considered for any provided
pattern.  This can be done easily by providing a regular expression inside of your string variable;

```javascript
router.bindPattern('/user/{id:[0-9]{5}}');
```
	
Anything succeeding the colon `:` in a named variable will be used as a regular expression in order to determine
matches for the given pattern.  Remember to keep it contained within the curly braces.  In the above example, the pattern
is indicating only 5-digit numeric values will be matched as the string variable.

This is useful when you want to avoid pattern collisions.  Consider the following scenario;

```javascript
router.bindPattern('/user/{id}');
router.bindPattern('/user/{username}');
```
	
The above patterns are functionally equivalent.  Which means that if you needed matches to the 
the second pattern to execute different logic than the first (see the section on pattern-bound callbacks),
you would need to specify a different pattern entirely.  Of course that's not necessary with `StringRouter`, you can simply
make the matching rules more specific according to your needs;

```javascript
router.bindPattern('/user/{id:some regex here}');
router.bindPattern('/user/{username:another regex here}');
```

### Pattern-Bound Callbacks

Chances are you'll want to be able to execute code specific to a given route.  This can be done easily
with the introduction of a pattern-bound callback is invoked when a string match is detected when `dispatch()` is called;

```javascript
router.bindPattern('/user/{id}', function(packet, callback) {
    // this code will be executed
});
```
	
You'll notice there's no `err` object available to provided callback.  That's because the match to the pattern
is guaranteed.  If a string that doesn't match the pattern is provided to `dispatch()`, then of course the pattern-bound
callback is never invoked.

The `packet` argument is an object containing the key/value pairs for the parsed URL variables of the provided
string to `dispatch` as well as `config` and `data` if it was provided to `dispatch()`.

The `callback` argument is the callback provded as the second argument to `dispatch()`.  It is the responsibility of
the pattern-bound callback to invoke the `dispatch()` callback with the appropriate arguments 
if control is to be given to that function.

```javascript
router.bindPattern('/user/{id}', function(packet, callback) {
	/*
	 * Execute logic specific to this pattern here.  You have access
	 * to the packet object.  Also, don't forget to invoke the provided
	 * dispatch callback to provide control to that function.
	 *
	 * In the below example, we need to ensure that scope, and the errors
	 * object are what that callback expects.
	 */
	callback.call(undefined, undefined, packet);
});
```
	
### Simple Match Testing

If you want to see if a given string pattern matches any pattern registered with an instance of `StringRouter` without having to explicitly call `dispatch()`
then you can simply ask the `StringRouter` if it has a match for a provided string;

```javascript
router.hasMatch('hello world');
```
	
No callbacks, no mess - it will simply return a boolean indicating if the given string matches any registered patterns.  Of course using `dispatch()` is much more 
robust and will provide you with much more information about the match and control over what happens next, this is a good way of knowing up front what would happen
should a call to `dispatch()` be made.

### Function Execution Lifecycle

This is really just a fancy name for what to expect when you invoke the `dispatch()` method.  If no pattern-bound functions have been declared for a `StringRouter` instance,
then the lifecycle is very straight-forward - the provided callback to `dispatch()` is invoked, populating `err` depending upon whether or not a registered pattern matched
the string.  As stated previously `packet` is always populated.

The lifecycle is only slightly more complex when a pattern-bound function has been declared.  When a match is made on a pattern that has a bound function like so;

```javascript
router.bindPattern("/hello/world", function(packet, callback) {

});
```
 
..then control is handed to this function **before** the callback provided to `dispatch()` can be invoked.  In fact, in these cases, it is the sole responsibility of
this function to execute the callback originally provided to `dispatch()` - because it's the `callback` argument in this method.  This means that if you never invoke
that method, then you may not get the expected results from your original call to `dispatch()`.

### Namespacing

The `StringRouter` API provides a convenient way to isolate sets of patterns in the form of namespaces.  Namespaces are represented with arbitrary string values like so;

```javascript
router.namespace('somekey').bindPattern(...);
```

Or the more convenient, truncated method;

```javascript
router.ns('somekey').bindPattern(...);
```

Once a pattern is bound to a specific namespace, you'll need to specify that namespace when invoking the `dispatch()` method in order to execute the pattern match against that context;

```
router.ns('somekey').dispatch(...);
```

Any number of namespaces can be created for any given `StringRouter` instance.  You can query the router to determine what namespaces it is maintaining with `namespaces()`;

```javascript
router.namespaces();
```

Of course, invoking `dispatch()` under a specific namespace (or no namespace at all) will not evaluate any patterns registered under a different namespace - which of course, is the whole point.
	
### Basic Configuration

Instances of `StringRouter` support only one configurable property; `noMatch`.  When `dispatch()` is invoked, and no patterns are matched, then the callback
function is invoked with an initialized `err` object.  That objects looks like this; `{error: 'No Match'}`.  You can override this value with the `noMatch` configuration;

```javascript
var router = stringrouter.getInstance({
	noMatch: 'Any value - simple or complex can go here.'
});
```
	
Now when the `err` object is evaluated (when no pattern matches exist) inside of the `dispatch()` callback, you'll see that it's value is the simple string we've provided
above.

Configuring your `StringRouter` instance can be useful in other ways too.  As a part of the `packet` variable that is made available throughout the function execution lifecycle,
you have access to `config` - which as you've probably already guessed, is the variable you passed into the initial `getInstance()` method.  So, you can add any number of arbitrary
keys and values to the configuration and have access to them inside of `packet.config` throughout the function execution lifecycle.
	
### Not Found

In the cases when the first argument to `dispatch()` is a string that does not match
any previously registered patterns, then the callback provided to that method will be
invoked with an `err` object passed as the first argument.  This object will contain a single
property named `error` containing the string 'No Match'.

License
-------
[MIT License](http://mrmarbles.mit-license.org/ "Mit License")