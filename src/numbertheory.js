// =================================================================================================
// Fermat.js | Number Theory
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    var smallPrimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];


    M.gcd = function gcd(a, b) {
        if (arguments.length > 2) {
            var rest = [].slice.call(arguments, 1);
            return gcd(a, gcd.apply(null, rest));
        }

        var mod;
        a = Math.abs(a);
        b = Math.abs(b);

        while (b) {
            mod = a % b;
            a = b;
            b = mod;
        }

        return a;
    };


    M.lcm = function lcm(a, b) {
        if (arguments.length > 2) {
            var rest = [].slice.call(arguments, 1);
            return lcm(a, lcm.apply(null, rest));
        }

        return Math.abs(a * b) / M.gcd(a, b);
    };


    M.isPrime = function(n) {
        if (n <= 1 || !M.isInt(n)) return false;
        if (n < 101) return (findInArray(smallPrimes, n) >= 0);
        if (n % 2 === 0) return false;

        var sqrt = Math.sqrt(n);
        for (var i = 3; i <= sqrt; i += 2) {
            if (n % i === 0) return false;
        }

        return true;
    };


    M.isOdd = function(n) {
        return n % 2 === 1;
    };


    M.isEven = function(n) {
        return n % 2 === 0;
    };


    M.primeFactorization = function fact(n) {
        if (n === 1) return [];
        if (M.isPrime(n)) return [n];

        var maxf = Math.sqrt(n);
        for (var f = 2; f <= maxf; ++f) {
            if (n % f === 0) return concatArray(fact(f), fact(n / f));
        }
    };


    M.primeFactors = function(n) {
        return M.primeFactorization(n).unique();
    };


    // Returns an array of all primes below n
    M.listPrimes = function(n) {
        if (n < 2) return [];
        var result = [2];

        for (var i = 3; i <= n; i++) {
            var notMultiple = false;
            for (var j in result) {
                if (M.has(result, j)) notMultiple = notMultiple || (0 === i % result[j]);
            }
            if (!notMultiple) result.push(i);
        }

        return result;
    };

})();
