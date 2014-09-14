// =================================================================================================
// Fermat.js | Arrays
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    // ---------------------------------------------------------------------------------------------
    // Array Generatora

    function tabulateWith(fn, vals, args) {
        var result = [], i;
        if (args.length === 1) {
            for (i=0; i<args[0]; ++i) result.push( fn.apply(null, vals.concat([i])) );
        } else {
            var newArgs = Array.prototype.slice.call(args, 0);
            var myX = newArgs.pop();
            for (i=0; i<myX; ++i) result.push( tabulateWith(fn, vals.concat([i]), newArgs ) );
        }
        return result;
    }

    M.tabulate = function(fn, x, y, z) {
        var indices = [];
        _arrayPush.apply(indices, arguments);
        indices.shift();
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
    // Simple Array Functions

    // Finds the smallest and the largest value in the arra a
    M.range = function(a) {
        return [M.min(a), M.max(a)];
    };

    // Removes any null or undefined values in array a
    M.clean = function(a) {
        var b = [], n = a.length;
        for (var i = 0; i < n; ++i)
            if (a[i] != null) b.push(a[i]);
        return b;
    };

    // Removes duplicates in an array a
    M.unique = function(a) {
        var b = [], n = a.length;
        for (var i = 0; i < n; ++i)
            if (b.indexOf(a[i]) === -1) b.push(a[i]);
        return b;
    };

    // Removes all occurrences of x from the array a
    M.without = function(a, x) {
        var b = [], n = a.length;
        for (var i = 0; i < n; ++i)
            if (a[i] !== x) b.push(a[i]);
        return b;
    };

    // Breaks an array a into chunks of size at most n
    M.chunk = function(a, n) {
        var chunks = [];
        var lastChunk = [];
        var count = 0, l = a.length;

        for (var i = 0; i < l; ++i) {
            lastChunk.push(a[i]);
            ++count;
            if (count >= n) {
                chunks.push(lastChunk);
                lastChunk = [];
                count = 0;
            }
        }

        if (lastChunk.length) chunks.push(lastChunk);
        return chunks;
    };

    // Randomly shuffles the elements in an array
    M.shuffle = function(a) {
        a = _arraySlice.call(a, 0); // create copy
        var j, tmp;
        for (var i = a.length - 1; i; --i) {
            j = Math.floor(Math.random() * (i+1));
            tmp = a[j];
            a[j] = a[i];
            a[i] = tmp;
        }
        return a;
    };

    // Rotates the elements of an array by offset
    M.arrayRotate = function(a, offset) {
        var n = a.length;
        offset = ((offset % n) + n) % n; // offset could initially be negative...
        var start = a.slice(0, offset);
        var end = a.slice(offset);
        _arrayPush.apply(end, start);
        return end;
    };

})();
