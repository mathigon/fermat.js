// =============================================================================
// Fermat.js | Expressions
// (c) Mathigon
// =============================================================================



import { difference, flatten, list, tabulate, isNumber, isString, isArray } from '@mathigon/core';
import { factorial, permutations, subsets } from './combinatorics';
import { nearlyEquals } from './arithmetic';


// -----------------------------------------------------------------------------
// Error handling

class ExprError extends Error {
  constructor(name, message) {
    super(message);
    this.name = name;
  }
}


// -----------------------------------------------------------------------------
// Expression Simplification Utilities

function substitute(expr, vars) {
  if (isNumber(expr)) return expr;
  if (isString(expr)) return (expr in vars) ? vars[expr] : expr;

  let [fn, ...args] = expr;
  args = args.map(a => substitute(a, vars));
  return [fn, ...args];
}

function same(expr1, expr2) {
  // Handle numbers and variables.
  if (expr1 === expr2) return true;

  // Different functions are always unequal (we assume already simplified).
  if (!isArray(expr1) || !isArray(expr2)) return false;
  if (expr1[0] != expr2[0]) return false;

  let [fn, ...args1] = expr1;
  let args2 = expr2.slice(1);

  if ('+*'.includes(fn)) {
    // Addition and multiplication are commutative.
    let orders = permutations(args1);
    return orders.some(p => p.every((a, i) => same(a, args2[i])));
  } else {
    return args1.every((a, i) => same(a, args2[i]))
  }
}

function flattenAssociative(expr) {
  if (isString(expr) || isNumber(expr)) return expr;
  let [fn, ...args] = expr;

  args = args.map(a => flattenAssociative(a));
  if (!'+*'.includes(fn)) return [fn, ...args];

  let newArgs = [];
  for (let a of args) {
    if (isArray(a) && a[0] == fn) {
      newArgs.push(...a.slice(1))
    } else {
      newArgs.push(a);
    }
  }
  return [fn, ...newArgs];
}

// argPlaceholders = [[{arg1v1}, {arg1v2}], [{arg2v1}], [{arg3v1}]]
// argPlaceholders = [{combinedv1}, {combinedv2}]
function mergePlaceholders(argPlaceholders) {
  if (!argPlaceholders.length) return [];
  for (let arg of argPlaceholders) if (!arg.length) return [];

  let possibilities = tabulate(function(...indices) {
    let placeholders = indices.map((v, i) => argPlaceholders[i][v]);
    let combined = {};

    for (let p of placeholders) {
      if (!p) return null;
      for (let key of Object.keys(p)) {
        if (key in combined) {
          if (!same(combined[key], p[key])) return null;
        } else {
          combined[key] = p[key]
        }
      }
    }

    return combined;
  }, ...argPlaceholders.map(a => a.length));

  return flatten(possibilities).filter(p => !!p);
}

// Returns an array of possible target substitutions to create a match.
function match(expr, target) {
  // Both expression and target are a number.
  if (isNumber(target)) {
    return (expr === target) ? [{}] : [];
  }

  if (isString(target)) {
    // Matches any constants (numbers)
    if (target[0] == 'c') {
      return isNumber(expr) ? [{[target]: expr}] : [];
    }

    // Matches any variables (strings)
    if (target[0] == 'v') {
      return isString(expr) ? [{[target]: expr}] : [];
    }

    // Match any other expressions
    return [{[target]: expr}];
  }

  // Check if functions are the same
  if (!isArray(expr)) return [];
  let [fn, ...args] = expr;
  if (fn != target[0]) return [];
  if (expr.length != target.length) return [];

  // Match all arguments of a function. Addition and multiplication can
  // match arguments in any order.
  if ('+*'.includes(expr[0])) {
    for (let a of permutations(args)) {
      let placeholders = mergePlaceholders(a.map((a, i) => match(a, target[i+1])));
      if (placeholders.length) return placeholders;
    }
    return [];
  }

  return mergePlaceholders(args.map((a, i) => match(a, target[i+1])));
}

