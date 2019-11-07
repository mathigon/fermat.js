// =============================================================================
// Fermat.js | Geometry Tests
// (c) Mathigon
// =============================================================================


import * as tape from 'tape';
import {Point, Segment, intersections} from '../src/geometry';


tape('intersections', (test) => {
  const s1 = new Segment(new Point(1, 1), new Point(3, 1));
  const s2 = new Segment(new Point(2, 2), new Point(2, 0));
  const i = intersections(s1, s2)[0];
  test.equal(i.x, 2);
  test.equal(i.y, 1);

  test.end();
});
