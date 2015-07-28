// =============================================================================
// Fermat.js | Geometry
// *** EXPERIMENTAL ***
// (c) 2015 Mathigon
// =============================================================================



import { square, cube, between, almost } from 'utilities'
import 'vector' as Vector
import { list, permutations } from 'combinatorics'

function square(x) { return x * x; }
function cube(x) { return x * x * x; }
function between(x, a, b) { return x >= a && x <= b; }
function almost(a, b) { return Math.abs(a, b) < 0.000001; }
function total(a) { var t = 0; for (x of a) t += a; return a; }


// -----------------------------------------------------------------------------
// Points

const origin = new Point(0,0);
const identity = [[1, 0], [0, 1]];

class Point {

    static average(...points) {
        var x = total(points.map(p => p.x)) / points.length;
        var y = total(points.map(p => p.y)) / points.length;
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

    static manhatten(p1, p2) {
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    }

    static distanceFromLine(p, l) {
        return Point.distance(p, p.project(l));  // TODO wrong?
    }

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y
    }

    get center() { return this; }

    toString() {
        return '(' + this.x + ', ' + this.y + ')'
    }

    project(l = xAxis) {
        let k = Point.dot(Point.difference(this, l.p1), l.normalVector);
        return Point.add(l.p1, k);  // TODO wrong?
    }

    transform(m = identity) {
        let x = m[0][0] * this.x + m[0][1] * this.y;
        let y = m[1][0] * this.x + m[1][1] * this.y;
        return new Point(x, y);
    }

    rotate(phi = 0, p = origin) {
        var x0 = this.x - p.x;
        var y0 = this.y - p.y;

        var cos = Math.cos(phi);
        var sin = Math.sin(phi);

        var x = x0 * cos - y0 * sin + p.x;
        var y = x0 * sin + y0 * cos + p.y;
        return new Point(x, y);
    }

    reflect(l = yAxis) {
        var v = l.p2.x - l.p1.x;
        var w = l.p2.y - l.p1.y;

        var x0 = this.x - l.p1.x;
        var y0 = this.y - l.p1.y;

        var mu = (v * y0 - w * x0) / (v * v + w * w);

        var x = this.x + 2 * mu * w;
        var y = this.y - 2 * mu * v;
        return new Point(x, y);
    }

    scale(sx = 1, sy = sx) {
        return new Point(this.x * sx, this.y * sy);
    }

    shift(x = 0, y = 0) {
        return new Point(this.x + x, this.y + y);
    }
}


// -----------------------------------------------------------------------------
// Lines and Beziers

const xAxis = new Line(origin, new Point(1, 0));
const yAxis = new Line(origin, new Point(0, 1));

class Line {

    static isParallel(l1, l2) {
        var x1 = l1.p2.x - l1.p1.x;
        var y1 = l1.p2.y - l1.p1.y;
        var x2 = l2.p2.x - l2.p1.x;
        var y2 = l2.p2.y - l2.p1.y;

        return (x1 === 0 && x2 === 0) || (y1 === 0 && y2 === 0) || almost(y1/x1, y2/x2);
    }

    static isPerpendicular(l1, l2) {
        // TODO
    }

    static angleBetween(l1, l2) {
        // TODO
    }

    // Calculates the angle bisector of the angle a, b, c.
    static angleBisector(a, b, c) {
        var phiA =  Math.atan2(a.y - b.y, a.x - b.x);
        var phiC =  Math.atan2(c.y - b.y, c.x - b.x);
        var phi = (phiA + phiC) / 2;

        if (phiA > phiC) phi += Math.PI;

        var x = Math.cos(phi) + b.x;
        var y = Math.sin(phi) + b.y;

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
        var l = this.length;
        var x = (this.p2.x - this.p1.x) / l;
        var y = (this.p2.y - this.p1.y) / l;
        return new Point(x, y);
    }

    contains(p) {
        var grad1 = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
        var grad2 = (p.y - this.p1.y) / (p - this.p1.x);
        return almost(grad1, grad2);
    }

    at(t = 0) {
        var x = t * this.p1.x + (1-t) * this.p2.x;
        var y = t * this.p1.y + (1-t) * this.p2.y;
        return new Point(x, y);
    }

