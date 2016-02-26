# Geometry (alpha)


## Shape

#### Properties
* `.center`

#### Methods
* `.transform`
* `.rotate`
* `.reflect`
* `.scale`
* `.shift`
* `.contains`
* `.at`



## Point _extends Shape_

### Point
`new Point(Number x, Number y)`

#### Properties
* `.distance`
* `.polar`
* `.project`

#### Methods
* `.distanceFromLine`

### Point.fromPolar
### Point.dot
### Point.sum
### Point.difference
### Point.distance
### Point.manhatten



## Line _extends Shape_

### Line
`new Line(Point p1, Point p2)`

#### Properties
* `.length`
* `.normalVector`

#### Methods
* `.perpendicular`

### Line.isParallel
### Line.isPerpendicular
### Line.angleBetween
### Line.angleBisector



## Bezier _extends Shape_

### Bezier
`new Bezier(Point p1, Point p2, [Point q1, Point q2])`

#### Properties
* `.length`



## Ellipse _extends Shape_

### Ellipse



## Circle _extends Ellipse_

### Circle
`new Circle([Point center, Number radius])`

#### Properties
* `.circumference`
* `.area`



## Rectangle _extends Shape_

### Rectangle
`new Rectangle([Point x, Point y, Number width, Number height])`

#### Properties
* `.circumference`
* `.area`
* `.polygon`



## Square _extends Rectangle_

### Square
`new Square([Point x, Point y, Number width])`



## Polygon _extends Shape_

### Polygon
`new Polygon(Point[] ...points)`

#### Properties
* `.centroid`
* `.circumference`
* `.area`



## Triangle _extends Polygon_

### Triangle
`new Triangle(Point[] ...points)`

#### Properties
* `.circumcircle`
* `.incircle`



## Utilities

### angle
`Number angle(Point a, Point b, Point c)`

### same
`Boolean same(Shape x, Shape y)`

### intersect
`Shape intersect(Shape x, Shape y)`

### convexHull
`Polygon convexHull(Point[] ...points)`

### travellingSalesman
`{ Integer[] path, Number length } travellingSalesman(Array distanceMatrix)`

### graphColouring
`Integer[] graphColouring(Array adjacencyMatrix)`
