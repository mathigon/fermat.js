// =================================================================================================
// Fermat.js | Matrix
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    // M.Matrix([[1,2],[3,4]]) = [[1,2],[3,4]];
    // M.Matrix(2) = [[0,0],[0,0]];
    // M.Matrix(2,3) = [[0,0,0],[0,0,0]]
    // M.Matrix(2,3,1) = [[1,1,1],[1,1,1]]

    M.Matrix = function(a, b, c) {
        if (!(this instanceof M.Matrix)) return new M.Matrix(a, b, c);

        var isArray = M.isArray(a);
        this.rows = isArray ? a.length : a;
        this.columns = isArray ? Math.max.call(Math, a.map(function(x) { return x.length; }))
                               : (b != null) ? b : a;

        for (var i=0; i<this.rows; ++i) {
            this[i] = [];
            for (var j=0; j<this.columns; ++j) {
                var val = isArray ? a[i][j] : c;
                this[i][j] = (val != null) ? val : null;
            }
        }
    };

    // ---------------------------------------------------------------------------------------------

    M.Matrix.prototype.isSquare = function() {
        return this.rows === this.cols;
    };

    M.Matrix.prototype.row = function(i) {
        return new M.Vector(this[i]);
    };

    M.Matrix.prototype.column = function(j) {
        var c = [];
        for (var i=0; i<this.rows; ++i) c.push(this[i][j]);
        return new M.Vector(c);
    };

    M.Matrix.prototype.transpose = function() {
        var newMatrix = [];

        for (var i=0; i<this.columns; ++i) {
            this[i] = [];
            for (var j=0; j<this.rows; ++j) {
                newMatrix[i][j] = this[j][i];
            }
        }

        return new M.Matrix(newMatrix);
    };

    M.Matrix.prototype.determinant = function() {
        if (!this.isSquare()) throw new Error('Not a square matrix.');
        var n = this.rows, det = 0;

        if (n === 1) {
            return this[0][0];
        } else if (n === 2) {
            return this[0][0] * this[1][1] - this[0][1] * this[1][0];
        }

        for (var col = 0; col < cols; ++col) {
            var diagLeft  = this[0][col];
            var diagRight = this[0][col];

            for(var row=1; row < rows; ++row) {
                diagRight *= this[row][M.mod(col + row, n)];
                diagLeft  *= this[row][M.mod(col - row, n)];
            }

            det += diagRight - diagLeft;
        }

        return det;
    };

    M.Matrix.prototype.scalarMultiply = function(val) {
        var result = [];
        for (var i = 0; i < this.rows; i++) {
            result[i] = [];
            for (var j = 0; j < this.columns; j++) {
                result[i][j] = val * this[i][j];
            }
        }
        return M.Matrix(result);
    };

    M.Matrix.prototype.inverse = function() {
        // TODO
    };

    // ---------------------------------------------------------------------------------------------

    M.matrix = {};

    // Create an identity matrix of dimension n x n
    M.matrix.identity = function(n) {
        var x = new M.Matrix(n, m, 0);
        for (var i = 0; i < Math.min(n, m); ++i) x[i][i] = 1;
        return x;
    };

    M.matrix.add = function(m1, m2) {
        if (m1.rows !== m2.rows || m1.cols !== m2.cols) throw new Error('Matrix size mismatch');

        var result = [];

        for (var i = 0; i < m1.length; ++i) {
            result[i] = [];
            for (var j = 0; j < m1[i].length; ++j) {
                result[i][j] = m1[i][j] + m2[i][j];
            }
        }

        return M.Matrix(result);
    };

    M.matrix.rotation = function(angle) {
        // TODO
    };

    M.matrix.shear = function() {
        // TODO
    };

    M.matrix.reflection = function() {
        // TODO
    };

    // Orthogonal Projection
    M.matrix.projection = function() {
        // TODO
    };

    var vMultM = function(v, m) {
        return mMultV(m.transpose(), v);
    };

    var mMultV = function(m, v) {
        // TODO
    };

    var mMultM = function(m1, m2) {
        // TODO
    };

    M.matrix.mult = function(a, b) {
        if (a instanceof M.Vector && b instanceof M.Matrix) {
            return vMultM(a, b);
        } else if (a instanceof M.Matrix && b instanceof M.Vector) {
            return mMultV(a, b);
        } else if (a instanceof M.Matrix && b instanceof M.Matrix) {
            return mMultM(a, b);
        } else {
            throw new Error('Can\'t multiply two vectors; use .dot or .cross instead.');
        }
    };

})();
