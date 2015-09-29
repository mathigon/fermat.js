// =============================================================================
// Fermat.js | Geometry
// *** EXPERIMENTAL ***
// (c) 2015 Mathigon
// =============================================================================



import { clamp } from 'utilities';
import { total } from 'arrays';
import { nearlyEquals, square, cube } from 'arithmetic';
import { list, permutations } from 'combinatorics';
import Vector from 'vector';


// -----------------------------------------------------------------------------
// Points

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

const origin = new Point(0,0);
const identity = [[1, 0], [0, 1]];


export default { Point };

/*

// -----------------------------------------------------------------------------
// Lines and Beziers

class Line {

    static isParallel(l1, l2) {
        var x1 = l1.p2.x - l1.p1.x;
        var y1 = l1.p2.y - l1.p1.y;
        var x2 = l2.p2.x - l2.p1.x;
        var y2 = l2.p2.y - l2.p1.y;

        return (x1 === 0 && x2 === 0) || (y1 === 0 && y2 === 0) || nearlyEquals(y1/x1, y2/x2);
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
        return nearlyEquals(grad1, grad2);
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

const xAxis = new Line(origin, new Point(1, 0));
const yAxis = new Line(origin, new Point(0, 1));

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

    contains(p) {
    }

    at(t = 0) {
        var x = cube(1-t)*this.p1.x + 3*t*(1-t)*(1-t)*this.q1.x +
                3*t*t*(1-t)*this.q2.x + cube(t)*this.p2.x;
        var y = cube(1-t)*this.p1.y + 3*t*(1-t)*(1-t)*this.q1.y +
                3*t*t*(1-t)*this.q2.y + cube(t)*this.p2.y;
        return new Point(x, y);
    }

    // TODO toString, transform, rotate, reflect, scale, shift
}


// -------------------------------------------------------------------------
// Ellipses and Circles

class Ellipse {
    // TODO
}

class Circle extends Ellipse {

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

    contains(p) {
        // TODO
    }

    at(t = 0) {
        // TODO
    }

    // TODO toString, transform, rotate, reflect, scale, shift
}


// -------------------------------------------------------------------------
// Rectangles and Squares

class Rectangle {

    constructor(x = 0, y = 0, w = 1, h = 1) {
        super();  // TODO
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

    contains(p) {
    }

    at(t = 0) {
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
        super();  // TODO
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
        return nearlyEquals(p1.x, p2.x) && nearlyEquals(p1.y, p2.y);
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

    if (clamp(x,0,1) && clamp(y,0,1)) {
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
        var rest = _arraySlice.call(arguments, 1); // TODO fix
        return intersect(x, intersect(...rest));
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
    let n = dist.length;
    let cities = M.list(n);

    let minLength = Infinity;
    let minPath = null;

    permutations(cities).each(function(path) {
        let length = 0;
        for (let i=0; i<n-1; ++i) {
            length += dist[path[i]][path[i+1]];
            if (length > minLength) return;
        }
        if (length < minLength) minLength = length;
        minPath = path;
    });

    return { path: minPath, length: minLength };
}


// -------------------------------------------------------------------------
// Graph Colouring

const COLOURS = [1,2,3,4];

function canColour(adjMatrix, colours, index, colour) {
    for (let i=0; i<index; ++i) {
        if (adjMatrix[i][index] && colours[i] === colours[index]) return false;
    }
    return true;
}

function colourMe(adjMatrix, colours, index) {
    for (let c of COLOURS) {
        if (canColour(adjMatrix, colours, index, colour)) {
            colours[index] = colour;
            if (colourMe(adjMayrix, colours, index + 1)) return true;
        }
    }
    return false;
}

function graphColouring(adjMatrix) {
    let colours = tabulate(0, adjMatrix.length);
    let result = colourMe(adjMatrix, colours, 0);
    return result ? colours : undefined;
}


// -------------------------------------------------------------------------

export default {
    Point, Line, Bezier, Ellipse, Circle, Rect, Square, Polygon, Triangle,
    angle, same, intersect, convexHull, travellingSalesman, graphColouring };



/*

// Calculates the center of the circumcircle of the three given points.
// @param {JXG.Point} point1 Point
// @param {JXG.Point} point2 Point
// @param {JXG.Point} point3 Point
// @param {JXG.Board} [board=point1.board] Reference to the board
function circumcenter(point1, point2, point3, ) {
    var u, v, m1, m2,
        A = point1.coords.usrCoords,
        B = point2.coords.usrCoords,
        C = point3.coords.usrCoords;

    u = [B[0] - A[0], -B[2] + A[2], B[1] - A[1]];
    v = [(A[0] + B[0])  * 0.5, (A[1] + B[1]) * 0.5, (A[2] + B[2]) * 0.5];
    m1 = Mat.crossProduct(u, v);

    u = [C[0] - B[0], -C[2] + B[2], C[1] - B[1]];
    v = [(B[0] + C[0]) * 0.5, (B[1] + C[1]) * 0.5, (B[2] + C[2]) * 0.5];
    m2 = Mat.crossProduct(u, v);

    return Mat.crossProduct(m1, m2);
}

// Sort vertices counter clockwise starting with the point with the lowest y coordinate.
// @param {Array} p An array containing {@link JXG.Point}, {@link JXG.Coords}, and/or arrays.
function sortVertices(p) {
    var i, ll,
        ps = Expect.each(p, Expect.coordsArray),
        N = ps.length;

    // find the point with the lowest y value
    for (i = 1; i < N; i++) {
        if ((ps[i][2] < ps[0][2]) ||
                // if the current and the lowest point have the same y value, pick the one with
                // the lowest x value.
                (Math.abs(ps[i][2] - ps[0][2]) < Mat.eps && ps[i][1] < ps[0][1])) {
            ps = Type.swap(ps, i, 0);
        }
    }

    // sort ps in increasing order of the angle the points and the ll make with the x-axis
    ll = ps.shift();
    ps.sort(function (a, b) {
        // atan is monotonically increasing, as we are only interested in the sign of the difference
        // evaluating atan is not necessary
        var rad1 = Math.atan2(a[2] - ll[2], a[1] - ll[1]),
            rad2 = Math.atan2(b[2] - ll[2], b[1] - ll[1]);

        return rad1 - rad2;
    });

    // put ll back into the array
    ps.unshift(ll);

    // put the last element also in the beginning
    ps.unshift(ps[ps.length - 1]);

    return ps;
}

function centroid(k) {
  var i = -1,
      n = this.length,
      x = 0,
      y = 0,
      a,
      b = this[n - 1],
      c;

  if (!arguments.length) k = -1 / (6 * this.area());

  while (++i < n) {
    a = b;
    b = this[i];
    c = a[0] * b[1] - b[0] * a[1];
    x += (a[0] + b[0]) * c;
    y += (a[1] + b[1]) * c;
  }

  return [x * k, y * k];
}

// Sort by x-coord first, y-coord second
function hullOrder(a, b) {
    return a[0] - b[0] || a[1] - b[1];
}

function hull(vertices) {

    // Hull of < 3 points is not well-defined
    if (vertices.length < 3) return [];

    var n = vertices.length;
    var points = []; // of the form [[x0, y0, 0], ..., [xn, yn, n]]
    var flippedPoints = [];

    for (var i = 0 ; i < n; i++) {
        points.push([]   [+fx.call(this, vertices[i], i), +fy.call(this, vertices[i], i), i]);
    }

    // sort ascending by x-coord first, y-coord second
    points.sort(d3_geom_hullOrder);

    // we flip bottommost points across y axis so we can use the upper hull routine on both
    for (i = 0; i < n; i++) flippedPoints.push([points[i][0], -points[i][1]]);

    var upper = d3_geom_hullUpper(points),
        lower = d3_geom_hullUpper(flippedPoints);

    // construct the polygon, removing possible duplicate endpoints
    var skipLeft = lower[0] === upper[0],
        skipRight  = lower[lower.length - 1] === upper[upper.length - 1],
        polygon = [];

    // add upper hull in r->l order
    // then add lower hull in l->r order
    for (i = upper.length - 1; i >= 0; --i) polygon.push(vertices[points[upper[i]][2]]);
    for (i = +skipLeft; i < lower.length - skipRight; ++i) polygon.push(vertices[points[lower[i]][2]]);

    return polygon;
}

// finds the 'upper convex hull' (see wiki link above)
// assumes points arg has >=3 elements, is sorted by x, unique in y
// returns array of indices into points in left to right order
function d3_geom_hullUpper(points) {
  var n = points.length,
      hull = [0, 1],
      hs = 2; // hull size

  for (var i = 2; i < n; i++) {
    while (hs > 1 && d3_cross2d(points[hull[hs-2]], points[hull[hs-1]], points[i]) <= 0) --hs;
    hull[hs++] = i;
  }

  // we slice to make sure that the points we 'popped' from hull don't stay behind
  return hull.slice(0, hs);
}

// @param {Object} cpt a point to be measured from the baseline
// @param {Array} bl the baseline, as represented by a two-element array of xy objects.
// @returns {Number} an approximate distance measure
function getDistant(cpt, bl) {
    var vY = bl[1].x - bl[0].x,
        vX = bl[0].x - bl[1].x;
    return (vX * (cpt.y - bl[0].y) + vY * (cpt.x - bl[0].x));
}

// @param {Array} baseLine a two-element array of xy objects representing the baseline to project from
// @param {Array} latLngs an array of xy objects
// @returns {Object} the maximum point and all new points to stay in consideration for the hull.
function findMostDistantPointFromBaseLine(baseLine, latLngs) {
    var maxD = 0,
        maxPt = null,
        newPoints = [],
        i, pt, d;

    for (i = latLngs.length - 1; i >= 0; i--) {
        pt = latLngs[i];
        d = getDistant(pt, baseLine);

        if (d > 0) {
            newPoints.push(pt);
        } else {
            continue;
        }

        if (d > maxD) {
            maxD = d;
            maxPt = pt;
        }
    }

    return {
        maxPoint: maxPt,
        newPoints: newPoints
    };
}

// Given a baseline, compute the convex hull of latLngs as an array of latLngs.
// @param {Array} xy
function buildConvexHull(baseLine, latLngs) {
    var convexHullBaseLines = [],
        t = findMostDistantPointFromBaseLine(baseLine, latLngs);

    if (t.maxPoint) { // if there is still a point "outside" the base line
        convexHullBaseLines =
            convexHullBaseLines.concat(
                buildConvexHull([baseLine[0], t.maxPoint], t.newPoints)
        );
        convexHullBaseLines =
            convexHullBaseLines.concat(
                buildConvexHull([t.maxPoint, baseLine[1]], t.newPoints)
        );
        return convexHullBaseLines;
    } else {  // if there is no more point "outside" the base line, the current base line is part of the convex hull
        return [baseLine];
    }
}

// Given an array of xys, compute a convex hull as an array of xys
// @param {Array} latLngs
function getConvexHull(points) {
    // find first baseline
    var maxLat = false, minLat = false,
    maxPt = null, minPt = null,
    i;

    for (i = points.length - 1; i >= 0; i--) {
        var pt = points[i];
        if (maxLat === false || pt.y > maxLat) {
            maxPt = pt;
            maxLat = pt.y;
        }
        if (minLat === false || pt.y < minLat) {
            minPt = pt;
            minLat = pt.y;
        }
    }
    return [].concat(buildConvexHull([minPt, maxPt], points),
        buildConvexHull([maxPt, minPt], points));
}


function codirectional(v1, v2, tolerance) {
    // The origin is trivially codirectional with all other vectors.
    // This gives nice semantics for codirectionality between points when
    // comparing their difference vectors.
    if (knumber.equal(kvector.length(v1), 0, tolerance) ||
            knumber.equal(kvector.length(v2), 0, tolerance)) {
        return true;
    }

    v1 = kvector.normalize(v1);
    v2 = kvector.normalize(v2);

    return kvector.equal(v1, v2, tolerance);
}

function collinear(v1, v2, tolerance) {
    return kvector.codirectional(v1, v2, tolerance) ||
            kvector.codirectional(v1, kvector.negate(v2), tolerance);
}

// Rotate vector
function rotateRad(v, theta) {
    var polar = kvector.polarRadFromCart(v);
    var angle = polar[1] + theta;
    return kvector.cartFromPolarRad(polar[0], angle);
}

// Angle between two vectors
function angleRad(v1, v2) {
    return Math.acos(kvector.dot(v1, v2) /
        (kvector.length(v1) * kvector.length(v2)));
}


// Vector projection of v1 onto v2
function projection(v1, v2) {
    var scalar = kvector.dot(v1, v2) / kvector.dot(v2, v2);
    return kvector.scale(v2, scalar);
}

// Distance between point and line
function distanceToLine(point, line) {
    var lv = kvector.subtract(line[1], line[0]);
    var pv = kvector.subtract(point, line[0]);
    var projectedPv = kvector.projection(pv, lv);
    var distancePv = kvector.subtract(projectedPv, pv);
    return kvector.length(distancePv);
}

// Reflect point over line
reflectOverLine: function(point, line) {
    var lv = kvector.subtract(line[1], line[0]);
    var pv = kvector.subtract(point, line[0]);
    var projectedPv = kvector.projection(pv, lv);
    var reflectedPv = kvector.subtract(kvector.scale(projectedPv, 2), pv);
    return kvector.add(line[0], reflectedPv);
}

// Compares two points, returning -1, 0, or 1, for use with
// Array.prototype.sort
// 
// Note: This technically doesn't satisfy the total-ordering
// requirements of Array.prototype.sort unless equalityTolerance
// is 0. In some cases very close points that compare within a
// few equalityTolerances could appear in the wrong order.
function compare(point1, point2, equalityTolerance) {
    if (point1.length !== point2.length) {
        return point1.length - point2.length;
    }
    for (var i = 0; i < point1.length; i++) {
        if (!knumber.equal(point1[i], point2[i], equalityTolerance)) {
            return point1[i] - point2[i];
        }
    }
    return 0;
}

function midpoint(line) {
    return [
        (line[0][0] + line[1][0]) / 2,
        (line[0][1] + line[1][1]) / 2
    ];
}

function equal(line1, line2, tolerance) {
    // TODO: A nicer implementation might just check collinearity of
    // vectors using underscore magick
    // Compare the directions of the lines
    var v1 = kvector.subtract(line1[1],line1[0]);
    var v2 = kvector.subtract(line2[1],line2[0]);
    if (!kvector.collinear(v1, v2, tolerance)) {
        return false;
    }
    // If the start point is the same for the two lines, then they are the same
    if (kpoint.equal(line1[0], line2[0])) {
        return true;
    }
    // Make sure that the direction to get from line1 to
    // line2 is the same as the direction of the lines
    var line1ToLine2Vector = kvector.subtract(line2[0], line1[0]);
    return kvector.collinear(v1, line1ToLine2Vector, tolerance);
}

*/