function rewrite(expr, rule) {
  if (isString(expr) || isNumber(expr)) return expr;

  let [fn, ...args] = expr;
  args = args.map(a => rewrite(a, rule));

  // For addition and multiplications we need to match subsets of arguments, e.g.
  // `a + b + c` should match the rule `a + b`.
  let [ruleFn, ...ruleArgs] = rule[0];
  if ('+*'.includes(fn) && '+*'.includes(ruleFn) && args.length > ruleArgs.length) {
    for (let p of subsets(list(args.length), ruleArgs.length)) {
      let argsSubset = p.map(i => args[i]);  // The subset of args that match the rule.
      let argsOthers = args.filter((x, i) => !p.includes(i));  // All other args.

      let placeholders = match([fn, ...argsSubset], rule[0])[0];
      if (placeholders) {
        let argsReplaced = substitute(rule[1], placeholders);
        return flattenAssociative([fn, argsReplaced, ...argsOthers]);
      }
    }
    return [fn, ...args];
  }

  let placeholders = match([fn,...args], rule[0])[0];
  return placeholders ? substitute(rule[1], placeholders) : [fn, ...args];
}


// -----------------------------------------------------------------------------
// Expression Simplification
// TODO copy rewrite rules

let HAS_GENERATED_RULES = false;
let REWRITE_RULES = [
  ['x^0', '1'],
  ['0*x', '0'],
  ['x/x', '1'],
  ['x^1', 'x'],
  ['x-(-y)', 'x+y'],

  // Temporary rules
  ['sqrt(x)', 'x^0.5'],
  ['x-y', 'x+(-y)'], // Replace 'subtract', to flatten addition
  ['-V', '(-1) * V'],
  ['x/(y^z)', 'x*(y^(-z))'], // Replace 'divide', to flatten multiplication
  ['x/y', 'x*(y^(-1))'],

  // Power and log laws
  ['(x*y)^z', 'x^z*y^z'],
  ['a^(b+c)', 'a^b*a^c'],
  ['(a^b)^c', 'a^(b*c)'],
  ['log(a^b)', 'b*log(a)'],
  ['log(a*b)', 'log(a)+log(b)'],

  // Expansions and distributive laws
  ['(a+b)^2', 'a^2+2*a*b+b^2'],
  ['(a+b)*(c+d)', 'a*c+a*d+b*c+b*d'],
  ['(a+b)*c', 'a*c+b*c'],

  // Collect like factors
  ['x * x', 'x^2'],
  ['x * x^y', 'x^(y+1)'],
  ['x^y * x^z', 'x^(y+z)'],

  // Collect like terms
  ['x+x', '2*x'],
  ['x+(-x)', '0'],
  ['x*y + x', 'x*(y+1)'],
  ['x*y + x*z', 'x*(y+z)'],

  // Undo temporary rules
  // ['(-x)*y', '-(x*y)'], // Make factors positive
  ['(-1) * x', '-x'],
  ['x+(-y)', 'x-y'],  // Undo replace 'subtract'
  ['x*(y^(-1))', 'x/y'],  // Undo replace 'divide'
  ['x*(y^(-z))', 'x/(y^z)'],
  ['x^(-1)', '1/x'],
  ['x^0.5', 'sqrt(x)'],

  // Ordering
  ['x*(y/z)', '(x*y)/z'],  // '*' before '/'
  ['x-(y+z)', 'x-y-z'],  // '-' before '+'
  // ['(x/y)/z', 'x/(y*z)'],
  // ['(x*y)/(x*z)', 'y/z'],
  // ['a-(b-c)', '(a+c)-b'],
  // ['(a-b)-c', 'a-(b+c)'],
  // ['a/(b/c)', '(a*c)/b'],
  // ['(a/b)/c', 'a/(b*c)'],
  // ['-(-a)', 'a'],

  // Cleanup
  ['1*x', 'x'],
  ['0+x', 'x']
];

