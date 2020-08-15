# Fermat.ts

[![Build Status](https://travis-ci.org/mathigon/fermat.js.svg?branch=master)](https://travis-ci.org/mathigon/fermat.js)
[![npm](https://img.shields.io/npm/v/@mathigon/fermat.svg)](https://www.npmjs.com/package/@mathigon/fermat)
[![npm](https://img.shields.io/github/license/mathigon/fermat.js.svg)](https://github.com/mathigon/fermat.js/blob/master/LICENSE)

Fermat.ts is a powerful mathematics, statistics and geometry library for
TypeScript. It contains everything from number theory to random numbers,
expression parsing and linear algebra classes. It was developed for
[Mathigon.org](https://mathigon.org), an award-winning mathematics education
project.


## Features

* Arithmetic: `nearlyEquals()`, `toWord()`, `toFraction()`, …
* Combinatorics: `factorial()`, `binomial()`, `permutations()`, `subsets()`
* Complex numbers: `Complex()`
* Cryptography: `caesarCipher()`, `vigenereCipher()`, `letterFrequency()`
* Geometry: `Point()`, `Line()`, `Polygon()`, `Circle()`, `Angle()`, as well as
  methods for geometric properties, projections, intersections and much more
* Matrices: `Matrix.product()`, `Matrix.determinant()`, `Matrix.inverse()`, …
* Number theory: `gcd()`, `isPrime()`, `generatePrime()`, `goldbach()`, …
* Numeric: `bisect()`, `integrate()`
* Random: `Random.shuffle()`, `Random.binomial()`, `Random.normalPDF()`, …
* Regression: `Regression.linear()`, `Regression.coefficient()`, …
* Statistics: `mean()`, `variance()`, `linearRegression()`, …
* Vector: `Vector()`


## Usage

First, install Fermat.ts from [NPM](https://www.npmjs.com/package/@mathigon/fermat)
using

```npm install @mathigon/fermat```

Now, simply import all functions and classes you need, using

```js
import {Complex, gcd} from '@mathigon/fermat'
```


## Contributing

We welcome community contributions: please file any bugs you find or send us
pull requests with improvements. You can find out more on
[Mathigon.io](https://mathigon.io).

Before submitting a pull request, you will need to sign the [Mathigon Individual
Contributor License Agreement](https://gist.github.com/plegner/5ad5b7be2948a4ad073c50b15ac01d39).


## Copyright and License

Copyright © Mathigon ([dev@mathigon.org](mailto:dev@mathigon.org))  
Released under the [MIT license](LICENSE)
