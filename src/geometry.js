// =============================================================================
// Fermat.js | Geometry
// (c) Mathigon
// =============================================================================



import { total, square, clamp, flatten, toLinkedList } from '@mathigon/core';
import { nearlyEquals, isBetween, roundTo } from './arithmetic';
import { subsets } from './combinatorics';


// -----------------------------------------------------------------------------
// Points

/**
 * A single point class defined by two coordinates x and y.
 */
export class Point {

  constructor(x = 0, y = 0) {
    /** @type {number} */
    this.x = x;

    /** @type {number} */
    this.y = y;
  }

  /** @returns {Point} */
  get normal() {
    return this.scale(1/this.length);
  }

  /** @returns {number} */
  get length() {
    return Math.sqrt(square(this.x) + square(this.y));
  }

  /** @returns {Point} */
  get inverse() {
    return new Point(-this.x, -this.y);
  }

  /** @returns {Point} */
  get flip() {
    return new Point(this.y, this.x);
  }

  /** @returns {Point} */
  get perpendicular() {
    return new Point(-this.y, this.x);
  }

  /** @returns {number[]} */
  get array() {
    return [this.x, this.y];
  }

  /**
   * Calculates the shortest distance between this point and a line l.
   * @param {Line} l
   * @returns {number}
   */
  distanceFromLine(l) {
    return Point.distance(this, l.project(this));
  }

  /**
   * Clamps this point between given x and y values.
   * @param {number} xMin
   * @param {number} xMax
   * @param {number} yMin
   * @param {number} yMax
   * @returns {Point}
   */
  clamp(xMin, xMax, yMin, yMax) {
    return new Point(clamp(this.x, xMin, xMax), clamp(this.y, yMin, yMax));
  }

  /**
   * Transforms this point using a 2x3 matrix m.
   * @param {Array.<number[]>} m
   * @returns {Point}
   */
  transform(m) {
    if (!m) return this;

    let x = m[0][0] * this.x + m[0][1] * this.y + m[0][2];
    let y = m[1][0] * this.x + m[1][1] * this.y + m[1][2];
    return new Point(x, y);
  }

  /**
   * Rotates this point by a given angle (in radians) around c.
   * @param {number} angle
   * @param {?Point} c
   * @returns {Point}
   */
  rotate(angle, c = origin) {
    let x0 = this.x - c.x;
    let y0 = this.y - c.y;

    let cos = Math.cos(angle);
    let sin = Math.sin(angle);

    let x = x0 * cos - y0 * sin + c.x;
    let y = x0 * sin + y0 * cos + c.y;
    return new Point(x, y);
  }

  /**
   * Reflects this point across a line l.
   * @param {Line} l
   * @returns {Point}
   */
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

  changeCoordinates(originCoords, targetCoords) {
    const x = targetCoords.xMin + (this.x - originCoords.xMin) / (originCoords.dx) * (targetCoords.dx);
    const y = targetCoords.yMin + (this.y - originCoords.yMin) / (originCoords.dy) * (targetCoords.dy);
    return new Point(x, y);
  }

  add(p) { return Point.sum(this, p); }

  subtract(p) { return Point.difference(this, p); }

  equals(p) { return Point.equals(this, p); }

  round(inc = 1) {
    return new Point(roundTo(this.x, inc), roundTo(this.y, inc));
  }

  floor() {
    return new Point(Math.floor(this.x), Math.floor(this.y));
  }

  mod(x, y = x) {
    return new Point(this.x % x, this.y % y);
  }

  /**
   * Calculates the average of multiple points.
   * @param {...Point} points
   * @returns {Point}
   */
  static average(...points) {
    let x = total(points.map(p => p.x)) / points.length;
    let y = total(points.map(p => p.y)) / points.length;
    return new Point(x, y);
  }

  /**
   * Calculates the dot product of two points p1 and p2.
   * @param {Point} p1
   * @param {Point} p2
   * @returns {number}
   */
  static dot(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y;
  }

  static sum(p1, p2) {
    return new Point(p1.x + p2.x, p1.y + p2.y);
  }

  static difference(p1, p2) {
    return new Point(p1.x - p2.x, p1.y - p2.y);
  }

  /**
   * Returns the Euclidean distance between two points p1 and p2.
   * @param {Point} p1
   * @param {Point} p2
   * @returns {number}
   */
  static distance(p1, p2) {
    return Math.sqrt(square(p1.x - p2.x) + square(p1.y - p2.y));
  }

