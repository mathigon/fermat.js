// =============================================================================
// Fermat.js | Geometry
// (c) Mathigon
// =============================================================================



import { tabulate, total, list, isBetween, square, clamp, flatten } from '@mathigon/core';
import { nearlyEquals, roundTo } from './arithmetic';
import { permutations, subsets } from './combinatorics';
import { Vector } from './vector';


// -----------------------------------------------------------------------------
// Points

export class Point {

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  get normal() {
    return this.scale(1/this.length);
  }

  get length() {
    return Math.sqrt(square(this.x) + square(this.y));
  }

  get inverse() {
    return new Point(-this.x, -this.y);
  }

  get flip() {
    return new Point(this.y, this.x);
  }

  get array() {
    return [this.x, this.y];
  }

  distanceFromLine(l) {
    return Point.distance(this, l.project(this));
  }

  clamp(xMin, xMax, yMin, yMax) {
    return new Point(clamp(this.x, xMin, xMax), clamp(this.y, yMin, yMax));
  }

  transform(m) {
    if (!m) return this;

    let x = m[0][0] * this.x + m[0][1] * this.y + m[0][2];
    let y = m[1][0] * this.x + m[1][1] * this.y + m[1][2];
    return new Point(x, y);
  }

  rotate(angle, c = origin) {
    let x0 = this.x - c.x;
    let y0 = this.y - c.y;

    let cos = Math.cos(angle);
    let sin = Math.sin(angle);

    let x = x0 * cos - y0 * sin + c.x;
    let y = x0 * sin + y0 * cos + c.y;
    return new Point(x, y);
  }

  reflect(l) {
    let v = l.p2.x - l.p1.x;
    let w = l.p2.y - l.p1.y;

    let x0 = this.x - l.p1.x;
    let y0 = this.y - l.p1.y;

    let mu = (v * y0 - w * x0) / (v * v + w * w);

    let x = this.x + 2 * mu * w;
    let y = this.y - 2 * mu * v;
    return new Point(x, y);
  }

  scale(sx, sy = sx) {
    return new Point(this.x * sx, this.y * sy);
  }

  shift(x, y = x) {
    return new Point(this.x + x, this.y + y);
  }

  translate(p) {
    return this.shift(p.x, p.y);
  }

  add(p) { return Point.sum(this, p); }

  subtract(p) { return Point.difference(this, p); }

  equals(p) { return Point.equals(this, p); }

  round(inc = 1) {
    return new Point(roundTo(this.x, inc), roundTo(this.y, inc))
  }

  mod(x, y = x) {
    return new Point(this.x % x, this.y % y);
  }

  static average(...points) {
    let x = total(points.map(p => p.x)) / points.length;
    let y = total(points.map(p => p.y)) / points.length;
    return new Point(x, y);
  }

  static dot(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y;
  }

  static sum(p1, p2) {
    return new Point(p1.x + p2.x, p1.y + p2.y);
  }

  static difference(p1, p2) {
    return new Point(p1.x - p2.x, p1.y - p2.y);
  }

  static distance(p1, p2) {
    return Math.sqrt(square(p1.x - p2.x) + square(p1.y - p2.y));
  }

  static manhattan(p1, p2) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
  }

  static interpolate(p1, p2, t=0.5) {
    return new Point(p1.x + t * (p2.x - p1.x), p1.y + t * (p2.y - p1.y));
  }

  static equals(p1, p2) {
    return nearlyEquals(p1.x, p2.x) && nearlyEquals(p1.y, p2.y);
  }
}

const origin = new Point(0,0);


// -----------------------------------------------------------------------------
// Angles

const twoPi = 2 * Math.PI;

export class Angle {

  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  transform(m) {
    if (!m) return this;
    return new Angle(this.a.transform(m), this.b.transform(m), this.c.transform(m));
  }

  get rad() {
    let phiA = Math.atan2(this.a.y - this.b.y, this.a.x - this.b.x);
    let phiC = Math.atan2(this.c.y - this.b.y, this.c.x - this.b.x);
    let phi = phiC - phiA;

    if (phi < 0) phi += 2 * Math.PI;
    return phi;
  }

  get deg() {
    return this.rad * 180 / Math.PI;
  }

  get size() {
    let rad = this.rad;
    return Math.min(rad, 2 * Math.PI - rad);
  }

  get isRight() {
    return nearlyEquals(this.size, Math.PI/2, 0.01);
  }

