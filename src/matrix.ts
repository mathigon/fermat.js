// =============================================================================
// Fermat.js | Matrix
// (c) Mathigon
// =============================================================================


import {repeat2D, tabulate2D} from '@mathigon/core';


type Matrix = number[][];

// ---------------------------------------------------------------------------
// Constructors

/** Fills a matrix of size x, y with a given value. */
export function fill(value: number, x: number, y: number) {
  return repeat2D(value, x, y);
}

/** Returns the identity matrix of size n. */
export function identity(n = 2) {
  const x = fill(0, n, n);
  for (let i = 0; i < n; ++i) x[i][i] = 1;
  return x;
}

export function rotation(angle: number) {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  return [[cos, -sin], [sin, cos]];
}

export function shear(lambda: number) {
  return [[1, lambda], [0, 1]];
}

export function reflection(angle: number) {
  const sin = Math.sin(2 * angle);
  const cos = Math.cos(2 * angle);
  return [[cos, sin], [sin, -cos]];
}


// ---------------------------------------------------------------------------
// Matrix Operations

/** Calculates the sum of two or more matrices. */
export function sum(...matrices: Matrix[]): Matrix {
  const [M1, ...rest] = matrices;
  const M2 = rest.length > 1 ? sum(...rest) : rest[0];

  if (M1.length !== M2.length || M1[0].length !== M2[0].length) {
    throw new Error('Matrix sizes don’t match');
  }

  const S = [];
  for (let i = 0; i < M1.length; ++i) {
    const row = [];
    for (let j = 0; j < M1[i].length; ++j) {
      row.push(M1[i][j] + M2[i][j]);
    }
    S.push(row);
  }
  return S;
}

/** Multiplies a matrix M by a scalar v. */
export function scalarProduct(M: Matrix, v: number) {
  return M.map(row => row.map(x => x * v));
}

/** Calculates the matrix product of multiple matrices. */
export function product(...matrices: Matrix[]): Matrix {
  const [M1, ...rest] = matrices;
  const M2 = rest.length > 1 ? product(...rest) : rest[0];

  if (M1[0].length !== M2.length) {
    throw new Error('Matrix sizes don’t match.');
  }

  const P = [];
  for (let i = 0; i < M1.length; ++i) {
    const row = [];
    for (let j = 0; j < M2[0].length; ++j) {

      let value = 0;
      for (let k = 0; k < M2.length; ++k) {
        value += M1[i][k] * M2[k][j];
      }
      row.push(value);

    }
    P.push(row);
  }
  return P;
}


// ---------------------------------------------------------------------------
// Matrix Properties

/** Calculates the transpose of a matrix M. */
export function transpose(M: Matrix) {
  const T = [];
  for (let j = 0; j < M[0].length; ++j) {
    const row = [];
    for (let i = 0; i < M.length; ++i) {
      row.push(M[i][j]);
    }
    T.push(row);
  }
  return T;
}

/** Calculates the determinant of a matrix M. */
export function determinant(M: Matrix) {
  if (M.length !== M[0].length) throw new Error('Not a square matrix.');
  const n = M.length;

  // Shortcuts for small n
  if (n === 1) return M[0][0];
  if (n === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0];

  let det = 0;
  for (let j = 0; j < n; ++j) {
    let diagLeft = M[0][j];
    let diagRight = M[0][j];
    for (let i = 1; i < n; ++i) {
      diagRight *= M[i][j + i % n];
      diagLeft *= M[i][j - i % n];
    }
    det += diagRight - diagLeft;
  }

  return det;
}

/** Calculates the inverse of a matrix M. */
export function inverse(M: Matrix) {
  // Perform Gaussian elimination:
  // (1) Apply the same operations to both I and C.
  // (2) Turn C into the identity, thereby turning I into the inverse of C.

  const n = M.length;
  if (n !== M[0].length) throw new Error('Not a square matrix.');

  const I = identity(n);
  const C = tabulate2D((x, y) => M[x][y], n, n);  // Copy of original matrix

  for (let i = 0; i < n; ++i) {
    // Loop over the elements e in along the diagonal of C.
    let e = C[i][i];

    // If e is 0, we need to swap this row with a lower row.
    if (!e) {
      for (let ii = i + 1; ii < n; ++ii) {
        if (C[ii][i] !== 0) {
          for (let j = 0; j < n; ++j) {
            [C[ii][j], C[i][j]] = [C[i][j], C[ii][j]];
            [I[ii][j], I[i][j]] = [I[i][j], I[ii][j]];
          }
          break;
        }
      }
      e = C[i][i];
      if (!e) throw new Error('Matrix not invertible.');
    }

    // Scale row by e, so that we have a 1 on the diagonal.
    for (let j = 0; j < n; ++j) {
      C[i][j] = C[i][j] / e;
      I[i][j] = I[i][j] / e;
    }

    // Subtract a multiple of this row from all other rows,
    // so that they end up having 0s in this column.
    for (let ii = 0; ii < n; ++ii) {
      if (ii === i) continue;
      const f = C[ii][i];
      for (let j = 0; j < n; ++j) {
        C[ii][j] -= f * C[i][j];
        I[ii][j] -= f * I[i][j];
      }
    }
  }

  return I;
}
