// Tesla JavaScript Tools
// (c) 2014, Mathigon / Philipp Legner
// MIT License (https://github.com/Mathigon/tesla.js/blob/master/LICENSE)

 (function() {
var M = { tesla: true };

// Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = M;
    global.M = M;

// AMD module
} else if (typeof define === 'function' && define.amd) {
    define(M);

// Global variable
} else {
    window.M = M;
}


// =================================================================================================


M.noop = function() {};

M.run = function(obj, args, _this) {
    if (obj instanceof Function) {
        return obj.apply(_this || null, args);
    } else {
        return obj;
    }
};

// Checks if x is strictly equal to any one of the following arguments
M.isOneOf = function(x, values) {
    for (var i=1; i<arguments.length; ++i)
        if (x === arguments[i]) return true;
    return false;
};
;(function() {

    // ---------------------------------------------------------------------------------------------
    // Object Functions

    M.object = {};

    // Checks is an object has a given key
    M.has = function(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    };

    // Returns an array with all keys in an object
    M.object.keys = function(obj) {
        var keys = [];
        for (var key in obj) if (M.has(obj, key)) keys.push(key);
        return keys;
    };

    // Swaps keys and values for an object
    M.object.invert = function(obj) {
        var result = {};
        var keys = M.keys(obj);
        for (var i = 0, l = keys.length; i < l; ++i) {
            result[obj[keys[i]]] = keys[i];
        }
        return result;
    };

    M.object.create = Object.create || (function () {
        function F() {}
        return function (proto) {
            F.prototype = proto;
            return new F();
        };
    })();


    // ---------------------------------------------------------------------------------------------
    // Object/Array Iterators

    // Collection can be an array or an object
    M.each = function(collection, fn) {
        var result, i;
        var l = collection.length;
        if (l === 0 || (l && collection.hasOwnProperty(l-1))) {
            result = [];
            for (i=0; i<l; ++i) if (M.has(collection, i)) result.push(fn(collection[i], i));
        } else {
            result = {};
            for (i in collection) if (M.has(collection, i)) result[i] = fn(collection[i], i);
        }
        return result;
    };


    // ---------------------------------------------------------------------------------------------
    // Object Extend

   function makePrototype(obj, name, fn) {
        Object.defineProperty(obj, name, {
            enumerable: false,
            writable: true,
            value: fn
        });
    }

    M.extend = function(obj, properties, nonEnumerable) {
        for (var p in properties) {
            if (M.has(properties, p)) {
                if (properties[p] === undefined) {
                    delete obj[p];
                } else if (nonEnumerable) {
                    makePrototype(obj, p, properties[p]);
                } else {
                    obj[p] = properties[p];
                }
            }
        }
    };

    // Merges multiple objects into a single one
    M.merge = function() {
        var result = {};
        for (var i=0; i<arguments.length; ++i) {
            M.each(arguments[i], function(value, property) { result[property] = value; });  // jshint ignore:line
        }
        return result;
    };


    // ---------------------------------------------------------------------------------------------
    // Object Watchers
    // https://gist.github.com/eligrey/384583

    M.watch = function(obj, prop, handler) {
        var value = obj[prop];

        var getter = function () { return value; };
        var setter = function (newVal) {
            oldVal = value;
            value = newVal;
            return newVal = handler.call(this, newVal, oldVal);  // jshint ignore:line
        };

        if (delete obj[prop]) { // can't watch constants
            Object.defineProperty(obj, prop, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });
        }
    };

    M.unwatch = function(obj, prop) {
        var val = obj[prop];
        delete obj[prop]; // remove accessor
        obj[prop] = val;
    };

})();
;(function() {

    M.typeof = function(obj) {

        // Matches null and undefined
        if (obj == null) return '' + obj;

        // Falsy Types
        if (isNaN(obj)) return 'nan';

        // Types and Special Objects
        var match = toString.call(obj).match( /^\[object\s(.*)\]$/ );
        var type = match && match[1] || '';
        if (M.isOneOf(type, ['Number', 'String', 'Boolean', 'Array', 'Date', 'RegExp', 'Function']))
            return type.toLowerCase();

        // General Objects
        if (typeof obj === 'object') return 'object';
    };

    // ---------------------------------------------------------------------------------------------

    M.isType = function(x, type) {
        return M.typeof(x) === type;
    };

    M.isString = function(x) {
        return (x instanceof String) || (typeof x === 'string');
    };

    M.isArray = Array.isArray || function(x) {
        return Object.prototype.toString.call(x) === '[object Array]';
    };

    M.isNumber = function(x) {
        return (x instanceof Number) || (typeof x === 'number');
    };

    M.isInteger = function(x) {
        return x % 1 === 0;
    };

    M.isDate = function(x) {
        return Object.prototype.toString.call(x) === '[object Date]';
    };

    M.isNaN = function(x) {
        return x !== x;
    };

    M.isBoolean = function(x) {
        return (x instanceof Boolean) || (typeof x === 'boolean');
    };

    M.isObject = function(x) {
        return x === Object(x);
    };

})();
;(function() {

    // ---------------------------------------------------------------------------------------------
    // Copy

    M.shallowCopy = function(obj) {
        // TODO
    };

    M.deepCopy = function(obj) {
        // TODO
    };


    // ---------------------------------------------------------------------------------------------
    // Equals

    M.shallowEquals = function(obj1, obj2) {

    };

    M.deepEquals = function(obj1, obj2) {

    };

})();



