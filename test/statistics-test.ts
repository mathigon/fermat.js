// =============================================================================
// Fermat.js | Statistic Tests
// (c) Mathigon
// =============================================================================


import tape from 'tape';
import {quantile} from '../src';


tape('quantile', (test) => {
  test.equal(quantile([], 0.5), 0);

  const evenPopulation = [1, 2, 3, 4, 5];
  test.equal(quantile(evenPopulation, 0.25), 2);
  test.equal(quantile(evenPopulation, 0.5), 3);
  test.equal(quantile(evenPopulation, 0.75), 4);
  test.equal(quantile(evenPopulation, 1), 5);

  const oddPopulation = [1, 2, 3, 4, 5, 6];
  test.equal(quantile(oddPopulation, 0.25), 2);
  test.equal(quantile(oddPopulation, 0.5), 7 / 2);
  test.equal(quantile(oddPopulation, 0.75), 5);
  test.equal(quantile(oddPopulation, 1), 6);
  test.end();
});
