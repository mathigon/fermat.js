// ============================================================================
// Fermat.js | Combinatorics
// (c) 2015 Mathigon / Philipp Legner
// ============================================================================



import cache from 'utilities.js'


const factorial = cache(function(x) {
    if (x < 0) return NaN;
    if (x === 0) return 1;
    if (x <= 1) return x;
    return x * factorial(x - 1);
});


const binomial = cache(function(n, k) {  // n choose k
    if (k === 0) {
        return 1;
    } else if (2 * k > n) {
        return binomial(n, n - k);
    } else {
        let coeff = 1;
        for (let i = k; i > 0; --i) {
            coeff *= (n - i + 1);
            coeff /= i;
        }
        return coeff;
    }
});

// permutations(arr)[0] == arr
// http://stackoverflow.com/questions/9960908/permutations-in-javascript
function permutations(arr) {
    let permArr = [];
    let usedChars = [];
    function permute(input) {
        for (let i = 0; i < input.length; i++) {
            let term = input.splice(i, 1)[0];
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
}

function _getSubsets(arr) {
    if (arr.length === 1) return [[], arr];
    let last = arr.pop();
    let subsets = getSubsets(arr);
    let result = [];
    for (let s of subsets) {
        let a2 = s.slice(0);
        a2.push(last);
        result.push(s, a2);
    }
    return result;
}

function subsets(arr, length = 0) {
    let myArr = arr.slice(0);
    let subsets = _getSubsets(myArr);
    if (length) subsets = subsets.filter(x => x.length === length);
    // FUTURE Sorting of Subsets Results
    return subsets;
}

// Returns a string of n coin flips like 'HTTHTHTTHTT'
function coinFlips(n = 10) {
    let str = '';
    for (let i = 0; i < n; ++i) {
        str += (Math.random() >= 0.5) ? 'H' : 'T';
    }
    return str;
}


export default { factorial, binomial, permutations, subsets, coinFlips };

