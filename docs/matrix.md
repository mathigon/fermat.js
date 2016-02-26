# Matrix (alpha)


## Constructors

### Matrix
`new Matrix()`

### Matrix.rotation
`Matrix Matrix.rotation(Number angle)`

### Matrix.shear
`Matrix Matrix.shear(Number angle)`

### Matrix.reflection
`Matrix Matrix.reflection()`

### Matrix.projection
`Matrix Matrix.rotation()`


## Properties

### .isSquare
`Boolean .isSquare`

### .row
`Vector .row(Integer i)`

### .column
`Vector .column(Integer j)`

### .transpose
`Matrix .transpose`

### .inverse
`Matrix .inverse`

### .determinant
`Number .determinant`


## Methods

### .scalarMultiply
`Matrix .scalarMultiply(Number x)`


## Static Methods

### Matrix.add
`Matrix Matrix.add(Matrix a, Matrix b)`

### Matrix.product
`Matrix Matrix.product((Matrix|Vector) a, (Matrix|Vector) b)`
