// =================================================================================================
// Fermat.js | Geometry
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    M.geo = {};

    // TODO  M.geo.Curve class (length, area)
    // circle-circle and circle-polygon intersections


    // ---------------------------------------------------------------------------------------------
    // Types

    M.geo.Point = function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
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
    }


    // ---------------------------------------------------------------------------------------------
    // Basic Properties

    M.geo.angle = function (a, b, c) {
        var phiA = Math.atan2(a.y - b.y, a.x - b.x);
        var phiC = Math.atan2(c.y - b.y, c.x - b.x);
        var phi = phiC - phiA;

        if (phi < 0) phi += 2 * Math.PI;
        return phi;
    };

    M.reco.Rect.toPolygon = function() {
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

        return (x1 === 0 && x2 === 0) || (y1 === 0 && y2 === 0) || M.nearlyEquals(y1/x1, y2/x2)
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

    M.Circle.prorotype.circumference = function() {
        return 2 * Math.PI * this.r;
    };

    M.Rect.prorotype.circumference = function() {
        return 2 * w + 2 * h;
    };

    M.Polygon.prorotype.circumference = function() {
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
        var y0 = p.y - x.y;

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
        var x, y,c, z,

        // Special case: point is the first point of the line
        if (M.geo.same(p === l.p1) {
            x = a.x + b.y - a.y;
            y = a.y - b.x + a.x;
            z = A[0] * B[0];

            if (Math.abs(z) < EPS) {
                x =  B[2];
                y = -B[1];
            }
            c = [z, x, y];

        // Special case: point is the second point of the line
        } else if (M.geo.same(p === l.p2) {
            x = B[1] + A[2] - B[2];
            y = B[2] - A[1] + B[1];
            z = A[0] * B[0];

            if (Math.abs(z) < Mat.eps) {
                x =  A[2];
                y = -A[1];
            }
            c = [z, x, y];

        // special case: point lies somewhere else on the line
        } else if (Math.abs(Mat.innerProduct(C, line.stdform, 3)) < Mat.eps) {
            x = C[1] + B[2] - C[2];
            y = C[2] - B[1] + C[1];
            z = B[0];

            if (Math.abs(z) < Mat.eps) {
                x =  B[2];
                y = -B[1];
            }

            if (Math.abs(z) > Mat.eps && Math.abs(x - C[1]) < Mat.eps && Math.abs(y - C[2]) < Mat.eps) {
                x = C[1] + A[2] - C[2];
                y = C[2] - A[1] + C[1];
            }
            c = [z, x, y];

        // general case: point does not lie on the line
        // -> calculate the foot of the dropped perpendicular
        } else {
            c = [0, line.stdform[1], line.stdform[2]];
            c = Mat.crossProduct(c, C);                  // perpendicuar to line
            c = Mat.crossProduct(c, line.stdform);       // intersection of line and perpendicular
        }

        return [new Coords(Type.COORDS_BY_USER, c, board), change];
    };

    // Returns the circumcenter of the circumcircle two three points a, b and c
    M.geo.circumcenter = function(a, b, c) {
        u = [B[0] - A[0], -B[2] + A[2], B[1] - A[1]];
        v = [(A[0] + B[0])  * 0.5, (A[1] + B[1]) * 0.5, (A[2] + B[2]) * 0.5];
        m1 = Mat.crossProduct(u, v);

        u = [C[0] - B[0], -C[2] + B[2], C[1] - B[1]];
        v = [(B[0] + C[0]) * 0.5, (B[1] + C[1]) * 0.5, (B[2] + C[2]) * 0.5];
        m2 = Mat.crossProduct(u, v);

        return new Coords(Const.COORDS_BY_USER, Mat.crossProduct(m1, m2), board);
    };


    // ---------------------------------------------------------------------------------------------
    // Computational Geometry

    M.geo.sortVertices = function() {
        // TODO
    };

    M.geo.convexHull = function() {
        // TODO
    };

    M.geo.travellingSalesman = function() {
        // TODO
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

    };

    var pointCircleIntersect = function(p, ) {

    };

    var pointPolygonIntersect = function() {

    };

    var lineLineIntersect = function(l1, l2) {

        /* TODO
        var da = M.vector.diff(a2, a1);
        var db = M.vector.diff(b2, b1);
        var ab = M.vector.diff(a1, b1);

        var denominator = M.vector.cross(db, da);
        if (denominator === 0) return;  // -> colinear

        var numeratorA = db[1] * ab[0] - db[0] * ab[1];
        var numeratorB = da[1] * ab[0] - da[0] * ab[1];

        var A = numeratorA / denominator;
        var B = numeratorB / denominator;

        if (M.bound(A,0,1) && M.bound(B,0,1)) {
            var intersectionX = a1[0] + A * (a2[0] - a1[0]);
            var intersectionY = a1[1] + B * (a2[1] - a1[1]);
            return [intersectionX, intersectionY];
        }
        */
    };

    var lineCircleIntersect = function(l, c) {
        // TODO
    }

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

        var typeX = (x instanceof M.geo.Line) ? 'line' : (x instanceof M.geo.Circle) ? 'circle' : (x instanceof M.geo.Polygon) ? 'polygon';
        var typeY = (y instanceof M.geo.Line) ? 'line' : (y instanceof M.geo.Circle) ? 'circle' : (y instanceof M.geo.Polygon) ? 'polygon';

        switch (typeX + '-' + typeY) {
            case 'line-line':       return lineLineIntersect(x, y);
            case 'line-circle':     return lineCircleIntersect(x, y);
            case 'line-polygon':    return linePolygonIntersect(x, y);
            case 'circle-line':     return lineCircleIntersect(y, x);
            case 'polygon-line':    return linePolygonIntersect(y, x);
            case 'polygon-polygon': return polygonPolygonIntersect(x, y);
        }

        throw new Error('Can\'t intersect ' + typeX + 's and ' + typeY + '.');
    };


    // ---------------------------------------------------------------------------------------------
    // Projections

    M.geo.projectPointOnLine = function() {
        // TODO
    };

    M.geo.projectLineOnLine = function() {
        // TODO
    };

    // TODO More Projections Functions

})();
