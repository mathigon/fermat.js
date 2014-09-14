// =================================================================================================
// Fermat.js | TODO
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    M.random = {};

    M.random.integer = function(a, b) {
        return Math.floor(a + (b == null ? 1 : b-a+1) * Math.random());
    };

    /*
    TODO
    // Get an array of unique random numbers between min and max
    randRangeUnique: function(min, max, count) {
        if (count == null) {
            return KhanUtil.randRange(min, max);
        } else {
            var toReturn = [];
            for (var i = min; i <= max; i++) {
                toReturn.push(i);
            }

            return KhanUtil.shuffle(toReturn, count);
        }
    },

    // Get a random integer between min and max with a perc chance of hitting
    // target (which is assumed to be in the range, but it doesn't have to be).
    randRangeWeighted: function(min, max, target, perc) {
        if (KhanUtil.random() < perc || (target === min && target === max)) {
            return target;
        } else {
            return KhanUtil.randRangeExclude(min, max, [target]);
        }
    }
    */

    M.random.integerArray = function(n) {
        var a = [];
        for (var i=0; i<n; ++i) a.push(i);
        return a.shuffle();
    };

    // =============================================================================================

    M.random.bernoulli = function(p) {
        p = Math.max(0,Math.min(1,p));
        return (Math.random() < p ? 1 : 0);
    };

    M.random.binomial = function(n,p) {
        var t = 0;
        for (var i=0; i<n; ++i) t += M.random.bernoulli(p);
        return t;
    };

    M.random.poisson = function(l) {
        if (l <= 0) return 0;
        var L = Math.exp(-l), p = 1;
        for (var k = 0; p > L; ++k) p = p * Math.random();
        return k-1;
    };

    // =============================================================================================

    M.random.uniform = function(a, b) {
        return a + (b-a) * Math.random();
    };

    M.random.normal = function() {
        var u1 = Math.random();
        var u2 = Math.random();
        return Math.sqrt( -2 * Math.log(u1) ) * Math.cos( 2 * Math.PI * u2 );
    };

    M.random.exponential = function(l) {
        if (l <= 0) return 0;
        return -Math.log(Math.random()) / l;
    };

    M.random.geometric = function(p) {
        if (p <= 0 || p > 0) return null;
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

    M.normalPDF = function(mean, stddev, x) {
        return (1 / Math.sqrt(2 * Math.PI * stddev * stddev)) *
            Math.exp(-((x - mean) * (x - mean)) / (2 * stddev * stddev));
    };

})();