  /**
   * Returns the Manhattan distance between two points p1 and p2.
   * @param {Point} p1
   * @param {Point} p2
   * @returns {number}
   */
  static manhattan(p1, p2) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
  }

  /**
   * Interpolates two points p1 and p2 by a factor of t.
   * @param {Point} p1
   * @param {Point} p2
   * @param {?number} t
   * @returns {Point}
   */
  static interpolate(p1, p2, t=0.5) {
    return new Point(p1.x + t * (p2.x - p1.x), p1.y + t * (p2.y - p1.y));
  }

  /**
   * Checks if two points p1 and p2 are equal.
   * @param {Point} p1
   * @param {Point} p2
   * @returns {boolean}
   */
  static equals(p1, p2) {
    return nearlyEquals(p1.x, p2.x) && nearlyEquals(p1.y, p2.y);
  }

  /**
   * Creates a point from polar coordinates.
   * @param r
   * @param angle
   * @returns {Point}
   */
  static fromPolar(angle, r=1) {
    return new Point(r * Math.cos(angle), r * Math.sin(angle));
  }
}

const origin = new Point(0,0);


// -----------------------------------------------------------------------------
// Angles

export class Bounds {

  constructor(xMin, xMax, yMin, yMax) {
    this.xMin = xMin;
    this.xMax = xMax;
    this.yMin = yMin;
    this.yMax = yMax;
  }

  get dx() { return this.xMax - this.xMin; }
  get dy() { return this.yMax - this.yMin; }
}


// -----------------------------------------------------------------------------
// Angles

const twoPi = 2 * Math.PI;

/**
 * A 2-dimensional angle class, defined by three points.
 */
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

  /**
   * The size, in radians, of this angle.
   * @returns {number}
   */
  get rad() {
    let phiA = Math.atan2(this.a.y - this.b.y, this.a.x - this.b.x);
    let phiC = Math.atan2(this.c.y - this.b.y, this.c.x - this.b.x);
    let phi = phiC - phiA;

    if (phi < 0) phi += 2 * Math.PI;
    return phi;
  }

  /**
   * The size, in degrees, of this angle.
   * @returns {number}
   */
  get deg() {
    return this.rad * 180 / Math.PI;
  }

  /**
   * The smaller size of this angle, in radians, between 0 and Pi.
   * @returns {number}
   */
  get size() {
    let rad = this.rad;
    return Math.min(rad, 2 * Math.PI - rad);
  }

  /**
   * Checks if this angle is right-angled.
   * @returns {boolean}
   */
  get isRight() {
    return nearlyEquals(this.size, Math.PI/2, 0.01);
  }

  /**
   * The bisector of this angle.
   * @returns {Line}
   */
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

/**
 * An infinite straight line that goes through two points.
 */
export class Line {

  constructor(p1, p2) {
    /** @type {Point} */
    this.p1 = p1;

    /** @type {Point} */
    this.p2 = p2;
  }

  get length() {
    return Point.distance(this.p1, this.p2);
  }

  /**
   * The midpoint of this line.
   * @returns {Point}
   */
  get midpoint() {
    return Point.average(this.p1, this.p2);
  }

  get slope() {
    return (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
  }

  get intercept() {
    return this.p1.y + this.slope * this.p1.x
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

  /**
   * The perpendicular bisector of this line.
   * @returns {Line}
   */
  get perpBisector() {
    return this.perpendicular(this.midpoint);
  }

  /**
   * Finds the line parallel to this one, going though point p.
   * @param {Point} p
   * @returns {Line}
   */
  parallel(p) {
    const q = Point.sum(p, Point.difference(this.p2, this.p1));
    return new Line(p, q);
  }

  /**
   * Finds the line perpendicular to this one, going though point p.
   * @param {Point} p
   * @returns {Line}
   */
  perpendicular(p) {
    return new Line(p, Point.sum(p, this.perpendicularVector));
  }

  /**
   * Checks if a point p lies on this line.
   * @param {Point} p
   * @returns {boolean}
   */
  contains(p) {
    // det([[p.x, p.y, 1],[p1.x, p1.y, 1],[p2.x, ,p2.y 1]])
    const det = p.x * (this.p1.y - this.p2.y) + this.p1.x * (this.p2.y - p.y)
      + this.p2.x * (p.y - this.p1.y);
    return nearlyEquals(det, 0);
  }

  at(t) {
    return Point.interpolate(this.p1, this.p2, t);
  }

  /**
   * Projects a point p onto this line.
   * @param {Point} p
   * @returns {Point}
   */
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

  /**
   * Checks if two lines l1 and l2 are equal.
   * @param {Line} l1
   * @param {Line} l2
   * @returns {boolean}
   */
  static equals(l1, l2) {
    return l1.contains(l2.p1) && l1.contains(l2.p2);
  }
}

export class Ray extends Line {
  // TODO
}

/**
 * A finite line segment defined by its two endpoints.
 */
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

  /**
   * Contracts (or expands) a line by a specific ratio.
   * @param {number} x
   * @returns {Segment}
   */
  contract(x) {
    return new Segment(this.at(x), this.at(1 - x));
  }

  /**
   * Checks if two line segments l1 and l2 are equal.
   * @param {Line} l1
   * @param {Line} l2
   * @param {boolean=} oriented Make true of the orientation matters.
   * @returns {boolean}
   */
  static equals(l1, l2, oriented=false) {
    return (Point.equals(l1.p1, l2.p1) && Point.equals(l1.p2, l2.p2)) ||
      (!oriented && Point.equals(l1.p1, l2.p2) && Point.equals(l1.p2, l2.p1));
  }

  /**
   * Finds the intersection of two line segments l1 and l2 (or null).
   * @param {Line} l1
   * @param {Line} l2
   * @returns {?Point}
   */
  static intersect(l1, l2) {
    const s1 = new Segment(l1.p1, l1.p2);
    const s2 = new Segment(l2.p1, l2.p2);
    return intersections(s1, s2)[0] || null;
  }
}


// -----------------------------------------------------------------------------
// Circles, Ellipses and Arcs

/**
 * A circle with a given center and radius.
 */
export class Circle {

