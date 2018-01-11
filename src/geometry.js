// =============================================================================
// Fermat.js | Geometry
// (c) Mathigon
// =============================================================================



import { tabulate, total, list, isBetween, square, clamp } from '@mathigon/core';
import { nearlyEquals } from './arithmetic';
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

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }

  project(l = xAxis) {
    l.project(this);  // TODO Remove this!
  }

  distanceFromLine(l) {
    return Point.distance(this, this.project(l));
  }

  clamp(xMin, xMax, yMin, yMax) {
    return new Point(clamp(this.x, xMin, xMax), clamp(this.y, yMin, yMax));
  }

  transform(m = identity) {
    let x = m[0][0] * this.x + m[0][1] * this.y;
    let y = m[1][0] * this.x + m[1][1] * this.y;
    return new Point(x, y);
  }

  rotate(phi = 0, p = origin) {
    let x0 = this.x - p.x;
    let y0 = this.y - p.y;

    let cos = Math.cos(phi);
    let sin = Math.sin(phi);

    let x = x0 * cos - y0 * sin + p.x;
    let y = x0 * sin + y0 * cos + p.y;
    return new Point(x, y);
  }

  reflect(l = yAxis) {
    let v = l.p2.x - l.p1.x;
    let w = l.p2.y - l.p1.y;

    let x0 = this.x - l.p1.x;
    let y0 = this.y - l.p1.y;

    let mu = (v * y0 - w * x0) / (v * v + w * w);

    let x = this.x + 2 * mu * w;
    let y = this.y - 2 * mu * v;
    return new Point(x, y);
  }

  scale(sx = 1, sy = sx) {
    return new Point(this.x * sx, this.y * sy);
  }

  shift(x = 0, y = x) {
    return new Point(this.x + x, this.y + y);
  }

  translate(p) {
    return this.shift(p.x, p.y);
  }

  add(p) { return Point.sum(this, p); }

  subtract(p) { return Point.difference(this, p); }

  equals(p) { return Point.equals(this, p); }

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
    return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
  }

  static equals(p1, p2) {
    return nearlyEquals(p1.x, p2.x) && nearlyEquals(p1.y, p2.y);
  }
}

const origin = new Point(0,0);
const identity = [[1, 0], [0, 1]];


// -----------------------------------------------------------------------------
// Angles

export class Angle {

  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
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


// -----------------------------------------------------------------------------
// Straight Lines

export class Line {

  constructor(p1, p2, decoration=null) {
    this.p1 = p1;
    this.p2 = p2;
    this.decoration = decoration;
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
    return Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x) * 180 / Math.PI;
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

  contains(p) {
    let grad1 = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
    let grad2 = (p.y - this.p1.y) / (p.x - this.p1.x);
    return nearlyEquals(grad1, grad2);
  }

  at(t = 0) {
    let x = t * this.p1.x + (1-t) * this.p2.x;
    let y = t * this.p1.y + (1-t) * this.p2.y;
    return new Point(x, y);
  }

  parallel(p) {
    const q = Point.sum(p, Point.difference(this.p2, this.p1));
    return new Line(p, q);
  }

  perpendicular(p) {
    return new Line(p, Point.sum(p, this.perpendicularVector));
  }

  toString() {
    return `line((${this.p1.x}, ${this.p1.y}), (${this.p2.x}, ${this.p2.y}))`;
  }

  project(p) {
    const a = Point.difference(this.p2, this.p1);
    const b = Point.difference(p, this.p1);
    const proj = a.scale(Point.dot(a, b) / square(this.length));
    return Point.sum(this.p1, proj);
  }

  // TODO transform, rotate, reflect, scale, shift

  static equals(l1, l2) {
    return l1.contains(l2.p1) && l1.contains(l2.p2);
  }

