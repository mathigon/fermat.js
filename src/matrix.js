// =============================================================================
// Fermat.js | Matrix
// *** EXPERIMENTAL ***
// (c) 2015 Mathigon
// =============================================================================



import Vector from 'vector';


export default class Matrix {

    // -------------------------------------------------------------------------
    // Constructors

    // new Matrix([[1,2],[3,4]]) = [[1,2],[3,4]];
    // new Matrix(2) = [[0,0],[0,0]];
    // new Matrix(2,3) = [[0,0,0],[0,0,0]]
    // new Matrix(2,3,1) = [[1,1,1],[1,1,1]]

    constructor(a, b = null, c = null) {
        if (!(this instanceof Matrix)) return new Matrix(arguments);

        var isArray = Array.isArray(a);
        this.rows = isArray ? a.length : a;
        this.columns = isArray ? Math.max(...a.map(x => x.length))
                               : (b == null) ? a : b;

        for (var i = 0; i < this.rows; ++i) {
            this[i] = [];
            for (var j = 0; j < this.columns; ++j) {
                var val = isArray ? a[i][j] : c;
                this[i][j] = (val != null) ? val : null;
            }
        }
    }

    static identity(n = 2) {
        let x = new Matrix(n, n, 0);
        for (let i = 0; i < n; ++i) x[i][i] = 1;
        return x;
    }

    static rotation(angle) {
        // TODO
    }

    static shear(s) {
        // TODO
    }

    static reflection() {
        // TODO
    }

    static projection() {
        // TODO
    }


    // -------------------------------------------------------------------------
    // Getters and Methods

    get isSquare() {
        return this.rows === this.cols;
    }

    row(i) {
        return new Vector(this[i]);
    }

    column(j) {
        let c = [];
        for (let i = 0; i < this.rows; ++i) c.push(this[i][j]);
        return new Vector(c);
    }

    get transpose() {
        let newMatrix = [];

        for (var i = 0; i < this.columns; ++i) {
            this[i] = [];
            for (let j = 0; j < this.rows; ++j) {
                newMatrix[i][j] = this[j][i];
            }
        }

        return new Matrix(newMatrix);
    }

    get determinant() {
        if (!this.isSquare()) throw new Error('Not a square matrix.');
        let n = this.rows, det = 0;

        if (n === 1) {
            return this[0][0];
        } else if (n === 2) {
            return this[0][0] * this[1][1] - this[0][1] * this[1][0];
        }

        for (var col = 0; col < this.cols; ++col) {
            var diagLeft  = this[0][col];
            var diagRight = this[0][col];

            for (var row=1; row < rows; ++row) {
                diagRight *= this[row][col + row % n];
                diagLeft  *= this[row][col - row % n];
            }

            det += diagRight - diagLeft;
        }

        return det;
    }

    scalarMultiply(val) {
        var result = [];
        for (var i = 0; i < this.rows; i++) {
            result[i] = [];
            for (var j = 0; j < this.columns; j++) {
                result[i][j] = val * this[i][j];
            }
        }
        return new Matrix(result);
    }

    get inverse() {
        // TODO
    }


    // -------------------------------------------------------------------------
    // Static Methods

    static add(m1, m2) {
        if (m1.rows !== m2.rows || m1.cols !== m2.cols) throw new Error('Matrix size mismatch');

        var result = [];

        for (var i = 0; i < m1.length; ++i) {
            result[i] = [];
            for (var j = 0; j < m1[i].length; ++j) {
                result[i][j] = m1[i][j] + m2[i][j];
            }
        }

        return M.Matrix(result);
    }

    static productVM(v, m) {
        return Matrix.productMV(m.transpose, v);
    }

    static productMV(m, v) {
        // TODO
    }

    static productMM(m1, m2) {
        // TODO
    }

    static product(a, b) {
        if (a instanceof Vector && b instanceof Matrix) {
            return Matrix.productVM(a, b);
        } else if (a instanceof Matrix && b instanceof Vector) {
            return Matrix.productMV(a, b);
        } else if (a instanceof Matrix && b instanceof Matrix) {
            return Matrix.productMM(a, b);
        } else {
            throw new Error('Can\'t multiply these two objects.');
        }
    }
}
