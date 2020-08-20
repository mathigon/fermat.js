// =============================================================================
// Fermat.js | Geometry
// (c) Mathigon
// =============================================================================


import {total, flatten, toLinkedList, tabulate, isOneOf} from '@mathigon/core';
import {nearlyEquals, isBetween, roundTo, square, clamp, lerp} from './arithmetic';
import {subsets} from './combinatorics';


// -----------------------------------------------------------------------------
// Interfaces

export type TransformMatrix = [[number, number, number], [number, number, number]];
export type SimplePoint = {x: number, y: number};


// -----------------------------------------------------------------------------
// Points


/** A single point class defined by two coordinates x and y. */
export class Point implements SimplePoint {
  readonly type = 'point';

  constructor(readonly x = 0, readonly y = 0) {}

  get unitVector() {
    if (nearlyEquals(this.length, 0)) return new Point(1, 0);
    return this.scale(1 / this.length);
  }

  get length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  get inverse() {
    return new Point(-this.x, -this.y);
  }

  get flip() {
    return new Point(this.y, this.x);
  }

  get perpendicular() {
    return new Point(-this.y, this.x);
  }

  get array() {
    return [this.x, this.y];
  }

  /** Finds the perpendicular distance between this point and a line. */
  distanceFromLine(l: Line) {
    return Point.distance(this, l.project(this));
  }

  /** Clamps this point to specific bounds. */
  clamp(bounds: Bounds, padding = 0) {
    const x = clamp(this.x, bounds.xMin + padding, bounds.xMax - padding);
    const y = clamp(this.y, bounds.yMin + padding, bounds.yMax - padding);
    return new Point(x, y);
  }

  /** Transforms this point using a 2x3 matrix m. */
  transform(m: TransformMatrix) {
    const x = m[0][0] * this.x + m[0][1] * this.y + m[0][2];
    const y = m[1][0] * this.x + m[1][1] * this.y + m[1][2];
    return new Point(x, y);
  }

  /** Rotates this point by a given angle (in radians) around c. */
  rotate(angle: number, c = ORIGIN) {
    const x0 = this.x - c.x;
    const y0 = this.y - c.y;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x = x0 * cos - y0 * sin + c.x;
    const y = x0 * sin + y0 * cos + c.y;
    return new Point(x, y);
  }

  /** Reflects this point across a line l. */
  reflect(l: Line) {
    const v = l.p2.x - l.p1.x;
    const w = l.p2.y - l.p1.y;

    const x0 = this.x - l.p1.x;
    const y0 = this.y - l.p1.y;

    const mu = (v * y0 - w * x0) / (v * v + w * w);

    const x = this.x + 2 * mu * w;
    const y = this.y - 2 * mu * v;
    return new Point(x, y);
  }

  scale(sx: number, sy = sx) {
    return new Point(this.x * sx, this.y * sy);
  }

  shift(x: number, y = x) {
    return new Point(this.x + x, this.y + y);
  }

  translate(p: Point) {
    return this.shift(p.x, p.y);  // Alias for .add()
  }

  changeCoordinates(originCoords: Bounds, targetCoords: Bounds) {
    const x = targetCoords.xMin + (this.x - originCoords.xMin) /
              (originCoords.dx) * (targetCoords.dx);
    const y = targetCoords.yMin + (this.y - originCoords.yMin) /
              (originCoords.dy) * (targetCoords.dy);
    return new Point(x, y);
  }

  add(p: SimplePoint) {
    return Point.sum(this, p);
  }

  subtract(p: SimplePoint) {
    return Point.difference(this, p);
  }

  equals(other: SimplePoint) {
    return nearlyEquals(this.x, other.x) && nearlyEquals(this.y, other.y);
  }

  round(inc = 1) {
    return new Point(roundTo(this.x, inc), roundTo(this.y, inc));
  }

  floor() {
    return new Point(Math.floor(this.x), Math.floor(this.y));
  }

  mod(x: number, y = x) {
    return new Point(this.x % x, this.y % y);
  }

  angle(c = ORIGIN) {
    return rad(this, c);
  }

  /** Calculates the average of multiple points. */
  static average(...points: SimplePoint[]) {
    const x = total(points.map(p => p.x)) / points.length;
    const y = total(points.map(p => p.y)) / points.length;
    return new Point(x, y);
  }

