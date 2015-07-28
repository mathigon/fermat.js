// =============================================================================
// Fermat.js | Vector
// (c) 2015 Mathigon
// =============================================================================



import { map, isInteger } from 'utilities';


export default class Vector extends Array {

    // -------------------------------------------------------------------------
    // Contructors

    constructor(...args) {
        if (!(this instanceof Vector)) return new Vector(arguments);

        if (args.length === 1) {
            if (Array.isArray(args[0])) {
                args = args[0];
            } else {
                args = Array(args[0]).fill(0);
            }
        }

        super.call(this, args);
    }


    // -------------------------------------------------------------------------
    // Getters and Methods

    get total() {
        let total = 0;
        for (let x of this) total += (+x || 0);
        return total;
    }

    get average() {
        return this.total() / this.length;
    }

    get norm() {
        let squares = 0;
        for (let x of this) squares += x * x;
        return Math.sqrt(squares);
    }

    get first() { return this[0]; }
    get last() { return this[this.length - 1]; }
    get min() { return Math.min.apply(Math, this); }
    get max() { return Math.max.apply(Math, this); }
    get range() { return [this.min, this.max] },

    scale(q = 1) {
        var scaled = this.map(x => q * x);
        return new Vector(scaled);
    }

    normalise() {
        return this.scale(1 / this.norm);
    }

    toString() {
        return '(' + this.join(', ') + ')';
    }


    // -------------------------------------------------------------------------
    // Static Functions

    static sum(v1, v2) {
        let a = map((a,b) => a + b, v1, v2);
        return new Vector(a);
    }

    static difference(v1, v2) {
        return Vector.add(v1, v2.scale(-1));
    }

    static dot(v1, v2) {
        let n = Math.min(v1.length, v2.length);
        let d = 0;
        for (let i = 0; i < n; ++i) d += (v1[i] || 0) * (v2[i] || 0);
        return d;
    }

    static cross2D(x, y) {
        return x[0] * y[1] - x[1] * y[0];
    }

    static cross(v1, v2) {
        return new Vector([v1[1] * v2[2] - v1[2] * v2[1],
                           v1[2] * v2[0] - v1[0] * v2[2],
                           v1[0] * v2[1] - v1[1] * v2[0]]);
    }

    static product(v1, v2) {
        let a = map((a,b) => a * b, v1, v2);
        return new Vector(a);
    }

    static equals(v1, v2) {
        let n = v1.length;
        if (n !== v2.length) return false;
        for (let i = 0; i < n; ++i) if (v1[i] !== v2[i]) return false;
        return true;
    }

}