  static intersect(_l1, _l2) {
    // TODO
  }
}

export class Ray extends Line {
  static intersect(_l1, _l2) {
    // TODO
  }
}

export class Segment extends Line {

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
    // Equal or touching lines don't intersect
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

    if (isBetween(q1, 0, 1) && isBetween(q2, 0, 1)) {
      let intersectionX = l1.p1.x + q1 * d[0];
      let intersectionY = l1.p1.y + q2 * d[1];
      return new Point(intersectionX, intersectionY);
    }
  }
}

const xAxis = new Line(origin, new Point(1, 0));
const yAxis = new Line(origin, new Point(0, 1));


// -----------------------------------------------------------------------------
// Ellipses and Circles

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
    let a = this.c.shift(this.r, 0);
    return new Arc(this.c, a, a);
  }

  contains(_p) {
    // TODO
  }

  at(_t = 0) {
    // TODO
  }

  project(p) {
    const proj = Point.difference(p, this.c).normal.scale(this.r);
    return Point.sum(this.c, proj);
  }

  toString() {
    return '';  // TODO
  }

  static equals(c1, c2) {
    return (c1.r === c2.r) && Point.equals(c1.c, c2.c);
  }

  // TODO transform, rotate, reflect, scale, shift
}

export class Ellipse {
  // TODO
}

export class Arc {

  constructor(c, a1, a2) {
    this.c = c;
    this.a1 = a1;
    this.a2 = a2;
  }

  get radius() {
    return this.a1.length;
  }

  project(p) {
    // TODO Update this for arcs
    const proj = Point.difference(p, this.c).normal.scale(this.radius);
    return Point.sum(this.c, proj);
  }

  get angle() {
    return new Angle(Point.sum(this.c, this.a1), this.c, Point.sum(this.c, this.a2));
  }

  get startAngle() {
    return new Angle(this.c.shift(1, 0), this.c, Point.sum(this.c, this.a1));
  }

  get endAngle() {
    return new Angle(this.c.shift(1, 0), this.c, Point.sum(this.c, this.a2));
  }
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

  get convexHull() {
    // TODO
  }

  contains(p) {
    let n = this.points.length;
    let count = false;

    for (let i = 0; i < n; ++i) {
      const q1 = this.points[i];
      const q2 = this.points[(i+1) % n];

      const x = (q2.y > p.y) !== (q1.y > p.y);
      const y = (p.x - q2.x) * (q1.y - q2.y) < (p.y - q2.y) * (q1.x - q2.x);
      if (x && y) count = !count;
    }

    return count;
  }

  at(_t = 0) {
    // TODO
  }

  toString() {
    return '';  // TODO
  }

  shift(x, y=x) {
    const points = this.points.map(p => p.shift(x, y));
    return new Polygon(...points);
  }

  translate(p) {
    return this.shift(p.x, p.y);
  }

  rotate(a, center=origin) {
    const points = this.points.map(p => p.rotate(a, center));
    return new Polygon(...points);
  }

  reflect(line) {
    const points = this.points.map(p => p.reflect(line));
    return new Polygon(...points);
  }

  static equals(_p1, _p2) {
    // TODO
  }

