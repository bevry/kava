require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// UTILITY
var util = require('util');
var shims = require('_shims');
var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  this.message = options.message || getMessage(this);
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = shims.keys(a),
        kb = shims.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};
},{"_shims":1,"util":6}],3:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}],4:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util');

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!util.isNumber(n) || n < 0)
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (util.isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (util.isUndefined(handler))
    return false;

  if (util.isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (util.isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              util.isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (util.isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (util.isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!util.isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  function g() {
    this.removeListener(type, g);
    listener.apply(this, arguments);
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (util.isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (util.isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (util.isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (util.isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (util.isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};
},{"util":6}],5:[function(require,module,exports){

exports.isatty = function () { return false; };

function ReadStream() {
  throw new Error('tty.ReadStream is not implemented');
}
exports.ReadStream = ReadStream;

function WriteStream() {
  throw new Error('tty.ReadStream is not implemented');
}
exports.WriteStream = WriteStream;

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":1}],7:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],8:[function(require,module,exports){
'use strict';

module.exports = [
	"000000", "800000", "008000", "808000", "000080", "800080", "008080", "c0c0c0",
	"808080", "ff0000", "00ff00", "ffff00", "0000ff", "ff00ff", "00ffff", "ffffff",

	"000000", "00005f", "000087", "0000af", "0000d7", "0000ff",
	"005f00", "005f5f", "005f87", "005faf", "005fd7", "005fff",
	"008700", "00875f", "008787", "0087af", "0087d7", "0087ff",
	"00af00", "00af5f", "00af87", "00afaf", "00afd7", "00afff",
	"00d700", "00d75f", "00d787", "00d7af", "00d7d7", "00d7ff",
	"00ff00", "00ff5f", "00ff87", "00ffaf", "00ffd7", "00ffff",

	"5f0000", "5f005f", "5f0087", "5f00af", "5f00d7", "5f00ff",
	"5f5f00", "5f5f5f", "5f5f87", "5f5faf", "5f5fd7", "5f5fff",
	"5f8700", "5f875f", "5f8787", "5f87af", "5f87d7", "5f87ff",
	"5faf00", "5faf5f", "5faf87", "5fafaf", "5fafd7", "5fafff",
	"5fd700", "5fd75f", "5fd787", "5fd7af", "5fd7d7", "5fd7ff",
	"5fff00", "5fff5f", "5fff87", "5fffaf", "5fffd7", "5fffff",

	"870000", "87005f", "870087", "8700af", "8700d7", "8700ff",
	"875f00", "875f5f", "875f87", "875faf", "875fd7", "875fff",
	"878700", "87875f", "878787", "8787af", "8787d7", "8787ff",
	"87af00", "87af5f", "87af87", "87afaf", "87afd7", "87afff",
	"87d700", "87d75f", "87d787", "87d7af", "87d7d7", "87d7ff",
	"87ff00", "87ff5f", "87ff87", "87ffaf", "87ffd7", "87ffff",

	"af0000", "af005f", "af0087", "af00af", "af00d7", "af00ff",
	"af5f00", "af5f5f", "af5f87", "af5faf", "af5fd7", "af5fff",
	"af8700", "af875f", "af8787", "af87af", "af87d7", "af87ff",
	"afaf00", "afaf5f", "afaf87", "afafaf", "afafd7", "afafff",
	"afd700", "afd75f", "afd787", "afd7af", "afd7d7", "afd7ff",
	"afff00", "afff5f", "afff87", "afffaf", "afffd7", "afffff",

	"d70000", "d7005f", "d70087", "d700af", "d700d7", "d700ff",
	"d75f00", "d75f5f", "d75f87", "d75faf", "d75fd7", "d75fff",
	"d78700", "d7875f", "d78787", "d787af", "d787d7", "d787ff",
	"d7af00", "d7af5f", "d7af87", "d7afaf", "d7afd7", "d7afff",
	"d7d700", "d7d75f", "d7d787", "d7d7af", "d7d7d7", "d7d7ff",
	"d7ff00", "d7ff5f", "d7ff87", "d7ffaf", "d7ffd7", "d7ffff",

	"ff0000", "ff005f", "ff0087", "ff00af", "ff00d7", "ff00ff",
	"ff5f00", "ff5f5f", "ff5f87", "ff5faf", "ff5fd7", "ff5fff",
	"ff8700", "ff875f", "ff8787", "ff87af", "ff87d7", "ff87ff",
	"ffaf00", "ffaf5f", "ffaf87", "ffafaf", "ffafd7", "ffafff",
	"ffd700", "ffd75f", "ffd787", "ffd7af", "ffd7d7", "ffd7ff",
	"ffff00", "ffff5f", "ffff87", "ffffaf", "ffffd7", "ffffff",

	"080808", "121212", "1c1c1c", "262626", "303030", "3a3a3a",
	"444444", "4e4e4e", "585858", "626262", "6c6c6c", "767676",
	"808080", "8a8a8a", "949494", "9e9e9e", "a8a8a8", "b2b2b2",
	"bcbcbc", "c6c6c6", "d0d0d0", "dadada", "e4e4e4", "eeeeee"
];

},{}],9:[function(require,module,exports){
'use strict';

var push = Array.prototype.push, reduce = Array.prototype.reduce, abs = Math.abs
  , colors, match, result, i;

colors = require('./_xterm-colors').map(function (color) {
	return {
		r: parseInt(color.slice(0, 2), 16),
		g: parseInt(color.slice(2, 4), 16),
		b: parseInt(color.slice(4), 16)
	};
});

match = colors.slice(0, 16);

module.exports = result = [];

i = 0;
while (i < 8) {
	result.push(30 + i++);
}
i = 0;
while (i < 8) {
	result.push(90 + i++);
}
push.apply(result, colors.slice(16).map(function (data) {
	var index, diff = Infinity;
	match.every(function (match, i) {
		var ndiff = reduce.call('rgb', function (diff, channel) {
			return (diff += abs(match[channel] - data[channel]));
		}, 0);
		if (ndiff < diff) {
			index = i;
			diff = ndiff;
		}
		return ndiff;
	});
	return result[index];
}));

},{"./_xterm-colors":8}],10:[function(require,module,exports){
var process=require("__browserify_process");'use strict';

var d       = require('es5-ext/lib/Object/descriptor')
  , extend  = require('es5-ext/lib/Object/extend')
  , map     = require('es5-ext/lib/Object/map')
  , reduce  = require('es5-ext/lib/Object/reduce')
  , repeat  = require('es5-ext/lib/String/prototype/repeat')
  , memoize = require('memoizee')
  , tty     = require('tty')

  , join = Array.prototype.join, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties, abs = Math.abs
  , floor = Math.floor, max = Math.max, min = Math.min

  , mods, proto, getFn, getMove, xtermMatch
  , up, down, right, left, getHeight, memoized;

mods = extend({
	// Style
	bold:      { _bold: [1, 22] },
	italic:    { _italic: [3, 23] },
	underline: { _underline: [4, 24] },
	blink:     { _blink: [5, 25] },
	inverse:   { _inverse: [7, 27] },
	strike:    { _strike: [9, 29] }
},

	// Color
	['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
		.reduce(function (obj, color, index) {
		// foreground
		obj[color] = { _fg: [30 + index, 39] };
		obj[color + 'Bright'] = { _fg: [90 + index, 39] };

		// background
		obj['bg' + color[0].toUpperCase() + color.slice(1)] =
			{ _bg: [40 + index, 49] };
		obj['bg' + color[0].toUpperCase() + color.slice(1) + 'Bright'] =
			{ _bg: [100 + index, 49] };

		return obj;
	}, {}));

// Some use cli-color as: console.log(clc.red('Error!'));
// Which is inefficient as on each call it configures new clc object
// with memoization we reuse once created object
memoized = memoize(function (scope, mod) {
	return defineProperty(getFn(), '_cliColorData',
		d(extend({}, scope._cliColorData, mod)));
});

proto = Object.create(Function.prototype, extend(map(mods, function (mod) {
	return d.gs(function () { return memoized(this, mod); });
}), {
	// xterm (255) color
	xterm: d(memoize(function (code) {
		code = isNaN(code) ? 255 : min(max(code, 0), 255);
		return defineProperty(getFn(), '_cliColorData',
			d(extend({}, this._cliColorData, {
				_fg: [xtermMatch ? xtermMatch[code] : ('38;5;' + code), 39]
			})));
	}, { method: 'xterm' })),
	bgXterm: d(memoize(function (code) {
		code = isNaN(code) ? 255 : min(max(code, 0), 255);
		return defineProperty(getFn(), '_cliColorData',
			d(extend({}, this._cliColorData, {
				_bg: [xtermMatch ? (xtermMatch[code] + 10) : ('48;5;' + code), 49]
			})));
	}, { method: 'bgXterm' }))
}));

if (process.platform === 'win32') {
	xtermMatch = require('./_xterm-match');
}

getFn = function () {
	var fn = function (/*…msg*/) {
		var data = fn._cliColorData, close = '';
		return reduce(data, function (str, mod) {
			close = '\x1b[' + mod[1] + 'm' + close;
			return str + '\x1b[' + mod[0] + 'm';
		}, '', true) + join.call(arguments, ' ') + close;
	};
	fn.__proto__ = proto;
	return fn;
};

getMove = function (control) {
	return function (num) {
		num = isNaN(num) ? 0 : max(floor(num), 0);
		return num ? ('\x1b[' + num + control) : '';
	};
};

module.exports = defineProperties(getFn(), {
	width: d.gs(process.stdout.getWindowSize ? function () {
		return process.stdout.getWindowSize()[0];
	} : function () {
		return tty.getWindowSize ? tty.getWindowSize()[1] : 0;
	}),
	height: d.gs(getHeight = process.stdout.getWindowSize ? function () {
		return process.stdout.getWindowSize()[1];
	} : function () {
		return tty.getWindowSize ? tty.getWindowSize()[0] : 0;
	}),
	reset: d.gs(function () {
		return repeat.call('\n', getHeight() - 1) + '\x1bc';
	}),
	up: d(up = getMove('A')),
	down: d(down = getMove('B')),
	right: d(right = getMove('C')),
	left: d(left = getMove('D')),
	move: d(function (x, y) {
		x = isNaN(x) ? 0 : floor(x);
		y = isNaN(y) ? 0 : floor(y);
		return ((x > 0) ? right(x) : left(-x)) + ((y > 0) ? down(y) : up(-y));
	}),
	moveTo: d(function (x, y) {
		x = isNaN(x) ? 1 : (max(floor(x), 0) + 1);
		y = isNaN(y) ? 1 : (max(floor(y), 0) + 1);
		return '\x1b[' + y + ';' + x + 'H';
	}),
	bol: d(function (n/*, erase*/) {
		var dir;
		n = isNaN(n) ? 0 : Number(n);
		dir = (n >= 0) ? 'E' : 'F';
		n = floor(abs(n));
		return arguments[1] ?
				(((!n || (dir === 'F')) ? '\x1b[0E\x1bK' : '') +
					repeat.call('\x1b[1' + dir + '\x1b[K', n)) : '\x1b[' + n + dir;
	}),
	beep: d('\x07'),
	xtermSupported: d(!xtermMatch),
	_cliColorData: d({})
});

},{"./_xterm-match":9,"__browserify_process":7,"es5-ext/lib/Object/descriptor":24,"es5-ext/lib/Object/extend":25,"es5-ext/lib/Object/map":31,"es5-ext/lib/Object/reduce":32,"es5-ext/lib/String/prototype/repeat":37,"memoizee":47,"tty":5}],11:[function(require,module,exports){
'use strict';

var isArguments   = require('../Function/is-arguments')

  , isArray = Array.isArray, slice = Array.prototype.slice;

module.exports = function (obj) {
	if (isArray(obj)) {
		return obj;
	} else if (isArguments(obj)) {
		return (obj.length === 1) ? [obj[0]] : Array.apply(null, obj);
	} else {
		return slice.call(obj);
	}
};

},{"../Function/is-arguments":16}],12:[function(require,module,exports){
'use strict';

var numIsNaN = require('../../Number/is-nan')
  , ois      = require('../../Object/is')
  , value    = require('../../Object/valid-value')

  , indexOf = Array.prototype.indexOf;

module.exports = function (searchElement/*, fromIndex*/) {
	var i;
	if (!numIsNaN(searchElement) && (searchElement !== 0)) {
		return indexOf.apply(this, arguments);
	}

	for (i = (arguments[1] >>> 0); i < (value(this).length >>> 0); ++i) {
		if (this.hasOwnProperty(i) && ois(searchElement, this[i])) {
			return i;
		}
	}
	return -1;
};

},{"../../Number/is-nan":18,"../../Object/is":30,"../../Object/valid-value":34}],13:[function(require,module,exports){
'use strict';

var value = require('../../Object/valid-value');

module.exports = function () {
	var i, l;
	if (!(l = (value(this).length >>> 0))) {
		return null;
	}
	i = l - 1;
	while (!this.hasOwnProperty(i)) {
		if (--i === -1) {
			return null;
		}
	}
	return i;
};

},{"../../Object/valid-value":34}],14:[function(require,module,exports){
'use strict';

var lastIndex = require('./last-index');

module.exports = function () {
	var i;
	if ((i = lastIndex.call(this)) !== null) {
		return this[i];
	}
	return undefined;
};

},{"./last-index":13}],15:[function(require,module,exports){
'use strict';

var d      = require('../Object/descriptor')
  , extend = require('../Object/extend')

  , captureStackTrace = Error.captureStackTrace
  , CustomError;

CustomError = module.exports = function CustomError(message, code/*, ext*/) {
	var ext = arguments[2];
	if (ext != null) extend(this, ext);
	this.message = String(message);
	if (code != null) this.code = String(code);
	if (captureStackTrace) captureStackTrace(this, CustomError);
};

CustomError.prototype = Object.create(Error.prototype, {
	constructor: d(CustomError),
	name: d('CustomError')
});

},{"../Object/descriptor":24,"../Object/extend":25}],16:[function(require,module,exports){
'use strict';

var toString = Object.prototype.toString

  , id = toString.call((function () { return arguments; }()));

module.exports = function (x) {
	return toString.call(x) === id;
};

},{}],17:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	value = Number(value);
	if (isNaN(value) || (value === 0)) {
		return value;
	}
	return (value > 0) ? 1 : -1;
};

},{}],18:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	return (value !== value); //jslint: skip
};

},{}],19:[function(require,module,exports){
'use strict';

var toString = Object.prototype.toString

  , id = toString.call(1);

module.exports = function (x) {
	return ((typeof x === 'number') ||
		((x instanceof Number) ||
			((typeof x === 'object') && (toString.call(x) === id))));
};

},{}],20:[function(require,module,exports){
'use strict';

var sign = require('../Math/sign')

  , abs = Math.abs, floor = Math.floor;

module.exports = function (value) {
	if (isNaN(value)) {
		return 0;
	}
	value = Number(value);
	if ((value === 0) || !isFinite(value)) {
		return value;
	}

	return sign(value) * floor(abs(value));
};

},{"../Math/sign":17}],21:[function(require,module,exports){
'use strict';

var toInt = require('./to-int')

  , max = Math.max;

module.exports = function (value) { return max(0, toInt(value)); };

},{"./to-int":20}],22:[function(require,module,exports){
// Internal method, used by iteration functions.
// Calls a function for each key-value pair found in object
// Optionally takes compareFn to iterate object in specific order

'use strict';

var isCallable = require('./is-callable')
  , callable   = require('./valid-callable')
  , value      = require('./valid-value')

  , call = Function.prototype.call, keys = Object.keys;

module.exports = function (method) {
	return function (obj, cb/*, thisArg, compareFn*/) {
		var list, thisArg = arguments[2], compareFn = arguments[3];
		obj = Object(value(obj));
		callable(cb);

		list = keys(obj);
		if (compareFn) {
			list.sort(isCallable(compareFn) ? compareFn.bind(obj) : undefined);
		}
		return list[method](function (key, index) {
			return call.call(cb, thisArg, obj[key], key, obj, index);
		});
	};
};

},{"./is-callable":27,"./valid-callable":33,"./valid-value":34}],23:[function(require,module,exports){
'use strict';

var isPlainObject = require('./is-plain-object')
  , forEach       = require('./for-each')
  , extend        = require('./extend')
  , value         = require('./valid-value')

  , recursive;

recursive = function (to, from, cloned) {
	forEach(from, function (value, key) {
		var index;
		if (isPlainObject(value)) {
			if ((index = cloned[0].indexOf(value)) === -1) {
				cloned[0].push(value);
				cloned[1].push(to[key] = extend({}, value));
				recursive(to[key], value, cloned);
			} else {
				to[key] = cloned[1][index];
			}
		}
	}, from);
};

module.exports = function (obj/*, deep*/) {
	var copy;
	if ((copy = Object(value(obj))) === obj) {
		copy = extend({}, obj);
		if (arguments[1]) {
			recursive(copy, obj, [[obj], [copy]]);
		}
	}
	return copy;
};

},{"./extend":25,"./for-each":26,"./is-plain-object":29,"./valid-value":34}],24:[function(require,module,exports){
'use strict';

var isCallable = require('./is-callable')
  , callable   = require('./valid-callable')
  , validValue = require('./valid-value')
  , copy       = require('./copy')
  , map        = require('./map')
  , isString   = require('../String/is-string')
  , contains   = require('../String/prototype/contains')

  , bind = Function.prototype.bind
  , defineProperty = Object.defineProperty
  , d;

d = module.exports = function (dscr, value) {
	var c, e, w;
	if (arguments.length < 2) {
		value = dscr;
		dscr = null;
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	return { value: value, configurable: c, enumerable: e, writable: w };
};

d.gs = function (dscr, get, set) {
	var c, e;
	if (isCallable(dscr)) {
		set = (get == null) ? undefined : callable(get);
		get = dscr;
		dscr = null;
	} else {
		get = (get == null) ? undefined : callable(get);
		set = (set == null) ? undefined : callable(set);
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	return { get: get, set: set, configurable: c, enumerable: e };
};

d.binder = function self(name, dv) {
	var value, dgs;
	if (!isString(name)) {
		return map(name, function (dv, name) { return self(name, dv); });
	}
	value = validValue(dv) && callable(dv.value);
	dgs = copy(dv);
	delete dgs.writable;
	delete dgs.value;
	dgs.get = function () {
		dv.value = bind.call(value, this);
		defineProperty(this, name, dv);
		return this[name];
	};
	return dgs;
};

},{"../String/is-string":35,"../String/prototype/contains":36,"./copy":23,"./is-callable":27,"./map":31,"./valid-callable":33,"./valid-value":34}],25:[function(require,module,exports){
'use strict';

var value = require('./valid-value')

  , forEach = Array.prototype.forEach, slice = Array.prototype.slice
  , keys = Object.keys

  , extend;

extend = function (src) {
	keys(Object(src)).forEach(function (key) {
		this[key] = src[key];
	}, this);
};

module.exports = function (dest/*, …src*/) {
	forEach.call(arguments, value);
	slice.call(arguments, 1).forEach(extend, dest);
	return dest;
};

},{"./valid-value":34}],26:[function(require,module,exports){
'use strict';

module.exports = require('./_iterate')('forEach');

},{"./_iterate":22}],27:[function(require,module,exports){
// Inspired by: http://www.davidflanagan.com/2009/08/typeof-isfuncti.html

'use strict';

var forEach = Array.prototype.forEach.bind([]);

module.exports = function (obj) {
	var type;
	if (!obj) {
		return false;
	}
	type = typeof obj;
	if (type === 'function') {
		return true;
	}
	if (type !== 'object') {
		return false;
	}

	try {
		forEach(obj);
		return true;
	} catch (e) {
		if (e instanceof TypeError) {
			return false;
		}
		throw e;
	}
};

},{}],28:[function(require,module,exports){
'use strict';

var value = require('./valid-value');

module.exports = function (obj) {
	var i;
	value(obj);
	for (i in obj) { //jslint: skip
		if (obj.propertyIsEnumerable(i)) return false;
	}
	return true;
};

},{"./valid-value":34}],29:[function(require,module,exports){
'use strict';

var getPrototypeOf = Object.getPrototypeOf, prototype = Object.prototype
  , toString = prototype.toString

  , id = {}.toString();

module.exports = function (value) {
	var proto;
	if (!value || (typeof value !== 'object') || (toString.call(value) !== id)) {
		return false;
	}
	proto = getPrototypeOf(value);
	return (proto === prototype) || (getPrototypeOf(proto) === null);
};

},{}],30:[function(require,module,exports){
// Implementation credits go to:
// http://wiki.ecmascript.org/doku.php?id=harmony:egal

'use strict';

module.exports = function (x, y) {
	return (x === y) ?
			((x !== 0) || ((1 / x) === (1 / y))) :
			((x !== x) && (y !== y)); //jslint: skip
};

},{}],31:[function(require,module,exports){
'use strict';

var callable = require('./valid-callable')
  , forEach  = require('./for-each')

  , call = Function.prototype.call;

module.exports = function (obj, cb/*, thisArg*/) {
	var o = {}, thisArg = arguments[2];
	callable(cb);
	forEach(obj, function (value, key, obj, index) {
		o[key] = call.call(cb, thisArg, value, key, obj, index);
	});
	return o;
};

},{"./for-each":26,"./valid-callable":33}],32:[function(require,module,exports){
'use strict';

var isCallable = require('./is-callable')
  , callable   = require('./valid-callable')
  , value      = require('./valid-value')

  , call = Function.prototype.call, keys = Object.keys;

module.exports = exports = function self(obj, cb/*, initial, compareFn*/) {
	var list, fn, initial, compareFn, initialized;
	value(obj) && callable(cb);

	obj = Object(obj);
	initial = arguments[2];
	compareFn = arguments[3];

	list = keys(obj);
	if (compareFn) {
		list.sort(isCallable(compareFn) ? compareFn.bind(obj) : undefined);
	}

	fn = function (value, key, index) {
		if (initialized) {
			return call.call(cb, undefined, value, obj[key], key, obj, index);
		} else {
			initialized = true;
			return call.call(cb, undefined, obj[value], obj[key], key, obj, index,
				value);
		}
	};

	if ((arguments.length < 3) || (initial === self.NO_INITIAL)) {
		return list.reduce(fn);
	} else {
		initialized = true;
		return list.reduce(fn, initial);
	}
};
exports.NO_INITIAL = {};

},{"./is-callable":27,"./valid-callable":33,"./valid-value":34}],33:[function(require,module,exports){
'use strict';

var isCallable = require('./is-callable');

module.exports = function (fn) {
	if (!isCallable(fn)) {
		throw new TypeError(fn + " is not a function");
	}
	return fn;
};

},{"./is-callable":27}],34:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) {
		throw new TypeError("Cannot use null or undefined");
	}
	return value;
};

},{}],35:[function(require,module,exports){
'use strict';

var toString = Object.prototype.toString

  , id = toString.call('');

module.exports = function (x) {
	return (typeof x === 'string') || (x && (typeof x === 'object') &&
		((x instanceof String) || (toString.call(x) === id))) || false;
};

},{}],36:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],37:[function(require,module,exports){
// Not rocket science but taken from:
// http://closure-library.googlecode.com/svn/trunk/closure/goog/string/string.js

'use strict';

var value  = require('../../Object/valid-value')
  , toUint = require('../../Number/to-uint');

module.exports = function (n) {
	return new Array((isNaN(n) ? 1 : toUint(n)) + 1).join(String(value(this)));
};

},{"../../Number/to-uint":21,"../../Object/valid-value":34}],38:[function(require,module,exports){
'use strict';

module.exports = new Function("return this")();

},{}],39:[function(require,module,exports){
// To be used internally, memoize factory

'use strict';

var callable = require('es5-ext/lib/Object/valid-callable')
  , forEach  = require('es5-ext/lib/Object/for-each')
  , ee       = require('event-emitter/lib/core')

  , ext;

module.exports = exports = function (core) {
	return function self(fn/*, options */) {
		var options, length, get, clear, conf;

		callable(fn);
		if (fn.memoized) {
			// Do not memoize already memoized function
			return fn;
		}

		options = Object(arguments[1]);
		conf = ee({ memoize: self, fn: fn });

		// Normalize length
		if (isNaN(options.length)) {
			length = fn.length;
			// Special case
			if (options.async && ext.async) {
				--length;
			}
		} else {
			length = (options.length === false) ? false : (options.length >>> 0);
		}

		core(conf, length);

		forEach(ext, function (fn, name) {
			if (fn.force) {
				fn(conf, options);
			} else if (options[name]) {
				fn(options[name], conf, options);
			}
		});

		fn = conf.fn;
		get = conf.get;
		clear = conf.clear;

		conf.memoized.clear = function () { clear(get(arguments)); };
		conf.memoized.clearAll = function () {
			conf.emit('purgeall');
			conf.clearAll();
		};
		conf.memoized.memoized = true;
		conf.emit('ready');
		return conf.memoized;
	};
};
ext = exports.ext = {};

},{"es5-ext/lib/Object/for-each":26,"es5-ext/lib/Object/valid-callable":33,"event-emitter/lib/core":51}],40:[function(require,module,exports){
// Support for asynchronous functions

'use strict';

var toArray     = require('es5-ext/lib/Array/from')
  , last        = require('es5-ext/lib/Array/prototype/last')
  , isArguments = require('es5-ext/lib/Function/is-arguments')
  , forEach     = require('es5-ext/lib/Object/for-each')
  , isCallable  = require('es5-ext/lib/Object/is-callable')
  , nextTick    = require('next-tick')

  , isArray = Array.isArray, slice = Array.prototype.slice
  , apply = Function.prototype.apply;

require('../_base').ext.async = function (ignore, conf) {
	var cache, purge;

	cache = conf.async = {};

	(function (org) {
		var value, cb, initContext, initArgs, fn, resolver;

		conf.on('init', function (id) {
			value.id = id;
			cache[id] = cb ? [cb] : [];
		});

		conf.on('hit', function (id, syncArgs, syncCtx) {
			if (!cb) {
				return;
			}

			if (isArray(cache[id])) {
				cache[id].push(cb);
			} else {
				nextTick(function (cb, id, ctx, args) {
					if (cache[id]) {
						conf.emit('hitasync', id, syncArgs, syncCtx);
						apply.call(cb, this.context, this);
					} else {
						// Purged in a meantime, we shouldn't rely on cached value, recall
						fn.apply(ctx, args);
					}
				}.bind(cache[id], cb, id, initContext, initArgs));
				initContext = initArgs = null;
			}
		});
		conf.fn = function () {
			var args, asyncArgs;
			args = arguments;
			asyncArgs = toArray(args);
			asyncArgs.push(value = function self(err) {
				var i, cb, waiting, res;
				if (self.id == null) {
					// Shouldn't happen, means async callback was called sync way
					nextTick(apply.bind(self, this, arguments));
					return;
				}
				waiting = cache[self.id];
				if (conf.cache.hasOwnProperty(self.id)) {
					if (err) {
						delete cache[self.id];
						conf.clear(self.id);
					} else {
						arguments.context = this;
						cache[self.id] = arguments;
						conf.emit('initasync', self.id, waiting.length);
					}
				} else {
					delete cache[self.id];
				}
				for (i = 0; (cb = waiting[i]); ++i) {
					res = apply.call(cb, this, arguments);
				}
				return res;
			});
			return apply.call(org, this, asyncArgs);
		};

		fn = conf.memoized;
		resolver = function (args) {
			cb = last.call(args);
			if (isCallable(cb)) {
				return slice.call(args, 0, -1);
			} else {
				cb = null;
				return args;
			}
		};
		conf.memoized = function () {
			return fn.apply(initContext = this, initArgs = resolver(arguments));
		};
		forEach(fn, function (value, name) {
			conf.memoized[name] = function () {
				return fn[name].apply(this, resolver(arguments));
			};
		});

	}(conf.fn));

	conf.on('purge', purge = function (id) {
		// If false, we don't have value yet, so we assume that intention is not
		// to memoize this call. After value is obtained we don't cache it but
		// gracefully pass to callback
		if (isArguments(cache[id])) {
			conf.emit('purgeasync', id);
			delete cache[id];
		}
	});

	conf.on('purgeall', function () {
		forEach(conf.async, function (value, id) { purge(id); });
	});
};

},{"../_base":39,"es5-ext/lib/Array/from":11,"es5-ext/lib/Array/prototype/last":14,"es5-ext/lib/Function/is-arguments":16,"es5-ext/lib/Object/for-each":26,"es5-ext/lib/Object/is-callable":27,"next-tick":53}],41:[function(require,module,exports){
// Call dispose callback on each cache purge

'use strict';

var callable = require('es5-ext/lib/Object/valid-callable')
  , forEach  = require('es5-ext/lib/Object/for-each')
  , ext      = require('../_base').ext

  , slice = Array.prototype.slice;

ext.dispose = function (dispose, conf, options) {
	var clear, async;

	callable(dispose);

	async = (options.async && ext.async);
	conf.on('purge' + (async ? 'async' : ''), clear =  async ? function (id) {
		var value = conf.async[id];
		delete conf.cache[id];
		dispose.apply(conf.memoized['_memoize:context_'], slice.call(value, 1));
	} : function (id) {
		var value = conf.cache[id];
		delete conf.cache[id];
		dispose.call(conf.memoized['_memoize:context_'], value);
	});

	if (!async) {
		conf.on('purgeall', function () {
			forEach(conf.cache, function (value, id) { clear(id); });
		});
	}
};

},{"../_base":39,"es5-ext/lib/Object/for-each":26,"es5-ext/lib/Object/valid-callable":33}],42:[function(require,module,exports){
// Timeout cached values

'use strict';

var isNumber = require('es5-ext/lib/Number/is-number')
  , forEach  = require('es5-ext/lib/Object/for-each')
  , nextTick = require('next-tick')
  , ext      = require('../_base').ext

  , max = Math.max, min = Math.min;

ext.maxAge = function (maxAge, conf, options) {
	var cache, async, preFetchAge, preFetchCache;

	maxAge = maxAge >>> 0;
	if (!maxAge) {
		return;
	}

	cache = {};
	async = options.async && ext.async;
	conf.on('init' + (async ? 'async' : ''), function (id) {
		cache[id] = setTimeout(function () { conf.clear(id); }, maxAge);
		if (preFetchCache) {
			preFetchCache[id] = setTimeout(function () { delete preFetchCache[id]; },
				preFetchAge);
		}
	});
	conf.on('purge' + (async ? 'async' : ''), function (id) {
		clearTimeout(cache[id]);
		if (preFetchCache && preFetchCache[id]) {
			clearTimeout(preFetchCache[id]);
			delete preFetchCache[id];
		}
		delete cache[id];
	});

	if (options.preFetch) {
		if (isNumber(options.preFetch)) {
			preFetchAge = max(min(Number(options.preFetch), 1), 0);
		} else {
			preFetchAge = 0.333;
		}
		if (preFetchAge) {
			preFetchCache = {};
			preFetchAge = (1 - preFetchAge) * maxAge;
			conf.on('hit' + (async ? 'async' : ''), function (id, args, ctx) {
				if (!preFetchCache[id]) {
					preFetchCache[id] = true;
					nextTick(function () {
						if (preFetchCache[id] === true) {
							delete preFetchCache[id];
							conf.clear(id);
							conf.memoized.apply(ctx, args);
						}
					});
				}
			});
		}
	}

	if (!async) {
		conf.on('purgeall', function () {
			forEach(cache, function (id) {
				clearTimeout(id);
			});
			cache = {};
			if (preFetchCache) {
				forEach(preFetchCache, function (id) {
					clearTimeout(id);
				});
				preFetchCache = {};
			}
		});
	}
};

},{"../_base":39,"es5-ext/lib/Number/is-number":19,"es5-ext/lib/Object/for-each":26,"next-tick":53}],43:[function(require,module,exports){
// Limit cache size, LRU (least recently used) algorithm.

'use strict';

var ext = require('../_base').ext;

ext.max = function (max, conf, options) {
	var index, base, size, queue, map, async;

	max = max >>> 0;
	if (!max) {
		return;
	}

	index = -1;
	base = size = 0;
	queue = {};
	map = {};
	async = options.async && ext.async;

	conf.on('init' + (async ? 'async' : ''), function (id) {
		queue[++index] = id;
		map[id] = index;
		++size;
		if (size > max) {
			conf.clear(queue[base]);
		}
	});

	conf.on('hit' + (async ? 'async' : ''), function (id) {
		var oldIndex = map[id];
		queue[++index] = id;
		map[id] = index;
		delete queue[oldIndex];
		if (base === oldIndex) {
			while (!queue.hasOwnProperty(++base)) continue; //jslint: skip
		}
	});

	conf.on('purge' + (async ? 'async' : ''), function (id) {
		var oldIndex = map[id];
		delete queue[oldIndex];
		--size;
		if (base === oldIndex) {
			if (!size) {
				index = -1;
				base = 0;
			} else {
				while (!queue.hasOwnProperty(++base)) continue; //jslint: skip
			}
		}
	});

	if (!async) {
		conf.on('purgeall', function () {
			index = -1;
			base = size = 0;
			queue = {};
			map = {};
		});
	}
};

},{"../_base":39}],44:[function(require,module,exports){
// Memoized methods factory

'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , global   = require('es5-ext/lib/global')
  , extend   = require('es5-ext/lib/Object/extend')
  , isString = require('es5-ext/lib/String/is-string')

  , create = Object.create, defineProperty = Object.defineProperty;

require('../_base').ext.method = function (method, conf, options) {
	if (isString(options.method)) {
		method = { name: String(options.method),
			descriptor: { configurable: true, writable: true } };
	} else {
		method = options.method;
		method.name = String(method.name);
		method.descriptor = (method.descriptor == null) ?
				{ configurable: true, writable: true } : Object(method.descriptor);
	}
	options = create(options);
	options.method = undefined;

	(function (fn) {
		conf.memoized = function () {
			var memoized;
			if (this && (this !== global)) {
				memoized = method.descriptor.value =
					conf.memoize(conf.fn.bind(this), options);
				defineProperty(this, method.name, method.descriptor);
				defineProperty(memoized, '_memoize:context_', d(this));
				return memoized.apply(this, arguments);
			}
			return fn.apply(this, arguments);
		};
		extend(conf.memoized, fn);
	}(conf.memoized));
};

},{"../_base":39,"es5-ext/lib/Object/descriptor":24,"es5-ext/lib/Object/extend":25,"es5-ext/lib/String/is-string":35,"es5-ext/lib/global":38}],45:[function(require,module,exports){
// Reference counter, useful for garbage collector like functionality

'use strict';

var ext = require('../_base').ext;

ext.refCounter = function (ignore, conf, options) {
	var cache, async;

	cache = {};
	async = options.async && ext.async;

	conf.on('init' + (async ? 'async' : ''), async ? function (id, length) {
		cache[id] = length;
	} : function (id) { cache[id] = 1; });
	conf.on('hit' + (async ? 'async' : ''), function (id) { ++cache[id]; });
	conf.on('purge' + (async ? 'async' : ''), function (id) {
		delete cache[id];
	});
	if (!async) {
		conf.on('purgeall', function () { cache = {}; });
	}

	conf.memoized.clearRef = function () {
		var id = conf.get(arguments);
		if (cache.hasOwnProperty(id)) {
			if (!--cache[id]) {
				conf.clear(id);
				return true;
			}
			return false;
		}
		return null;
	};
};

},{"../_base":39}],46:[function(require,module,exports){
// Normalize arguments before passing them to underlying function

'use strict';

var toArray    = require('es5-ext/lib/Array/from')
  , forEach    = require('es5-ext/lib/Object/for-each')
  , callable   = require('es5-ext/lib/Object/valid-callable')

  , slice = Array.prototype.slice

  , resolve;

resolve = function (args) {
	return this.map(function (r, i) {
		return r ? r(args[i]) : args[i];
	}).concat(slice.call(args, this.length));
};

require('../_base').ext.resolvers = function (resolvers, conf) {
	var resolver;

	resolver = toArray(resolvers);
	resolver.forEach(function (r) { (r == null) || callable(r); });
	resolver = resolve.bind(resolver);

	(function (fn) {
		conf.memoized = function () {
			var value;
			conf.memoized.args = arguments;
			value = fn.apply(this, resolver(arguments));
			delete conf.memoized.args;
			return value;
		};
		forEach(fn, function (value, name) {
			conf.memoized[name] = function () {
				return fn[name].apply(this, resolver(arguments));
			};
		});
	}(conf.memoized));
};

},{"../_base":39,"es5-ext/lib/Array/from":11,"es5-ext/lib/Object/for-each":26,"es5-ext/lib/Object/valid-callable":33}],47:[function(require,module,exports){
// Provides memoize with all options

'use strict';

var regular   = require('./regular')
  , primitive = require('./primitive')

  , call = Function.prototype.call;

// Order is significant!
require('./ext/dispose');
require('./ext/resolvers');
require('./ext/async');
require('./ext/ref-counter');
require('./ext/method');
require('./ext/max-age');
require('./ext/max');

module.exports = function (fn/* options */) {
	var options = Object(arguments[1]);
	return call.call(options.primitive ? primitive : regular, this, fn, options);
};

},{"./ext/async":40,"./ext/dispose":41,"./ext/max":43,"./ext/max-age":42,"./ext/method":44,"./ext/ref-counter":45,"./ext/resolvers":46,"./primitive":48,"./regular":49}],48:[function(require,module,exports){
// Memoize working in primitive mode

'use strict';

var CustomError  = require('es5-ext/lib/Error/custom')
  , hasListeners = require('event-emitter/lib/has-listeners')

  , getId0 = function () { return ''; }
  , getId1 = function (args) { return args[0]; }

  , apply = Function.prototype.apply, call = Function.prototype.call;

module.exports = require('./_base')(function (conf, length) {
	var get, cache = conf.cache = {}, fn
	  , hitListeners, initListeners, purgeListeners;

	if (length === 1) {
		get = conf.get = getId1;
	} else if (length === false) {
		get = conf.get = function (args) {
			var id = '', i, length = args.length;
			if (length) {
				id += args[i = 0];
				while (--length) {
					id += '\u0001' + args[++i];
				}
			} else {
				id = '\u0002';
			}
			return id;
		};
	} else if (length) {
		get = conf.get = function (args) {
			var id = String(args[0]), i = 0, l = length;
			while (--l) { id += '\u0001' + args[++i]; }
			return id;
		};
	} else {
		get = conf.get = getId0;
	}

	conf.memoized = (length === 1) ? function (id) {
		var value;
		if (cache.hasOwnProperty(id)) {
			hitListeners && conf.emit('hit', id, arguments, this);
			return cache[id];
		} else {
			if (arguments.length === 1) {
				value = call.call(fn, this, id);
			} else {
				value = apply.call(fn, this, arguments);
			}
			if (cache.hasOwnProperty(id)) {
				throw new CustomError("Circular invocation", 'CIRCULAR_INVOCATION');
			}
			cache[id] = value;
			initListeners && conf.emit('init', id);
			return value;
		}
	} : function () {
		var id = get(arguments), value;
		if (cache.hasOwnProperty(id)) {
			hitListeners && conf.emit('hit', id, arguments, this);
			return cache[id];
		} else {
			value = apply.call(conf.fn, this, arguments);
			if (cache.hasOwnProperty(id)) {
				throw new CustomError("Circular invocation", 'CIRCULAR_INVOCATION');
			}
			cache[id] = value;
			initListeners && conf.emit('init', id);
			return value;
		}
	};

	conf.clear = function (id) {
		if (cache.hasOwnProperty(id)) {
			purgeListeners && conf.emit('purge', id);
			delete cache[id];
		}
	};
	conf.clearAll = function () { cache = conf.cache = {}; };

	conf.once('ready', function () {
		fn = conf.fn;
		hitListeners = hasListeners(conf, 'hit');
		initListeners = hasListeners(conf, 'init');
		purgeListeners = hasListeners(conf, 'purge');
	});
});

},{"./_base":39,"es5-ext/lib/Error/custom":15,"event-emitter/lib/has-listeners":52}],49:[function(require,module,exports){
// Memoize working in object mode (supports any type of arguments)

'use strict';

var CustomError  = require('es5-ext/lib/Error/custom')
  , indexOf      = require('es5-ext/lib/Array/prototype/e-index-of')
  , hasListeners = require('event-emitter/lib/has-listeners')

  , apply = Function.prototype.apply;

// Results are saved internally within array matrix:
// [0] -> Result of calling function with no arguments
// [1] -> Matrix that keeps results when function is called with one argument
//        [1][0] -> Array of arguments with which
//                 function have been called
//        [1][1] -> Array of results that matches [1][0] array
// [2] -> Matrix that keeps results when function is called with two arguments
//        [2][0] -> Array of first (of two) arguments with which
//                function have been called
//        [2][1] -> Matrixes that keeps results for two arguments function calls
//                  Each matrix matches first argument found in [2][0]
//                  [2][1][x][0] -> Array of second arguments with which
//                                  function have been called.
//                  [2][1][x][1] -> Array of results that matches [2][1][x][0]
//                                   arguments array
// ...and so on
module.exports = require('./_base')(function (conf, length) {
	var map, map1, map2, get, set, clear, count, fn
	  , hitListeners, initListeners, purgeListeners
	  , cache = conf.cache = {}, argsCache;

	if (length === 0) {
		map = null;
		get = conf.get = function () { return map; };
		set = function () { return ((map = 1)); };
		clear = function () { map = null; };
		conf.clearAll = function () {
			map = null;
			cache = conf.cache = {};
		};
	} else {
		count = 0;
		if (length === 1) {
			map1 = [];
			map2 = [];
			get = conf.get = function (args) {
				var index = indexOf.call(map1, args[0]);
				return (index === -1) ? null : map2[index];
			};
			set = function (args) {
				map1.push(args[0]);
				map2.push(++count);
				return count;
			};
			clear = function (id) {
				var index = indexOf.call(map2, id);
				if (index !== -1) {
					map1.splice(index, 1);
					map2.splice(index, 1);
				}
			};
			conf.clearAll = function () {
				map1 = [];
				map2 = [];
				cache = conf.cache = {};
			};
		} else if (length === false) {
			map = [];
			argsCache = {};
			get = conf.get = function (args) {
				var index = 0, set = map, i, length = args.length;
				if (length === 0) {
					return set[length] || null;
				} else if ((set = set[length])) {
					while (index < (length - 1)) {
						i = indexOf.call(set[0], args[index]);
						if (i === -1) return null;
						set = set[1][i];
						++index;
					}
					i = indexOf.call(set[0], args[index]);
					if (i === -1) return null;
					return set[1][i] || null;
				}
				return null;
			};
			set = function (args) {
				var index = 0, set = map, i, length = args.length;
				if (length === 0) {
					set[length] = ++count;
				} else {
					if (!set[length]) {
						set[length] = [[], []];
					}
					set = set[length];
					while (index < (length - 1)) {
						i = indexOf.call(set[0], args[index]);
						if (i === -1) {
							i = set[0].push(args[index]) - 1;
							set[1].push([[], []]);
						}
						set = set[1][i];
						++index;
					}
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						i = set[0].push(args[index]) - 1;
					}
					set[1][i] = ++count;
				}
				argsCache[count] = args;
				return count;
			};
			clear = function (id) {
				var index = 0, set = map, i, args = argsCache[id], length = args.length
				  , path = [];
				if (length === 0) {
					delete set[length];
				} else if ((set = set[length])) {
					while (index < (length - 1)) {
						i = indexOf.call(set[0], args[index]);
						if (i === -1) {
							return;
						}
						path.push(set, i);
						set = set[1][i];
						++index;
					}
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						return;
					}
					id = set[1][i];
					set[0].splice(i, 1);
					set[1].splice(i, 1);
					while (!set[0].length && path.length) {
						i = path.pop();
						set = path.pop();
						set[0].splice(i, 1);
						set[1].splice(i, 1);
					}
				}
				delete argsCache[id];
			};
			conf.clearAll = function () {
				map = [];
				cache = conf.cache = {};
				argsCache = {};
			};
		} else {
			map = [[], []];
			argsCache = {};
			get = conf.get = function (args) {
				var index = 0, set = map, i;
				while (index < (length - 1)) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) return null;
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) return null;
				return set[1][i] || null;
			};
			set = function (args) {
				var index = 0, set = map, i;
				while (index < (length - 1)) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						i = set[0].push(args[index]) - 1;
						set[1].push([[], []]);
					}
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					i = set[0].push(args[index]) - 1;
				}
				set[1][i] = ++count;
				argsCache[count] = args;
				return count;
			};
			clear = function (id) {
				var index = 0, set = map, i, path = [], args = argsCache[id];
				while (index < (length - 1)) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						return;
					}
					path.push(set, i);
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					return;
				}
				id = set[1][i];
				set[0].splice(i, 1);
				set[1].splice(i, 1);
				while (!set[0].length && path.length) {
					i = path.pop();
					set = path.pop();
					set[0].splice(i, 1);
					set[1].splice(i, 1);
				}
				delete argsCache[id];
			};
			conf.clearAll = function () {
				map = [[], []];
				cache = conf.cache = {};
				argsCache = {};
			};
		}
	}
	conf.memoized = function () {
		var id = get(arguments), value;
		if (id != null) {
			hitListeners && conf.emit('hit', id, arguments, this);
			return cache[id];
		} else {
			value = apply.call(fn, this, arguments);
			id = get(arguments);
			if (id != null) {
				throw new CustomError("Circular invocation", 'CIRCULAR_INVOCATION');
			}
			id = set(arguments);
			cache[id] = value;
			initListeners && conf.emit('init', id);
			return value;
		}
	};
	conf.clear = function (id) {
		if (cache.hasOwnProperty(id)) {
			purgeListeners && conf.emit('purge', id);
			clear(id);
			delete cache[id];
		}
	};

	conf.once('ready', function () {
		fn = conf.fn;
		hitListeners = hasListeners(conf, 'hit');
		initListeners = hasListeners(conf, 'init');
		purgeListeners = hasListeners(conf, 'purge');
	});
});

},{"./_base":39,"es5-ext/lib/Array/prototype/e-index-of":12,"es5-ext/lib/Error/custom":15,"event-emitter/lib/has-listeners":52}],50:[function(require,module,exports){
'use strict';

module.exports = '_ee2_';

},{}],51:[function(require,module,exports){
'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , callable = require('es5-ext/lib/Object/valid-callable')
  , id       = require('./_id')

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit
  , colId, methods, descriptors, base;

colId = id + 'l_';

on = function (type, listener) {
	var data;

	callable(listener);

	if (!this.hasOwnProperty(id)) {
		data = descriptor.value = {};
		defineProperty(this, id, descriptor);
		descriptor.value = null;
	} else {
		data = this[id];
	}
	if (!data.hasOwnProperty(type)) data[type] = listener;
	else if (data[type].hasOwnProperty(colId)) data[type].push(listener);
	else (data[type] = [data[type], listener])[colId] = true;

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once._listener = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!this.hasOwnProperty(id)) return this;
	data = this[id];
	if (!data.hasOwnProperty(type)) return this;
	listeners = data[type];

	if (listeners.hasOwnProperty(colId)) {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) || (candidate._listener === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) || (listeners._listener === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var data, i, l, listener, listeners, args;

	if (!this.hasOwnProperty(id)) return;
	data = this[id];
	if (!data.hasOwnProperty(type)) return;
	listeners = data[type];

	if (listeners.hasOwnProperty(colId)) {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) {
			args[i - 1] = arguments[i];
		}

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;

},{"./_id":50,"es5-ext/lib/Object/descriptor":24,"es5-ext/lib/Object/valid-callable":33}],52:[function(require,module,exports){
'use strict';

var isEmpty = require('es5-ext/lib/Object/is-empty')
  , value   = require('es5-ext/lib/Object/valid-value')
  , id      = require('./_id');

module.exports = function (obj/*, type*/) {
	var type;
	value(obj);
	type = arguments[1];
	if (arguments.length > 1) {
		return obj.hasOwnProperty(id) && obj[id].hasOwnProperty(type);
	} else {
		return obj.hasOwnProperty(id) && !isEmpty(obj[id]);
	}
};

},{"./_id":50,"es5-ext/lib/Object/is-empty":28,"es5-ext/lib/Object/valid-value":34}],53:[function(require,module,exports){
var process=require("__browserify_process");'use strict';

if ((typeof process !== 'undefined') && process &&
		(typeof process.nextTick === 'function')) {

	// Node.js
	module.exports = process.nextTick;

} else if (typeof setImmediate === 'function') {

	// W3C Draft
	// https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	module.exports = function (cb) { setImmediate(cb); };

} else {

	// Wide available standard
	module.exports = function (cb) { setTimeout(cb, 0); };
}

},{"__browserify_process":7}],"joe-reporter-console":[function(require,module,exports){
module.exports=require('VZwf7U');
},{}],"VZwf7U":[function(require,module,exports){
var process=require("__browserify_process");// Generated by CoffeeScript 1.6.2
var ConsoleReporter, cliColor, err, isBrowser, isWindows, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

isBrowser = typeof window !== "undefined" && window !== null;

isWindows = (typeof process !== "undefined" && process !== null ? (_ref = process.platform) != null ? _ref.indexOf('win') : void 0 : void 0) === 0;

try {
  if (!isBrowser) {
    cliColor = require('cli-color');
  }
} catch (_error) {
  err = _error;
  cliColor = null;
}

ConsoleReporter = (function() {
  ConsoleReporter.prototype.errors = null;

  ConsoleReporter.prototype.config = null;

  function ConsoleReporter(config) {
    var _base, _base1, _base2, _base3, _base4, _base5, _base6, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;

    this.errors || (this.errors = []);
    this.config || (this.config = config || {});
    if ((_ref1 = (_base = this.config).start) == null) {
      _base.start = '';
    }
    if ((_ref2 = (_base1 = this.config).fail) == null) {
      _base1.fail = isWindows ? ' ERR!' : ' ✘  ';
    }
    if ((_ref3 = (_base2 = this.config).pass) == null) {
      _base2.pass = isWindows ? ' OK' : ' ✔  ';
    }
    if ((_ref4 = (_base3 = this.config).sub) == null) {
      _base3.sub = isWindows ? ' > ' : ' ➞  ';
    }
    if ((_ref5 = (_base4 = this.config).failHeading) == null) {
      _base4.failHeading = 'Error #%s:';
    }
    if ((_ref6 = (_base5 = this.config).summaryPass) == null) {
      _base5.summaryPass = "%s/%s tests ran successfully, everything passed";
    }
    if ((_ref7 = (_base6 = this.config).summaryFail) == null) {
      _base6.summaryFail = "FAILURE: %s/%s tests ran successfully; %s failed, %s incomplete, %s errors";
    }
    if (cliColor != null) {
      if (__indexOf.call(typeof process !== "undefined" && process !== null ? process.argv : void 0, '--no-colors') < 0) {
        this.config.fail = cliColor.red(this.config.fail);
        this.config.pass = cliColor.green(this.config.pass);
        this.config.sub = cliColor.black(this.config.sub);
        this.config.failHeading = cliColor.red.underline(this.config.failHeading);
        this.config.summaryPass = cliColor.green.underline(this.config.summaryPass);
        this.config.summaryFail = cliColor.red.bold.underline(this.config.summaryFail);
      }
    }
  }

  ConsoleReporter.prototype.getItemName = function(item) {
    var name;

    name = this.joe.getItemName(item, this.config.sub);
    return name;
  };

  ConsoleReporter.prototype.startSuite = function(suite) {
    var message, name;

    name = this.getItemName(suite);
    if (!name) {
      return this;
    }
    message = "" + name + this.config.start;
    console.log(message);
    return this;
  };

  ConsoleReporter.prototype.finishSuite = function(suite, err) {
    var check, message, name;

    name = this.getItemName(suite);
    if (!name) {
      return this;
    }
    check = (err ? this.config.fail : this.config.pass);
    message = "" + name + check;
    console.log(message);
    return this;
  };

  ConsoleReporter.prototype.startTest = function(test) {
    var message, name;

    name = this.getItemName(test);
    if (!name) {
      return this;
    }
    message = "" + name + this.config.start;
    console.log(message);
    return this;
  };

  ConsoleReporter.prototype.finishTest = function(test, err) {
    var check, message, name;

    name = this.getItemName(test);
    if (!name) {
      return this;
    }
    check = (err ? this.config.fail : this.config.pass);
    message = "" + name + check;
    console.log(message, (typeof process !== "undefined" && process !== null) === false && err ? [err, err.stack] : '');
    return this;
  };

  ConsoleReporter.prototype.exit = function(exitCode) {
    var errorLog, errorLogs, index, name, suite, test, totalErrors, totalFailedTests, totalIncompleteTests, totalPassedTests, totalTests, _i, _len, _ref1, _ref2;

    _ref1 = this.joe.getTotals(), totalTests = _ref1.totalTests, totalPassedTests = _ref1.totalPassedTests, totalFailedTests = _ref1.totalFailedTests, totalIncompleteTests = _ref1.totalIncompleteTests, totalErrors = _ref1.totalErrors;
    if (exitCode) {
      errorLogs = this.joe.getErrorLogs();
      console.log("\n" + this.config.summaryFail, totalPassedTests, totalTests, totalFailedTests, totalIncompleteTests, totalErrors);
      for (index = _i = 0, _len = errorLogs.length; _i < _len; index = ++_i) {
        errorLog = errorLogs[index];
        suite = errorLog.suite, test = errorLog.test, name = errorLog.name, err = errorLog.err;
        name || (name = this.getItemName(test || suite));
        console.log("\n" + this.config.failHeading, index + 1);
        console.log(name);
        console.log(((_ref2 = err.stack) != null ? _ref2.toString() : void 0) || err);
      }
      console.log('');
    } else {
      console.log("\n" + this.config.summaryPass, totalPassedTests, totalTests);
    }
    return this;
  };

  return ConsoleReporter;

})();

module.exports = ConsoleReporter;

},{"__browserify_process":7,"cli-color":10}],56:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var typeChecker,
    __hasProp = {}.hasOwnProperty;

  typeChecker = {
    getObjectType: function(value) {
      return Object.prototype.toString.call(value);
    },
    getType: function(value) {
      var result, type, _i, _len, _ref;
      result = 'object';
      _ref = ['Array', 'RegExp', 'Date', 'Function', 'Boolean', 'Number', 'Error', 'String', 'Null', 'Undefined'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        if (typeChecker['is' + type](value)) {
          result = type.toLowerCase();
          break;
        }
      }
      return result;
    },
    isPlainObject: function(value) {
      return typeChecker.isObject(value) && value.__proto__ === Object.prototype;
    },
    isObject: function(value) {
      return value && typeof value === 'object';
    },
    isError: function(value) {
      return value instanceof Error;
    },
    isDate: function(value) {
      return typeChecker.getObjectType(value) === '[object Date]';
    },
    isArguments: function(value) {
      return typeChecker.getObjectType(value) === '[object Arguments]';
    },
    isFunction: function(value) {
      return typeChecker.getObjectType(value) === '[object Function]';
    },
    isRegExp: function(value) {
      return typeChecker.getObjectType(value) === '[object RegExp]';
    },
    isArray: function(value) {
      var _ref;
      return (_ref = typeof Array.isArray === "function" ? Array.isArray(value) : void 0) != null ? _ref : typeChecker.getObjectType(value) === '[object Array]';
    },
    isNumber: function(value) {
      return typeof value === 'number' || typeChecker.getObjectType(value) === '[object Number]';
    },
    isString: function(value) {
      return typeof value === 'string' || typeChecker.getObjectType(value) === '[object String]';
    },
    isBoolean: function(value) {
      return value === true || value === false || typeChecker.getObjectType(value) === '[object Boolean]';
    },
    isNull: function(value) {
      return value === null;
    },
    isUndefined: function(value) {
      return typeof value === 'undefined';
    },
    isEmpty: function(value) {
      return value != null;
    },
    isEmptyObject: function(value) {
      var empty, key;
      empty = true;
      if (value != null) {
        for (key in value) {
          if (!__hasProp.call(value, key)) continue;
          value = value[key];
          empty = false;
          break;
        }
      }
      return empty;
    }
  };

  module.exports = typeChecker;

}).call(this);

},{}],57:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var ambi, typeChecker,
    __slice = [].slice;

  typeChecker = require('typechecker');

  ambi = function() {
    var args, completionCallback, err, fireMethod, introspectMethod, isAsynchronousMethod, method, result;
    method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (typeChecker.isArray(method)) {
      fireMethod = method[0], introspectMethod = method[1];
    } else {
      fireMethod = introspectMethod = method;
    }
    isAsynchronousMethod = introspectMethod.length === args.length;
    completionCallback = args[args.length - 1];
    if (!typeChecker.isFunction(completionCallback)) {
      err = new Error('ambi was called without a completion callback');
      throw err;
    }
    if (isAsynchronousMethod) {
      fireMethod.apply(null, args);
    } else {
      result = fireMethod.apply(null, args);
      if (typeChecker.isError(result)) {
        err = result;
        completionCallback(err);
      } else {
        completionCallback(null, result);
      }
    }
    return null;
  };

  module.exports = ambi;

}).call(this);

},{"typechecker":56}],58:[function(require,module,exports){
var process=require("__browserify_process");// Generated by CoffeeScript 1.6.3
(function() {
  var EventEmitter, Task, TaskGroup, ambi, domain, err, events,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  ambi = require('ambi');

  events = require('events');

  domain = (function() {
    try {
      return require('domain');
    } catch (_error) {
      err = _error;
      return null;
    }
  })();

  EventEmitter = events.EventEmitter;

  Task = (function(_super) {
    __extends(Task, _super);

    Task.prototype.type = 'task';

    Task.prototype.result = null;

    Task.prototype.running = false;

    Task.prototype.completed = false;

    Task.prototype.taskDomain = null;

    Task.prototype.config = null;

    /*
    		name: null
    		method: null
    		args: null
    		parent: null
    */


    function Task() {
      var arg, args, key, opts, value, _base, _i, _len;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Task.__super__.constructor.apply(this, arguments);
      if (this.config == null) {
        this.config = {};
      }
      if ((_base = this.config).run == null) {
        _base.run = false;
      }
      opts = {};
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        switch (typeof arg) {
          case 'string':
            opts.name = arg;
            break;
          case 'function':
            opts.method = arg;
            break;
          case 'object':
            for (key in arg) {
              if (!__hasProp.call(arg, key)) continue;
              value = arg[key];
              opts[key] = value;
            }
        }
      }
      this.setConfig(opts);
      this;
    }

    Task.prototype.setConfig = function(opts) {
      var key, value;
      if (opts == null) {
        opts = {};
      }
      for (key in opts) {
        if (!__hasProp.call(opts, key)) continue;
        value = opts[key];
        switch (key) {
          case 'next':
            if (value) {
              this.once('complete', value.bind(this));
            }
            break;
          default:
            this.config[key] = value;
        }
      }
      return this;
    };

    Task.prototype.getConfig = function() {
      return this.config;
    };

    Task.prototype.reset = function() {
      this.completed = false;
      this.running = false;
      this.result = null;
      return this;
    };

    Task.prototype.uncaughtExceptionCallback = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      err = args[0];
      if (!this.completed) {
        this.complete(args);
      }
      this.emit('error', err);
      return this;
    };

    Task.prototype.completionCallback = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!this.completed) {
        this.complete(args);
        this.emit.apply(this, ['complete'].concat(__slice.call(this.result)));
      } else {
        err = new Error("A task's completion callback has fired when the task was already in a completed state, this is unexpected");
        this.emit('error', err);
      }
      return this;
    };

    Task.prototype.destroy = function() {
      this.removeAllListeners();
      return this;
    };

    Task.prototype.complete = function(result) {
      this.completed = true;
      this.running = false;
      this.result = result;
      return this;
    };

    Task.prototype.fire = function() {
      var args, fire, me;
      me = this;
      args = (this.config.args || []).concat([this.completionCallback.bind(this)]);
      if ((this.taskDomain != null) === false && ((domain != null ? domain.create : void 0) != null)) {
        this.taskDomain = domain.create();
        this.taskDomain.on('error', this.uncaughtExceptionCallback.bind(this));
      }
      fire = function() {
        try {
          return ambi.apply(null, [me.config.method.bind(me)].concat(__slice.call(args)));
        } catch (_error) {
          err = _error;
          return me.uncaughtExceptionCallback(err);
        }
      };
      if (this.taskDomain != null) {
        this.taskDomain.run(fire);
      } else {
        fire();
      }
      return this;
    };

    Task.prototype.run = function() {
      if (this.completed) {
        err = new Error("A task was about to run but it has already completed, this is unexpected");
        this.emit('error', err);
      } else {
        this.reset();
        this.running = true;
        this.emit('run');
        process.nextTick(this.fire.bind(this));
      }
      return this;
    };

    return Task;

  })(EventEmitter);

  TaskGroup = (function(_super) {
    __extends(TaskGroup, _super);

    TaskGroup.prototype.type = 'taskgroup';

    TaskGroup.prototype.running = 0;

    TaskGroup.prototype.remaining = null;

    TaskGroup.prototype.err = null;

    TaskGroup.prototype.results = null;

    TaskGroup.prototype.paused = true;

    TaskGroup.prototype.bubbleEvents = null;

    TaskGroup.prototype.config = null;

    /*
    		name: null
    		method: null
    		concurrency: 1  # use 0 for unlimited
    		pauseOnError: true
    		parent: null
    */


    function TaskGroup() {
      var arg, args, key, me, opts, value, _base, _base1, _base2, _i, _len;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      me = this;
      TaskGroup.__super__.constructor.apply(this, arguments);
      if (this.config == null) {
        this.config = {};
      }
      if ((_base = this.config).concurrency == null) {
        _base.concurrency = 1;
      }
      if ((_base1 = this.config).pauseOnError == null) {
        _base1.pauseOnError = true;
      }
      if ((_base2 = this.config).run == null) {
        _base2.run = false;
      }
      if (this.results == null) {
        this.results = [];
      }
      if (this.remaining == null) {
        this.remaining = [];
      }
      if (this.bubbleEvents == null) {
        this.bubbleEvents = ['complete', 'run', 'error'];
      }
      opts = {};
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        switch (typeof arg) {
          case 'string':
            opts.name = arg;
            break;
          case 'function':
            opts.method = arg;
            break;
          case 'object':
            for (key in arg) {
              if (!__hasProp.call(arg, key)) continue;
              value = arg[key];
              opts[key] = value;
            }
        }
      }
      this.setConfig(opts);
      process.nextTick(this.fire.bind(this));
      this.on('item.complete', this.itemCompletionCallback.bind(this));
      this.on('item.error', function(item, err) {
        me.stop();
        return me.emit('error', err);
      });
      this;
    }

    TaskGroup.prototype.setConfig = function(opts) {
      var key, value;
      if (opts == null) {
        opts = {};
      }
      for (key in opts) {
        if (!__hasProp.call(opts, key)) continue;
        value = opts[key];
        switch (key) {
          case 'next':
            if (value) {
              this.once('complete', value.bind(this));
            }
            break;
          case 'task':
          case 'tasks':
            if (value) {
              this.addTasks(value);
            }
            break;
          case 'group':
          case 'groups':
            if (value) {
              this.addGroups(value);
            }
            break;
          case 'item':
          case 'items':
            if (value) {
              this.addItems(value);
            }
            break;
          default:
            this.config[key] = value;
        }
      }
      return this;
    };

    TaskGroup.prototype.getConfig = function() {
      return this.config;
    };

    TaskGroup.prototype.fire = function() {
      if (this.config.method) {
        this.addTask(this.config.method.bind(this), {
          args: [this.addGroup.bind(this), this.addTask.bind(this)],
          includeInResults: false
        });
        if (!this.config.parent) {
          this.run();
        }
      }
      if (this.config.run === true) {
        this.run();
      }
      return this;
    };

    TaskGroup.prototype.itemCompletionCallback = function() {
      var args, item;
      item = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (item.config.includeInResults !== false) {
        this.results.push(args);
      }
      if (args[0]) {
        this.err = args[0];
      }
      if (this.running > 0) {
        --this.running;
      }
      if (this.paused) {
        return;
      }
      if (!this.complete()) {
        this.nextItems();
      }
      return this;
    };

    TaskGroup.prototype.getTotals = function() {
      var completed, remaining, running, total;
      running = this.running;
      remaining = this.remaining.length;
      completed = this.results.length;
      total = running + remaining + completed;
      return {
        running: running,
        remaining: remaining,
        completed: completed,
        total: total
      };
    };

    TaskGroup.prototype.addItem = function(item) {
      var me;
      me = this;
      item.setConfig({
        parent: this
      });
      if (item instanceof Task) {
        this.bubbleEvents.forEach(function(bubbleEvent) {
          return item.on(bubbleEvent, function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return me.emit.apply(me, ["task." + bubbleEvent, item].concat(__slice.call(args)));
          });
        });
        this.emit('task.add', item);
      }
      if (item instanceof TaskGroup) {
        this.bubbleEvents.forEach(function(bubbleEvent) {
          return item.on(bubbleEvent, function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return me.emit.apply(me, ["group." + bubbleEvent, item].concat(__slice.call(args)));
          });
        });
        this.emit('group.add', item);
      }
      this.bubbleEvents.forEach(function(bubbleEvent) {
        return item.on(bubbleEvent, function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return me.emit.apply(me, ["item." + bubbleEvent, item].concat(__slice.call(args)));
        });
      });
      this.emit('item.add', item);
      this.remaining.push(item);
      if (!this.paused) {
        this.nextItems();
      }
      return item;
    };

    TaskGroup.prototype.addItems = function() {
      var args, item, items;
      items = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!Array.isArray(items)) {
        items = [items];
      }
      return (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          _results.push(this.addItem.apply(this, [item].concat(__slice.call(args))));
        }
        return _results;
      }).call(this);
    };

    TaskGroup.prototype.createTask = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Task, args, function(){});
    };

    TaskGroup.prototype.addTask = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.addItem(this.createTask.apply(this, args));
    };

    TaskGroup.prototype.addTasks = function() {
      var args, item, items;
      items = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!Array.isArray(items)) {
        items = [items];
      }
      return (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          _results.push(this.addTask.apply(this, [item].concat(__slice.call(args))));
        }
        return _results;
      }).call(this);
    };

    TaskGroup.prototype.createGroup = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(TaskGroup, args, function(){});
    };

    TaskGroup.prototype.addGroup = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.addItem(this.createGroup.apply(this, args));
    };

    TaskGroup.prototype.addGroups = function() {
      var args, item, items;
      items = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!Array.isArray(items)) {
        items = [items];
      }
      return (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          _results.push(this.addGroup.apply(this, [item].concat(__slice.call(args))));
        }
        return _results;
      }).call(this);
    };

    TaskGroup.prototype.hasItems = function() {
      return this.remaining.length !== 0;
    };

    TaskGroup.prototype.isReady = function() {
      return !this.config.concurrency || this.running < this.config.concurrency;
    };

    TaskGroup.prototype.nextItems = function() {
      var item, items, result;
      items = [];
      while (true) {
        item = this.nextItem();
        if (item) {
          items.push(item);
        } else {
          break;
        }
      }
      result = items.length ? items : false;
      return result;
    };

    TaskGroup.prototype.nextItem = function() {
      var nextItem;
      if (this.hasItems()) {
        if (this.isReady()) {
          nextItem = this.remaining.shift();
          ++this.running;
          nextItem.run();
          return nextItem;
        }
      }
      return false;
    };

    TaskGroup.prototype.complete = function() {
      var completed, empty, pause;
      pause = this.config.pauseOnError && this.err;
      empty = this.hasItems() === false && this.running === 0;
      completed = pause || empty;
      if (completed) {
        if (pause) {
          this.pause();
        }
        this.emit('complete', this.err, this.results);
        this.err = null;
        this.results = [];
      }
      return completed;
    };

    TaskGroup.prototype.clear = function() {
      var item, _i, _len, _ref;
      _ref = this.remaining.splice(0);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        item.destroy();
      }
      return this;
    };

    TaskGroup.prototype.destroy = function() {
      this.stop();
      this.removeAllListeners();
      return this;
    };

    TaskGroup.prototype.stop = function() {
      this.pause();
      this.clear();
      return this;
    };

    TaskGroup.prototype.exit = function(err) {
      if (err) {
        this.err = err;
      }
      this.stop();
      this.running = 0;
      this.complete();
      return this;
    };

    TaskGroup.prototype.pause = function() {
      this.paused = true;
      return this;
    };

    TaskGroup.prototype.run = function() {
      var args, me;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      me = this;
      this.paused = false;
      this.emit('run');
      process.nextTick(function() {
        if (!me.complete()) {
          return me.nextItems();
        }
      });
      return this;
    };

    return TaskGroup;

  })(EventEmitter);

  module.exports = {
    Task: Task,
    TaskGroup: TaskGroup
  };

}).call(this);

},{"__browserify_process":7,"ambi":57,"domain":3,"events":4}],59:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, joe, wait;

  assert = require('assert');

  joe = require('../..');

  wait = function(delay, fn) {
    return setTimeout(fn, delay);
  };

  joe.suite('example1', function(suite, test) {
    test('api is readonly within node', function() {
      if ((typeof window !== "undefined" && window !== null) === false) {
        joe.blah = true;
        return assert.ok((joe.blah != null) === false);
      }
    });
    return suite('tests', function(suite, test) {
      suite('async-suite', function(suite, test, done) {
        wait(1 * 1000, function() {
          return test('1/2', function() {
            return assert.ok(true);
          });
        });
        wait(2 * 1000, function() {
          return test('2/2', function() {
            return assert.ok(true);
          });
        });
        return wait(3 * 1000, function() {
          return done();
        });
      });
      suite('async-tests', function(suite, test) {
        test('1/2', function(done) {
          return wait(1 * 1000, function() {
            assert.ok(true);
            return done();
          });
        });
        return test('2/2', function(done) {
          return wait(2 * 1000, function() {
            assert.ok(true);
            return done();
          });
        });
      });
      suite('sync', function(suite, test) {
        test('1/2', function() {
          return assert.ok(true);
        });
        return test('2/2', function() {
          return assert.ok(true);
        });
      });
      suite('async-sync', function(suite, test) {
        test('1/2', function(done) {
          return wait(1 * 1000, function() {
            assert.ok(true);
            return done();
          });
        });
        return test('2/2', function() {
          return assert.ok(true);
        });
      });
      return suite('deliberate-failure', function(suite, test) {
        test('1/2', function(done) {
          return wait(1 * 1000, function() {
            assert.ok(false);
            return done();
          });
        });
        return test('2/2', function() {
          return assert.ok(false);
        });
      });
    });
  });

}).call(this);

},{"../..":60,"assert":2}],60:[function(require,module,exports){
var process=require("__browserify_process");// Generated by CoffeeScript 1.6.3
(function() {
  var Suite, Task, TaskGroup, Test, isBrowser, isWindows, joe, joePrivate, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  _ref = require('taskgroup'), Task = _ref.Task, TaskGroup = _ref.TaskGroup;

  isBrowser = typeof window !== "undefined" && window !== null;

  isWindows = (typeof process !== "undefined" && process !== null ? (_ref1 = process.platform) != null ? _ref1.indexOf('win') : void 0 : void 0) === 0;

  Test = (function(_super) {
    __extends(_Class, _super);

    function _Class() {
      _ref2 = _Class.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    return _Class;

  })(Task);

  Suite = (function(_super) {
    __extends(_Class, _super);

    _Class.prototype.groupRunCallback = function(suite) {
      if (!suite.getConfig().name) {
        return;
      }
      joePrivate.totalSuites++;
      return joe.report('startSuite', suite);
    };

    _Class.prototype.groupCompleteCallback = function(suite, err) {
      if (err) {
        joePrivate.addErrorLog({
          suite: suite,
          err: err
        });
        if (!suite.getConfig().name) {
          return;
        }
        joePrivate.totalFailedSuites++;
      } else {
        if (!suite.getConfig().name) {
          return;
        }
        joePrivate.totalPassedSuites++;
      }
      return joe.report('finishSuite', suite, err);
    };

    _Class.prototype.taskRunCallback = function(test) {
      if (!test.getConfig().name) {
        return;
      }
      joePrivate.totalTests++;
      return joe.report('startTest', test);
    };

    _Class.prototype.taskCompleteCallback = function(test, err) {
      if (err) {
        joePrivate.addErrorLog({
          test: test,
          err: err
        });
        if (!test.getConfig().name) {
          return;
        }
        joePrivate.totalFailedTests++;
      } else {
        if (!test.getConfig().name) {
          return;
        }
        joePrivate.totalPassedTests++;
      }
      return joe.report('finishTest', test, err);
    };

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
      this.on('group.run', this.groupRunCallback.bind(this));
      this.on('group.complete', this.groupCompleteCallback.bind(this));
      this.on('group.error', this.groupCompleteCallback.bind(this));
      this.on('task.run', this.taskRunCallback.bind(this));
      this.on('task.complete', this.taskCompleteCallback.bind(this));
      this.on('task.error', this.taskCompleteCallback.bind(this));
    }

    _Class.prototype.createTask = function() {
      var args, task;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      task = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Test, args, function(){});
      return task;
    };

    _Class.prototype.createGroup = function() {
      var args, group;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      group = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Suite, args, function(){});
      return group;
    };

    _Class.prototype.suite = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.addGroup.apply(this, args);
    };

    _Class.prototype.describe = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.addGroup.apply(this, args);
    };

    _Class.prototype.test = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.addTask.apply(this, args);
    };

    _Class.prototype.it = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.addTask.apply(this, args);
    };

    return _Class;

  })(TaskGroup);

  joePrivate = {
    globalSuite: null,
    getGlobalSuite: function() {
      if (joePrivate.globalSuite == null) {
        joePrivate.globalSuite = new Suite().run();
      }
      return joePrivate.globalSuite;
    },
    errorLogs: [],
    addErrorLog: function(errorLog) {
      var _ref3;
      if (errorLog.err === ((_ref3 = joePrivate.errorLogs[joePrivate.errorLogs.length - 1]) != null ? _ref3.err : void 0)) {

      } else {
        joePrivate.errorLogs.push(errorLog);
      }
      return joePrivate;
    },
    exited: false,
    reporters: [],
    totalSuites: 0,
    totalPassedSuites: 0,
    totalFailedSuites: 0,
    totalTests: 0,
    totalPassedTests: 0,
    totalFailedTests: 0,
    getReporters: function() {
      var arg, argResult, err, reporterName, _i, _len, _ref3;
      if (joePrivate.reporters.length === 0) {
        reporterName = 'console';
        _ref3 = (typeof process !== "undefined" && process !== null ? process.argv : void 0) || [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          arg = _ref3[_i];
          argResult = arg.replace(/^--joe-reporter=/, '');
          if (argResult !== arg) {
            reporterName = argResult;
            break;
          }
        }
        try {
          joe.addReporter(reporterName);
        } catch (_error) {
          err = _error;
          console.log("Joe could not load the reporter: " + reporterName + "\nPerhaps it's not installed? Try install it using:\n    npm install --save-dev joe-reporter-" + reporterName + "\nThe exact error was:", err);
          joe.exit(1);
          return;
        }
      }
      return joePrivate.reporters;
    }
  };

  joe = {
    getTotals: function() {
      var errorLogs, result, success, totalErrors, totalFailedSuites, totalFailedTests, totalIncompleteSuites, totalIncompleteTests, totalPassedSuites, totalPassedTests, totalSuites, totalTests;
      totalSuites = joePrivate.totalSuites, totalPassedSuites = joePrivate.totalPassedSuites, totalFailedSuites = joePrivate.totalFailedSuites, totalTests = joePrivate.totalTests, totalPassedTests = joePrivate.totalPassedTests, totalFailedTests = joePrivate.totalFailedTests, errorLogs = joePrivate.errorLogs;
      totalIncompleteSuites = totalSuites - totalPassedSuites - totalFailedSuites;
      totalIncompleteTests = totalTests - totalPassedTests - totalFailedTests;
      totalErrors = errorLogs.length;
      success = (totalIncompleteSuites === 0) && (totalFailedSuites === 0) && (totalIncompleteTests === 0) && (totalFailedTests === 0) && (totalErrors === 0);
      result = {
        totalSuites: totalSuites,
        totalPassedSuites: totalPassedSuites,
        totalFailedSuites: totalFailedSuites,
        totalIncompleteSuites: totalIncompleteSuites,
        totalTests: totalTests,
        totalPassedTests: totalPassedTests,
        totalFailedTests: totalFailedTests,
        totalIncompleteTests: totalIncompleteTests,
        totalErrors: totalErrors,
        success: success
      };
      return result;
    },
    getErrorLogs: function() {
      return joePrivate.errorLogs.slice();
    },
    hasErrors: function() {
      return joe.getTotals().success === false;
    },
    hasExited: function() {
      return joePrivate.exited === true;
    },
    hasReporters: function() {
      return joePrivate.reporters !== 0;
    },
    addReporter: function(reporterInstance) {
      var Reporter;
      if (typeof reporterInstance === 'string') {
        Reporter = require("joe-reporter-" + reporterInstance);
        reporterInstance = new Reporter();
      }
      reporterInstance.joe = joe;
      joePrivate.reporters.push(reporterInstance);
      return joe;
    },
    setReporter: function(reporterInstance) {
      joePrivate.reporters = [];
      if (reporterInstance != null) {
        joe.addReporter(reporterInstance);
      }
      return joe;
    },
    report: function() {
      var args, event, reporter, reporters, _i, _len, _ref3;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      reporters = joePrivate.getReporters();
      if (!reporters.length) {
        console.log("Joe has no reporters loaded, so cannot log anything...");
        joe.exit(1);
        return joe;
      }
      for (_i = 0, _len = reporters.length; _i < _len; _i++) {
        reporter = reporters[_i];
        if ((_ref3 = reporter[event]) != null) {
          _ref3.apply(reporter, args);
        }
      }
      return joe;
    },
    exit: function(exitCode) {
      if (joe.hasExited()) {
        return;
      }
      joePrivate.exited = true;
      joePrivate.getGlobalSuite().stop();
      if (exitCode == null) {
        exitCode = joe.hasErrors() ? 1 : 0;
      }
      joe.report('exit', exitCode);
      if (typeof process !== "undefined" && process !== null) {
        if (typeof process.exit === "function") {
          process.exit(exitCode);
        }
      }
      return joe;
    },
    uncaughtException: function(err) {
      if (joe.hasExited()) {
        return;
      }
      if (!(err instanceof Error)) {
        err = new Error(err);
      }
      joePrivate.addErrorLog({
        name: 'uncaughtException',
        err: err
      });
      joe.report('uncaughtException', err);
      joe.exit(1);
      return joe;
    },
    getItemNames: function(item) {
      var config, result;
      result = [];
      config = item.getConfig();
      if (config.parent) {
        result = result.concat(this.getItemNames(config.parent));
      }
      if (config.name) {
        result.push(config.name);
      }
      return result;
    },
    getItemName: function(item, separator) {
      var result;
      if (separator) {
        result = joe.getItemNames(item).join(separator);
      } else {
        result = item.getConfig().name;
      }
      return result;
    }
  };

  if (isBrowser) {
    joePrivate.getGlobalSuite().on('item.complete', function(item) {
      if (!item.getConfig().name) {
        return;
      }
      return joePrivate.getGlobalSuite().on('complete', function() {
        return process.nextTick(function() {
          return joe.exit();
        });
      });
    });
  } else if (typeof process !== "undefined" && process !== null) {
    if (!isWindows) {
      process.on('SIGINT', function() {
        return joe.exit();
      });
    }
    process.on('exit', function() {
      return joe.exit();
    });
    process.on('uncaughtException', function(err) {
      return joe.uncaughtException(err);
    });
  }

  joePrivate.getGlobalSuite().on('error', function(err) {
    return joe.uncaughtException(err);
  });

  joe.describe = joe.suite = function() {
    var args, globalSuite;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    globalSuite = joePrivate.getGlobalSuite();
    return globalSuite.suite.apply(globalSuite, args);
  };

  joe.it = joe.test = function() {
    var args, globalSuite;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    globalSuite = joePrivate.getGlobalSuite();
    return globalSuite.test.apply(globalSuite, args);
  };

  if (!isBrowser) {
    if (typeof Object.freeze === "function") {
      Object.freeze(joe);
    }
  }

  module.exports = joe;

}).call(this);

},{"__browserify_process":7,"taskgroup":58}]},{},[59])
;