  constructor(c = origin, r = 1) {
    /** @type {Point} */
    this.c = c;

    /** @type {number} */
    this.r = r;
  }

  /**
   * The length of the circumference of this circle.
   * @returns {number}
   */
  get circumference() {
    return 2 * Math.PI * this.r;
  }

  /**
   * The area of this circle.
   * @returns {number}
   */
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

/**
 * An arc segment of a circle, with given center, start point and angle.
 */
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

/**
 * A polygon defined by its vertex points.
 */
export class Polygon {

  constructor(...points) {
    /** @type {Point[]} */
    this.points = points;
  }

  /** @returns {number} */
  get circumference() {
    let C = 0;
    for (let i = 1; i < this.points.length; ++i) {
      C += Point.distance(this.points[i - 1], this.points[i]);
    }
    return C;
  }

  /**
   * The (signed) area of this polygon. The result is positive if the vertices
   * are ordered clockwise, and negative otherwise.
   * @returns {number}
   */
  get signedArea() {
    let p = this.points;
    let n = p.length;
    let A = p[n - 1].x * p[0].y - p[0].x * p[n - 1].y;

    for (let i = 1; i < n; ++i) {
      A += p[i - 1].x * p[i].y - p[i].x * p[i - 1].y;
    }

    return A / 2;
  }

  /** @returns {number} */
  get area() { return Math.abs(this.signedArea); }

  /** @returns {Point} */
  get centroid() {
    let p = this.points;
    let n = p.length;

    let Cx = 0;
    for (let i=0; i<n; ++i) Cx += p[i].x;

    let Cy = 0;
    for (let i=0; i<n; ++i) Cy += p[i].y;

    return new Point(Cx / n, Cy / n);
  }

  /** @returns {Segment[]} */
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
    return new this.constructor(...points);
  }

  reflect(line) {
    const points = this.points.map(p => p.reflect(line));
    return new this.constructor(...points);
  }

  scale(sx, sy = sx) {
    const points = this.points.map(p => p.scale(sx, sy));
    return new this.constructor(...points);
  }

  shift(x, y=x) {
    const points = this.points.map(p => p.shift(x, y));
    return new this.constructor(...points);
  }

  translate(p) {
    return this.shift(p.x, p.y);
  }

  /**
   * Checks if a point p lies inside this polygon.
   * @param {Point} p
   * @returns {boolean}
   */
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

  /**
   * The oriented version of this polygon (vertices in clockwise order).
   * @returns {Polygon}
   */
  get oriented() {
    if (this.signedArea >= 0) return this;
    const points = [...this.points].reverse();
    return new Polygon(...points);
  }

  /**
   * The intersection of this and another polygon, calculated using the
   * Weiler–Atherton clipping algorithm
   * @param {Polygon} polygon
   * @returns {?Polygon}
   */
  intersect(polygon) {
    // TODO Support intersections with multiple disjoint overlapping areas.
    // TODO Support segments intersecting at their endpoints
    const points = [toLinkedList(this.oriented.points),
      toLinkedList(polygon.oriented.points)];
    const max = this.points.length + polygon.points.length;
    const result = [];

    let which = 0;
    let active = points[which].find(p => polygon.contains(p.val));
    if (!active) return null;  // No intersection

    while(active.val !== result[0] && result.length < max) {
      result.push(active.val);

      const nextEdge = new Segment(active.val, active.next.val);
      active = active.next;

      for (let p of points[1 - which]) {
        const testEdge = new Segment(p.val, p.next.val);
        const intersect = intersections(nextEdge, testEdge)[0];
        if (intersect) {
          which = 1 - which;  // Switch active polygon
          active = {val: intersect, next: p.next};
          break;
        }
      }
    }

    return new Polygon(...result);
  }