  static collision(p1, p2) {
    // Check if any of the edges overlap.
    for (let e1 of p1.edges) {
      for (let e2 of p2.edges) {
        if (Line.intersect(e1, e2)) return true;
      }
    }

    // TODO Check if one of the vertices is in one of the the polygons.
    // for (let v of p1.points) if (p2.contains(v)) return true;
    // for (let v of p2.points) if (p1.contains(v)) return true;

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

  constructor(x = 0, y = 0, w = 1, h = 1) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  get center() {
    return new Point(this.x + this.w / 2, this.y + this.h / 2);
  }

  get circumference() {
    return 2 * this.w + 2 * this.h;
  }

  get area() {
    return Math.abs(this.w * this.h);
  }

  get polygon() {
    let a = new Point(this.x, this.y);
    let b = new Point(this.x + this.w, this.y);
    let c = new Point(this.x + this.w, this.y + this.h);
    let d = new Point(this.x, this.y + this.h);
    return new Polygon(a, b, c, d);
  }

  contains(_p) {
  }

  at(_t = 0) {
  }

  static equals(_r1, _r2) {
    // TODO
  }

  // TODO toString, transform, rotate, reflect, scale, shift
}

export class Square extends Rectangle {
  constructor(x = 0, y = 0, w = 1) {
    super(x, y, w, w);
  }
}


// -----------------------------------------------------------------------------
// Intersections

function lineLineIntersection(l1, l2) {
  // TODO handle rays and segments
  return Line.intersect(l1, l2);
}

function lineCircleIntersection(l, c) {
  // TODO
  return [];
}

function circleCircleIntersection(c1, c2) {
  const d = Point.distance(c1.c, c2.c);

  if (d > c1.r + c2.r) return [];  // Circles are separate.
  if (d < Math.abs(c1.r - c2.r)) return [];  // One circles contains the other.
  if (d === 0 && c1.r === c2.r) return [];  // Circles are the same.

  if (d === c1.r + c2.r) {
    // TODO
    return [];
  }

  const a = (square(c1.r) - square(c2.r) + square(d)) / (2 * d);
  const b = Math.sqrt(square(c1.r) - square(a));

  const px = (c2.c.x - c1.c.x) * a / d + (c2.c.y - c1.c.y) * b / d + c1.c.x;
  const py = (c2.c.y - c1.c.y) * a / d - (c2.c.x - c1.c.x) * b / d + c1.c.y;
  const qx = (c2.c.x - c1.c.x) * a / d - (c2.c.y - c1.c.y) * b / d + c1.c.x;
  const qy = (c2.c.y - c1.c.y) * a / d + (c2.c.x - c1.c.x) * b / d + c1.c.y;

  return [new Point(px, py), new Point(qx, qy)]
}

export function intersections(...elements) {
  if (elements.length < 2) return [];

  if (elements.length > 2) {
    let pairs = subsets(elements, 2).map(e => intersections(...e));
    return pairs[0].concat(...pairs.slice(1));
  }

  const [a, b] = elements;

  if (a instanceof Polygon) return intersections(b, ...a.edges);
  if (b instanceof Polygon) return intersections(a, ...b.edges);

  if (a instanceof Line && b instanceof Line) {
    return lineLineIntersection(a, b);
  } else if (a instanceof Line && b instanceof Circle) {
    return lineCircleIntersection(a, b);
  } else if (a instanceof Circle && b instanceof Line) {
    return lineCircleIntersection(b, a);
  } else if (a instanceof Circle && b instanceof Circle) {
    return circleCircleIntersection(a, b);
  }

  return [];
}


// -----------------------------------------------------------------------------
// Projections

export function projectPointOnRect(point, rect) {
    let rect1 = { x: rect.x + rect.w, y: rect.y + rect.h };  // bottom right corner of rect
    let center = { x: rect.x + rect.w/2, y: rect.y + rect.h/2 };
    let m = (center.y - point.y) / (center.x - point.x);

    if (point.x <= center.x) {  // check left side
        let y = m * (rect.x - point.x) + point.y;
        if (rect.y < y && y < rect1.y) return { x: rect.x, y };
    }

    if (point.x >= center.x) {  // check right side
        let y = m * (rect1.x - point.x) + point.y;
        if (rect.y < y && y < rect1.y) return { x: rect1.x, y };
    }

    if (point.y <= center.y) {  // check top side
        let x = (rect.y - point.y) / m + point.x;
        if (rect.x < x && x < rect1.x) return { x, y: rect.y };
    }

    if (point.y >= center.y) {  // check bottom side
        let x = (rect1.y - point.y) / m + point.x;
        if (rect.x < x && x < rect1.x) return { x, y: rect1.y };
    }
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
