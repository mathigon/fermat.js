## Arithmetic


### nearlyEquals

`M.nearlyEquals(Number a, Number b, optional Number t) : Boolean`  
checks if two numbers `a` and `b` are almost equal. If the tolerance `t` isn't specified, the default tolerance is used.


### sign

`M.sign(Number x) : (-1 | 0 | 1)`  
returns the sign of a number `x`.


### square

`M.square(Number x) : Number`  
returns the square of a number `x`.


### cube

`M.cube(Number x) : Number`  
returns the cube of a number `x`.


### bound

`M.bound(Number x, Number min, Number max) : Number`  
returns `x`, bounded between two limits min and max.


### between

`M.between(Number x, Number min, Number max) : Boolean`  
checks if `x` lies on or between the two limits min and max.


### numberFormat

`M.numberFormat(Number x) : String`  
formats a number `x` with thousands separators.


### toOrdinal

`M.toOrdinal(Number x) : String`  
returns the _ordinal_ (1st, 2nd, ...) of a number `x`.


### digits

`M.digits(Number x) : [Number, ...]`  
returns an array with the integer decimal digits of `x`, in reverse order.
For example, `M.digits(376) = [6, 7, 3]`.


### fractionalDigits

`M.fractionalDigits(Number x) : [Number, ...]`  
returns an array with the fractional decimal digits of `x`.
For example, `fractionalDigits(3.456) = [4, 5, 6]`.


### decimalPlaces

`M.decimalPlaces(Number x) : Number`  
returns the number of fractional decimal digits of `x`.


### round

`M.round(Number x, optional Number precision = 0) : Number`  
rounds `x` to have at most `precision` decimal places.


### round

`M.roundTo(Number x, optional Number increment = 1) : Number`  
rounds `x` to the nearest multiple of `increment`.


### roundTowardsZero

`M.roundTowardsZero(Number x) : Number`  
rounds `x` to the nearest integer towards 0;


### toFraction

`M.toFraction(Number x, optional Number maxDenom = 1000) : [Number, Number]`  
uses continued fractions to find a rational representation of a decimal `x`, and returns the array `[numerator, denominator]`.
If there is no rational representation with a denominator `<= maxDenom`, then `[x, 1]` is returned.
For example, `M.toFraction(3/6) = [1, 2]`, `M.toFraction(0.33) = [33, 100]` and  `M.toFraction(0.66, 0.01) = [2/3]`


### add

### mult

### subtr

### div

### mod

### log

### log10

### log2

### cosh

### sinh
