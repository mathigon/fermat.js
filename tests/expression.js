// =============================================================================
// Fermat.js | Expressions Unit Tests
// (c) 2017 Mathigon
// =============================================================================


import Expression from 'expression';

function expr(src) { return new Expression(src).simplified; }


exports['Parsing'] = function(test) {
  test.equal(expr('1').toString(), '1');
  test.equal(expr('-1').toString(), '-1');
  test.equal(expr('x + y').toString(), 'x + y');
  test.equal(expr('xx + yy + zz').toString(), 'xx + yy + zz');
  test.equal(expr('a*(b + c)').toString(), 'a*b + a*c');
  test.equal(expr('a + b*c^d').toString(), 'a + b*c^d');
  test.equal(expr('a + (b*c)^d').toString(), 'a + b^d*c^d');
  test.equal(expr('((a + b)*c)^d').toString(), 'a + b^d*c^d');
  test.equal(expr('([{|a|}])').toString(), '|a|');
  test.done();
};

exports['Advanced simplification and equality'] = function(test) {
  /* compare('1/x + 1/y', '(x + y)/(x*y)');
  compare('4 + 4*x - 2*(2 + 2*x))/(2 + 2*x)', '0');
  compare('-4*x*y^2 - 2*y^3 - 2*x^2*y)/(x + y)^2', '-2*y');
  compare('-x - y - (x + y)^(-1)*y^2 + (x + y)^(-1)*x^2', '-2*y');
  compare('x + x*y)/x', '1 + y');
  compare('f(x) + y*f(x))/f(x)', '1 + y');
  compare('-x + y/(z + t) + z*x/(z + t) + z*a/(z + t) + t*x/(z + t)', '(y + a*z)/(z + t)');
  compare('-x/-y)', 'x/y');
  compare('-x/y)', '-x/y');
  compare('x/y)', 'x/y');
  compare('x/-y)', '-x/y');
  compare('-x/0)', 'Infinity');
  compare('-a*x/(-y - b))', 'a*x/(b + y)'); */
  test.done();
};

exports['Implicit evaluation'] = function(test) {
  test.equal(expr('1 + 2').toString(), '3');
  test.equal(expr('1 - 2').toString(), '-1');
  test.equal(expr('2*3').toString(), '6');
  test.equal(expr('5/2').toString(), '2.5');
  test.equal(expr('2^3').toString(), '8');
  test.equal(expr('sqrt(9)').toString(), '3');
  test.equal(expr('5%').toString(), '0.05');
  test.equal(expr('log(e)').toString(), '1');
  test.done();
};

exports['Function and variable extraction'] = function(test) {
  test.deepEqual(expr('a + b(c - d(5))').variables, ['a', 'c']);
  test.deepEqual(expr('a + b(c - d(5))').functions, ['+', 'b', '-', 'd']);
  test.done();
};

exports['Direct evaluation'] = function(test) {
  test.equal(expr('a + b + sqrt(1)').evaluate({a: 1, b: 2}), 4);
  test.equal(expr('a + b(a)').evaluate({a: 10, b: (x => x/2)}), 15);
  test.done();
};
