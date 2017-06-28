// =============================================================================
// Fermat.js | Geometry
// (c) Mathigon
// =============================================================================



import { tabulate, total, list, isBetween, square, cube } from '@mathigon/core';
import { nearlyEquals } from './arithmetic';
import { permutations } from './combinatorics';
import { Vector } from './vector';


// -----------------------------------------------------------------------------
// Points

export class Point {

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

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  get center() { return this; }

  get distance() {
    return Math.sqrt(square(this.x) + square(this.y));
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }

  get polar() {
    let th = Math.atan2(this.y, this.x);
    if (th < 0) th += 2 * Math.PI;
    return { r: this.distance, th };
  }

  static fromPolar(polar) {
    let x = polar.r * Math.cos(polar.th);
    let y = polar.r * Math.sin(polar.th);
    return new Point(x, y);
  }

  project(l = xAxis) {
    let k = Point.dot(Point.difference(this, l.p1), l.normalVector);
    return Point.add(l.p1, k);  // TODO check this!
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

  shift(x = 0, y = 0) {
    return new Point(this.x + x, this.y + y);
  }

  distanceFromLine(l) {
    return Point.distance(this, this.project(l));  // TODO check this!
  }
}

const origin = new Point(0,0);
const identity = [[1, 0], [0, 1]];


// -----------------------------------------------------------------------------
// Straight Lines

export class Line {

  static isParallel(l1, l2) {
    let x1 = l1.p2.x - l1.p1.x;
    let y1 = l1.p2.y - l1.p1.y;
    let x2 = l2.p2.x - l2.p1.x;
    let y2 = l2.p2.y - l2.p1.y;

    return (x1 == 0 && x2 == 0) || (y1 == 0 && y2 == 0) ||
      nearlyEquals(y1 / x1, y2 / x2);
  }

  static isPerpendicular(_l1, _l2) {
    // TODO
  }

  static angleBetween(_l1, _l2) {
    // TODO
  }

  // Calculates the angle bisector of the angle a, b, c.
  static angleBisector(a, b, c) {
    let phiA =  Math.atan2(a.y - b.y, a.x - b.x);
    let phiC =  Math.atan2(c.y - b.y, c.x - b.x);
    let phi = (phiA + phiC) / 2;

    if (phiA > phiC) phi += Math.PI;

    let x = Math.cos(phi) + b.x;
    let y = Math.sin(phi) + b.y;

    return new Line(b, new Point(x, y));
  }

  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  get length() {
    return Point.distance(this.p1, this.p2);
  }

  get center() {
    return Point.average(this.p1, this.p2);
  }

  get normalVector() {
    let l = this.length;
    let x = (this.p2.x - this.p1.x) / l;
    let y = (this.p2.y - this.p1.y) / l;
    return new Point(x, y);
  }

  contains(p) {
    let grad1 = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
    let grad2 = (p.y - this.p1.y) / (p - this.p1.x);
    return nearlyEquals(grad1, grad2);
  }

  at(t = 0) {
    let x = t * this.p1.x + (1-t) * this.p2.x;
    let y = t * this.p1.y + (1-t) * this.p2.y;
    return new Point(x, y);
  }

  perpendicular(p = origin) {
    // Special case: point is the first point of the line.
    if (same(p, this.p1)) {
      let dx = this.p2.y - this.p1.y;
      let dy = this.p1.x - this.p2.x;
      return new Line(p, p.shift(dx, dy));
    }

    // Special case: point is the second point of the line.
    if (same(p, this.p2)) {
      let dx = this.p1.y - this.p2.y;
      let dy = this.p2.x - this.p1.x;
      return new Line(p, p.shift(dx, dy));
    }

    // Special case: point lies somewhere else on the line.
    if (this.contains(p)) {
      let dx = this.p1.y - p.y;
      let dy = p.x - this.p1.x;
      return new Line(p, p.shift(dx, dy));
    }

    // General case: point does not lie on the line.
    let q = p.project(this);
    return new Line(p, p.shift(q.x, q.y));
  }

  // TODO toString, transform, rotate, reflect, scale, shift
}

const xAxis = new Line(origin, new Point(1, 0));
const yAxis = new Line(origin, new Point(0, 1));


// -----------------------------------------------------------------------------
// Beziers

export class Bezier {

  constructor(p1, p2, q1 = p1, q2 = p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.q1 = q1;
    this.q2 = q2;
  }

  get length() {
    // TODO
  }

  get center() {
    // TODO
  }

  contains(_p) {
  }

  at(t = 0) {
    let x = cube(1 - t) * this.p1.x + 3 * t * (1 - t) * (1 - t) * this.q1.x +
      3 * t * t * (1 - t) * this.q2.x + cube(t) * this.p2.x;
    let y = cube(1 - t) * this.p1.y + 3 * t * (1 - t) * (1 - t) * this.q1.y +
      3 * t * t * (1 - t) * this.q2.y + cube(t) * this.p2.y;
    return new Point(x, y);
  }

  // TODO toString, transform, rotate, reflect, scale, shift
}


// -------------------------------------------------------------------------
// Ellipses and Circles

export class Ellipse {
  // TODO
}

export class Circle extends Ellipse {