  /** Calculates the dot product of two points p1 and p2. */
  static dot(p1: SimplePoint, p2: SimplePoint) {
    return p1.x * p2.x + p1.y * p2.y;
  }

  static sum(p1: SimplePoint, p2: SimplePoint) {
    return new Point(p1.x + p2.x, p1.y + p2.y);
  }

  static difference(p1: SimplePoint, p2: SimplePoint) {
    return new Point(p1.x - p2.x, p1.y - p2.y);
  }

  /** Returns the Euclidean distance between two points p1 and p2. */
  static distance(p1: SimplePoint, p2: SimplePoint) {
    return Math.sqrt(square(p1.x - p2.x) + square(p1.y - p2.y));
  }

  /** Returns the Manhattan distance between two points p1 and p2. */
  static manhattan(p1: SimplePoint, p2: SimplePoint) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
  }

  /** Interpolates two points p1 and p2 by a factor of t. */
  static interpolate(p1: SimplePoint, p2: SimplePoint, t = 0.5) {
    return new Point(lerp(p1.x, p2.x, t), lerp(p1.y, p2.y, t));
  }

  /** Interpolates a list of multiple points. */
  static interpolateList(points: SimplePoint[], t = 0.5) {
    const n = points.length - 1;
    const a = Math.floor(clamp(t, 0, 1) * n);
    return Point.interpolate(points[a], points[a + 1], n * t - a);
  }

  /** Creates a point from polar coordinates. */
  static fromPolar(angle: number, r = 1) {
    return new Point(r * Math.cos(angle), r * Math.sin(angle));
  }
}

const ORIGIN = new Point(0, 0);


// -----------------------------------------------------------------------------
// Bounds

export class Bounds {

  constructor(public xMin: number, public xMax: number,
              public yMin: number, public yMax: number) {
  }

  get dx() {
    return this.xMax - this.xMin;
  }

  get dy() {
    return this.yMax - this.yMin;
  }

  get xRange(): [number, number] {
    return [this.xMin, this.xMax];
  }

  get yRange(): [number, number] {
    return [this.yMin, this.yMax];
  }

  get rect() {
    return new Rectangle(new Point(this.xMin, this.xMin), this.dx, this.dy);
  }
}


// -----------------------------------------------------------------------------
// Angles

const TWO_PI = 2 * Math.PI;

/** A 2-dimensional angle class, defined by three points. */
export class Angle {
  readonly type = 'angle';

  constructor(readonly a: Point, readonly b: Point, readonly c: Point) {}

  transform(m: TransformMatrix) {
    return new Angle(this.a.transform(m), this.b.transform(m),
        this.c.transform(m));
  }

  /** The size, in radians, of this angle. */
  get rad() {
    const phiA = Math.atan2(this.a.y - this.b.y, this.a.x - this.b.x);
    const phiC = Math.atan2(this.c.y - this.b.y, this.c.x - this.b.x);
    let phi = phiC - phiA;

    if (phi < 0) phi += TWO_PI;
    return phi;
  }

  /** The size, in degrees, of this angle. */
  get deg() {
    return this.rad * 180 / Math.PI;
  }

  /** Checks if this angle is right-angled. */
  get isRight() {
    // Within 1 deg of 90 deg.
    return nearlyEquals(this.rad, Math.PI / 2, Math.PI/360);
  }

  /** The bisector of this angle. */
  get bisector() {
    if (this.b.equals(this.a)) return undefined;
    if (this.b.equals(this.c)) return undefined;

    const phiA = Math.atan2(this.a.y - this.b.y, this.a.x - this.b.x);
    const phiC = Math.atan2(this.c.y - this.b.y, this.c.x - this.b.x);
    let phi = (phiA + phiC) / 2;

    if (phiA > phiC) phi += Math.PI;

    const x = Math.cos(phi) + this.b.x;
    const y = Math.sin(phi) + this.b.y;

    return new Line(this.b, new Point(x, y));
  }

  /** Returns the smaller one of this and its supplementary angle. */
  get sup() {
    return (this.rad < Math.PI) ? this : new Angle(this.c, this.b, this.a);
  }

  /** Returns the Arc element corresponding to this angle. */
  get arc() {
    return new Arc(this.b, this.a, this.rad);
  }

  equals(_a: Angle) {
    return false;  // TODO
  }

  // Only required to have a common API with Line, Polygon, etc.
  project() {
    return this.b;
  }

  at() {
    return this.b;
  }
}

