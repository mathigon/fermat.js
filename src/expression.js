// =============================================================================
// Fermat.js | Expressions
// *** EXPERIMENTAL ***
// (c) 2015 Mathigon
// =============================================================================



// TODO fix parser errors + test
// TODO + and * with multiple arguments
// TODO Simplify expressions
// TODO More error messages: 1(1), "str"(10), %(x)


// -----------------------------------------------------------------------------
// Expression Functions

const functions = {
    '+': function(a, b) { return a + b; },
    '-': function(a, b) { return (b === undefined) ? -a : a - b; },
    '*': function(a, b) { return a * b; },
    '/': function(a, b) { return a / b; },
    '!': function(n) { return M.factorial(n); },  // FIXME
    '^': function(a, b) { return Math.pow(a, b); },
    '[]': function(...args) { return args; },
    '"': function(str) { return '' + str; },
    'mod': function(a, b) { return M.mod(a, b); }
};

const strings = {
    '+': function(...args) { return args.join(' + '); },
    '-': function(a, b) { return (b === undefined) ? '-' + a : a + ' - ' + b; },
    '*': function(...args) { return args.join(' * '); },
    '/': function(a, b) { return a + ' / ' + b; },
    '!': function(n) { return n + '!'; },
    '^': function(a, b) { return a + ' ^ ' + b; },
    '[]': function(...args) { return '[' + args.join(', ') + ']'; },
    '"': function(str) { return '"' + str + '"'; },
    'mod': function(a, b) { return a + ' mod ' + b; }
};


class ExpressionFn {
    constructor(fn, args) {
        this.fn = fn;
        this.args = args;
    }

    simplify() {
        // TODO !!!
        return this;
    }

    toString() {
        var newArgs = [];
        for (var i=0; i<this.args.length; ++i) newArgs.push(this.args[i].toString());

        var fn = strings[this.fn];
        return fn ? fn(...newArgs) : this.fn + '(' + this.args.join(', ') + ')';
    }

    evaluate(vars = {}) {
        var newArgs = [];
        for (var i=0; i<this.args.length; ++i) {
            var newArg = this.args[i].evaluate();
            if (newArg instanceof Expression) return this;
            newArgs.push(newArg);
        }

        var fn = vars[this.fn] || functions[this.fn] || Math[this.fn] || M[this.fn];
        return (fn instanceof Function) ? fn(...newArgs) : this;
    }
}


// ExpressionVal can be numbers of strings (-> variables)
class ExpressionVal {
    constructor(val) { this.val = val; }
    simplify() { return this; }
    toString() { return '' + this.val; }

    evaluate(vars = {}) {
        if (isNumber(this.val)) return this.val;
        if (this.val in vars) return vars[this.val];
        return this;
    }
}


// -----------------------------------------------------------------------------
// Expression Parser

const brackets = { '(': ')', '[': ']', '{': '}', '|': '|' };

function bracketsMatch(a, b) {
    return brackets[a] === b || brackets[b] === a;
}

class ExpressionParser {

    constructor() {
        this.current = '';
        this.result = [];

        this.currentParser = null;
        this.currentBracket = null;
        this.currentFn = null;
    }

    // Pushes a new letter to the expression parser
    send(x) {

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
    }

    isReady() {
        return this.currentParser == null;
    }

    // Adds a new letter, number or expression to the results object
    pushCurrent() {
        if (!this.current) return;
        var num = +this.current;
        this.result.push(new ExpressionVal(num === num ? num : this.current));
        this.current = '';
    }

    // Completes the expression and returns a new expression
    complete(x) {

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
                this.result.splice(i-1, 3,
                    new ExpressionFn('^', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            }
        }

        // Handle Leading -
        if (this.result[0] === '-')
            this.result.splice(0, 2, new ExpressionFn('-', [this.result[1]]));

        // Handle Multiplication and Division
        for (i=0; i<this.result.length; ++i) {
            if (this.result[i] === '/') {
                this.result.splice(i-1, 3,
                    new ExpressionFn('/', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            } else if (this.result[i] === '*') {
                this.result.splice(i-1, 3,
                    new ExpressionFn('*', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            }
        }

        // Handle Addition and Subtraction
        for (i=0; i<this.result.length; ++i) {
            if (this.result[i] === '-') {
                this.result.splice(i-1, 3,
                    new ExpressionFn('-', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            } else if (this.result[i] === '+') {
                this.result.splice(i-1, 3,
                    new ExpressionFn('+', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            }
        }

        return this.result;
    }
}


// -----------------------------------------------------------------------------
// Expressions Class

export default class Expression {

    constructor(str) {
        let parser = new ExpressionParser();
        for (let x of str) parser.send(x);
        this.expr = parser.complete()[0].simplify();
    }

    simplify() {
        return this;
    }

    toString() {
        return this.val.toString();
    }

    evaluate(vars) {
        if (vars == null) vars = {};
        // TODO return numbers if possible?
        return (vars[this.val] === undefined) ? this.val : vars[this.val];
    }
}
