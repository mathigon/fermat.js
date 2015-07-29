// ============================================================================
// Fermat.js | Statistics
// (c) 2015 Mathigon
// ============================================================================



import { total } from 'arrays';
import { square } from 'arithmetic';


// -----------------------------------------------------------------------------
// Mean, Media, Mode

function mean(a) {
    return a.length ? total(a) / a.length : null;
}

function median(values) {
    let n = values.length;
    if (!n) return 0;

    let sorted = values.slice(0).sort();
    return (n % 2 === 1) ? sorted[Math.floor(n/2)] : (sorted[n/2 - 1] + sorted[n/2]) / 2;
}

// Returns 'null' if no mode exists (multiple values with the same largest count)
function mode(values) {
    let counts = new Map();

    let modeCount = -1;
    let result;

    for (let v of values) {
        if (!counts.has(v)) {
            counts.set(v, 1);
        } else {
            let newCount = counts.get(v) + 1;
            counts.set(v, newCount);
            if (newCount > modeCount) {
                modeCount = newCount;
                result = v;
            }
        }
    }

    // iterate again to check for 'no mode'
    for (let i of counts.entries()) {
        if (i[1] === modeCount && i[0] !== result) {
                return null;
        }
    }

    return result;
}


// -----------------------------------------------------------------------------
// Variance

function variance(values) {
    if (!values.length) return null;
    let mean = mean(values);

    let sum = 0;
    for (let v of values) sum += square(v - mean);
    return sum / (n - 1);
}

function stdDev(values) {
    return Math.sqrt(variance(values));
}

// Determines the covariance of the numbers in two arrays aX and aY
function covariance(aX, aY) {
    if (aX.length !== aY.length) throw new Error('Array length mismatch');
    var n = aX.length;
    var total = 0;
    for (var i = 0; i < n; i++) total += aX[i] * aY[i];
    return (total - total(aX) * total(aY) / n) / n;
}

function correlation(aX, aY) {
    if (aX.length !== aY.length) throw new Error('Array length mismatch');
    var covarXY = covariance(aX, aY);
    var stdDevX = stdDev(aX);
    var stdDevY = stdDev(aY);
    return covarXY / (stdDevX * stdDevY);
}


// -----------------------------------------------------------------------------
// Regression

function rSquared(source, regression) {
    let sourceMean = mean(source);

    let residualSquares = source.map((d, i) => square(d - regression[i]));
    let totalSquares = source.map(d => square(d - sourceMean));

    return 1 - total(residualSquares) / total(totalSquares);
}

function linearRegression(aX, aY) {
    var n = aX.length;

    var sumX = total(aX);
    var sumY = total(aY);
    var sumXY = total(aX.map((d, i) => d * aY[i]));
    var sumXSquared = total(aX.map(d => d * d));

    var meanX = mean(aX);
    var meanY = mean(aY);

    var b = (sumXY - 1 / n * sumX * sumY) / (sumXSquared - 1 / n * (sumX * sumX));
    var a = meanY - b * meanX;

    return (x) => (a + b * x);
}

// -----------------------------------------------------------------------------

export default {
    mean, median, mode, variance, stdDev, covariance,
    correlation, rSquared, linearRegression
};