  constructor(c = origin, r = 1) {
    super();  // TODO
    this.c = c;
    this.r = r;
  }

  get center() {
    return this.c;
  }

  get circumference() {
    return 2 * Math.PI * this.r;
  }

  get area() {
    return Math.PI * square(this.r);
  }

  contains(_p) {
    // TODO
  }

  at(_t = 0) {
    // TODO
  }

  // TODO toString, transform, rotate, reflect, scale, shift
}


// -------------------------------------------------------------------------
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

  // TODO toString, transform, rotate, reflect, scale, shift
}

export class Square extends Rectangle {

  constructor(x = 0, y = 0, w = 1) {
    super(x, y, w, w);
  }

}


// -------------------------------------------------------------------------
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

    return Math.abs(A/2);
  }

  get center() {
    // TODO
  }

  get centroid() {
    // TODO
  }

  contains(_p) {
    // TODO
  }

  at(_t = 0) {
    // TODO
  }

  get convexHull() {
    // TODO
  }

  // TODO toString, transform, rotate, reflect, scale, shift
}

export class Triangle extends Polygon {
  constructor(...points) {
    if (points.length !== 3) {
      throw new Error('Triangles need exactly 3 vertices.');
    }
    super(points);
  }

  get circumcircle() {
    // TODO
  }

  get incircle() {
    // TODO
  }
}


// -------------------------------------------------------------------------
// Angles

export function angle(a, b, c) {
  let phiA = Math.atan2(a.y - b.y, a.x - b.x);
  let phiC = Math.atan2(c.y - b.y, c.x - b.x);
  let phi = phiC - phiA;

  if (phi < 0) phi += 2 * Math.PI;
  return phi;
}


// -------------------------------------------------------------------------
// Equality Checking

function samePoint(p1, p2) {
  return nearlyEquals(p1.x, p2.x) && nearlyEquals(p1.y, p2.y);
}

function sameLine(l1, l2, oriented=false) {
  return (samePoint(l1.p1, l2.p1) && samePoint(l1.p2, l2.p2)) ||
    (!oriented && samePoint(l1.p1, l2.p2) && samePoint(l1.p2, l2.p1));
}

function sameRect(_r1, _r2, _oriented=false) {
  // TODO
}

function sameEllipse(_c1, _c2) {
  // TODO
}

function samePolygon(_p1, _p2, _oriented=false) {
  // TODO
}

export function same(a, b, oriented=false) {
  // TODO Handle Circle (Ellipse) and Rectangle + Square + Triangle (Polygon).
  let type = a.constructor.name;
  if (type !== b.constructor.name) return false;

  switch (type) {
    case 'Point': return samePoint(a, b, oriented);
    case 'Line': return sameLine(a, b, oriented);
    case 'Rect': return sameRect(a, b, oriented);
    case 'Ellipse': return sameEllipse(a, b, oriented);
    case 'Polygon': return samePolygon(a, b, oriented);
  }
  return false;
}


// -------------------------------------------------------------------------
// Intersections and Overlaps

function pointPointIntersect(p1, p2) {
  return same(p1, p2) ? [new Point(p1.x, p1.y)] : [];
}

export function lineLineIntersect(l1, l2) {
  let s = samePoint(l1.p1, l2.p1) + samePoint(l1.p1, l2.p2) +
    samePoint(l1.p2, l2.p1) + samePoint(l1.p2, l2.p2);

  if (s === 2) return l1.p1;  // same lines intersect
  if (s === 1) return;        // connected lines don't intersect

  let d1 = [l1.p2.x - l1.p1.x, l1.p2.y - l1.p1.y];
  let d2 = [l2.p2.x - l2.p1.x, l2.p2.y - l2.p1.y];

  let denominator = Vector.cross2D(d2, d1);
  if (nearlyEquals(denominator, 0)) return;  // -> colinear

  let d  = [l2.p1.x - l1.p1.x, l2.p1.y - l1.p1.y];
  let x = Vector.cross2D(d1, d) / denominator;
  let y = Vector.cross2D(d2, d) / denominator;

  if (isBetween(x, 0, 1) && isBetween(y, 0, 1)) {
    let intersectionX = l1.p1.x + x * d[0];
    let intersectionY = l1.p1.y + y * d[1];
    return new Point(intersectionX, intersectionY);
  }
}

export function intersect(x, ...rest) {
  // TODO Handle Circle (Ellipse) and Rectangle + Square + Triangle (Polygon).
  if (rest.length > 1) return intersect(x, intersect(...rest));
  let y = rest[0];

  let typeX = x.constructor.name;
  let typeY = y.constructor.name;

  switch (typeX + '-' + typeY) {
    case 'Point-Point': return pointPointIntersect(x, y);
    case 'Line-Line':   return lineLineIntersect(x, y);
  }

  throw new Error(`Can't intersect ${typeX}s and ${typeY}s.`);
}


// -------------------------------------------------------------------------
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


// -------------------------------------------------------------------------
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


// -------------------------------------------------------------------------
// Graph Colouring

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
