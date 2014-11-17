// =================================================================================================
// Fermat.js | Combinatorics
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    M.factorial = caching(function(x) {
        if (x < 0) return NaN;
        if (x === 0) return 1;
        if (x <= 1) return x;
        return x * M.factorial(x - 1);
    });


    // Returns binomial coefficient (n choose k)
    M.binomial = caching(function(n, k) {
        if (k === 0) {
            return 1;
        } else if (2 * k > n) {
            return M.binomial(n, n - k);
        } else {
            var coeff = 1;
            for (var i = k; i > 0; --i) {
                coeff *= (n - i + 1);
                coeff /= i;
            }
            return coeff;
        }
    });

    /*
    if (k > n || k < 0) return NaN;

    k = Math.round(k);
    n = Math.round(n);

    if (k === 0 || k === n) return 1;

    var b = 1;

    for (var i = 0; i < k; i++) {
        b *= (n - i);
        b /= (i + 1);
    }

    return b;
    */


    // Returns an array of all the permutationsof arr.
    // permutations(arr)[0] == arr
    // http://stackoverflow.com/questions/9960908/permutations-in-javascript
    M.permutations = function(arr) {
        var permArr = [];
        var usedChars = [];
        function permute(input) {
            for (var i = 0; i < input.length; i++) {
                var term = input.splice(i, 1)[0];
                usedChars.push(term);
                if (input.length === 0) {
                    permArr.push(usedChars.slice());
                }
                permute(input);
                input.splice(i, 0, term);
                usedChars.pop();
            }
            return permArr;
        }
        return permute(arr);
    };


    function getSubsets(arr) {
        if (arr.length === 1) return [[], arr];
        var last = arr.pop();
        var subsets = getSubsets(arr);
        var result = [];
        for (var i=0; i<subsets.length; ++i) {
            var a2 = subsets[i].clone();
            a2.push(last);
            result.push(subsets[i], a2);
        }
        return result;
    }

    // Returns all subsets of arr (of given length)
    M.subsets = function(arr, length) {
        var myArr = _arraySlice.call(arr, 0);
        var subsets = getSubsets(myArr);
        if (length) subsets = subsets.filter(function(x) { return x.length === length; });
        return subsets;
        // FUTURE Sorting of Subsets Results
    };


    // Returns a string of n coin flips like 'HTTHTHTTHTT'
    M.coinFlips = function(n) {
        var str = '';
        for (var i=0; i<n; ++i) {
            str += (Math.random() >= 0.5) ? 'H' : 'T';
        }
        return str;
    };

})();