/*

exports.clone = function clone(x) {
  var type = typeof x;

  // immutable primitive types
  if (type === 'number' || type === 'string' || type === 'boolean' ||
      x === null || x === undefined) {
    return x;
  }

  // use clone function of the object when available
  if (typeof x.clone === 'function') {
    return x.clone();
  }

  // array
  if (Array.isArray(x)) {
    return x.map(function (value) {
      return clone(value);
    });
  }

  if (x instanceof Number)  return new Number(x.valueOf());
  if (x instanceof String)  return new String(x.valueOf());
  if (x instanceof Boolean) return new Boolean(x.valueOf());
  if (x instanceof Date)    return new Date(x.valueOf());
  if (x instanceof RegExp)  throw new TypeError('Cannot clone ' + x);  // TODO: clone a RegExp

  // object
  var m = {};
  for (var key in x) {
    if (x.hasOwnProperty(key)) {
      m[key] = clone(x[key]);
    }
  }
  return m;
};




exports.deepEqual = function deepEqual (a, b) {
  var prop, i, len;
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return false;
    }

    if (a.length != b.length) {
      return false;
    }

    for (i = 0, len = a.length; i < len; i++) {
      if (!exports.deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  else if (a instanceof Object) {
    if (Array.isArray(b) || !(b instanceof Object)) {
      return false;
    }

    for (prop in a) {
      //noinspection JSUnfilteredForInLoop
      if (!exports.deepEqual(a[prop], b[prop])) {
        return false;
      }
    }
    for (prop in b) {
      //noinspection JSUnfilteredForInLoop
      if (!exports.deepEqual(a[prop], b[prop])) {
        return false;
      }
    }
    return true;
  }
  else {
    return (typeof a === typeof b) && (a == b);
  }
};



M.deepCopy = function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (M.isDate(obj)) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (M.isArray(obj)) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
};

M.shallowCopy

var deepEqualsHelper = function(a, b) {
    if (a === b) {
        return true;

    } else if ( a === null || b === null || typeof a === "undefined" || typeof b === "undefined"
            || M.typeOf(a) !== M.typeOf(b) ) {
        return false;

    } else {
        return bindCallbacks( a, callbacks, [ b, a ] );
    }
};


M.deepEquals = function deepEq(obj1, obj2) {  // can take >2 arguments

    var args = [].slice.apply( arguments );
    if (args.length < 2) return true;

    var a = args[0];
    var b = args[1];

    return ( (function( a, b ) {

        // apply transition with (1..n) arguments
    }( args[ 0 ], args[ 1 ] ) ) && deepEq.apply( this, args.splice( 1, args.length - 1 ) ) );

};







    // Call the o related callback with the given arguments.
    function bindCallbacks( o, callbacks, args ) {
        var prop = QUnit.objectType( o );
        if ( prop ) {
            if ( QUnit.objectType( callbacks[ prop ] ) === "function" ) {
                return callbacks[ prop ].apply( callbacks, args );
            } else {
                return callbacks[ prop ]; // or undefined
            }
        }
    }



        // stack to decide between skip/abort functions
        callers = [],

        // stack to avoiding loops from circular referencing
        parents = [],
        parentsB = [],

        getProto = Object.getPrototypeOf || function( obj ) {
            return obj.__proto__;
        },
        callbacks = (function() {

            // for string, boolean, number and null
            function useStrictEquality( b, a ) {

                if ( b instanceof a.constructor || a instanceof b.constructor ) {

                    // to catch short annotation VS 'new' annotation of a
                    // declaration
                    // e.g. var i = 1;
                    // var j = new Number(1);
                    return a == b;
                } else {
                    return a === b;
                }
            }

            return {
                "string": useStrictEquality,
                "boolean": useStrictEquality,
                "number": useStrictEquality,
                "null": useStrictEquality,
                "undefined": useStrictEquality,

                "nan": function( b ) {
                    return isNaN( b );
                },

                "date": function( b, a ) {
                    return QUnit.objectType( b ) === "date" && a.valueOf() === b.valueOf();
                },

                "regexp": function( b, a ) {
                    return QUnit.objectType( b ) === "regexp" &&

                        // the regex itself
                        a.source === b.source &&

                        // and its modifiers
                        a.global === b.global &&

                        // (gmi) ...
                        a.ignoreCase === b.ignoreCase &&
                        a.multiline === b.multiline &&
                        a.sticky === b.sticky;
                },

                // - skip when the property is a method of an instance (OOP)
                // - abort otherwise,
                // initial === would have catch identical references anyway
                "function": function() {
                    var caller = callers[ callers.length - 1 ];
                    return caller !== Object && typeof caller !== "undefined";
                },

                "array": function( b, a ) {
                    var i, j, len, loop, aCircular, bCircular;

                    // b could be an object literal here
                    if ( QUnit.objectType( b ) !== "array" ) {
                        return false;
                    }

                    len = a.length;
                    if ( len !== b.length ) {
                        // safe and faster
                        return false;
                    }

                    // track reference to avoid circular references
                    parents.push( a );
                    parentsB.push( b );
                    for ( i = 0; i < len; i++ ) {
                        loop = false;
                        for ( j = 0; j < parents.length; j++ ) {
                            aCircular = parents[ j ] === a[ i ];
                            bCircular = parentsB[ j ] === b[ i ];
                            if ( aCircular || bCircular ) {
                                if ( a[ i ] === b[ i ] || aCircular && bCircular ) {
                                    loop = true;
                                } else {
                                    parents.pop();
                                    parentsB.pop();
                                    return false;
                                }
                            }
                        }
                        if ( !loop && !innerEquiv( a[ i ], b[ i ] ) ) {
                            parents.pop();
                            parentsB.pop();
                            return false;
                        }
                    }
                    parents.pop();
                    parentsB.pop();
                    return true;
                },

                "object": function( b, a ) {

                    var i, j, loop, aCircular, bCircular,
                        // Default to true
                        eq = true,
                        aProperties = [],
                        bProperties = [];

                    // comparing constructors is more strict than using
                    // instanceof
                    if ( a.constructor !== b.constructor ) {

                        // Allow objects with no prototype to be equivalent to
                        // objects with Object as their constructor.
                        if ( !( ( getProto( a ) === null && getProto( b ) === Object.prototype ) ||
                            ( getProto( b ) === null && getProto( a ) === Object.prototype ) ) ) {
                            return false;
                        }
                    }

                    // stack constructor before traversing properties
                    callers.push( a.constructor );

                    // track reference to avoid circular references
                    parents.push( a );
                    parentsB.push( b );

                    // be strict: don't ensure hasOwnProperty and go deep
                    for ( i in a ) {
                        loop = false;
                        for ( j = 0; j < parents.length; j++ ) {
                            aCircular = parents[ j ] === a[ i ];
                            bCircular = parentsB[ j ] === b[ i ];
                            if ( aCircular || bCircular ) {
                                if ( a[ i ] === b[ i ] || aCircular && bCircular ) {
                                    loop = true;
                                } else {
                                    eq = false;
                                    break;
                                }
                            }
                        }
                        aProperties.push( i );
                        if ( !loop && !innerEquiv( a[ i ], b[ i ] ) ) {
                            eq = false;
                            break;
                        }
                    }

                    parents.pop();
                    parentsB.pop();
                    callers.pop(); // unstack, we are done

                    for ( i in b ) {
                        bProperties.push( i ); // collect b's properties
                    }

                    // Ensures identical properties name
                    return eq && innerEquiv( aProperties.sort(), bProperties.sort() );
                }
            };
        }());



*/
;(function() {

    M.inherit = function(ChildClass, ParentClass) {
        ChildClass.prototype = new ParentClass;  // jshint ignore:line
        ChildClass.prototype.constructor = this;
    };

    M.Class = function() {
        this._events = {};
    };

    M.extend(M.Class.prototype, {

        on: function(event, fn) {
            if (this._events[event]) {
                if (this._events[event].indexOf(fn) < 0) this._events[event].push(fn);
            } else {
                this._events[event] = [fn];
            }
        },

        off: function(event, fn) {
            if (!this._events[event]) return;
            var index = this._events[event].indexOf(fn);
            if (index >= 0) this._events.splice(index, 1);
        },

        trigger: function(event, args) {
            if (!this._events[event]) return;
            var _this = this;
            M.each(this._events[event], function(fn) { fn.call(_this, args); });
        }

    }, true);

    M.Class.extend = function(props) {

        var parent = this;

        var NewClass = function() {
            this._events = {};
            if (props.init) props.init.apply(this, arguments);
        };

        NewClass.prototype = {};
        for (var i in parent.prototype) NewClass.prototype[i] = parent.prototype[i];  // jshint ignore:line
        for (i in props) if (i !== 'init') NewClass.prototype[i] = props[i];
        NewClass.extend = M.Class.extend;
        NewClass.prototype.constructor = NewClass;
        NewClass.parent = parent;

        return NewClass;
    };

})();
;(function() {

    M.string = {};

    M.string.endsWith = function(text, search) {
        var start = text.length - search.length;
        var end = text.length;
        return (text.substring(start, end) === search);
    };

    M.string.strip = function(str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    };

    M.string.collapse = function(str) {
        return str.trim().replace(/\s+/g, ' ');
    };

    M.string.toTitleCase = function(str) {
        return str.replace(/\S+/g, function(a){
            return a.charAt(0).toUpperCase() + a.slice(1);
        });
    };

    M.string.words = function(str) {
        return str.strip().split(/\s+/);
    };

})();
;(function() {

    M.extend(Array.prototype, {

        // Runs the function fn(element, index) for every element in an array
        each: function(fn, reverse) {
            var x = [], i;

            if (reverse) {
                for (i = this.length - 1; i >= 0; --i)
                    if (M.has(this, i)) x[i] = fn(this[i], i);
            } else {
                for (i = 0, l = this.length; i < l; ++i)
                    if (M.has(this, i)) x[i] = fn(this[i], i);
            }

            return x;
        },

        total: function() {
            var total = 0, n = this.length;
            for (var i=0; i < n; ++i) total += (+this[i] || 0);
            return total;
        },

        first: function() {
            return this[0];
        },

        last: function() {
            return this[this.length - 1];
        },

        // Finds the minimum of all values in an array a
        min: function() {
            return Math.min.apply(Math, this);
        },

        // Finds the maximum of all values in an array a
        max: function() {
            return Math.max.apply(Math, this);
        }

    }, true);

})();


})();