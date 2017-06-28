# Fermat.js

Fermat.js is a powerful mathematics, statistics and geometry library for
JavaScript. It contains everything from number theory to random numbers,
expression parsing and linear algebra classes. Fermat.js was developed
for the mathematics education project [Mathigon.org](https://mathigon.org).


## Quick start

Fermat.js is not intended to be used on its own, but as a dependency of another
module or application. You can install it easily using
`npm install @mathigon/fermat`.

Now use [ES6 imports](http://2ality.com/2014/09/es6-modules-final.html) to
require specific classes or functions:

```js
import { Complex, gcd } from '@mathigon/fermat'
```

Finally, compile your JavaScript using [rollup](https://rollupjs.org/). Remember
to include a plugin like [rollup-plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve)
to correctly resolve the imports.


## Documentation

Coming soon!


## Contributing

While fermat.js was developed specifically for use by Mathigon, many of the
functions are generic and reusable. We welcome community contributions: please
file bugs or send us pull requests. You can find out more on
[Mathigon's contributions page](https://mathigon.org/contribute).


## Copyright and License

Code and documentation are copyright (c) Mathigon.
Released under the [MIT license](LICENSE).