function rad(p: Point, c = ORIGIN) {
  const a = Math.atan2(p.y - c.y, p.x - c.x);
  return (a + TWO_PI) % TWO_PI;
}


// -----------------------------------------------------------------------------
// Lines, Rays and Line Segments

/** An infinite straight line that goes through two points. */
export class Line {
  readonly type: string = 'line';

  constructor(readonly p1: Point, readonly p2: Point) {}

  protected make(p1: Point, p2: Point) {
    return new Line(p1, p2);
  }

  /* The distance between the two points defining this line. */
  get length() {
    return Point.distance(this.p1, this.p2);
  }

  /** The midpoint of this line. */
  get midpoint() {
    return Point.average(this.p1, this.p2);
  }

  /** The slope of this line. */
  get slope() {
    return (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
  }

  /** The y-axis intercept of this line. */
  get intercept() {
    return this.p1.y + this.slope * this.p1.x;
  }

  /** The angle formed between this line and the x-axis. */
  get angle() {
    return rad(this.p2, this.p1);
  }

  /** The point representing a unit vector along this line. */
  get unitVector() {
    return this.p2.subtract(this.p1).unitVector;
  }

  /** The point representing the perpendicular vector of this line. */
  get perpendicularVector() {
    return new Point(this.p2.y - this.p1.y,
        this.p1.x - this.p2.x).unitVector;
  }

  /** Finds the line parallel to this one, going though point p. */
  parallel(p: Point) {
    const q = Point.sum(p, Point.difference(this.p2, this.p1));
    return new Line(p, q);
  }

  /** Finds the line perpendicular to this one, going though point p. */
  perpendicular(p: Point) {
    return new Line(p, Point.sum(p, this.perpendicularVector));
  }

  /** The perpendicular bisector of this line. */
  get perpendicularBisector() {
    return this.perpendicular(this.midpoint);
  }

  /** Projects this point onto the line `l`. */
  project(p: Point) {
    const a = Point.difference(this.p2, this.p1);
    const b = Point.difference(p, this.p1);
    const proj = a.scale(Point.dot(a, b) / this.length ** 2);
    return Point.sum(this.p1, proj);
  }

  /** Checks if a point p lies on this line. */
  contains(p: Point) {
    // det([[p.x, p.y, 1],[p1.x, p1.y, 1],[p2.x, ,p2.y 1]])
    const det = p.x * (this.p1.y - this.p2.y) + this.p1.x * (this.p2.y - p.y) +
                this.p2.x * (p.y - this.p1.y);
    return nearlyEquals(det, 0);
  }

  at(t: number) {
    return Point.interpolate(this.p1, this.p2, t);
  }

  transform(m: TransformMatrix): this {
    return new (<any> this.constructor)(this.p1.transform(m),
        this.p2.transform(m));
  }

  rotate(a: number, c = ORIGIN): this {
    return new (<any> this.constructor)(this.p1.rotate(a, c),
        this.p2.rotate(a, c));
  }

  reflect(l: Line): this {
    return new (<any> this.constructor)(this.p1.reflect(l), this.p2.reflect(l));
  }

  scale(sx: number, sy = sx) {
    return this.make(this.p1.scale(sx, sy), this.p2.scale(sx, sy));
  }

  shift(x: number, y = x) {
    return this.make(this.p1.shift(x, y), this.p2.shift(x, y));
  }

  translate(p: Point) {
    return this.shift(p.x, p.y);
  }

  equals(other: Line) {
    return this.contains(other.p1) && this.contains(other.p2);
  }
}


/** An infinite ray defined by an endpoint and another point on the ray. */
export class Ray extends Line {
  readonly type = 'ray';

  protected make(p1: Point, p2: Point) {
    return new Ray(p1, p2);
  }

  equals(other: Ray) {
    if (other.type !== 'ray') return false;
    return this.p1.equals(other.p1) && this.contains(other.p2);
  }
}


/** A finite line segment defined by its two endpoints. */
export class Segment extends Line {
  readonly type = 'segment';

  contains(p: Point) {
    if (!Line.prototype.contains.call(this, p)) return false;
    if (nearlyEquals(this.p1.x, this.p2.x)) {
      return isBetween(p.y, this.p1.y, this.p2.y);
    } else {
      return isBetween(p.x, this.p1.x, this.p2.x);
    }
  }

  protected make(p1: Point, p2: Point) {
    return new Segment(p1, p2);
  }