  /**
   * Checks if two polygons p1 and p2 collide.
   * @param {Polygon} p1
   * @param {Polygon} p2
   * @returns {boolean}
   */
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

/**
 * A polyline defined by its vertex points.
 */
export class Polyline extends Polygon {

  /** @returns {Segment[]} */
  get edges() {
    let edges = [];
    for (let i=0; i<this.points.length-1; ++i)
      edges.push(new Segment(this.points[i], this.points[i+1]));
    return edges;
  }

  // TODO Other methods and properties
}

/**
 * A triangle defined by its three vertices.
 */
export class Triangle extends Polygon {

  constructor(a, b, c) {
    super(a, b, c);
  }

  /** @returns {Circle} */
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

  /** @returns {Circle} */
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

  /** @returns {Point} */
  get orthocenter() {
    const [a, b, c] = this.points;
    const h1 = new Line(a, b).perpendicular(c);
    const h2 = new Line(a, c).perpendicular(b);
    return intersections(h1, h2)[0];
  }
}


// -----------------------------------------------------------------------------
// Rectangles and Squares

/**
 * A rectangle, defined by its top left vertex, width and height.
 */
export class Rectangle {

  constructor(p, w = 1, h = w) {
    /** @type {Point} */
    this.p = p;

    /** @type {number} */
    this.w = w;

    /** @type {number} */
    this.h = h;
  }

  /** @returns {Point} */
  get center() {
    return new Point(this.p.x + this.w / 2, this.p.y + this.h / 2);
  }

  /** @returns {number} */
  get circumference() {
    return 2 * Math.abs(this.w) + 2 * Math.abs(this.h);
  }

  /** @returns {number} */
  get area() {
    return Math.abs(this.w * this.h);
  }

  /** @returns {Segment[]} */
  get edges() {
    return this.polygon.edges;
  }

  /**
   * A polygon class representing this rectangle.
   * @returns {Polygon}
   */
  get polygon() {
    let b = new Point(this.p.x + this.w, this.p.y);
    let c = new Point(this.p.x + this.w, this.p.y + this.h);
    let d = new Point(this.p.x, this.p.y + this.h);
    return new Polygon(this.p, b, c, d);
  }

  transform(m) {
    if (!m) return this;
    return this.polygon.transform(m);
  }

  rotate(a, c = origin) {
    return this.polygon.rotate(a,c);
  }

  reflect(l) {
    return this.polygon.reflect(l);
  }

  scale(sx, sy = sx) {
    return new Rectangle(this.p.scale(sx, sy), this.w * sx, this.h * sy);
  }

  shift(x, y = x) {
    return new Rectangle(this.p.shift(x, y), this.w, this.h);
  }

  translate(p) {
    return new Rectangle(this.p.translate(p), this.w, this.h);
  }

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

/**
 * A square, defined by its top left vertex and size.
 */
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

function liesOnRay(r, p) {
  if (nearlyEquals(r.p1.x, r.p2.x)) return (p.y - r.p1.y) / (r.p2.y - r.p1.y) > 0;
  return (p.x - r.p1.x) / (r.p2.x - r.p1.x)  > 0;
}

function lineLineIntersection(l1, l2) {
  const d1x = l1.p1.x - l1.p2.x;
  const d1y = l1.p1.y - l1.p2.y;

  const d2x = l2.p1.x - l2.p2.x;
  const d2y = l2.p1.y - l2.p2.y;

  const d = d1x * d2y - d1y * d2x;
  if (nearlyEquals(d, 0)) return [];  // Colinear lines never intersect

  const q1 = l1.p1.x * l1.p2.y - l1.p1.y * l1.p2.x;
  const q2 = l2.p1.x * l2.p2.y - l2.p1.y * l2.p2.x;

  const x = q1 * d2x - d1x * q2;
  const y = q1 * d2y - d1y * q2;
  return [new Point(x/d, y/d)];
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

/**
 * Returns the intersection of two or more geometry objects.
 * @param {...*} elements
 * @returns {*}
 */
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

  if (a instanceof Ray) results = results.filter(i => liesOnRay(a, i));
  if (b instanceof Ray) results = results.filter(i => liesOnRay(b, i));

  return results;
}
