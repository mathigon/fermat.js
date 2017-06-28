// =============================================================================
// Fermat.js | Expressions Tests
// (c) Mathigon
// =============================================================================



const tape = require('tape');
const fermat = require('../');

function expr(src) {
  return new fermat.Expression(src).simplified;
}

function numEquals(a, b) {
  return new fermat.Expression(a).numEquals(new fermat.Expression(b));
}

/*tape('parsing', function(test) {
  test.equal(expr('1').toString(), '1');
  test.equal(expr('-1').toString(), '-1');
  test.equal(expr('x + y').toString(), 'x + y');
  test.equal(expr('xx + yy + zz').toString(), 'xx + yy + zz');
  test.equal(expr('a*(b + c)').toString(), '(a*b) + (a*c)');
  test.equal(expr('a + b*c^d').toString(), 'a + (b*(c^d))');
  test.equal(expr('a + (b*c)^d').toString(), 'a + ((b^d)*(c^d))');
  test.equal(expr('((a + b)*c)^d').toString(), 'a + ((b^d)*(c^d))');
  test.equal(expr('([{|a|}])').toString(), '|a|');
  test.end();
});

tape('Implicit evaluation', function(test) {
  test.equal(expr('1 + 2').toString(), '3');
  test.equal(expr('1 - 2').toString(), '-1');
  test.equal(expr('2*3').toString(), '6');
  test.equal(expr('5/2').toString(), '2.5');
  test.equal(expr('2^3').toString(), '8');
  test.equal(expr('3+2/4+2*8').toString(), '19.5');
  test.equal(expr('sqrt(9)').toString(), '3');
  test.equal(expr('3+sin(pi)').toString(), '3');
  test.equal(expr('5%').toString(), '0.05');
  test.equal(expr('log(e)').toString(), '1');
  test.end();
});

tape('Function and variable extraction', function(test) {
  test.deepEqual(expr('a + b(c - d(5))').variables, ['a', 'c']);
  test.deepEqual(expr('a + b(c - d(5))').functions, ['+', 'b', '-', 'd']);
  test.end();
});

tape('Direct evaluation', function(test) {
  test.equal(expr('a + b + sqrt(1)').evaluate({a: 1, b: 2}), 4);
  test.equal(expr('a + b(a)').evaluate({a: 10, b: (x => x/2)}), 15);
  test.end();
});

tape('Basic simplification', function(test) {
  test.equal(expr('x+x').toString(), '2*x');
  test.equal(expr('2x+x').toString(), '3*x');
  test.equal(expr('2(x+1)+(x+1)').toString(), '3*(x + 1)');
  test.equal(expr('y*x^2+2*x^2').toString(), '(y+2)*x^2');

  test.equal(expr('x+1+x').toString(), '(2*x) + 1');
  test.equal(expr('x^2+x+3+x^2').toString(), '(2*(x^2)) + x + 3');
  test.equal(expr('x+1+2x').toString(), '(3*x) + 1');
  test.equal(expr('x-1+x').toString(), '(2*x) - 1');
  test.equal(expr('x-1-2x+2').toString(), '1 - x');

  test.equal(expr('x/2*x').toString(), '(x^2)/2');
  test.equal(expr('x*2*x').toString(), '2*(x^2)');
  test.equal(expr('x*y*(-x)/(x^2)').toString(), '-y');

  test.equal(expr('foo(x)').toString(), 'foo(x)');

  test.end();
});

tape('Advanced simplification', function(test) {
  test.equal(expr('1/x + 1/y').toString(), '(x + y)/(x*y)');
  test.equal(expr('4 + 4*x - 2*(2 + 2*x))/(2 + 2*x)').toString(), '0');
  test.equal(expr('-4*x*y^2 - 2*y^3 - 2*x^2*y)/(x + y)^2').toString(), '-2*y');
  test.equal(expr('-x - y - (x + y)^(-1)*y^2 + (x + y)^(-1)*x^2').toString(), '-2*y');
  test.equal(expr('x + x*y)/x').toString(), '1 + y');
  test.equal(expr('f(x) + y*f(x))/f(x)').toString(), '1 + y');
  test.equal(expr('-x/-y)').toString(), 'x/y');
  test.equal(expr('-x/y)').toString(), '-x/y');
  test.equal(expr('x/y)').toString(), 'x/y');
  test.equal(expr('x/-y)').toString(), '-x/y');
  test.equal(expr('-x/0)').toString(), 'Infinity');
  test.equal(expr('-a*x/(-y - b))').toString(), 'a*x/(b + y)');
  test.done();
});

tape('Numeric equality checking', function(test) {
  test.ok(numEquals('x + y', 'y + x'));
  test.ok(numEquals('x + y*z^(w+1)', '(y / z^2) * z^(w+3) + x * 1'));
  test.end();
});*/
