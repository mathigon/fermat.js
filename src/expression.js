// =============================================================================
// Fermat.js | Expressions
// (c) 2017 Mathigon
// =============================================================================



import { isNumber, isString } from 'types';
import { factorial, permutations } from 'combinatorics';


// -----------------------------------------------------------------------------
// Error handling

class ExprError extends Error {
  constructor(name, message) {
    super(message);
    this.name = name;
  }
}


// -----------------------------------------------------------------------------
// Expression Equality Checking

function equals(expr1, expr2) {
  // Handle numbers and variables.
  if (expr1 === expr2) return true;

  // Different functions are always unequal (we assume already simplified).
  if (expr1[0] != expr2[0]) return false;

  let [fn, ...args1] = expr1;
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
// TODO improved simplification rules
// TODO exact decimals

let EXPAND_RULES = [
  // Ordering
  ['a-(b-c)', '(a+c)-b'],
  ['(a-b)-c', 'a-(b+c)'],
  ['a/(b/c)', '(a*c)/b'],
  ['(a/b)/c', 'a/(b*c)'],
  ['-(-a)', 'a'],

  // Distributive laws
  ['(a+b)*c', 'a*c+b*c'],
  ['(a-b)*c', 'a*c-b*c'],
  ['(a+b)/c', 'a/c+b/c'],
  ['(a-b)/c', 'a/c-b/c'],
  ['a*(b+c)', 'a*b+a*c'],
  ['a*(b-c)', 'a*b-a*c'],

  // Expansions
  ['(a+b)^2', 'a^2+2*a*b+b^2'],
  ['(a-b)^2', 'a^2-2*a*b+b^2'],
  ['(a+b)*(c+d)', 'a*c+a*d+b*c+b*d'],
  ['(a+b)*(c-d)', 'a*c-a*d+b*c-b*d'],
  ['(a-b)*(c+d)', 'a*c+a*d-b*c-b*d'],
  ['(a-b)*(c-d)', 'a*c-a*d-b*c+b*d'],

  // Power laws
  ['(a*b)^c', 'a^c*b^c'],
  ['(a/b)^c', 'a^c/b^c'],
  ['a^(b+c)', 'a^b*a^c'],
  ['a^(b-c)', 'a^b/a^c'],
  ['(a^b)^c', 'a^(b*c)'],

  // Log laws
  ['log(a^b)', 'b*log(a)'],
  ['log(a*b)', 'log(a)+log(b)'],
  ['log(a-b)', 'log(a)-log(b)'],

  // Power cleanup
  ['a^(-b)', '1/(a^b)'],
  ['sqrt(a)', 'a^0.5']
];
let HAS_GENERATED_RULES = false;

function match(expr, target) {
  // The expression is immediately matched to a target placeholder
  if (isString(target)) return {[target]: expr};
  if (isNumber(target) && expr == target) return {};

  if (expr[0] != target[0]) return;
  if (expr.length != target.length) return;

  let placeholders = {};
  for (let i=1; i<target.length; ++i) {
    let newPlaceholders = match(expr[i], target[i]);
    if (!newPlaceholders) return;
    Object.assign(placeholders, newPlaceholders);
  }

  return placeholders;
}

function fill(expr, placeholders) {
  if (isNumber(expr)) return expr;
  if (isString(expr)) return placeholders[expr];
  let args = expr.slice(1).map(a => fill(a, placeholders));
  return [expr[0], ...args];
}

// TODO simplify the rewrite function, merge with while loop, better efficiency?
function rewrite(expr, rule) {
  if (isString(expr) || isNumber(expr)) return;

  let args = expr.slice(1).map(a => rewrite(a, rule));
  let argsWereRewritten = args.some(a => !!a);

  expr = expr.map((a, i) => args[i-1] || a);
  let placeholders = match(expr, rule[0]);
  if (placeholders) return fill(rule[1], placeholders);

  // This expression wasn't rewritten, but one of its children was.
  if (argsWereRewritten) return expr;
}

// TODO Improved flattening, remove traverse fn, add ordering functions above
function flatten([fn, ...args], op1, op2) {
  if (fn != op1 && fn != op2) return;

  let positive = [];
  let negative = [];
  let swap = (args.length < 2);

  for (let a of args) {
    if (a[0] == op1) {
      (swap ? negative : positive).push(...a.slice(1))
    } else if (a[0] == op2) {
      if (a.length == 3) {  // Only needed for -.
        (swap ? negative : positive).push(a[1]);
        (swap ? positive : negative).push(a[2])
      } else {
        (swap ? positive : negative).push(a[1])
      }
    } else {
      (swap ? negative : positive).push(a);
    }

    // For negative operations (- and /), the values of the second argument are inverted.
    if (fn == op2) swap = 2;
  }

  let unity = (op2 == '/') ? [1] : [];
  if (!negative.length) return [op1, ...positive];
  if (!positive.length) return ['-', ...unity, ['+', ...negative]];
  return [op2, [op1, ...positive], [op1, ...negative]];
}

function traverse(expr, callback, ...options) {
  if (typeof expr == 'number' || typeof expr == 'string') return expr;
  let [fn, ...args] = expr;
  args = args.map(a => traverse(a, callback, ...options));
  return callback([fn, ...args], ...options) || [fn, ...args];
}

function simplify(expr) {
  if (!HAS_GENERATED_RULES) {
    EXPAND_RULES = EXPAND_RULES.map(rule => [parseString(rule[0]), parseString(rule[1])]).reverse();
    HAS_GENERATED_RULES = true;
  }

  let changes;
  do {
    changes = 0;
    for (let r of EXPAND_RULES) {
      let newExpr = rewrite(expr, r);
      if (newExpr) {
        changes += 1;
        expr = newExpr;
      }
    }
  } while(changes);

  expr = traverse(expr, flatten, '*', '/');
  expr = traverse(expr, flatten, '+', '-');

  // TODO collect and cancel terms (fix 2*a^2-a)

  expr = evaluate(expr, null);

  // TODO clean *0, *1, +0, /1, -0

  return expr;
}

/* function addFractions([fn, ...args]) {
  if (fn == '+' || fn == '-') {
    let fractions = args.filter(a => a[0] == '/');
    if (fractions.length) {
      let num = args.map(a => {
        let den = fractions.filter(f => f != a).map(f => f[1]);
        return den.length ? ['*', a, ...den] : a;
      });
      let den = fractions.map(f => f[1]);
      return ['/', [fn, ...num], den.length > 1 ? ['*', ...den] : den[0]];
    }
  }
} */


// -----------------------------------------------------------------------------
// Expression Stringify
// TODO correct bracket placement

const FN_STRINGIFY = {
  '+': (...args) => args.join(' + '),
  '-': (a, b) => (b === undefined) ? '-' + a : a + ' - ' + b,
  '±': (a, b) => (b === undefined) ? '±' + a : a + ' ± ' + b,
  '*': (...args) => args.join('*'),
  '/': (a, b) => a + '/' + b,
  '!': x => x + '!',
  '%': x => x + '%',
  'abs': x => '|' + x + '|',
  '^': (a, b) => a + '^' + b,
  '=': (a, b) => a + ' = ' + b,
  '<': (a, b) => a + ' < ' + b,
  '>': (a, b) => a + ' > ' + b,
  '≤': (a, b) => a + ' ≤ ' + b,
  '≥': (a, b) => a + ' ≥ ' + b
};

function stringify(expr) {
  if (isNumber(expr) || isString(expr)) return expr;

  let [fn, ...args] = expr;
  args = args.map(a => stringify(a));
  if (fn in FN_STRINGIFY) return FN_STRINGIFY[fn](...args);
  return fn + '(' + args.join(', ') + ')';
}


// -----------------------------------------------------------------------------
// Substitution and Evaluation
// TODO recursive substitutions

const FN_EVALUATE = {
  '+': (...args) => args.reduce((a, b) => a + b, 0),
  '-': (a, b) => (b === undefined) ? -a : a - b,
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '/': (a, b) => a / b,
  '!': n => factorial(n),
  '%': x => x / 100,
  '^': (a, b) => Math.pow(a, b),
  'log': (x, b) => (b === undefined) ? Math.log(x) : Math.log(x) / Math.log(b),
  '=': (a, b) => equals(a, b)
};

const CONSTANTS = {
  'pi': Math.PI,
  'e': Math.E
};

function evaluate(expr, vars) {
  // Note that we explicitly set vars=null when using this
  // internally as part of the simplify function.

  if (isNumber(expr)) return expr;

  if (isString(expr)) {
    if (vars && expr in vars) return vars[expr];
    if (expr in CONSTANTS) return CONSTANTS[expr];
    if (vars) throw new ExprError('EvalError', `The variable "${expr}" doesn’t exist.`);
    return expr;
  }

  let [fn, ...args] = expr;
  args = args.map(a => evaluate(a, vars));

  if (args.every(a => isNumber(a))) {
    if (vars && fn in vars) return vars[fn](...args);
    if (fn in FN_EVALUATE) return FN_EVALUATE[fn](...args);
    if (fn in Math) return Math[fn](...args);
  }

  if (vars) throw new ExprError('EvalError', `The function "${fn}" doesn’t exist.`);
  return [fn, ...args];
}

function substitute(expr, vars) {
  if (isNumber(expr)) return expr;
  if (isString(expr)) return (expr in vars) ? parseString(vars[expr]) : expr;

  let [fn, ...args] = expr;
  args = args.map(a => substitute(a, vars));
  return [fn, ...args];
}


// -----------------------------------------------------------------------------
// Extract functions and variables

function variables(tree) {
  if (isNumber(tree)) return [];
  if (isString(tree)) return [tree];

  let vars = [];
  for (let a of tree.slice(1)) {
    for (let v of variables(a)) {
      if (!vars.includes(v)) vars.push(v);
    }
  }
  return vars;
}

function functions(tree) {
  if (isNumber(tree) || isString(tree)) return [];

  let fns = [tree[0]];
  for (let a of tree.slice(1)) {
    for (let v of functions(a)) {
      if (!fns.includes(v)) fns.push(v);
    }
  }
  return fns;
}


// -----------------------------------------------------------------------------
// Expression Parser
// TODO handle functions with multiple arguments (commas)

const TOKEN_REGEX = /\b[0-9]+(\.[0-9]*)?\b|\b\.[0-9]+\b|\b\w+\b|\+|-|–|±|\*|×|\/|÷|\^|%|!|\(|\)|\[|\]|\{|\}|\||=|<|>|≤|≥/g;
const TOKEN_REPLACE = {'–': '-', '÷': '/', '×': '*'};
const BRACKETS = { '(': ')', '[': ']', '{': '}', '|': '|' };

function findBinaryFunction(tokens, chars) {
  for (let i=0; i<tokens.length; ++i) {
    if (chars.includes(tokens[i])) {
      let a = tokens[i-1];
      let b = tokens[i+1];
      if (!b) throw new ExprError('SyntaxError', `An expression cannot end with a "${tokens[i]}".`);
      if ('+-*/^%!'.includes(a)) throw new ExprError('SyntaxError', `A "${a}" cannot be followed by a "${tokens[i]}".`);
      if ('+-*/^%!'.includes(b)) throw new ExprError('SyntaxError', `A "${tokens[i]}" cannot be followed by a "${b}".`);
      tokens.splice(i - 1, 3, [tokens[i], a, b]);
      i -= 2;
    }
  }
}

function parseMaths(tokens) {
  // Numbers
  for (let i=0; i<tokens.length; ++i) {
    let t = tokens[i];
    if (t ==  +t) tokens[i] = +t;
  }

  if ('+*/^%!'.includes(tokens[0])) throw new ExprError('SyntaxError', `A term cannot start with a "${a}".`);

  // Factorials and Percentages
  for (let i=0; i<tokens.length; ++i) {
    if ('!%'.includes(tokens[i])) {
      tokens.splice(i-1, 2, [tokens[i], tokens[i-1]]);
      i -= 1;
    }
  }

  findBinaryFunction(tokens, '^');  // Powers
  findBinaryFunction(tokens, '*/');  // Multiplication and division.

  // Implicit multiplication (consecutive expressions)
  for (let i=0; i<tokens.length-1; ++i) {
    if (!'+-*/^%!'.includes(tokens[i]) && !'+-*/^%!'.includes(tokens[i+1])) {
      tokens.splice(i, 2, ['*', tokens[i], tokens[i+1]]);
      i -= 1;
    }
  }

  // Leading (plus)minus.
  if ('-±'.includes(tokens[0])) tokens.splice(0, 2, [tokens[0], tokens[1]]);

  findBinaryFunction(tokens, '+-±');  // Addition and subtraction.
  findBinaryFunction(tokens, '=<>≤≥');  // Equalities and inequalities.

  if (tokens.length > 1) throw new ExprError('SyntaxError', `This expression is invalid.`);
  return tokens[0];
}

function matchBrackets(tokens) {
  let newTokens = [];

  for (let i=0; i<tokens.length; ++i) {
    let t = tokens[i];
    if (')]}'.includes(t) || (t == '|' && i > 0)) {
      return [parseMaths(newTokens), tokens.slice(i)]

    } else if ('([{|'.includes(t)) {
      let last = newTokens.pop();
      if ('%!'.includes(last)) throw new ExprError('SyntaxError', `A "${last}" cannot be followed by a "${t}".`);

      let [inside, [close, ...rest]] = matchBrackets(tokens.slice(i + 1));
      if (close != BRACKETS[t]) throw new ExprError('SyntaxError', `The brackets "${t}" and "${close}" don’t match.`);

      // Vertical lines are automatically converted into abs.
      if (t == '|') inside = ['abs', inside];

      // Check last value of newTokens for possible function call.
      if (last && last.match(/^\w+$/) && last != +last) {
        newTokens.push([last, inside]);
      } else if (last) {
        newTokens.push(last, inside);
      } else {
        newTokens.push(inside);  // This deals with expressions that start with "(".
      }

      // Update the for-loop parameters.
      tokens = rest;
      i = -1;

    } else {
      newTokens.push(t);
    }
  }

  return [parseMaths(newTokens), []]
}

function parseString(str) {
  let invalidChars = str.replace(TOKEN_REGEX, '').trim();
  if (invalidChars) throw new ExprError('SyntaxError', `The character "${invalidChars[0]}" is invalid.`);

  let tokens = str.match(TOKEN_REGEX);
  for (let i=0; i<tokens.length; ++i) {
    if (tokens[i] in TOKEN_REPLACE) tokens[i] = TOKEN_REPLACE[tokens[i]];
  }

  let [expr, rest] = matchBrackets(tokens);
  if (rest.length) throw new ExprError('SyntaxError', `The character "${rest[0][0]}" shouldn’t be here.`);
  return expr;
}


// -----------------------------------------------------------------------------
// Expressions Class

export default class Expression {
  constructor(str, parse=true) { this.expr = parse ? parseString(str) : str; }

  get simplified() { return new Expression(simplify(this.expr), false); }
  get functions() { return functions(this.expr); }
  get variables() { return variables(this.expr); }

  evaluate(vars={}) { return evaluate(this.expr, vars); }
  substitute(vars) { return new Expression(substitute(this.expr, vars), false); }

  equals(other) { return equals(this.simplified.expr, other.simplified.expr); }
  same(other) { return equals(this.expr, other.expr); }

  toString() { return stringify(this.expr); }
}