  get bisector() {
    let phiA = Math.atan2(this.a.y - this.b.y, this.a.x - this.b.x);
    let phiC = Math.atan2(this.c.y - this.b.y, this.c.x - this.b.x);
    let phi = (phiA + phiC) / 2;

    if (phiA > phiC) phi += Math.PI;

    let x = Math.cos(phi) + this.b.x;
    let y = Math.sin(phi) + this.b.y;

    return new Line(this.b, new Point(x, y));
  }

}

function rad(p, c=origin) {
  const a = Math.atan2(p.y - c.y, p.x - c.x);
  return (a + twoPi) % twoPi;
}


// -----------------------------------------------------------------------------
// Lines, Rays and Line Segments

export class Line {

  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  get length() {
    return Point.distance(this.p1, this.p2);
  }

  get midpoint() {
    return Point.average(this.p1, this.p2);
  }

  get slope() {
    return (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
  }

  get angle() {
    return rad(this.p2, this.p1);
  }

  get normalVector() {
    let l = this.length;
    let x = (this.p2.x - this.p1.x) / l;
    let y = (this.p2.y - this.p1.y) / l;
    return new Point(x, y);
  }

  get perpendicularVector() {
    return new Point(this.p2.y - this.p1.y, this.p1.x - this.p2.x).normal;
  }

  get perpendicularBisector() {
    return this.perpendicular(this.midpoint);
  }

  parallel(p) {
    const q = Point.sum(p, Point.difference(this.p2, this.p1));
    return new Line(p, q);
  }

  perpendicular(p) {
    return new Line(p, Point.sum(p, this.perpendicularVector));
  }

  contains(p) {
    let grad1 = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
    let grad2 = (p.y - this.p1.y) / (p.x - this.p1.x);
    return nearlyEquals(grad1, grad2);
  }

  at(t) {
    return Point.interpolate(this.p1, this.p2, t);
  }

  project(p) {
    const a = Point.difference(this.p2, this.p1);
    const b = Point.difference(p, this.p1);
    const proj = a.scale(Point.dot(a, b) / square(this.length));
    return Point.sum(this.p1, proj);
  }

  transform(m) {
    if (!m) return this;
    return new this.constructor(this.p1.transform(m), this.p2.transform(m));
  }

  rotate(a, c = origin) {
    return new this.constructor(this.p1.rotate(a, c), this.p2.rotate(a, c));
  }

  reflect(l) {
    return new this.constructor(this.p1.reflect(l), this.p2.reflect(l));
  }

  scale(sx, sy = sx) {
    return new this.constructor(this.p1.scale(sx, sy), this.p2.scale(sx, sy));
  }

  shift(x, y = x) {
    return new this.constructor(this.p1.shift(x, y), this.p2.shift(x, y));
  }

  translate(p) {
    return new this.constructor(this.p1.translate(p), this.p2.translate(p));
  }

  equals(other) {
    return this.constructor.equals(this, other);
  }

  static equals(l1, l2) {
    return l1.contains(l2.p1) && l1.contains(l2.p2);
  }
}

export class Ray extends Line {
  // TODO
}

export class Segment extends Line {

  contains(_p) {
    // TODO
  }

  project(p) {
    const a = Point.difference(this.p2, this.p1);
    const b = Point.difference(p, this.p1);

    const q = clamp(Point.dot(a, b) / square(this.length), 0, 1);
    return Point.sum(this.p1, a.scale(q));
  }

  static equals(l1, l2, oriented=false) {
    return (Point.equals(l1.p1, l2.p1) && Point.equals(l1.p2, l2.p2)) ||
      (!oriented && Point.equals(l1.p1, l2.p2) && Point.equals(l1.p2, l2.p1));
  }

  static intersect(l1, l2) {
    // TODO Use the generic intersection() function

    // Equal or touching line segments don't intersect
    let s = Point.equals(l1.p1, l2.p1) + Point.equals(l1.p1, l2.p2) +
      Point.equals(l1.p2, l2.p1) + Point.equals(l1.p2, l2.p2);
    if (s >= 1) return;

    let d1 = [l1.p2.x - l1.p1.x, l1.p2.y - l1.p1.y];
    let d2 = [l2.p2.x - l2.p1.x, l2.p2.y - l2.p1.y];

    let denominator = Vector.cross2D(d2, d1);
    if (nearlyEquals(denominator, 0)) return;  // -> colinear

    let d  = [l2.p1.x - l1.p1.x, l2.p1.y - l1.p1.y];
    let q1 = Vector.cross2D(d1, d) / denominator;
    let q2 = Vector.cross2D(d2, d) / denominator;

    if (q1 >= 0 && q1 <= 1 && q2 >= 0 && q2 <= 1) {
      let intersectionX = l1.p1.x + q1 * d[0];
      let intersectionY = l1.p1.y + q2 * d[1];
      return new Point(intersectionX, intersectionY);
    }
  }
}


// -----------------------------------------------------------------------------
// Circles, Ellipses and Arcs

export class Circle {