    perpendicular(p = origin) {
        var dx, dy;

        // Special case: point is the first point of the line
        if (same(p, this.p1)) {
            dx = this.p2.y - this.p1.y;
            dy = this.p1.x - this.p2.x;

        // Special case: point is the second point of the line
        } else if (same(p, this.p2)) {
            dx = this.p1.y - this.p2.y;
            dy = this.p2.x - this.p1.x;

        // special case: point lies somewhere else on the line
        } else if (this.contains(p)) {
            dx = this.p1.y - p.y;
            dy = p.x - this.p1.x;

        // general case: point does not lie on the line
        } else {
            var b = p.project(l);
            dx = b.x;
            dy = b.y;
        }

        return new Line(p, p.shift(dx, dy));
    }

    // TODO toString, transform, rotate, reflect, scale, shift
}

class Bezier {

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

    function contains(p) {
    }

    function at(t = 0) {
        var x = cube(1-t)*this.p1.x + 3*t*(1-t)*(1-t)*this.q1.x + 3*t*t*(1-t)*this.q2.x + cube(t)*this.p2.x;
        var y = cube(1-t)*this.p1.y + 3*t*(1-t)*(1-t)*this.q1.y + 3*t*t*(1-t)*this.q2.y + cube(t)*this.p2.y;
        return new Point(x, y);
    }

    // TODO toString, transform, rotate, reflect, scale, shift
}


// -------------------------------------------------------------------------
// Ellipses and Circles

class Ellipse extends Base {
    // TODO
}

class Circle extends Ellipse {
    constructor function(c = new Point(0,0), r = 1) {
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

    function contains(p) {
        // TODO
    }

    function at(t = 0) {
        // TODO
    }

    // TODO toString, transform, rotate, reflect, scale, shift
}


// -------------------------------------------------------------------------
// Rectangles and Squares

class Rect extends Base {
    constructor(x = 0, y = 0, w = 1, h = 1) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    get center() {
        // TODO
    }

    get circumference() {
        return 2 * this.w + 2 * this.h;
    }

    get area() {
        return Math.abs(this.w * this.h);
    }

    get polygon() {
        var a = new Point(this.x, this.y);
        var b = new Point(this.x + this.w, this.y);
        var c = new Point(this.x + this.w, this.y + this.h);
        var d = new Point(this.x, this.y + this.h);
        return new Polygon(a, b, c, d);
    }

    function contains(p) {
    }

    function at(t = 0) {
    }

    // TODO toString, transform, rotate, reflect, scale, shift
}

class Square extends Rect {
    // TODO
}


// -------------------------------------------------------------------------
// Polygons and Triangles

class Polygon {
    constructor(...points) {
        this.points = points;
    }

    get circumference() {
        let C = 0;
        this.points.each(function() { C += distance(p[i - 1], p[i]); });
        C += distance(p[n-1], p[0]);
        return C;
    }

    get area() {
        var p = this.points;
        var n = p.length;
        var A = p[0].x * p[n - 1].y - p[n - 1].x * p[0].y;

        for (var i = 1; i < n; ++i)
            A += p[i - 1].x * p[i].y - p[i].x * p[i - 1].y;

        return Math.abs(A/2);
    }

    get center() {
        // TODO
    }

    get centroid() {
        // TODO
    }

    contains(p) {
        // TODO
    }

    at(t = 0) {
        // TODO
    }

