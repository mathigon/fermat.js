// =================================================================================================
// Fermat.js | Geometry
// ***EXPERIMENTAL ***
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    M.geo = {};

    // TODO  M.geo.Curve class (length, area)
    // TODO circle-circle and circle-polygon intersections
    // TODO Advanced projections functions


    // ---------------------------------------------------------------------------------------------
    // Types

    M.geo.Point = function(x, y) {
        this.x = this[0] = (+x || 0);
        this.y = this[1] = (+y || 0);
        this.length = 2;
    };

    // Defines a line that goes through two M.Points p1 and p2
    M.geo.Line = function(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    };

    // Defines a circle
    M.geo.Circle = function(c, r) {
        this.c = (r == null) ? new M.Point(0,0) : c;
        this.r = (r == null) ? 1 : r;
    };

    // Defines a rectangle
    M.geo.Rect = function(x, y, w, h) {
        this.x = x || 0;
        this.y = y || 0;
        this.w = (w == null) ? w : 1;
        this.h = (h == null) ? h : 1;
    };

    // Defines a polygon
    M.geo.Polygon = function(points) {
        this.points = points;
    };

    var getGeoType = function(x) {
        if (x instanceof M.geo.Point) return 'point';
        if (x instanceof M.geo.Line) return 'line';
        if (x instanceof M.geo.Circle) return 'circle';
        if (x instanceof M.geo.Rect) return 'rect';
        if (x instanceof M.geo.Polygon) return 'polygon';
        return '';
    };


    // ---------------------------------------------------------------------------------------------
    // Basic Properties

    M.geo.angle = function (a, b, c) {
        var phiA = Math.atan2(a.y - b.y, a.x - b.x);
        var phiC = Math.atan2(c.y - b.y, c.x - b.x);
        var phi = phiC - phiA;

        if (phi < 0) phi += 2 * Math.PI;
        return phi;
    };

    M.geo.Rect.prototype.toPolygon = function() {
        var a = new M.geo.Point(this.x,     this.y);
        var b = new M.geo.Point(this.x + w, this.y);
        var c = new M.geo.Point(this.x + w, this.y + h);
        var d = new M.geo.Point(this.x,     this.y + h);
        return new M.geo.Polygon([a, b, c, d]);
    };

    M.geo.isParallel = function(l1, l2) {
        var x1 = l1.p2.x - l1.p1.x;
        var y1 = l1.p2.y - l1.p1.y;
        var x2 = l2.p2.x - l2.p1.x;
        var y2 = l2.p2.y - l2.p1.y;

        return (x1 === 0 && x2 === 0) || (y1 === 0 && y2 === 0) || M.nearlyEquals(y1/x1, y2/x2);
    };

    M.geo.Line.prototype.contains = function(p) {
        var grad1 = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
        var grad2 = (p.y - this.p1.y) / (p - this.p1.x);
        return M.nearlyEquals(grad1, grad2);
    };

    M.geo.Line.prototype.normalVector = function() {
        var l = this.length();
        var x = (this.p2.x - this.p1.x) / l;
        var y = (this.p2.y - this.p1.y) / l;
        return new M.Point(x, y);
    };

    M.geo.project = function(p, l) {
        var k = M.vector.dot(M.vector.subtr(p, l.p1), l.normalVector());
        return new Point(l.p1.x + k.x, l.p1.y + k.y);
    };

    M.geo.lineToPointDistance = function(p, l) {
        return M.geo.distance(p, M.gep.project(p, l));
    };


    // ---------------------------------------------------------------------------------------------
    // Distances

    M.geo.distance = function(p1, p2) {
        return Math.sqrt(M.square(p1.x - p2.x) + M.square(p1.y - p2.y));
    };

    M.geo.manhatten = function(p1, p2) {
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    };

    M.geo.Line.prototype.length = function() {
        return M.geo.distance(this.p1, this.p2);
    };

    M.geo.Circle.prototype.circumference = function() {
        return 2 * Math.PI * this.r;
    };

    M.geo.Rect.prototype.circumference = function() {
        return 2 * w + 2 * h;
    };

    M.geo.Polygon.prototype.circumference = function() {
        var C = 0, p = this.points, n = p.length;
        for (var i = 1; i < n; ++i) C += M.geo.distance(p[i - 1], p[i]);
        C += M.geo.distance(p[n-1], p[0]);
        return C;
    };


    // ---------------------------------------------------------------------------------------------
    // Areas

    M.geo.Circle.prototype.area = function() {
        return Math.PI * M.square(this.r);
    };

    M.geo.Rect.prototype.area = function() {
        return Math.abs(this.w * this.h);
    };

    var signedTriangleArea = function(a, b, c) {
        return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / 2;
    };

    // Polygon has to be non-intersecting
    M.geo.Polygon.prototype.area = function() {
        var A = 0, p = this.points, n = p.length;
        for (var i = 1; i < n; ++i) A += p[i - 1].x * p[i].y - p[i].x * p[i - 1].y;
        A += p[0].x * p[n - 1].y - p[n - 1].x * p[0].y;
        return Math.abs(A/2);
    };


    // ---------------------------------------------------------------------------------------------
    // Equivalence Checks

    var same = {

        point: function(p1, p2) {
            return M.nearlyEquals(p1.x, p2.x) && M.nearlyEquals(p1.y, p2.y);
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

    M.geo.same = function same(a, b, unOriented) {
        var type = getGeoType(a);
        if (type !== getGeoType(b)) return false;
        var sameFn = same[type];
        if (sameFn) return sameFn(a, b, unOriented);
    };


    // ---------------------------------------------------------------------------------------------
    // Transformations

    var scalePoint = function(p, sx, sy) {
        return new M.geo.Point(p.x * sx, p.y * sy)
    };

    M.geo.scale = function(x, sx, sy) {
        if (sy == null) sy = sx;

        if (x instanceof M.geo.Rect) x = x.toPolygon();
        var type = getGeoType(x);

        switch (type) {
            case 'point':   return scalePoint(x, sx, sy);
            case 'line':    return new M.geo.Line(scalePoint(x.p1, sx, sy), scalePoint(x.p2, sx, sy));
            case 'circle':  return new M.geo.Circle(scalePoint(x.c, sx, sy), x.r * (sx + sy) / 2);
            case 'polygon': return new M.geo.Polygon(x.points.map(function(p) {
                                                                return scalePoint(p, sx, sy); }));
        }
    };

    // Finds the reflection of a point p in a line l
    var reflectPoint = function(p, l) {
        var v = l.p2.x - l.p1.x;
        var w = l.p2.y - l.p1.y;

        var x0 = p.x - p1.x;
        var y0 = p.y - p1.y;

        var mu = (v * y0 - w * x0) / (v * v + w * w);

        var x = p.x + 2 * mu * w;
        var y = p.y - 2 * mu * v;
        return new M.geo.Point(x, y);
    };

    M.geo.reflection = function(x, l) {
        if (x instanceof M.geo.Rect) x = x.toPolygon();
        var type = getGeoType(x);

        switch (type) {
            case 'point':   return reflectPoint(x, l);
            case 'line':    return new M.geo.Line(reflectPoint(x.p1, l), reflectPoint(x.p2, l));
            case 'circle':  return new M.geo.Circle(reflectPoint(x.c, l), x.r);
            case 'polygon': return new M.geo.Polygon(x.points.map(function(p) {
                                                                return reflectPoint(p, l); }));
        }
    };

    // Finds the rotation of a point p around a center c by an angle phi
    var rotatePoint = function(p, c, phi) {
        var x0 = p.x - c.x;
        var y0 = p.y - c.y;

        var cos = Math.cos(phi);
        var sin = Math.sin(phi);

        var x = x0 * cos - y0 * sin + c.x;
        var y = x0 * sin + y0 * cos + c.y;
        return new M.geo.Point(x, y);
    };

    M.geo.rotation = function(x, c, phi) {
        if (x instanceof M.geo.Rect) x = x.toPolygon();
        var type = getGeoType(x);

        switch (type) {
            case 'point':   return rotatePoint(x, c, phi);
            case 'line':    return new M.geo.Line(rotatePoint(x.p1, c, phi),
                                                  rotatePoint(x.p2, c, phi));
            case 'circle':  return new M.geo.Circle(rotatePoint(x.c, c, phi),  x.r);
            case 'polygon': return new M.geo.Polygon(x.points.map(function(p) {
                                                            return rotatePoint(p, c, phi); }));
        }
    };


    // ---------------------------------------------------------------------------------------------
    // Constructions

    // Calculates the angle bisector of the angle a, b, c.
    // The result is a line which goes through b
    M.geo.angleBisector = function(a, b, c) {
        var phiA =  Math.atan2(a.y - b.y, a.x - b.x);
        var phiC =  Math.atan2(c.y - b.y, c.x - b.x);
        var phi = (phiA + phiC) / 2;

        if (phiA > phiC) phi += Math.PI;

        var x = Math.cos(phi) + b.x;
        var y = Math.sin(phi) + b.y;
        return new M.geo.Point(x, y);
    };

    // Finds a perpendicular to the line l which goes through a point p.
    M.geo.perpendicular = function(l, p) {
        var dx, dy;

        // Special case: point is the first point of the line
        if (M.geo.same(p, l.p1)) {
            dx = l.p2.y - l.p1.y;
            dy = l.p1.x - l.p2.x;

        // Special case: point is the second point of the line
        } else if (M.geo.same(p === l.p2)) {
            dx = l.p1.y - l.p2.y;
            dy = l.p2.x - l.p1.x;

        // special case: point lies somewhere else on the line
        } else if (l.contains(p)) {
            dx = l.p1.y - p.y;
            dy = p.x - l.p1.x;

        // general case: point does not lie on the line
        } else {
            var b = M.geo.project(p, l);
            dx = b.x;
            dy = b.y;
        }

        return new M.geo.Line(new M.geo.Point(p.x, p.y), new M.geo.Point(p.x + dx, p.y + dy));
    };

    // TODO More Constructions


    // ---------------------------------------------------------------------------------------------
    // Computational Geometry

    M.geo.sortVertices = function() {
        // TODO
    };

    M.geo.convexHull = function() {
        // TODO
    };

    M.geo.travellingSalesman = function(dist) {
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
    };


    // ---------------------------------------------------------------------------------------------
    // Intersections and Overlaps

    var pointPointIntersect = function(p1, p2) {
        return M.geo.same(p1, p2) ? [new M.geo.Point(p1.x, p2.x)] : [];
    };

    var pointLineIntersect = function(p, l) {
        // TODO check that p lies on l
    };

    var pointRectIntersect = function(p, r) {
        // TODO
    };

    var pointCircleIntersect = function(p, c) {
        // TODO
    };

    var pointPolygonIntersect = function(p1, p2) {
        // TODO
    };

    var lineLineIntersect = function(l1, l2) {

        var d1 = M.map(M.subtr, l1.p2, l1.p1);
        var d2 = M.map(M.subtr, l2.p2, l2.p1);
        var d  = M.map(M.subtr, l2.p1, l1.p1);

        var denominator = M.vector.cross2D(d2, d1);
        if (denominator === 0) return;  // -> colinear

        var n1 = M.vector.cross2D(d1, d);
        var n2 = M.vector.cross2D(d2, d);

        var x = n2 / denominator;
        var y = n1 / denominator;

        if (M.bound(x,0,1) && M.bound(y,0,1)) {
            var intersectionX = l1.p1.x + x * (l1.p2.x - l1.p1.x);
            var intersectionY = l1.p1.y + y * (l1.p2.y - l1.p1.y);
            return [intersectionX, intersectionY];
        }
    };

    var lineCircleIntersect = function(l, c) {
        // TODO
    };

    var linePolygonIntersect = function(l, c) {
        // TODO
    };

    var rectRectIntersect = function() {
        // TODO
    };

    var polygonPolygonIntersect = function() {
        // TODO
    };

    M.geo.intersect = function(x, y) {

        if (arguments.length > 2) {
            var rest = _arraySlice.call(arguments, 1);
            return lcm(x, M.geo.intersect.apply(null, rest));
        }

        // Handle Rectangles
        if (x instanceof M.geo.Rect && y instanceof M.geo.Rect) return rectRectIntersect(x, y);
        if (x instanceof M.geo.Rect) x = x.toPolygon();
        if (y instanceof M.geo.Rect) y = y.toPolygon();

        switch (getGeoType(x) + '-' + getGeoType(y)) {
            case 'line-line':       return lineLineIntersect(x, y);
            case 'line-circle':     return lineCircleIntersect(x, y);
            case 'line-polygon':    return linePolygonIntersect(x, y);
            case 'circle-line':     return lineCircleIntersect(y, x);
            case 'polygon-line':    return linePolygonIntersect(y, x);
            case 'polygon-polygon': return polygonPolygonIntersect(x, y);
        }

        throw new Error('Can\'t intersect ' + typeX + 's and ' + typeY + '.');
    };

})();
