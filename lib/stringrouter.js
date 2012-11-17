var StringRouter = function(cfg) {
  this.config = cfg || {};
  this.noMatch = this.config.noMatch || {error: 'No Match'};
  this.patterns = [];
  this.namespaces = {};
};

/**
 * Accepts a specifically formatted string, converts it into a regular-expression and
 * binds that pattern to an optionally provided callback.  Future calls to `dispatch()` will
 * compare the provided string against the pattern in this string and if a match is
 * detected, then the callback will be invoked.
 *
 * The string can accept special formatting encased in curly-braces, in the case of a
 * Restful URL it may look like this;
 *
 * `/hello/{world}`
 *
 * In this case, the value encased in the braces is a variable.  Matches to the string
 * can be any alpha-numeric value such as `/hello/goodbye`.  The variable name in this case
 * `world` will be parsed and given the value `goodbye`.  This variable is now available
 * to the provided callback in the `packet.params` variable.
 *
 * @param str
 * @param callback
 */
StringRouter.prototype.bindPattern = function(str, callback) {
		
  var replacements = str.match(/\{.*?\}{1,2}/g), matcher = str,
    replacement, raw, params = [], element, name, reg, components, i;

  if (replacements) {
    for (i = 0; i < replacements.length; i++) {
      raw = replacements[i];
      replacement = raw.replace(/\{/, "").replace(/\}$/, "");
      components = replacement.split(":");
      name = components[0];
      reg = (components.length > 1) ? "(" + components[1] + ")" : "([\\w\\d]+)";
      matcher = matcher.replace(raw, reg);
      params.push(name);
    }
  }

  matcher = "^" + matcher + "$";

  element = {
    template: str,
    matcher: new RegExp(matcher),
    variables: params
  };

  if (callback) {
    element.callback = callback;
  }

  this.patterns.push(element);
		
};

/**
 * Given the provided String parameter, will attempt to match that
 * string against any previously registered patterns (via `bindPattern()`).
 * If a match is found, then the patterns callback will be invoked (if a callback
 * was provided on bindPattern).  If no callback was provided to the pattern when
 * bindPattern() was invoked, then the callback parameter provided to this method
 * will be invoked.  An optional `data` argument can be provided to this method
 * which can be any arbitrary data type.  This variable will be passed through
 * the chain of method execution.
 *
 * @param str
 * @param callback
 * @param data
 */
StringRouter.prototype.dispatch = function(str, callback, data) {
		
  // create the data object
  var packet = {
    data: data,
    config: this.config
  };

  for (var index in this.patterns) {

    var pattern = this.patterns[index],
      match = str.match(pattern.matcher),
      params = {};

    if (match) {

      // compile parameters
      for (var i = 0; i < pattern.variables.length; i++) {
        params[pattern.variables[i]] = match[i + 1];
      }

      // append the params packet
      packet['params'] = params;

      if (pattern.callback) {
        pattern.callback.call(undefined, packet, callback);
      } else {
        callback.call(undefined, undefined, packet);
      }
      return;
    }

  }

  callback.call(undefined, this.noMatch, packet);
};

/**
 * Will return a boolean result depending upon whether
 * the given String argument matches any previously registered
 * patterns.
 *
 * @param str
 * @return {Boolean}
 */
StringRouter.prototype.hasMatch = function(str) {
		
  var index, pattern;

  for (index in this.patterns) {
    pattern = this.patterns[index];
    if (str.match(pattern.matcher)) {
      return true;
    }
  }

  return false;
};

/**
 * This method provides a way to register specific patterns
 * that may otherwise be matched by a pattern, but will be ignored
 * if registered with this method.
 *
 * @param str
 */
StringRouter.prototype.ignore = function(str) {
  this.bindPattern(str, function() {});
};

/**
 * Creates a new StringRouter context under the provided
 * namespace name.  A namespace is a completely independent
 * workspace and maintains no knowledge of patterns registered
 * in another namespace.
 *
 * @param ns
 * @return {*}
 */
StringRouter.prototype.namespace = function(ns) {
  if (!this.namespaces[ns]) {
    this.namespaces[ns] = new StringRouter(this.config);
  }
  return this.namespaces[ns];
};

/**
 * Shortcut method, same as `namespace()`.
 *
 * @type {*}
 */
StringRouter.prototype.ns = StringRouter.prototype.namespace;

StringRouter.prototype.namespaces = function() {
  var spaces = [], key;
  for (key in this.namespaces) {
    spaces.push(key);
  }
  return spaces;
};

/**
 * Will return a converted representation of all
 * registered patterns.
 *
 * @return {Array}
 */
StringRouter.prototype.getPatterns = function() {
  return this.patterns;
};

/**
 * Returns the configuration object used to
 * initialize the current `StringRouter` instance.
 *
 * @return {*}
 */
StringRouter.prototype.getConfig = function() {
  return this.config;
};

/**
 * Returns an initialized instance of `StringRouter`.  Can
 * optionally be provided a configuration object.
 *
 * @param config
 * @return {*}
 */
exports.getInstance = function(config) {
	return new StringRouter(config);
};
