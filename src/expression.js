// =================================================================================================
// Fermat.js | Expressions
// ***EXPERIMENTAL ***
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    // TODO fix parser errors + test
    // TODO + and * with multiple arguments
    // TODO Simplify expressions
    // TODO More error messages: 1(1), "str"(10), %(x)

    // ---------------------------------------------------------------------------------------------
    // Expression Parser

    var brackets = { '(': ')', '[': ']', '{': '}', '|': '|' };

    function bracketsMatch(a, b) {
        return brackets[a] === b || brackets[b] === a;
    }

    function ExpressionParser() {
        this.current = '';
        this.result = [];

        this.currentParser = null;
        this.currentBracket = null;
        this.currentFn = null;
    }

    // Pushes a new letter to the expression parser
    ExpressionParser.prototype.send = function(x) {

        // Handle Strings
        if (this.currentBracket === '"' && x !== '"') {
            this.current += x;

        // Closing Strings
    } else if (!this.currentBracket && x === '"') {
            this.pushCurrent();
            this.currentBracket = '"';

        // Opening Strings
    } else if (this.currentBracket === '"' && x === '"') {
            this.result.push(new Expression('"', [this.current]));

        // Handle Invalid Characters
        } else if (('@&\\?<>=~`±§').contains(x)) {
            throw new Error('Unexpected "' + x + '".');

        // Handle Content for CHild parsers
        } else if (this.currentParser) {

            if ((')]}|').contains(x) && this.currentParser.isReady()) {

                if (!bracketsMatch(x,this.currentBracket))
                    throw new Error('Unexpected "' + x + '".');

                var completed = this.currentParser.complete();
                if (this.currentFn) {
                    this.result.push(new ExpressionFn(this.currentFn, completed));
                } else if (x === ']') {
                    this.result.push(new ExpressionFn('[]', completed));
                } else if (x === '|') {
                    this.result.push(new ExpressionFn('abs', completed));
                } else {
                    if (completed.length !== 1) throw new Error('Unexpected ",".');
                    this.result.push(new ExpressionVal(completed[0]));
                }
                this.current = '';
                this.currentBracket = this.currentParser = this.currentFn = null;

            } else {
                this.currentParser.send(x);
            }

        // Handle Open Brackets
        } else if (('([{|').contains(x)) {
            if (x === '(' && isNaN(+this.current) && !('+-*/!^%,').contains(this.current)) {
                this.currentFn = this.current;
                this.current = '';
            } else {
                this.pushCurrent();
            }
            this.currentParser = new ExpressionParser();
            this.currentBracket = x;

        } else if (('+-*/!^%,').contains(x)) {
            this.pushCurrent();
            if (x !== ',') this.result.push(x);

        } else if (x.match(/\s\n\t/)) {
            this.pushCurrent();

        } else {
            this.current += x.trim();
        }
    };

    ExpressionParser.prototype.isReady = function() {
        return this.currentParser == null;
    };

    // Adds a new letter, number or expression to the results object
    ExpressionParser.prototype.pushCurrent = function() {
        if (!this.current) return;
        var num = +this.current;
        this.result.push(new ExpressionVal(num === num ? num : this.current));
        this.current = '';
    };

    // Completes the expression and returns a new expression
    ExpressionParser.prototype.complete = function(x) {

        this.pushCurrent();
        var i;

        // Handle Factorials and Percentages
        for (i=0; i<this.result.length; ++i) {
            if (this.result[i] === '!') {
                this.result.splice(i-1, 2, new ExpressionFn('!', [this.result[i-1]]));
                i -= 1;
            } else if (this.result[i] === '%') {
                this.result.splice(i-1, 2, new ExpressionFn('/', [this.result[i-1], 100]));
                i -= 1;
            }
        }

        // Handle Powers
        for (i=0; i<this.result.length; ++i) {
            if (this.result[i] === '^') {
                this.result.splice(i-1, 3, new ExpressionFn('^', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            }
        }

        // Handle Leading -
        if (this.result[0] === '-') this.result.splice(0, 2, new ExpressionFn('-', [this.result[1]]));

        // Handle Multiplication and Division
        for (i=0; i<this.result.length; ++i) {
            if (this.result[i] === '/') {
                this.result.splice(i-1, 3, new ExpressionFn('/', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            } else if (this.result[i] === '*') {
                this.result.splice(i-1, 3, new ExpressionFn('*', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            }
        }

        // Handle Addition and Subtraction
        for (i=0; i<this.result.length; ++i) {
            if (this.result[i] === '-') {
                this.result.splice(i-1, 3, new ExpressionFn('-', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            } else if (this.result[i] === '+') {
                this.result.splice(i-1, 3, new ExpressionFn('+', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            }
        }

        return this.result;
    };


    // ---------------------------------------------------------------------------------------------
    // Expressions

    function ExpressionFn(fn, args) {
        this.fn = fn;
        this.args = args;
    }

    ExpressionFn.prototype.simplify = function() {
        // TODO !!!
        return this;
    };

    ExpressionFn.prototype.toString = function() {
        var newArgs = [];
        for (var i=0; i<this.args.length; ++i) newArgs.push(this.args[i].toString());

        var fn = strings[this.fn];
        return fn ? fn.apply(null, newArgs) : this.fn + '(' + this.args.join(', ') + ')';
    };

    ExpressionFn.prototype.evaluate = function(vars) {
        if (vars == null) vars = {};

        var newArgs = [];
        for (var i=0; i<this.args.length; ++i) {
            var newArg = this.args[i].evaluate();
            if (newArg instanceof Expression) return this;
            newArgs.push(newArg);
        }

        var fn = vars[this.fn] || functions[this.fn] || Math[this.fn] || M[this.fn];
        return (fn instanceof Function) ? fn.apply(null, newArgs) : this;
    };


    function ExpressionVal(val) {
        this.val = val;
    }

    ExpressionVal.prototype.simplify = function() {
        return this;
    };

    ExpressionVal.prototype.toString = function() {
        return this.val.toString();
    };

    ExpressionVal.prototype.evaluate = function(vars) {
        if (vars == null) vars = {};
        // TODO return numbers if possible?
        return (vars[this.val] === undefined) ? this.val : vars[this.val];
    };


    // ---------------------------------------------------------------------------------------------
    // Expression Functions

    var functions = {
        '+': function(a, b) { return a + b; },
        '-': function(a, b) { return (b === undefined) ? -a : a - b; },
        '*': function(a, b) { return a * b; },
        '/': function(a, b) { return a / b; },
        '!': function(n) { return M.factorial(n); },
        '^': function(a, b) { return Math.pow(a, b); },
        '[]': function() { return arguments; },
        '"': function(str) { return '' + str; },
        'mod': function(a, b) { return M.mod(a, b); }
    };

    var strings = {
        '+': function() { return M.toArray(arguments).join(' + '); },
        '-': function(a, b) { return (b === undefined) ? '-' + a : a + ' - ' + b; },
        '*': function() { return M.toArray(arguments).join(' * '); },
        '/': function(a, b) { return a + ' / ' + b; },
        '!': function(n) { return n + '!'; },
        '^': function(a, b) { return a + ' ^ ' + b; },
        '[]': function() { return '[' + M.toArray(arguments).join(', ') + ']'; },
        '"': function(str) { return '"' + str + '"'; },
        'mod': function(a, b) { return a + ' mod ' + b; }
    };


    // ---------------------------------------------------------------------------------------------
    // Public Interface

    M.expression = {};

    M.expression.parse = function(str) {

        var parser = new ExpressionParser();

        var n = str.length;
        for (var i=0; i<n; ++i) parser.send(str[i]);

        return parser.complete()[0].simplify();
    };

})();