  project(p: Point) {
    const a = Point.difference(this.p2, this.p1);
    const b = Point.difference(p, this.p1);

    const q = clamp(Point.dot(a, b) / square(this.length), 0, 1);
    return Point.sum(this.p1, a.scale(q));
  }

  /** Contracts (or expands) a line by a specific ratio. */
  contract(x: number) {
    return new Segment(this.at(x), this.at(1 - x));
  }

  equals(other: Segment, oriented = false) {
    if (other.type !== 'segment') return false;
    return (this.p1.equals(other.p1) && this.p2.equals(other.p2)) ||
           (!oriented && this.p1.equals(other.p2) && this.p2.equals(other.p1));
  }

  /** Finds the intersection of two line segments l1 and l2 (or undefined). */
  static intersect(s1: Segment, s2: Segment) {
    return simpleIntersection(s1, s2)[0] || undefined;
  }
}


// -----------------------------------------------------------------------------
// Circles, Ellipses and Arcs

/** A circle with a given center and radius. */
export class Circle {
  readonly type = 'circle';

  constructor(readonly c = ORIGIN, readonly r = 1) {}

  /** The length of the circumference of this circle. */
  get circumference() {
    return TWO_PI * this.r;
  }

  /** The area of this circle. */
  get area() {
    return Math.PI * this.r ** 2;
  }

  get arc() {
    const start = this.c.shift(this.r, 0);
    return new Arc(this.c, start, TWO_PI);
  }

  transform(m: TransformMatrix) {
    const scale = Math.abs(m[0][0]) + Math.abs(m[1][1]);
    return new Circle(this.c.transform(m), this.r * scale / 2);
  }

  rotate(a: number, c = ORIGIN) {
    return new Circle(this.c.rotate(a, c), this.r);
  }

  reflect(l: Line) {
    return new Circle(this.c.reflect(l), this.r);
  }

  scale(sx: number, sy = sx) {
    return new Circle(this.c.scale(sx, sy), this.r * (sx + sy) / 2);
  }

  shift(x: number, y = x) {
    return new Circle(this.c.shift(x, y), this.r);
  }

  translate(p: Point) {
    return this.shift(p.x, p.y);
  }

  contains(p: Point) {
    return Point.distance(p, this.c) <= this.r;
  }

  equals(other: Circle) {
    return nearlyEquals(this.r, other.r) && this.c.equals(other.c);
  }

  project(p: Point) {
    const proj = p.subtract(this.c).unitVector.scale(this.r);
    return Point.sum(this.c, proj);
  }

  at(t: number) {
    const a = 2 * Math.PI * t;
    return this.c.shift(this.r * Math.cos(a), this.r * Math.sin(a));
  }

  tangentAt(t: number) {
    const p1 = this.at(t);
    const p2 = this.c.rotate(Math.PI / 2, p1);
    return new Line(p1, p2);
  }
}


/** An arc segment of a circle, with given center, start point and angle. */
export class Arc {
  readonly type: string = 'arc';

  constructor(readonly c: Point, readonly start: Point,
              readonly angle: number) {
  }

  get radius() {
    return Point.distance(this.c, this.start);
  }

  get end() {
    return this.start.rotate(this.angle, this.c);
  }

  transform(m: TransformMatrix): this {
    return new (<any> this.constructor)(this.c.transform(m),
        this.start.transform(m), this.angle);
  }

  rotate(a: number, c = ORIGIN): this {
    return new (<any> this.constructor)(this.c.rotate(a, c),
        this.start.rotate(a, c), this.angle);
  }

  reflect(l: Line): this {
    return new (<any> this.constructor)(this.c.reflect(l),
        this.start.reflect(l), this.angle);
  }

  scale(sx: number, sy = sx): this {
    return new (<any> this.constructor)(this.c.scale(sx, sy),
        this.start.scale(sx, sy), this.angle);
  }

  shift(x: number, y = x): this {
    return new (<any> this.constructor)(this.c.shift(x, y),
        this.start.shift(x, y), this.angle);
  }

  translate(p: Point) {
    return this.shift(p.x, p.y);
  }

  get startAngle() {
    return rad(this.start, this.c);
  }

  project(p: Point) {
    const start = this.startAngle;
    const end = start + this.angle;

    let angle = rad(p, this.c);
    if (end > TWO_PI && angle < end - TWO_PI) angle += TWO_PI;
    angle = clamp(angle, start, end);

    return this.c.shift(this.radius, 0).rotate(angle, this.c);
  }