  constructor(c = origin, r = 1) {
    this.c = c;
    this.r = r;
  }

  get circumference() {
    return 2 * Math.PI * this.r;
  }

  get area() {
    return Math.PI * square(this.r);
  }

  get arc() {
    let start = this.c.shift(this.r, 0);
    return new Arc(this.c, start, twoPi);
  }

  transform(m) {
    if (!m) return this;
    return new Circle(this.c.transform(m), this.r * (m[0][0] + m[1][1]) / 2);
  }

  rotate(a, c = origin) {
    return new Circle(this.c.rotate(a, c), this.r);
  }

  reflect(l) {
    return new Circle(this.c.reflect(l), this.r);
  }

  scale(sx, sy = sx) {
    return new Circle(this.c.scale(sx, sy), this.r * (sx + sy) / 2);
  }

  shift(x, y = x) {
    return new Circle(this.c.shift(x, y), this.r)
  }

  translate(p) {
    return new Circle(this.c.translate(p), this.r);
  }

  contains(p) {
    return Point.distance(p, this.c) <= this.r;
  }

  equals(other) {
    return other instanceof Circle && nearlyEquals(this.r, other.r)
      && this.c.equals(other.c);
  }

  project(p) {
    const proj = Point.difference(p, this.c).normal.scale(this.r);
    return Point.sum(this.c, proj);
  }

  at(t) {
    const a = 2 * Math.PI * t;
    return this.c.shift(this.r * Math.cos(a), this.r * Math.sin(a));
  }
}

export class Arc {

  constructor(c, start, angle) {
    this.c = c;
    this.start = start;
    this.angle = angle;
  }

  get radius() {
    return Point.distance(this.c, this.start);
  }

  get end() {
    return this.start.rotate(this.angle, this.c);
  }

  transform(m) {
    if (!m) return this;
    return new Arc(this.c.transform(m), this.start.transform(m), this.angle);
  }

  get startAngle() {
    return rad(this.start, this.c);
  }

  project(p) {
    let start = this.startAngle;
    let end = start + this.angle;

    let angle = rad(p, this.c);
    if (end > twoPi && angle < end - twoPi) angle += twoPi;
    angle = clamp(angle, start, end);

    return this.c.shift(this.radius, 0).rotate(angle, this.c);
  }

  at(t) {
    return this.start.rotate(this.angle * t, this.c);
  }

  contract(p) {
    return new Arc(this.c, this.at(p / 2), this.angle * (1 - p));
  }

  // TODO rotate, reflect, scale, shift, translate, contains, equals
}


// -----------------------------------------------------------------------------
// Polygons

export class Polygon {

  constructor(...points) {
    this.points = points;
  }

  get circumference() {
    let C = 0;
    for (let i = 1; i < this.points.length; ++i) {
      C += Point.distance(this.points[i - 1], this.points[i]);
    }
    return C;
  }

  get area() {
    let p = this.points;
    let n = p.length;
    let A = p[0].x * p[n - 1].y - p[n - 1].x * p[0].y;

    for (let i = 1; i < n; ++i) {
      A += p[i - 1].x * p[i].y - p[i].x * p[i - 1].y;
    }

    return A / 2;
  }

  get centroid() {
    let p = this.points;
    let n = p.length;

    let Cx = 0;
    for (let i=0; i<n; ++i) Cx += p[i].x;

    let Cy = 0;
    for (let i=0; i<n; ++i) Cy += p[i].y;

    return new Point(Cx / n, Cy / n);
  }

  get edges() {
    let p = this.points;
    let n = p.length;

    let edges = [];
    for (let i=0; i<n; ++i) edges.push(new Segment(p[i], p[(i+1) % n]));
    return edges;
  }

  transform(m) {
    if (!m) return this;
    return new this.constructor(...this.points.map(p => p.transform(m)));
  }

  rotate(a, center=origin) {
    const points = this.points.map(p => p.rotate(a, center));
    return new Polygon(...points);
  }

  reflect(line) {
    const points = this.points.map(p => p.reflect(line));
    return new Polygon(...points);
  }

  scale(sx, sy = sx) {
    const points = this.points.map(p => p.scale(sx, sy));
    return new Polygon(...points);
  }

  shift(x, y=x) {
    const points = this.points.map(p => p.shift(x, y));
    return new Polygon(...points);
  }

  translate(p) {
    return this.shift(p.x, p.y);
  }

