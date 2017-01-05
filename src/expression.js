// =============================================================================
// Fermat.js | Expressions
// (c) 2017 Mathigon
// =============================================================================



import { factorial, permutations } from 'combinatorics'


// -----------------------------------------------------------------------------
// Expression Equality Checking

function equals(expr1, expr2) {
  // Handle numbers and variables.
  if (expr1 === expr2) return true;

  // Different functions are always unequal (we assume already simplified).
  if (expr1[0] != expr2[0]) return false;

  let [fn, args1] = expr1;
  let args2 = expr2.slice(1);

  if (fn == '+' || fn == '*') {
    // Addition and multiplication are commutative.
    let orders = permutations(args1);
    return orders.some(p => p.every((a, i) => equals(a, args2[i])));
  } else {
    return args1.every((a, i) => equals(a, args2[i]))
  }
}


// -----------------------------------------------------------------------------
// Expression Simplification
// TODO more and better simplification rules
// TODO exact decimals / don't simplify

const FN_SIMPLIFY = {
  '+': function(...args) {
    let newArgs = [];
    for (let a of args) {
      newArgs.push(...(a[0] == '+' ? a.slice(1) : [a]))
    }

    let numbers = newArgs.filter(a => typeof a == 'number');
    let others = newArgs.filter(a => typeof a != 'number');

    let constant = FN_EVALUATE['+'](...numbers);
    if (!others.length) return constant;

    // TODO remove constant 0 if others.length
    // TODO _a + _a = 2*a
    // TODO _1+_2*_1 == (1+_2)*_1
    // TODO nice ordering
    // TODO (_1*_2)+(_3*_2) == (_1+_3)*_2

    if (constant) return ['+', constant, ...others];
    return ['+', constant, ...others];
  },
  '-': function(a, b) {
    // TODO remove 0s
    // TODO _a - _a = 0
  },
  '*': function(...args) {
    // Remove zeros.
    for (let a of args) if (a === 0) return 0;

    let newArgs = [];
    for (let a of args) {
      newArgs.push(...(a[0] == '*' ? a.slice(1) : [a]))
    }

    let numbers = newArgs.filter(a => typeof a == 'number');
    let others = newArgs.filter(a => typeof a != 'number');

    let constant = FN_EVALUATE['*'](...numbers);
    if (!others.length) return constant;

    // TODO remove constant 1 of others.length
    // TODO _a * _a = a^2
    // TODO nice ordering
    // TODO _a^_b * _a^_c == _a^(_b + _c)   (+ sqrt)
    // TODO _a^_b * _c^_b == (_a*_b)^_c   (+ sqrt)
    // TODO a * (b/c) * (d/e) == (a*b*d)/(c*e)
    // TODO (x + y)*(x - y) == x^2 - y^2

    if (constant != 1) return ['*', constant, ...others];
    return ['*', ...others];
  },
  '/': function(a, b) {
    // TODO _a / _a = 1
    // TODO (_1*_2)/_1 == _1
    if (b === 1) return a
  },
  '^': function(a, b) {
    if (b === 0) return 1;
    if (a === 0) return 0;
    if (a === 1) return 1;
    if (b === 1) return a;

    // (a^b)^c == a^(b*c)
    if (a[0] == '^') {
      return ['^', a[1], simplify(['*', a[2], b])]
    }

    // TODO Bionomial expansions

    if (b === -1) return ['/', 1, a];
    if (b === 1/2) return ['sqrt', a];
  },
  'log': function(a, b) {
    // TODO ln(_1*_2) == ln(_1)+ln(_2)
    // TODO ln(_1/_2) == ln(_1)-ln(_2)
  }
};

function simplify(expr) {
  if (typeof expr === 'number' || typeof expr === 'string') {
    return expr;

  } else {
    let [fn, ...args] = expr;
    args = args.map(a => simplify(a));

    // If possible, evaluate this function.
    if (args.every(a => typeof a == 'number' || a in CONSTANTS)) {
      return evaluate([fn, ...args]);
    }

    if (fn in FN_SIMPLIFY) return FN_SIMPLIFY[fn](...args) || [fn, ...args];
    return [fn, ...args];
  }
}


// -----------------------------------------------------------------------------
// Expression Stringify

const FN_STRINGIFY = {
  '+': (...args) => args.join(' + '),
  '-': (a, b) => (b === undefined) ? '-' + a : a + ' - ' + b,
  '±': (a, b) => (b === undefined) ? '±' + a : a + ' ± ' + b,
  '*': (...args) => args.join('*'),
  '/': (a, b) => a + '/' + b,
  '!': x => x + '!',
  '%': x => x + '%',
  '^': (a, b) => a + '^' + b
};

function stringify(expr) {
  if (typeof expr === 'number' || typeof expr === 'string') {
    return expr;
  } else {
    let [fn, ...args] = expr;
    args = args.map(a => stringify(a));
    if (fn in FN_STRINGIFY) return FN_STRINGIFY[fn](...args);
    return fn + '(' + args.join(', ') + ')';
  }
}


// -----------------------------------------------------------------------------
// Expression Evaluation

const FN_EVALUATE = {
  '+': (...args) => args.reduce((a, b) => a + b, 0),
  '-': (a, b) => (b === undefined) ? -a : a - b,
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '/': (a, b) => a / b,
  '!': n => factorial(n),
  '%': x => x / 100,
  '^': (a, b) => Math.pow(a, b),
  'log': (x, b) => (b === undefined) ? Math.log(x) : Math.log(x) / Math.log(b)
};