  at(t: number) {
    return this.start.rotate(this.angle * t, this.c);
  }

  contract(p: number): this {
    return new (<any> this.constructor)(this.c, this.at(p / 2),
        this.angle * (1 - p));
  }

  get minor(): this {
    if (this.angle <= Math.PI) return this;
    return new (<any> this.constructor)(this.c, this.end,
        2 * Math.PI - this.angle);
  }

  get major(): this {
    if (this.angle >= Math.PI) return this;
    return new (<any> this.constructor)(this.c, this.end,
        2 * Math.PI - this.angle);
  }

  get center() {
    return this.at(0.5);
  }

  equals() {
    // TODO Implement
    return false;
  }

  // TODO rotate, reflect, scale, shift, translate, contains, equals
}

export class Sector extends Arc {
  readonly type = 'sector';
}


// -----------------------------------------------------------------------------
// Polygons

/** A polygon defined by its vertex points. */
export class Polygon {
  readonly type: string = 'polygon';

  readonly points: Point[];

  constructor(...points: Point[]) {
    this.points = points;
  }

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
   */
  get signedArea() {
    const p = this.points;
    const n = p.length;
    let A = p[n - 1].x * p[0].y - p[0].x * p[n - 1].y;

    for (let i = 1; i < n; ++i) {
      A += p[i - 1].x * p[i].y - p[i].x * p[i - 1].y;
    }

    return A / 2;
  }

  get area() {
    return Math.abs(this.signedArea);
  }

  get centroid() {
    const p = this.points;
    const n = p.length;

    let Cx = 0;
    for (let i = 0; i < n; ++i) Cx += p[i].x;

    let Cy = 0;
    for (let i = 0; i < n; ++i) Cy += p[i].y;

    return new Point(Cx / n, Cy / n);
  }

  get edges() {
    const p = this.points;
    const n = p.length;

    const edges = [];
    for (let i = 0; i < n; ++i) edges.push(new Segment(p[i], p[(i + 1) % n]));
    return edges;
  }

  get radius() {
    const c = this.centroid;
    const radii = this.points.map(p => Point.distance(p, c));
    return Math.max(...radii);
  }

  transform(m: TransformMatrix): this {
    return new (<any> this.constructor)(...this.points.map(p => p.transform(m)));
  }

  rotate(a: number, center = ORIGIN): this {
    const points = this.points.map(p => p.rotate(a, center));
    return new (<any> this.constructor)(...points);
  }

  reflect(line: Line): this {
    const points = this.points.map(p => p.reflect(line));
    return new (<any> this.constructor)(...points);
  }

  scale(sx: number, sy = sx): this {
    const points = this.points.map(p => p.scale(sx, sy));
    return new (<any> this.constructor)(...points);
  }

  shift(x: number, y = x): this {
    const points = this.points.map(p => p.shift(x, y));
    return new (<any> this.constructor)(...points);
  }

  translate(p: Point) {
    return this.shift(p.x, p.y);
  }

  /**
   * Checks if a point p lies inside this polygon, by using a ray-casting
   * algorithm and calculating the number of intersections.
   */
  contains(p: Point) {
    let inside = false;

    for (const e of this.edges) {
      // Exclude points lying *on* the edge.
      if (e.p1.equals(p) || e.contains(p)) return false;
      if ((e.p1.y > p.y) === (e.p2.y > p.y)) continue;

      const det = (e.p2.x - e.p1.x) / (e.p2.y - e.p1.y);
      if (p.x < det * (p.y - e.p1.y) + e.p1.x) inside = !inside;
    }

    return inside;
  }

  equals(_other: Polygon) {
    // TODO Implement
    return false;
  }

  project(p: Point) {
    let q: Point|undefined = undefined;
    let d = Infinity;

    for (const e of this.edges) {
      const q1 = e.project(p);
      const d1 = Point.distance(p, q1);
      if (d1 < d) {
        q = q1;
        d = d1;
      }
    }

    return q || this.points[0];
  }

  at(t: number) {
    return Point.interpolateList([...this.points, this.points[0]], t);
  }

  /** The oriented version of this polygon (vertices in clockwise order). */
  get oriented(): this {
    if (this.signedArea >= 0) return this;
    const points = [...this.points].reverse();
    return new (<any> this.constructor)(...points);
  }