  contains(p) {
    let n = this.points.length;
    let inside = false;

    for (let i = 0; i < n; ++i) {
      const q1 = this.points[i];
      const q2 = this.points[(i+1) % n];

      const x = (q1.y > p.y) !== (q2.y > p.y);
      const y = p.x < (q2.x - q1.x) * (p.y - q1.y) / (q2.y - q1.y) + q1.x;
      if (x && y) inside = !inside;
    }

    return inside;
  }

  equals(_other) {
    // TODO
  }

  project(_p) {
    // TODO
  }

  at(_t) {
    // TODO
  }

  static collision(p1, p2) {
    // Check if any of the edges overlap.
    for (let e1 of p1.edges) {
      for (let e2 of p2.edges) {
        if (Segment.intersect(e1, e2)) return true;
      }
    }

    // Check if one of the vertices is in one of the the polygons.
    for (let v of p1.points) if (p2.contains(v)) return true;
    for (let v of p2.points) if (p1.contains(v)) return true;

    return false;
  }
}

export class Triangle extends Polygon {

  constructor(a, b, c) {
    super(a, b, c);
  }

  get circumcircle() {
    const p = this.points;

    const d = 2 * (p[0].x * (p[1].y - p[2].y) + p[1].x * (p[2].y - p[0].y)
      + p[2].x * (p[0].y - p[1].y));

    const ux = (square(p[0].x) + square(p[0].y)) * (p[1].y - p[2].y) +
      (square(p[1].x) + square(p[1].y)) * (p[2].y - p[0].y) +
      (square(p[2].x) + square(p[2].y)) * (p[0].y - p[1].y);

    const uy = (square(p[0].x) + square(p[0].y)) * (p[2].x - p[1].x) +
      (square(p[1].x) + square(p[1].y)) * (p[0].x - p[2].x) +
      (square(p[2].x) + square(p[2].y)) * (p[1].x - p[0].x);

    const center = new Point(ux / d, uy / d);
    const radius = Point.distance(center, this.points[0]);

    return new Circle(center, radius);
  }

  get incircle() {
    const edges = this.edges;
    const sides = edges.map(e => e.length);
    const total = sides[0] + sides[1] + sides[2];
    const p = this.points;

    const ux = sides[1] * p[0].x + sides[2] * p[1].x + sides[0] * p[2].x;
    const uy = sides[1] * p[0].y + sides[2] * p[1].y + sides[0] * p[2].y;

    const center = new Point(ux / total, uy / total);
    const radius = center.distanceFromLine(edges[0]);

    return new Circle(center, radius);
  }

  get orthocenter() {
    // TODO
    return origin;
  }
}


// -----------------------------------------------------------------------------
// Rectangles and Squares

export class Rectangle {

  constructor(p, w = 1, h = w) {
    this.p = p;
    this.w = w;
    this.h = h;
  }

  get center() {
    return new Point(this.p.x + this.w / 2, this.p.y + this.h / 2);
  }

  get circumference() {
    return 2 * Math.abs(this.w) + 2 * Math.abs(this.h);
  }

  get area() {
    return Math.abs(this.w * this.h);
  }

  get edges() {
    return this.polygon.edges;
  }

  get polygon() {
    let b = new Point(this.p.x + this.w, this.p.y);
    let c = new Point(this.p.x + this.w, this.p.y + this.h);
    let d = new Point(this.p.x, this.p.y + this.h);
    return new Polygon(this.p, b, c, d);
  }

  transform(m) {
    if (!m) return this;

    const w1 = this.w * m[0][0];
    const h1 = this.h * m[1][1];
    return new this.constructor(this.p.transform(m), w1, h1);
  }

  // TODO rotate, reflect, scale, shift, translate

  contains(_p) {
    // TODO
  }

  equals(_other) {
    // TODO
  }

  project(p) {
    // TODO Use the generic intersections() function
    let rect1 = { x: this.p.x + this.w, y: this.p.y + this.h };  // bottom right corner of rect
    let center = { x: this.p.x + this.w/2, y: this.p.y + this.h/2 };
    let m = (center.y - p.y) / (center.x - p.x);

    if (p.x <= center.x) {  // check left side
      let y = m * (this.p.x - p.x) + p.y;
      if (this.p.y < y && y < rect1.y) return new Point(this.p.x, y);
    }

    if (p.x >= center.x) {  // check right side
      let y = m * (rect1.x - p.x) + p.y;
      if (this.p.y < y && y < rect1.y) return new Point(rect1.x, y);
    }

    if (p.y <= center.y) {  // check top side
      let x = (this.p.y - p.y) / m + p.x;
      if (this.p.x < x && x < rect1.x) return new Point(x, this.p.y);
    }

    if (p.y >= center.y) {  // check bottom side
      let x = (rect1.y - p.y) / m + p.x;
      if (this.p.x < x && x < rect1.x) return new Point(x, rect1.y);
    }
  }

