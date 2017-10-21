// =============================================================================
// Fermat.js | Matrix
// (c) Mathigon
// =============================================================================



import { tabulate } from '@mathigon/core';


// -----------------------------------------------------------------------------
// Matrix Constructors

export function identity(n = 2) {
  const x = tabulate(0, n, n);
  for (let i = 0; i < n; ++i) x[i][i] = 1;
  return x;
}

export function fill(x, y, value) {
  return tabulate(value, x, r);
}

export function rotation(_angle) {
  // TODO
}

export function shear(_s) {
  // TODO
}

export function reflection() {
  // TODO
}

export function projection() {
  // TODO
}


// -----------------------------------------------------------------------------
// Matrix Operations

export function sum(M1, ...rest) {
  let M2 = rest.length > 1 ? sum(...rest) : rest[0];

  if (M1.length !== M2.length || M1[0].length !== M2[0].length)
    throw new Error('Matrix sizes don’t match');

  let S = [];
  for (let i = 0; i < M1.length; ++i) {
    let row = [];
    for (let j = 0; j < M1[i].length; ++j) {
      row.push(M1[i][j] + M2[i][j]);
    }
    S.push(row);
  }
  return S;
}

export function scalarProduct(M, v) {
  return M.map(row => row.map(x => x * v));
}

export function product(M1, ...rest) {
  let M2 = rest.length > 1 ? product(...rest) : rest[0];

  if (M1[0].length != M2.length) throw new Error('Matrix sizes don’t match.');

  let P = [];
  for (let i = 0; i < M1.length; ++i) {
    let row = [];
    for (let j = 0; j < M2[0].length; ++j) {

      let value = 0;
      for (let k = 0; k < M2.length; ++k) {
        value += M1[i][k] * M2[k][j]
      }
      row.push(value);

    }
    P.push(row);
  }
  return P;
}


// -----------------------------------------------------------------------------
// Matrix Properties

export function transpose(M) {
  let T = [];
  for (let j = 0; j < M[0].length; ++j) {
    let row = [];
    for (let i = 0; i < M.length; ++i) {
      row.push(M[i][j]);
    }
    T.push(row);
  }
  return T
}

export function determinant(M) {
  if (M.length != M[0].length) throw new Error('Not a square matrix.');
  let n = M.length;

  // Shortcuts for small n
  if (n === 1) return M[0][0];
  if (n === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0];

  let det = 0;
  for (let j = 0; j < n; ++j) {
    let diagLeft  = M[0][j];
    let diagRight = M[0][j];
    for (let i = 1; i < n; ++i) {
      diagRight *= M[i][j + i % n];
      diagLeft  *= M[i][j - i % n];
    }
    det += diagRight - diagLeft;
  }

  return det;
}

export function inverse(M) {
  // Perform Gaussian elimination:
  // (1) Apply the same operations to both I and C.
  // (2) Turn C into the identity, thereby turning I into the inverse of C.

  let n = M.length;
  if (n !== M[0].length) throw new Error('Not a square matrix.');

  let I = identity(n);
  let C = tabulate((x, y) => M[x][y], n, n);  // Copy of original matrix

  for(let i = 0; i < n; ++i){
    // Loop over the elements e in along the diagonal of C.
    let e = C[i][i];

    // If e is 0, we need to swap this row with a lower row.
    if (!e) {
      for (let ii = i + 1; ii < n; ++ii) {
        if (C[ii][i] != 0){
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
      if (ii == i) continue;
      let f = C[ii][i];
      for(let j = 0; j < n; ++j){
        C[ii][j] -= f * C[i][j];
        I[ii][j] -= f * I[i][j];
      }
    }
  }

  return I;
}