function simplify(expr) {
  if (!HAS_GENERATED_RULES) {
    REWRITE_RULES = REWRITE_RULES.map(
        rule => [parseString(rule[0]), parseString(rule[1])]).reverse();
    HAS_GENERATED_RULES = true;
  }

  let after = toString(expr);
  let before = null;

  while (before != after) {
    before = after;
    expr = evaluate(expr);
    expr = flattenAssociative(expr);
    for (let rule of REWRITE_RULES) {
      // TODO change '-5' to ['-', '5'].
      expr = rewrite(expr, rule);
    }
    after = toString(expr);
  }

  return expr;
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
  'log': (x, b) => (b === undefined) ? Math.log(x) : Math.log(x) / Math.log(b),
  '=': (a, b) => simplify(['-', a, b]) == 0
};

const CONSTANTS = {
  pi: Math.PI,
  e: Math.E
};

function evaluate(expr, vars={}) {
  if (isNumber(expr)) return expr;

  if (isString(expr)) {
    if (expr in vars) return vars[expr];
    if (expr in CONSTANTS) return CONSTANTS[expr];
    return expr;
  }

  let [fn, ...args] = expr;
  args = args.map(a => evaluate(a, vars));

  if (args.every(a => isNumber(a))) {
    if (fn in vars) return vars[fn](...args);
    if (fn in FN_EVALUATE) return FN_EVALUATE[fn](...args);
    if (fn in Math) return Math[fn](...args);
  } else if ('+*'.includes(fn)) {
    let constant =  FN_EVALUATE[fn](...args.filter(a => isNumber(a)));
    let variables = args.filter(a => !isNumber(a));
    return [fn, constant,...variables]
  }

  return [fn, ...args];
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
  args = args.map(a => isArray(a) ? `(${stringify(a)})` : stringify(a));

  if (fn in FN_STRINGIFY) return FN_STRINGIFY[fn](...args);
  return fn + '(' + args.join(', ') + ')';
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
      if (b == null) throw new ExprError('SyntaxError', `An expression cannot end with a "${tokens[i]}".`);
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

  if ('+*/^%!'.includes(tokens[0])) throw new ExprError('SyntaxError', `A term cannot start with a "${tokens[0]}".`);

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

export class Expression {
  constructor(str) { this.expr = isString(str) ? parseString(str) : str; }
  toString() { return stringify(this.expr); }

  get simplified() { return new Expression(simplify(this.expr)); }
  get functions() { return functions(this.expr); }
  get variables() { return variables(this.expr); }

  same(other) { return same(this.expr, other.expr); }
  equals(other) { return simplify(['-', this.expr, other.expr]) == 0; }

  evaluate(vars={}) {
    let result = evaluate(this.expr, vars);
    if (!isNumber(result)) {
      let unknown = [...variables(result), ...functions(result)].join(', ');
      throw new ExprError('EvalError', `This expression contains unknown variables or functions: ${unknown}.`);
    }
    return result;
  }

  numEquals(other) {
    // This is an incredibly hacky and non-robust solution, but much faster than
    // the full CAS simplification. We only test positive random numbers, because
    // negative numbers raised to non-integer powers return NaN.
    let vars = this.variables;
    if (difference(vars, other.variables).length) return false;

    for (let i=0; i<5; ++i) {
      let substitution = {};
      for (let v of vars) substitution[v] = Math.random() * 5;

      let a = evaluate(substitute(this.expr, substitution));
      let b = evaluate(substitute(other.expr, substitution));
      if (!nearlyEquals(a, b)) return false;
    }
    return true;
  }

  substitute(vars) {
    let newVars = {};
    for (let v of Object.keys(vars)) newVars[v] = parseString('' + vars[v]);
    return new Expression(substitute(this.expr, newVars));
  }
}
