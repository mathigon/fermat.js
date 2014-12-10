# Contributing to core.js

Mathigon JS was created to simplify web development, to share code between Mathigon websites, and to reduce the need for a large number of external JavaScript libraries and frameworks.

While most of the code was written for specific Mathigon uses, rather than to build a generic and universal library, we hope that you will find it useful for animation and computation heavy projects. 

We welcome any community suggestions and contributions.


## Bug Reports and Feature Requests

If you find bugs or mistakes in Mathigon JS, please [email us](mailto:dev@mathigon.org) with details on how to reproduce them.

To contribute code or to fix bugs, please fork our GitHub repository and send us a pull request. If you would like to add larger pieces of new functionality, please [email us](mailto:dev@mathigon.org) first.


## Testing

We use [nodeunit](https://github.com/caolan/nodeunit/) for testing. Tests are located in `tests/` and are run automatically when you build using Grunt. Every new function needs its own test located in the appropriate `*.tests.js` file. Nodeunit supports a variety of different tests:

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

Every JavaScript source file has a corresponding markdown file located in `docs/` containing documentation.


## JS Coding Guidelines

Mathigon JS largely follows the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).


## Pull requests

Run `grunt` before committing to check jshint and unit tests, and to build production files. Make sure that your code follows our coding guidelines.

All pull requests should focus on specific patches and improvements, and not contain unrelated work. Please [email us](mailto:dev@mathigon.org) first before starting work on significant new features.


## License

By contributing your code, you agree to license your contribution under the [MIT license](https://github.com/mathigon/kepler.js/blob/master/LICENSE).
