# Fermat.js

Fermat.js is a powerful mathematics, statistics and geometry library for
JavaScript. It contains everything from number theory to random numbers,
expression parsing and linear algebra classes. It was developed for
[Mathigon.org](https://mathigon.org), an award-winning mathematics education
project.

[![npm](https://img.shields.io/npm/v/@mathigon/fermat.svg)](https://www.npmjs.com/package/@mathigon/fermat)
[![npm](https://img.shields.io/github/license/mathigon/fermat.js.svg)](https://github.com/mathigon/fermat.js/blob/master/LICENSE)


## Features

* Arithmetic: `nearlyEquals()`, `toWord()`, `toFraction()`, …
* Combinatorics: `factorial()`, `binomial()`, `permutations()`, `subsets()`
* Complex numbers: `Complex()`
* Cryptography: `caesarCipher()`, `vigenereCipher()`, `letterFrequency()`
* Expression parsing: `Expression()`
* Geometry: `Point()`, `Line()`, `Polygon()`, `Circle()`, `Angle()`, as well as
  methods for geometric properties, projections, intersections and much more
* Matrices: `matrix.product()`, `matrix.determinant()`, `matrix.inverse()`, …
* Number theory: `gcd()`, `isPrime()`, `generatePrime()`, `goldbach()`, …
* Numeric: `bisect()`, `integrate()`
* Random: `random.shuffle()`, `random.binomial()`, `random.normalPDF()`, …
* Regression: `regression.linear()`, `regression.coefficient()`, …
* Statistics: `mean()`, `variance()`, `linearRegression()`, …
* Units: `convert()`, `define()`
* Vector: `Vector()`


## Usage

First, install fermat.js from [NPM](https://www.npmjs.com/package/@mathigon/fermat)
using

```npm install @mathigon/fermat --save```

Fermat.js uses [ES6 imports](http://2ality.com/2014/09/es6-modules-final.html).
While some browsers and platforms now support this feature, we recommend using
a transpiler such as [Babel](http://babeljs.io/) or [Rollup](https://rollupjs.org/). 
Make sure that you configure your compiler to correctly resolve these imports.
For Rollup, we recommend using the
[rollup-plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve)
plugin.

Now, simply import all functions and classes you need, using

```js
import { Complex, gcd } from '@mathigon/fermat'
```


## Contributing

We welcome community contributions: please file any bugs you find or send us
pull requests with improvements. You can find out more on
[Mathigon’s contributions page](https://mathigon.org/contribute).


## Copyright and License

Copyright © Mathigon ([dev@mathigon.org](mailto:dev@mathigon.org))  
Released under the [MIT license](LICENSE)