    // TODO toString, transform, rotate, reflect, scale, shift
}

class Triangle extends Polygon {
    constructor(...points) {
        if (points.length !== 3) throw new Error('Triangles need exactly 3 vertices.');
        this.points = points;
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

function angle(a, b, c) {
    var phiA = Math.atan2(a.y - b.y, a.x - b.x);
    var phiC = Math.atan2(c.y - b.y, c.x - b.x);
    var phi = phiC - phiA;

    if (phi < 0) phi += 2 * Math.PI;
    return phi;
}


// -------------------------------------------------------------------------
// Equality Checking

let isSame = {
    point: function(p1, p2) {
        return almost(p1.x, p2.x) && almost(p1.y, p2.y);
    },

    line: function(l1, l2, unoriented) {
        return (same.point(l1.p1, l2.p1) && same.point(l1.p2, l2.p2)) ||
               (unoriented && same.point(l1.p1, l2.p2) && same.point(l1.p2, l2.p1));
    },

    rect: function(r1, r2, unoriented) {
        // TODO
    },

    circle: function(c1, c2, unoriented) {
        // TODO
    },

    polygon: function(p1, p2, unoriented) {
        // TODO
    }
};

function same(a, b, unOriented) {
    var type = getGeoType(a);
    if (type !== getGeoType(b)) return false;
    var sameFn = isSame[type];
    if (sameFn) return sameFn(a, b, unOriented);
}


// -------------------------------------------------------------------------
// Intersections and Overlaps

function pointPointIntersect(p1, p2) {
    return same(p1, p2) ? [new Point(p1.x, p2.x)] : [];
}

function pointLineIntersect(p, l) {
    // TODO check that p lies on l
}

function pointRectIntersect(p, r) {
    // TODO
}

function pointCircleIntersect(p, c) {
    // TODO
}

function pointPolygonIntersect(p1, p2) {
    // TODO
}

function lineLineIntersect(l1, l2) {

    var s = same.point(l1.p1, l2.p1) + same.point(l1.p1, l2.p2) +
            same.point(l1.p2, l2.p1) + same.point(l1.p2, l2.p2);

    if (s === 2) return l1.p1;  // same lines intersect
    if (s === 1) return;        // connected lines don't intersect

    var d1 = [l1.p2.x - l1.p1.x, l1.p2.y - l1.p1.y];
    var d2 = [l2.p2.x - l2.p1.x, l2.p2.y - l2.p1.y];
    var d  = [l2.p1.x - l1.p1.x, l2.p1.y - l1.p1.y];

    var denominator = Vector.cross2D(d2, d1);
    if (denominator === 0) return;  // -> colinear

    var n1 = M.vector.cross2D(d1, d);
    var n2 = M.vector.cross2D(d2, d);

    var x = n2 / denominator;
    var y = n1 / denominator;

    if (between(x,0,1) && between(y,0,1)) {
        var intersectionX = l1.p1.x + x * (l1.p2.x - l1.p1.x);
        var intersectionY = l1.p1.y + y * (l1.p2.y - l1.p1.y);
        return new Point(intersectionX, intersectionY);
    }
}

function lineCircleIntersect(l, c) {
    // TODO
}

function linePolygonIntersect(l, c) {
    // TODO
}

function rectRectIntersect() {
    // TODO
}

function polygonPolygonIntersect() {
    // TODO
}

function intersect(x, y) {

    if (arguments.length > 2) {
        var rest = _arraySlice.call(arguments, 1);
        return intersect(x, intersect.apply(null, rest));
    }

    // Handle Rectangles
    if (x instanceof Rect && y instanceof Rect) return rectRectIntersect(x, y);
    if (x instanceof Rect) x = x.toPolygon();
    if (y instanceof Rect) y = y.toPolygon();

    switch (getGeoType(x) + '-' + getGeoType(y)) {
        case 'line-line':       return lineIntersect(x, y);
        case 'line-circle':     return lineCircleIntersect(x, y);
        case 'line-polygon':    return linePolygonIntersect(x, y);
        case 'circle-line':     return lineCircleIntersect(y, x);
        case 'polygon-line':    return linePolygonIntersect(y, x);
        case 'polygon-polygon': return polygonPolygonIntersect(x, y);
    }

    throw new Error('Can\'t intersect ' + getGeoType(x) + 's and ' + getGeoType(y) + '.');
}


// -------------------------------------------------------------------------
// Computational Geometry

function convexHull() {
    // TODO
}

function travellingSalesman(dist) {
    var n = dist.length;
    var cities = M.list(n);

    var minLength = Infinity;
    var minPath = null;

    M.permutations(cities).each(function(path) {
        var length = 0;
        for (var i=0; i<n-1; ++i) {
            length += dist[path[i]][path[i+1]];
            if (length > minLength) return;
        }
        if (length < minLength) minLength = length;
        minPath = path;
    });

    return { path: minPath, length: minLength };
}


// -------------------------------------------------------------------------

export default {
    Point, Line, Bezier, Ellipse, Circle, Rect, Square, Polygon,
    angle, same, intersect, convexHull, travellingSalesman
};

