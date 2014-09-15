# Contributing to Fermat.js

TODO


## Bug Reports and Feature Requests

Please submit bug reports if you find any problems in our code. It is helpful if these bug reports are as details as possible: your browser, OS, and what steps will reproduce the bug.

TODO


## Testing

For testing, we use the [nodeunit](https://github.com/caolan/nodeunit/) framework. Tests are located in `/tests` and are run automatically when you build using Grunt.

Every new function needs its own test located in the appropriate `.tests.js` file. Nodeunit supports a variety of different tests:

* `ok(value, [message])` tests if value is truthy;
* `equal(actual, expected, [message])` tests shallow, coercive equality using `==`;
* `notEqual(actual, expected, [message])` tests shallow, coercive non-equality using `!=`;
* `deepEqual(actual, expected, [message])` tests for deep equality;
* `notDeepEqual(actual, expected, [message])` tests for any deep inequality;
* `strictEqual(actual, expected, [message])` tests strict equality using `===`;
* `notStrictEqual(actual, expected, [message])` tests strict non-equality using `!==`;
* `expect(amount)` can be used to specify how many assertions are expected to run within a test;
* `done()` is called at the end of every test and moves on to the next one.


## Documentation

TODO


## JS Code Guidelines

TODO


## Pull requests

Run `grunt` before committing to check jshint and unit tests, and to build production files. Make sure that your code follows our coding guidelines.

All pull requests should focus on specific patches and improvements, and not contain unrelated work. Please [email us](dev@mathigon.org) first before starting work on significant new features.


## License

By contributing your code, you agree to license your contribution under the [MIT license](https://github.com/mathigon/fermat/blob/master/LICENSE).