  at(_t) {
    // TODO
  }
}

export class Square extends Rectangle {
  constructor(p, w = 1) {
    super(p, w, w);
  }
}


// -----------------------------------------------------------------------------
// Intersections

function liesOnSegment(s, p) {
  if (nearlyEquals(s.p1.x, s.p2.x)) return isBetween(p.y, s.p1.y, s.p2.y);
  return isBetween(p.x, s.p1.x, s.p2.x);
}

function lineLineIntersection(l1, l2) {
  const m1 = l1.slope;
  const m2 = l2.slope;

  const x = (l2.p1.y - l1.p1.y - m2 * l2.p1.x + m1 * l1.p1.x) / (m1 - m2);
  const y = l1.p1.y + m1 * (x - l1.p1.x);
  return [new Point(x, y)];
}

function circleCircleIntersection(c1, c2) {
  const d = Point.distance(c1.c, c2.c);

  if (d > c1.r + c2.r) return [];  // Circles are separate.
  if (d < Math.abs(c1.r - c2.r)) return [];  // One circles contains the other.
  if (nearlyEquals(d, 0) && nearlyEquals(c1.r,c2.r)) return [];  // Circles are the same.
  if (nearlyEquals(d, c1.r + c2.r)) return [new Line(c1.c, c2.c).midpoint]; // Circles touch.

  const a = (square(c1.r) - square(c2.r) + square(d)) / (2 * d);
  const b = Math.sqrt(square(c1.r) - square(a));

  const px = (c2.c.x - c1.c.x) * a / d + (c2.c.y - c1.c.y) * b / d + c1.c.x;
  const py = (c2.c.y - c1.c.y) * a / d - (c2.c.x - c1.c.x) * b / d + c1.c.y;
  const qx = (c2.c.x - c1.c.x) * a / d - (c2.c.y - c1.c.y) * b / d + c1.c.x;
  const qy = (c2.c.y - c1.c.y) * a / d + (c2.c.x - c1.c.x) * b / d + c1.c.y;

  return [new Point(px, py), new Point(qx, qy)]
}

function lineCircleIntersection(_l, _c) {
  // TODO
  return [];
}

export function intersections(...elements) {
  if (elements.length < 2) return [];
  if (elements.length > 2) return flatten(subsets(elements, 2).map(e => intersections(...e)));

  const [a, b] = elements;

  if (a instanceof Polygon || a instanceof Rectangle) return intersections(b, ...a.edges);
  if (b instanceof Polygon || a instanceof Rectangle) return intersections(a, ...b.edges);

  let results = [];

  // TODO Handle Arcs and Rays
  if (a instanceof Line && b instanceof Line) {
    results = lineLineIntersection(a, b);
  } else if (a instanceof Line && b instanceof Circle) {
    results = lineCircleIntersection(a, b);
  } else if (a instanceof Circle && b instanceof Line) {
    results = lineCircleIntersection(b, a);
  } else if (a instanceof Circle && b instanceof Circle) {
    results = circleCircleIntersection(a, b);
  }

  if (a instanceof Segment) results = results.filter(i => liesOnSegment(a, i));
  if (b instanceof Segment) results = results.filter(i => liesOnSegment(b, i));

  return results;
}


// -----------------------------------------------------------------------------
// Computational Geometry

export function travellingSalesman(dist) {
  let n = dist.length;
  let cities = list(n);

  let minLength = Infinity;
  let minPath = null;

  permutations(cities).forEach(function(path) {
    let length = 0;
    for (let i = 0; i < n - 1; ++i) {
      length += dist[path[i]][path[i+1]];
      if (length > minLength) return;
    }
    if (length < minLength) {
      minLength = length;
      minPath = path;
    }
  });

  return { path: minPath, length: minLength };
}

const COLOURS = [1,2,3,4];

function canColour(adjMatrix, colours, index, colour) {
  for (let i=0; i<index; ++i) {
    if (adjMatrix[i][index] && colours[i][index] === colour) return false;
  }
  return true;
}

function colourMe(adjMatrix, colours, index) {
  for (let c of COLOURS) {
    if (canColour(adjMatrix, colours, index, c)) {
      colours[index] = c;
      if (colourMe(adjMatrix, colours, index + 1)) return true;
    }
  }
  return false;
}

export function graphColouring(adjMatrix) {
  let colours = tabulate(0, adjMatrix.length);
  let result = colourMe(adjMatrix, colours, 0);
  return result ? colours : undefined;
}
