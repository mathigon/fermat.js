// =============================================================================
// Fermat.js | Geometry Tests
// (c) Mathigon
// =============================================================================


import * as tape from 'tape';
import {Point, Line, Segment, Polygon, Circle, intersections} from '../src/geometry';


tape('intersections', (test) => {
  // Segment-segment intersection
  const s1 = new Segment(new Point(1, 1), new Point(3, 1));
  const s2 = new Segment(new Point(2, 2), new Point(2, 0));
  const i1 = intersections(s1, s2);
  test.equal(i1.length, 1);
  test.deepEqual([i1[0].x, i1[0].y], [2, 1]);

  // Polygon-polygon intersection
  const p1 = new Polygon(new Point(0, 0), new Point(0, 2), new Point(2, 2), new Point(2, 0));
  const p2 = new Polygon(new Point(1, 1), new Point(3, 1), new Point(3, 3), new Point(1, 3));
  const i2 = intersections(p1, p2);
  test.equal(i2.length, 2);
  test.deepEqual([i2[0].x, i2[0].y, i2[1].x, i2[1].y], [2, 1, 1, 2]);

  // Circle-circle intersection
  const c1 = new Circle(new Point(1, 0), 2);
  const c2 = new Circle(new Point(-1, 0), 2);
  const i3 = intersections(c1, c2);
  test.equal(i3.length, 2);
  test.deepEqual([i3[0].x, i3[1].x], [0, 0]);

  // Polygon-line intersection
  const l1 = new Line(new Point(0, 3), new Point(1, 2));
  const i4 = intersections(l1, p1);
  test.equal(i4.length, 2);
  test.deepEqual([i4[0].x, i4[0].y, i4[1].x, i4[1].y], [1, 2, 2, 1]);

  // Line parallel to edge of polygon returns the vertices of the polygon
  // TODO Should this really happen?
  const i5 = intersections(p1, new Line(new Point(0, 2), new Point(3, 2)));
  test.equal(i5.length, 2);

  // Single elements
  test.equal(intersections(s1).length, 0);

  // Two VERY large polygons should intersect in <1 s
  const start = Date.now();
  const p3 = Polygon.regular(100, 1);
  const p4 = Polygon.regular(101, 1);
  test.equal(intersections(p3, p4).length, 202);
  const end = Date.now();
  test.ok(end - start < 1000);

  test.end();
});
