// =============================================================================
// Fermat.js | Arithmetic Tests
// (c) Mathigon
// =============================================================================


import tape from 'tape';
import {Matrix} from '../src';


tape('Matrix inverses', (test) => {
  const identity = Matrix.identity(3);
  test.equal(Matrix.determinant(identity), 1);
  test.deepEqual(Matrix.inverse(identity), identity);

  // Close-to-zero numbers
  const m = [[1e-17, 1.04, -0.04], [-1.04, 0, 1], [0, 0, 1]];
  test.deepEqual(Matrix.product(m, Matrix.inverse(m)), identity);

  test.end();
});
