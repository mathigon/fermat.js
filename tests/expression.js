// =============================================================================
// Fermat.js | Expressions Unit Tests
// (c) 2017 Mathigon
// =============================================================================


import Expression from 'expression';

String.prototype.contains = function(x) { return this.indexOf(x) >= 0 };


function parse(src) {
  let expr = new Expression(src);
  return expr.toString();
}


exports['Simple expression parsing'] = function(test) {
  test.equal(parse('1'), '1');
  test.equal(parse('x + y'), 'x + y');
  test.equal(parse('x + y + z'), 'x + y + z');
  test.equal(parse('a*(b + c)'), 'a*(b + c)');
  test.done();
};

exports['Implicit Expression evaluation'] = function(test) {
  test.equal(parse('1 + 2'), '3');
  test.equal(parse('1 - 2'), '-1');
  test.equal(parse('2*3'), '6');
  test.equal(parse('5/2'), '2.5');
  test.equal(parse('2^3'), '8');
  test.equal(parse('sqrt(9)'), '3');
  test.equal(parse('5%'), '0.05');
  test.done();
};





/* ;
 test.equal(parse('1/x + 1/y'), '(x + y)/(x*y)');
compare('4 + 4*x - 2*(2 + 2*x))/(2 + 2*x)', '0');
compare('-4*x*y^2 - 2*y^3 - 2*x^2*y)/(x + y)^2', '-2*y');
compare('-x - y - (x + y)^(-1)*y^2 + (x + y)^(-1)*x^2', '-2*y');
compare('x + x*y)/x', '1 + y');
compare('f(x) + y*f(x))/f(x)', '1 + y');
compare('-x + y/(z + t) + z*x/(z + t) + z*a/(z + t) + t*x/(z + t)', '(y + a*z)/(z + t)');
compare('log(2) + log(3)', 'log(6)');
compare('log(2*x) - log(2)', 'log(x)');

compare('-x/-y)', 'x/y');
compare('-x/y)', '-x/y');
compare('x/y)', 'x/y');
compare('x/-y)', '-x/y');
compare('-x/0)', 'Infinity');
compare('-a*x/(-y - b))', 'a*x/(b + y)');

compare('0', '0');
compare('-1', '-1');
compare('1', '1');
compare('1 + x', '1 + x');
compare('2.7', '2.7'); */