  /**
   * The intersection of this and another polygon, calculated using the
   * Weiler–Atherton clipping algorithm
   */
  intersect(polygon: Polygon) {
    // TODO Support intersections with multiple disjoint overlapping areas.
    // TODO Support segments intersecting at their endpoints
    const points = [toLinkedList<Point>(this.oriented.points),
      toLinkedList<Point>(polygon.oriented.points)];

    const max = this.points.length + polygon.points.length;
    const result: Point[] = [];

    let which = 0;
    let active = points[which].find(p => polygon.contains(p.val))!;
    if (!active) return undefined;  // No intersection

    while (active.val !== result[0] && result.length < max) {
      result.push(active.val);

      const nextEdge = new Segment(active.val, active.next!.val);
      active = active.next!;

      for (const p of points[1 - which]) {
        const testEdge = new Segment(p.val, p.next!.val);
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

  /** Checks if two polygons p1 and p2 collide. */
  static collision(p1: Polygon, p2: Polygon) {
    // Check if any of the edges overlap.
    for (const e1 of p1.edges) {
      for (const e2 of p2.edges) {
        if (Segment.intersect(e1, e2)) return true;
      }
    }

    // Check if one of the vertices is in one of the polygons.
    return p2.contains(p1.points[0]) || p1.contains(p2.points[0]);
  }

  /** Creates a regular polygon. */
  static regular(n: number, radius = 1) {
    const da = 2 * Math.PI / n;
    const a0 = Math.PI / 2 - da / 2;

    const points = tabulate((i) => Point.fromPolar(a0 + da * i, radius), n);
    return new Polygon(...points);
  }

  /** Interpolates the points of two polygons */
  static interpolate(p1: Polygon, p2: Polygon, t = 0.5) {
    // TODO support interpolating polygons with different numbers of points
    const points = p1.points.map(
        (p, i) => Point.interpolate(p, p2.points[i], t));
    return new Polygon(...points);
  }
}

/** A polyline defined by its vertex points. */
export class Polyline extends Polygon {
  readonly type = 'polyline';

  /** @returns {Segment[]} */
  get edges() {
    const edges = [];
    for (let i = 0; i < this.points.length - 1; ++i) {
      edges.push(new Segment(this.points[i], this.points[i + 1]));
    }
    return edges;
  }

  // TODO Other methods and properties
}


/** A triangle defined by its three vertices. */
export class Triangle extends Polygon {
  readonly type = 'triangle';

  get circumcircle() {
    const [a, b, c] = this.points;

    const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));

    const ux = (a.x ** 2 + a.y ** 2) * (b.y - c.y) +
               (b.x ** 2 + b.y ** 2) * (c.y - a.y) +
               (c.x ** 2 + c.y ** 2) * (a.y - b.y);

    const uy = (a.x ** 2 + a.y ** 2) * (c.x - b.x) +
               (b.x ** 2 + b.y ** 2) * (a.x - c.x) +
               (c.x ** 2 + c.y ** 2) * (b.x - a.x);

    const center = new Point(ux / d, uy / d);
    const radius = Point.distance(center, this.points[0]);

    return new Circle(center, radius);
  }

  get incircle() {
    const edges = this.edges;
    const sides = edges.map(e => e.length);
    const total = sides[0] + sides[1] + sides[2];
    const [a, b, c] = this.points;

    const ux = sides[1] * a.x + sides[2] * b.x + sides[0] * c.x;
    const uy = sides[1] * a.y + sides[2] * b.y + sides[0] * c.y;

    const center = new Point(ux / total, uy / total);
    const radius = center.distanceFromLine(edges[0]);

    return new Circle(center, radius);
  }

  get orthocenter() {
    const [a, b, c] = this.points;
    const h1 = new Line(a, b).perpendicular(c);
    const h2 = new Line(a, c).perpendicular(b);
    return intersections(h1, h2)[0];
  }
}


// -----------------------------------------------------------------------------
// Rectangles and Squares

/** A rectangle, defined by its top left vertex, width and height. */
export class Rectangle {
  readonly type = 'rectangle';

  constructor(readonly p: Point, readonly w = 1, readonly h = w) {}

  static aroundPoints(...points: Point[]) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    const x = Math.min(...xs);
    const w = Math.max(...xs) - x;
    const y = Math.min(...ys);
    const h = Math.max(...ys) - y;
    return new Rectangle(new Point(x, y), w, h);
  }

