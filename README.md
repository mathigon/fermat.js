# Fermat.ts

[![Build Status](https://github.com/mathigon/fermat.js/workflows/CI%20Tests/badge.svg)](https://github.com/mathigon/fermat.js/actions?query=workflow%3A%22CI+Tests%22)
[![npm](https://img.shields.io/npm/v/@mathigon/fermat.svg)](https://www.npmjs.com/package/@mathigon/fermat)
[![npm](https://img.shields.io/github/license/mathigon/fermat.js.svg)](https://github.com/mathigon/fermat.js/blob/master/LICENSE)

Fermat.ts is a powerful mathematics and statistics library for TypeScript. It contains everything
from number theory to random numbers, expression parsing and linear algebra classes. It was
developed for [Mathigon.org](https://mathigon.org), an award-winning mathematics education
project.


## Features

Note: in version `0.6.0`, all geometry classes and functions were moved to
[@mathigon/euclid](https://github.com/mathigon/euclid.js)!

* Arithmetic: `nearlyEquals()`, `toWord()`, `toFraction()`, …
* Combinatorics: `factorial()`, `binomial()`, `permutations()`, `subsets()`
* Complex numbers: `Complex()`
* Cryptography: `caesarCipher()`, `vigenereCipher()`, `letterFrequency()`
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
