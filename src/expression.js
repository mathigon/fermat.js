// =================================================================================================
// Fermat.js | Expressions
// ***EXPERIMENTAL ***
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    M.expression = {};

    function handleBracket(brkt, x) {
        switch(x) {
            case '(': ++brkt['(']; break;
            case ')': --brkt['(']; break;
            case '[': ++brkt['[']; break;
            case ']': --brkt['[']; break;
            case '{': ++brkt['{']; break;
            case '}': --brkt['{']; break;
            case '|': brkt['|'] = 1-brkt['|']; break;
        }

        // TODO Error on negative brkt
        return brkt['('] + brkt['['] + brkt['{'] + brkt['|'];
    }

    function splitAt(array, del) {
        var result = [];
        var last = -1;
        for (var i=0; i<array.length; ++i) {
            if (array[i] === del) {
                result.push(array.slice(last+1, i));
                last = i;
            }
        }
        result.push(array.slice(last+1, i));
        return result;
    }


    // ---------------------------------------------------------------------------------------------
    // Expression Parsing

    // TODO Strings ""
    // TODO propagate errors

    M.expression.parse = function parse(str, multiple) {

        var current = '';
        var result = [];
        var n = str.length;
        var isOpen = false;
        var openFn;
        var openBrk;

        function push(x) {
            if (!x) return;
            var num = +x;
            result.push(num === num ? num : x);
        }

        var brkt = { '(': 0, '[': 0, '{': 0, '|': 0 };

        for (var i=0; i<n; ++i) {

            var x = str[i];
            var wasOpen = isOpen;
            isOpen = handleBracket(brkt, x);

            // TODO fail on {}@&\?<>=~`±§

            if (('([{').contains(x) && !wasOpen) {
                if (x === '(' && +current !== +current && !('+-*/!^,').contains(current)) {
                    openFn = current;
                } else {
                    push(current);
                }
                openBrk = x;
                current = '';
            } else if (isOpen) {
                current += x;
            } else if ((')]}').contains(x)) {
                if (current) {
                    if (openFn) {
                        result.push(Array.prototype.concat([openFn], parse(current, true)));
                    } else if (openBrk === '[') {
                        result.push(Array.prototype.concat(['[]'], parse(current, true)));
                    } else {
                        result.push(parse(current));
                    }
                }
                openFn = openBrk = null;
                current = '';
            } else if (('+-*/!^%,').contains(x)) {
                if (x === ',' && !multiple) return ['Error: unexpected ",".'];
                push(current);
                if (x !== ',') result.push(x);
                current = '';
            } else if (x.match(/\s\n\t/)) {
                push(current);
                current = '';
            } else {
                current += x.trim();
            }
        }

        if (brkt['('] + brkt['['] + brkt['{'] + brkt['|']) return ['Error: non-matching brackets'];

        push(current);

        // Handle Factorials
        for (i=0; i<result.length; ++i) {
            if (result[i] === '!') {
                result.splice(i-1, 2, ['!', result[i-1]]);
                i -= 1;
            }
        }

        // Handle Percentages
        for (i=0; i<result.length; ++i) {
            if (result[i] === '!') {
                result.splice(i-1, 2, ['/', result[i-1], 100]);
                i -= 1;
            }
        }

        // Handle Powers
        for (i=0; i<result.length; ++i) {
            if (result[i] === '^') {
                result.splice(i-1, 3, ['^', result[i-1], result[i+1]]);
                i -= 2;
            }
        }

        // Handle Leading -
        if (result[0] === '-') result.splice(0, 2, ['-', result[1]]);

        // Handle Multiplication and Division
        for (i=0; i<result.length; ++i) {
            if (result[i] === '/') {
                result.splice(i-1, 3, ['/', result[i-1], result[i+1]]);
                i -= 2;
            } else if (result[i] === '*') {
                result.splice(i-1, 3, ['*', result[i-1], result[i+1]]);
                i -= 2;
            }
        }

        // Handle Addition and Subtraction
        for (i=0; i<result.length; ++i) {
            if (result[i] === '-') {
                result.splice(i-1, 3, ['-', result[i-1], result[i+1]]);
                i -= 2;
            } else if (result[i] === '+') {
                result.splice(i-1, 3, ['+', result[i-1], result[i+1]]);
                i -= 2;
            }
        }

        return result[0];
    };


    // ---------------------------------------------------------------------------------------------
    // Expression Simplify

    M.expression.simplify = function(expr, vars) {
        // TODO
    };


    // ---------------------------------------------------------------------------------------------
    // Expression to String

    M.expression.toString = function(expr) {
        // TODO
    };

    // ---------------------------------------------------------------------------------------------
    // Expression Evaluate

    var fn = {
        '+': function(a, b) { return a + b; },
        '-': function(a, b) { return (b === undefined) ? -a : a - b; },
        '*': function(a, b) { return a * b; },
        '/': function(a, b) { return a / b; },
        '!': function(n) { return M.factorial(n); },
        '^': function(a, b) { return Math.pow(a, b); },
        '[]': function() { return arguments; },
        'mod': function(a, b) { return M.mod(a, b); }
    };

    M.expression.evaluate = function evaluate(expr, vars) {

        // Individual Values
        if (M.isNumber(expr)) return expr;
        if (M.isString(expr)) return M.has(vars, expr) ? vars[expr] : expr;

        // Functions
        var args = [];
        for (var i=1; i<expr.length; ++i) args.push(evaluate(expr[i], vars));
        var f = fn[expr[0]] || Math[expr[0]] || M[expr[0]];
        return f.apply(null, args);
    };

})();
