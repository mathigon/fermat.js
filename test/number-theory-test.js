// =============================================================================
// Fermat.js | Arithmetic Tests
// (c) Mathigon
// =============================================================================

const tape = require('tape');
const {eulerPhi} = require('../');

tape('eulerPhi', function(test) {
  test.equal(eulerPhi(36), 12);
  test.equal(eulerPhi(1), 1);
  test.throws(() => {
    eulerPhi(0);
  })
  test.equal(eulerPhi(667), 616);
  test.equal(eulerPhi(243), 162);
  test.equal(eulerPhi(101), 100);
  test.equal(eulerPhi(1234567890), 329040288);
  test.equal(eulerPhi(12345678923), 12345678922);
  test.equal(eulerPhi(720720), 138240);
  test.equal(eulerPhi(2*3*5*7*11*13*17*19*23*29*31), 30656102400)

  test.end();
});
