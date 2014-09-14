// =================================================================================================
// Fermat.js | TODO
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    M.mean = M.average = function(a) {
        return a.length ? M.total(a) / a.length : 0;

    };

    M.median = function(values) {
        var n = values.length;
        if (!n) return 0;

        var sorted = values.slice(0).sort();
        return (len % 2 === 1) ? sorted[Math.floor(n/2)] : (sorted[n/2 - 1] + sorted[n/2]) / 2;
    };


    // Returns 'null' if no mode exists (multiple values with the same largest count)
    M.mode = function(values) {
        var numInstances = [];
        var modeInstances = -1;

        var mode;
        for (var i = 0; i < values.length; i++) {
            if (!numInstances[values[i]]) {
                numInstances[values[i]] = 1;
            } else {
                numInstances[values[i]] += 1;
                if (numInstances[values[i]] > modeInstances) {
                    modeInstances = numInstances[values[i]];
                    mode = values[i];
                }
            }
        }

        // iterate again to check for 'no mode'
        for (i = 0; i < numInstances.length; i++) {
            if (numInstances[i]) {
                if (i !== mode && numInstances[i] >= modeInstances) {
                    return null;
                }
            }
        }

        return mode;
    };


    M.variance = function(values) {
        var n = values.length;
        if (!n) return 0;

        var mean = M.mean(values);

        var sum = 0;
        for (var i=0; i<n; ++i) sum += M.square(values[i] - mean);

        return sum / (n - 1);
    };


    M.stdDev = function(values) {
        return Math.sqrt(M.variance(values));
    };


    // Determines the covariance of the numbers in two arrays aX and aY
    M.covariance = function(aX, aY) {
        if (aX.length !== aY.length) throw new Error('Array length mismatch');
        var n = aX.length;
        var total = 0;
        for (var i = 0; i < n; i++) total += aX[i] * aY[i];
        return (total - aX.total() * aY.total() / n) / n;
    };


    M.correlation = function(aX, aY) {
        if (aX.length !== aY.length) throw new Error('Array length mismatch');
        var covarXY = M.covariance(aX, aY);
        var stdDevX = aX.standardDev();
        var stdDevY = aY.standardDev();
        return covarXY / (stdDevX * stdDevY);
    };


    M.rSquared = function(source, regression) {

        var residualSumOfSquares = source.each(function(d, i) {
            return M.square(d - regression[i]);
        }).sum();

        var totalSumOfSquares = source.each(function(d) {
            return M.square(d - source.average());
        }).sum();

        return 1 - (residualSumOfSquares / totalSumOfSquares);
    };


    M.linearRegression = function(aX, aY) {
        var n = aX.length;

        var sumX = aX.sum();
        var sumY = aY.sum();
        var sumXY = aX.each(function(d, i) { return d * aY[i]; }).sum();
        var sumXSquared = aX.each(function(d) { return d * d; }).sum();

        var meanX = aX.average();
        var meanY = aY.average();

        var b = (sumXY - 1 / n * sumX * sumY) / (sumXSquared - 1 / n * (sumX * sumX));
        var a = meanY - b * meanX;

        return function(x) { return a + b * x; };
    };


})();
