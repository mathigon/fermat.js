// =================================================================================================
// Fermat.js | Geometry
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    M.geo = {};


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
    M.geo.Rectangle = function(x, y, w, h) {
        this.x = x || 0;
        this.y = y || 0;
        this.w = (w == null) ? w : 1;
        this.h = (h == null) ? h : 1;
    };

    // Defines a polygon
    M.geo.Polygon = function(points) {
        this.points = points;
    };


    // ---------------------------------------------------------------------------------------------
    // Basic Properties

    M.geo.angle = function (a, b, c) {
        var phi = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        if (phi < 0) phi += 2 * Math.PI;
        return phi;
    };

    M.geo.distance = function(a, b) {
        return M.vector.diff(a, b).norm();
    };

    M.geo.isParallel = function() {
        // TODO
    };


    // ---------------------------------------------------------------------------------------------
    // Distances

    M.geo.distance = function(p1, p2) {
        return Math.sqrt(M.square(p1.x - p2.x) + M.square(p1.y - p2.y));
    };

    M.geo.manhatten = function(p1, p2) {
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    };


    // ---------------------------------------------------------------------------------------------
    // Areas

    M.geo.Circle.area = function() {
        // TODO
    };

    M.geo.Rectangle.area = function() {
        // TODO
    };

    var triangleArea = function() {
        // TODO
    };

    M.geo.Polygon.area = function() {
        // TODO
    };


    // ---------------------------------------------------------------------------------------------
    // Contains

    M.geo.Line.prototype.contains = function(p) {
        // TODO
    };

    M.geo.Circle.prototype.contains = function(p) {
        // TODO
    };

    M.geo.Rectangle.prototype.contains = function(p) {
        // TODO
    };

    M.geo.Polygon.prototype.contains = function(p) {
        // TODO
    };


    // ---------------------------------------------------------------------------------------------
    // Transformations

    // Finds the reflection of a point p in a line l
    M.geo.reflection = function(p, l) {
        // TODO
    };

    // Finds the rotation of a point p around a center c by an angle phi
    M.geo.rotation = function(p, c, phi) {
        // TODO
    };


    // ---------------------------------------------------------------------------------------------
    // Constructions

    // Calculates the angle bisector of the angle a, b, c.
    // The result is a M.Line which goes through b.
    M.geo.angleBisector = function(a, b, c) {

        var phi1 = Math.atan2(a.y - b.y, a.x - b.x);
        var phi2 = Math.atan2(c.y - b.y, c.x - b.x);

        var phi = (phi1 + phi2) / 2;
        if (phiA > phiC) phi += Math.Pi;

        var x = b.x + Math.cos(phi);
        var y = b.y + Math.sin(phi);
        var p = new M.geo.Point(x, y);
        return new M.geo.Line(b, p);
    };

    M.geo.angleBisector = function() {
        // TODO
    };

    M.geo.perpendicular = function() {
        // TODO
    };

    M.geo.circumcenter = function() {
        // TODO
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
    // Projections

    M.geo.projectPointOnLine = function() {
        // TODO
    };

    M.geo.projectLineOnLine = function() {
        // TODO
    };

    // TODO More Functions


    // ---------------------------------------------------------------------------------------------
    // Intersections and Overlaps

    M.geo.intersect = function(a1, a2, b1, b2) {

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
    };

    // TODO More Functions

})();