const CONSTANTS = {
  'pi': Math.PI,
  'e': Math.E
};

function evaluate(expr, vars={}) {
  if (typeof expr === 'number') {
    return expr;

  } else if (typeof expr === 'string') {
    if (expr in vars) return vars[expr];
    let exprLower = expr.toLowerCase();
    if (exprLower in CONSTANTS) return CONSTANTS[exprLower];
    throw new Error(`Undefined variable "${expr}".`)

  } else {
    let [fn, ...args] = expr;
    args = args.map(a => evaluate(a));
    if (fn in FN_EVALUATE) return FN_EVALUATE[fn](...args);
    if (fn in Math) return Math[fn](...args);
    throw new Error(`Undefined function "${fn}".`)
  }
}


// -----------------------------------------------------------------------------
// Expression Parser
// TODO handle implicit multiplication (consecutive expressions without +/-)
// TODO handle functions with multiple arguments

const TOKEN_REGEX = /\b[0-9]+(.[0-9]*)?\b|\b\.[0-9]+\b|\b\w+\b|\+|-|–|±|\*|×|\/|÷|\^|%|!|\(|\)|\[|\]|\{|\}|\||,/g;
const BRACKETS = { '(': ')', '[': ']', '{': '}', '|': '|' };

function parseMaths(tokens) {

  // Handle Numbers
  for (let i=0; i<tokens.length; ++i) {
    let t = tokens[i];
    if (t ==  +t) tokens[i] = +t;
  }

  // Handle Factorials and Percentages
  for (let i=0; i<tokens.length; ++i) {
    if (tokens[i] == '!') {
      tokens.splice(i-1, 2, ['!', tokens[i-1]]);
      i -= 1;
    } else if (tokens[i] == '%') {
      tokens.splice(i-1, 2, ['%', tokens[i-1]]);
      i -= 1;
    }
  }

  // Handle Powers
  for (let i=0; i<tokens.length; ++i) {
    if (tokens[i] == '^') {
      tokens.splice(i-1, 3, ['^', tokens[i-1], tokens[i+1]]);
      i -= 2;
    }
  }

  // Handle Multiplication and Division
  for (let i=0; i<tokens.length; ++i) {
    if ('/÷'.includes(tokens[i])) {
      tokens.splice(i - 1, 3, ['/', tokens[i-1], tokens[i+1]]);
      i -= 2;
    } else if ('*×'.includes(tokens[i])) {
      tokens.splice(i - 1, 3, ['*', tokens[i-1], tokens[i+1]]);
      i -= 2;
    }
  }

  // TODO handle implicit multiplication (consecutive expressions without +/-)

  // Handle leading minus.
  if ('-–'.includes(tokens[0])) tokens.splice(0, 2, ['-', this.result[1]]);
  if (tokens[0] == '±') tokens.splice(0, 2, ['±', this.result[1]]);

  // Handle addition and subtraction.
  for (let i=0; i<tokens.length; ++i) {
    if ('-–'.includes(tokens[i])) {
      tokens.splice(i-1, 3, ['-', tokens[i-1], tokens[i+1]]);
      i -= 2;
    } else if (tokens[i] === '+') {
      tokens.splice(i-1, 3, ['+', tokens[i-1], tokens[i+1]]);
      i -= 2;
    } else if (tokens[i] === '±') {
      tokens.splice(i-1, 3, ['±', tokens[i-1], tokens[i+1]]);
      i -= 2;
    }
  }

  return tokens;
}

function matchBrackets(tokens) {
  let newTokens = [];

  for (let i=0; i<tokens.length; ++i) {
    let t = tokens[i];
    if (')]}|'.includes(t)) {
      return [parseMaths(newTokens), tokens.slice(i)]

    } else if ('([{|'.includes(t)) {
      let last = newTokens.pop();
      if ('%!'.includes(last)) throw new Error(`A "${last}" cannot be followed by a "${t}".`);

      let [inside, [close, ...rest]] = matchBrackets(tokens.slice(i + 1));
      if (close != BRACKETS[t]) throw new Error(`Non-matching brackets "${t}" and "${close}".`);

      // Vertical lines are automatically converted into abs.
      if (t == '|') inside = ['abs', inside];

      // Check last value of newTokens for possible function call.
      if (last.match(/^\w+$/)) {
        newTokens.push([last, inside]);
      } else {
        newTokens.push(last, inside);
      }

      // Update the for-loop parameters.
      tokens = rest;
      i=-1;

    } else {
      newTokens.push(t);
    }
  }

  return [parseMaths(newTokens), []]
}

function parseString(str) {
  let invalidChars = str.replace(TOKEN_REGEX, '').trim();
  if (invalidChars) throw new Error(`Invalid character "${invalidChars[0]}".`);

  let tokens = str.match(TOKEN_REGEX);

  let [ast, rest] = matchBrackets(tokens);
  if (rest.length) throw new Error(`Unexpected character "${rest[0][0]}".`);
  if (ast.length  != 1) throw new Error(`Unknown parser error.`);

  return ast[0];
}


// -----------------------------------------------------------------------------
// Expressions Class

export default class Expression {
  constructor(str) { this.expr = simplify(parseString(str)); }
  equals(other) { return equals(this.expr, other.expr); }
  toString() { return stringify(this.expr); }
  evaluate(vars={}) { return evaluate(this.expr, vars); }
}