  get center() {
    return new Point(this.p.x + this.w / 2, this.p.y + this.h / 2);
  }

  get centroid() {
    return this.center;
  }

  get circumference() {
    return 2 * Math.abs(this.w) + 2 * Math.abs(this.h);
  }

  get area() {
    return Math.abs(this.w * this.h);
  }

  /** @returns {Segment[]} */
  get edges() {
    return this.polygon.edges;
  }

  /** @returns {Point[]} */
  get points() {
    return this.polygon.points;
  }

  /**
   * A polygon class representing this rectangle.
   * @returns {Polygon}
   */
  get polygon() {
    const b = new Point(this.p.x + this.w, this.p.y);
    const c = new Point(this.p.x + this.w, this.p.y + this.h);
    const d = new Point(this.p.x, this.p.y + this.h);
    return new Polygon(this.p, b, c, d);
  }

  transform(m: TransformMatrix) {
    return this.polygon.transform(m);
  }

  rotate(a: number, c = ORIGIN) {
    return this.polygon.rotate(a, c);
  }

  reflect(l: Line) {
    return this.polygon.reflect(l);
  }

  scale(sx: number, sy = sx) {
    return new Rectangle(this.p.scale(sx, sy), this.w * sx, this.h * sy);
  }

  shift(x: number, y = x) {
    return new Rectangle(this.p.shift(x, y), this.w, this.h);
  }

  translate(p: Point) {
    return this.shift(p.x, p.y);
  }

  contains(p: Point) {
    return isBetween(p.x, this.p.x, this.p.x + this.w) &&
           isBetween(p.y, this.p.y, this.p.y + this.h);
  }

  equals(_other: Polygon) {
    // TODO Implement
    return false;
  }

  project(p: SimplePoint): Point {
    // TODO Use the generic intersections() function
    // bottom right corner of rect
    const rect1 = {x: this.p.x + this.w, y: this.p.y + this.h};
    const center = {x: this.p.x + this.w / 2, y: this.p.y + this.h / 2};
    const m = (center.y - p.y) / (center.x - p.x);

    if (p.x <= center.x) {  // check left side
      const y = m * (this.p.x - p.x) + p.y;
      if (this.p.y < y && y < rect1.y) return new Point(this.p.x, y);
    }

    if (p.x >= center.x) {  // check right side
      const y = m * (rect1.x - p.x) + p.y;
      if (this.p.y < y && y < rect1.y) return new Point(rect1.x, y);
    }

    if (p.y <= center.y) {  // check top side
      const x = (this.p.y - p.y) / m + p.x;
      if (this.p.x < x && x < rect1.x) return new Point(x, this.p.y);
    }

    if (p.y >= center.y) {  // check bottom side
      const x = (rect1.y - p.y) / m + p.x;
      if (this.p.x < x && x < rect1.x) return new Point(x, rect1.y);
    }

    return this.p;
  }

