// Tesla JavaScript Tools
// (c) 2014, Mathigon / Philipp Legner
// MIT License (https://github.com/Mathigon/tesla.js/blob/master/LICENSE)

 (function() {
var M = { tesla: true };

var _arrayPush = Array.prototype.push;
var _arraySlice = Array.prototype.slice;
var _arrayShift = Array.prototype.shift;
var _arrayJoin = Array.prototype.join;

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

    M.isFunction = function(x) {
        return x instanceof Function;
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
        /*jshint -W053 */

        // Handle (simple) strings, numbers, booleans, null and undefined
        var type = typeof obj;
        if (obj == null || M.isOneOf(type, 'number', 'string', 'boolean')) return obj;

        // Hande other type objects
        if (obj instanceof Number)  return new Number(obj.valueOf());
        if (obj instanceof String)  return new String(obj.valueOf());
        if (obj instanceof Boolean) return new Boolean(obj.valueOf());
        if (obj instanceof Date)    return new Date(obj.valueOf());
        if (obj instanceof RegExp)  return new RegExp(obj);

        // Handle Arrays and Objects
        return M.each(obj, function(val) { return val; });
    };

    // ---------------------------------------------------------------------------------------------

    var deepCopyStore = [];

    function deepCopyStoreLookup(obj) {
        for (var i=0; i<deepCopyStore.length; ++i)
            if (deepCopyStore[i][0] === obj) return deepCopyStore[i][1];
        return null;
    }

    function deepCopyHelper(obj) {
        /*jshint -W053 */

        // Handle (simple) strings, numbers, booleans, null and undefined
        var type = typeof obj;
        if (obj == null || M.isOneOf(type, 'number', 'string', 'boolean')) return obj;

        // Hande other type objects
        if (obj instanceof Number)  return new Number(obj.valueOf());
        if (obj instanceof String)  return new String(obj.valueOf());
        if (obj instanceof Boolean) return new Boolean(obj.valueOf());
        if (obj instanceof Date)    return new Date(obj.valueOf());
        if (obj instanceof RegExp)  return new RegExp(obj);

        // Avoids Recursive Loops
        var x = deepCopyStoreLookup(obj);
        if (x) return x;

        var copy = obj;

        // Handle Arrays
        if (M.isArray(obj)) {
            copy = [];
            deepCopyStore.push([obj, copy]);
            for (var i = 0, l = obj.length; i < l; ++i) copy[i] = deepCopyHelper(obj[i]);

        // Handle Objects
        } else if (obj instanceof Object) {
            copy = {};
            deepCopyStore.push([obj, copy]);
            for (var attr in obj) if (M.has(obj, attr)) copy[attr] = deepCopyHelper(obj[attr]);
        }

        return copy;
    }

    M.deepCopy = function(obj) {
        deepCopyStore = [];
        var copy = deepCopyHelper(obj);
        deepCopyStore = [];
        return copy;
    };


    // ---------------------------------------------------------------------------------------------
    // Equals

    M.shallowEquals = function(obj1, obj2) {
        // TODO
    };

    // ---------------------------------------------------------------------------------------------

    M.deepEquals = function(obj1, obj2) {
        // TODO
    };

})();
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

    if ( !String.prototype.contains ) {
        M.extend(String.prototype, {

            contains: function() {
                return String.prototype.indexOf.apply( this, arguments ) !== -1;
            }
        }, true);
    }

})();
;(function() {

    function toArray(fakeArray) {
        var newArray = [];
        _arrayPush.apply(newArray, fakeArray);
        return newArray;
    }

    function getLength(array) {
        return array.length;
    }


    // ---------------------------------------------------------------------------------------------
    // Array Generators

    function tabulateWith(fn, vals, args) {
        if (!args.length) return M.run(fn, vals);

        var newArgs = _arraySlice.call(args, 0);
        var x = newArgs.shift();

        var result = [];
        for (var i=0; i<x; ++i) result.push(tabulateWith(fn, vals.concat([i]), newArgs));
        return result;
    }

    M.tabulate = function(fn, x, y, z) {
        var indices = toArray(arguments);
        _arrayShift.call(indices);
        return tabulateWith(fn, [], indices);
    };

    M.list = function(a, b, step) {
        if (!step) step = 1;
        var arr = [], i;

        if (b == null && a >= 0) {
            for (i=0; i<a; i += step) arr.push(i);
        } else if (b == null) {
            for (i=0; i>a; i -= step) arr.push(i);
        } else if (a <= b) {
            for (i=a; i<=b; i += step) arr.push(i);
        } else {
            for (i=a; i>=b; i -= step) arr.push(i);
        }

        return arr;
    };


    // ---------------------------------------------------------------------------------------------
    // Array Functions

    M.map = function(fn) {
        var arrays = toArray(arguments);
        _arrayShift.call(arrays);

        var maxLength = Math.max.apply(Math, M.each(arrays, getLength));

        return M.tabulate(function(i) {
            return fn.apply(null, M.each(arrays, function(x) { return x[i]; }));
        }, maxLength);
    };


    // Flatten a multi dimensional array, put all elements in a one dimensional array
    M.flatten = function(array) {
        var flat = array;

        while (M.isArray(flat[0])) {
            var next = [];
            for (var i = 0, n = flat.length; i < n; ++i) {
                next = next.concat.apply(next, flat[i]);
            }
            flat = next;
        }

        return flat;
    };


    // ---------------------------------------------------------------------------------------------
    // Array Prototype

    M.extend(Array.prototype, {

        // Runs the function fn(element, index) for every element in an array
        each: function(fn, reverse) {
            var x = [], i;
            var n = this.length;

            if (reverse) {
                for (i = n - 1; i >= 0; --i)
                    if (M.has(this, i)) x[i] = fn(this[i], i);
            } else {
                for (i = 0; i < n; ++i)
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
        },

        // Finds the smallest and the largest value in the arra a
        range: function() {
            return [this.min(), this.max()];
        },

        // Removes any null or undefined values in array a
        clean: function() {
            var b = [], n = this.length;
            for (var i = 0; i < n; ++i)
                if (this[i] != null) b.push(this[i]);
            return b;
        },

        // Removes duplicates in an array a
        unique: function() {
            var b = [], n = this.length;
            for (var i = 0; i < n; ++i)
                if (b.indexOf(this[i]) === -1) b.push(this[i]);
            return b;
        },

        // Removes all occurrences of x from the array a
        without: function(x) {
            var b = [], n = this.length;
            for (var i = 0; i < n; ++i)
                if (this[i] !== x) b.push(this[i]);
            return b;
        },

        // Breaks an array a into chunks of size at most n
        chunk: function(n) {
            var chunks = [];
            var lastChunk = [];
            var count = 0, l = this.length;

            for (var i = 0; i < l; ++i) {
                lastChunk.push(this[i]);
                ++count;
                if (count >= n) {
                    chunks.push(lastChunk);
                    lastChunk = [];
                    count = 0;
                }
            }

            if (lastChunk.length) _arrayPush.call(chunks, lastChunk);
            return chunks;
        },

        // Rotates the elements of an array by offset
        rotate: function(offset) {
            var n = this.length;
            offset = ((offset % n) + n) % n; // offset could initially be negative...
            var start = this.slice(0, offset);
            var end = this.slice(offset);
            _arrayPush.apply(end, start);
            return end;
        }

    }, true);

})();


})();