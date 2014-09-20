// =================================================================================================
// Fermat.js | TODO
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    M.random = {};


    // ---------------------------------------------------------------------------------------------
    // Simple Random Number Generators

    M.random.integer = function(a, b) {
        return Math.floor(a + (b == null ? 1 : b-a+1) * Math.random());
    };

    M.random.integerArray = function(n) {
        var a = [];
        for (var i=0; i<n; ++i) a.push(i);
        return a.shuffle();
    };

    // Choses a random value from weights [2, 5, 3] or { a: 2, b: 5, c: 3 }
    // Total is optional to specify the total of the weights, if the function is called repeatedly
    M.random.weighted = function(obj, setTotal) {
        var total = 0;
        if (setTotal == null) {
            M.each(obj, function(x) { total += (+x); });
        } else {
            total = setTotal;
        }

        var rand = Math.random() * total;
        var curr = 0;

        return M.some(obj, function(x, i) {
            curr += obj[i];
            if (rand <= curr) return i;
        });
    };


    // ---------------------------------------------------------------------------------------------
    // Array Shuffle

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


    // ---------------------------------------------------------------------------------------------
    // Discrete Distribution

    M.random.bernoulli = function(p) {
        if (p == null) p = 0.5;
        p = Math.max(0,Math.min(1,p));
        return (Math.random() < p ? 1 : 0);
    };

    M.random.binomial = function(n,p) {
        if (n == null) n = 1;
        if (p == null) p = 0.5;
        var t = 0;
        for (var i=0; i<n; ++i) t += M.random.bernoulli(p);
        return t;
    };

    M.random.poisson = function(l) {
        if (l == null) l = 1;
        if (l <= 0) return 0;
        var L = Math.exp(-l), p = 1;
        for (var k = 0; p > L; ++k) p = p * Math.random();
        return k - 1;
    };


    // ---------------------------------------------------------------------------------------------
    // Continuous Distribution

    M.random.uniform = function(a, b) {
        if (a == null) a = 0;
        if (b == null) b = 1;
        return a + (b-a) * Math.random();
    };

    M.random.normal = function(m, v) {
        if (m == null) m = 0;
        if (v == null) v = 1;

        var u1 = Math.random();
        var u2 = Math.random();
        var rand = Math.sqrt( -2 * Math.log(u1) ) * Math.cos( 2 * Math.PI * u2 );

        return rand * Math.sqrt(s) + m;
    };

    M.random.exponential = function(l) {
        if (l == null) l = 1;
        return l <= 0 ? 0 : -Math.log(Math.random()) / l;
    };

    M.random.geometric = function(p) {
        if (p == null) p = 0.5;
        if (p <= 0 || p > 1) return null;
        return Math.floor( Math.log(Math.random()) / Math.log(1-p) );
    };

    M.random.cauchy = function() {
        var rr, v1, v2;
        do {
            v1 = 2 * Math.random() - 1;
            v2 = 2 * Math.random() - 1;
            rr = v1 * v1 + v2 * v2;
        } while (rr >= 1);
        return v1/v2;
    };


    // ---------------------------------------------------------------------------------------------
    // PDFs

    M.normalPDF = function(x, m, v) {
        return Math.exp(-M.square(x - m) / (2 * v)) / Math.sqrt(2 * Math.PI * v);
    };

})();