  at(_t: number) {
    // TODO Implement
  }
}


// -----------------------------------------------------------------------------
// Type Checking

type Shape = (Line|Ray|Segment|Circle|Polygon|Polyline|Triangle|Rectangle|Arc|Sector|Angle);

export function isPolygonLike(shape: Point|Shape): shape is Polygon|Rectangle {
  return isOneOf(shape.type, 'polygon', 'polyline', 'rectangle');
}

export function isLineLike(shape: Point|Shape): shape is Line {
  return isOneOf(shape.type, 'line', 'ray', 'segment');
}

export function isCircle(shape: Point|Shape): shape is Circle {
  return shape.type === 'circle';
}

export function isArc(shape: Point|Shape): shape is Arc {
  return shape.type === 'arc';
}

export function isSector(shape: Point|Shape): shape is Sector {
  return shape.type === 'sector';
}

export function isAngle(shape: Point|Shape): shape is Angle {
  return shape.type === 'angle';
}

export function isPoint(shape: Point|Shape): shape is Point {
  return shape.type === 'point';
}


// -----------------------------------------------------------------------------
// Intersections

function liesOnSegment(s: Segment, p: Point) {
  if (nearlyEquals(s.p1.x, s.p2.x)) return isBetween(p.y, s.p1.y, s.p2.y);
  return isBetween(p.x, s.p1.x, s.p2.x);
}

function liesOnRay(r: Ray, p: Point) {
  if (nearlyEquals(r.p1.x, r.p2.x)) {
    return (p.y - r.p1.y) / (r.p2.y - r.p1.y) > 0;
  }
  return (p.x - r.p1.x) / (r.p2.x - r.p1.x) > 0;
}

function lineLineIntersection(l1: Line, l2: Line) {
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
  return [new Point(x / d, y / d)];
}

function circleCircleIntersection(c1: Circle, c2: Circle) {
  const d = Point.distance(c1.c, c2.c);

  // Circles are separate:
  if (d > c1.r + c2.r) return [];

  // One circles contains the other:
  if (d < Math.abs(c1.r - c2.r)) return [];

  // Circles are the same:
  if (nearlyEquals(d, 0) && nearlyEquals(c1.r, c2.r)) return [];

  // Circles touch:
  if (nearlyEquals(d, c1.r + c2.r)) return [new Line(c1.c, c2.c).midpoint];

  const a = (square(c1.r) - square(c2.r) + square(d)) / (2 * d);
  const b = Math.sqrt(square(c1.r) - square(a));

  const px = (c2.c.x - c1.c.x) * a / d + (c2.c.y - c1.c.y) * b / d + c1.c.x;
  const py = (c2.c.y - c1.c.y) * a / d - (c2.c.x - c1.c.x) * b / d + c1.c.y;
  const qx = (c2.c.x - c1.c.x) * a / d - (c2.c.y - c1.c.y) * b / d + c1.c.x;
  const qy = (c2.c.y - c1.c.y) * a / d + (c2.c.x - c1.c.x) * b / d + c1.c.y;

  return [new Point(px, py), new Point(qx, qy)];
}

// From http://mathworld.wolfram.com/Circle-LineIntersection.html
function lineCircleIntersection(l: Line, c: Circle) {
  const dx = l.p2.x - l.p1.x;
  const dy = l.p2.y - l.p1.y;
  const dr2 = square(dx) + square(dy);

  const cx = c.c.x;
  const cy = c.c.y;
  const D = (l.p1.x - cx) * (l.p2.y - cy) - (l.p2.x - cx) * (l.p1.y - cy);

  const disc = square(c.r) * dr2 - square(D);
  if (disc < 0) return [];  // No solution

  const xa = D * dy / dr2;
  const ya = -D * dx / dr2;
  if (nearlyEquals(disc, 0)) return [c.c.shift(xa, ya)];  // One solution

  const xb = dx * (dy < 0 ? -1 : 1) * Math.sqrt(disc) / dr2;
  const yb = Math.abs(dy) * Math.sqrt(disc) / dr2;
  return [c.c.shift(xa + xb, ya + yb), c.c.shift(xa - xb, ya - yb)];
}

/** Returns the intersection of two or more geometry objects. */
export function intersections(...elements: Shape[]): Point[] {
  if (elements.length < 2) return [];
  if (elements.length > 2) {
    return flatten(subsets(elements, 2).map(e => intersections(...e)));
  }

  let [a, b] = elements;

  if (isPolygonLike(b)) [a, b] = [b, a];

  if (isPolygonLike(a)) {
    // This hack is necessary to capture intersections between a line and a
    // vertex of a polygon. There are more edge cases to consider!
    const results = isLineLike(b) ?
                    a.points.filter(p => (b as Line).contains(p)) : [];

    for (const e of a.edges) results.push(...intersections(e, b));
    return results;
  }

  // TODO Handle arcs, sectors and angles!
  return simpleIntersection(a as (Line|Circle), b as (Line|Circle));
}

/** Finds the intersection of two lines or circles. */
function simpleIntersection(a: Line|Circle, b: Line|Circle): Point[] {
  let results: Point[] = [];

  // TODO Handle Arcs and Rays
  if (isLineLike(a) && isLineLike(b)) {
    results = lineLineIntersection(a, b);
  } else if (isLineLike(a) && isCircle(b)) {
    results = lineCircleIntersection(a, b);
  } else if (isCircle(a) && isLineLike(b)) {
    results = lineCircleIntersection(b, a);
  } else if (isCircle(a) && isCircle(b)) {
    results = circleCircleIntersection(a, b);
  }

  for (const x of [a, b]) {
    if (x.type === 'segment') {
      results = results.filter(i => liesOnSegment(x as Segment, i));
    }
    if (x.type === 'ray') results = results.filter(i => liesOnRay(x as Ray, i));
  }

  return results;
}
