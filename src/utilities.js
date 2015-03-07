// =================================================================================================
// Fermat.js | Utilities
// (c) 2015 Mathigon / Philipp Legner
// =================================================================================================


if (typeof M !== 'object' || !M.core) throw new Error('fermat.js requires core.js.');
M.fermat = true;

// Epsilon/tolerance value used by default
var EPS = 0.000001;

// Constants
M.PHI = 1.618033988749895;
M.SQRT2 = 1.4142135623730951;

M.setPrecision = function(eps) {
    EPS = eps || 0.000001;
};

var _arrayJoin = Array.prototype.join;
var _arrayPush = Array.prototype.push;
var _arraySlice = Array.prototype.slice;

// The function remembers previously evaluated values, avoiding repetitive calculations
// http://blog.thejit.org/2008/09/05/memoization-in-javascript/
function caching(fn) {
    if (fn.memo) return fn.memo;
    var cache = {};

    fn.memo = function() {
        var key = _arrayJoin.call(arguments);
        return (cache[key] !== undefined) ? cache[key] : cache[key] = fn.apply(this, arguments);
    };

    return fn.memo;
}

// This function tries to convert all elements in an array to a number
function toNumberArray(array) {
    var newArray = [];
    for (var i=0, n=array.length; i<n; ++i) newArray.push(+array[i]);
    return newArray;
}

function findInArray(array, x) {
    for (var i=0, n=array.length; i<n; ++i) if (array[i] === x) return i;
    return -1;
}

function concatArrays(a1, a2) {
    return Array.prototype.concat.apply(a1, a2);
}
