// =================================================================================================
// Fermat.js | TODO
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {


    // M.bisect(function(x){ return Math.cos(x/2); }, 10) => Pi
    M.bisect = function(fn, precision, l, h) {

        if (precision == null) precision = 3;
        var p = Math.pow(10, -precision);
        var q = Math.pow(10,  precision);

        if (!l) l = 0;
        var lf = fn(l);
        var ls = Math.sign(lf);
        if (ls === 0) return l;
        var hf, hs;

        if (h == null) {
            h = 0.5;
            do {
                h *= 2;
                hf = fn(h);
                hs = Math.sign(hf);
            } while (hs === ls);
            if (hs === 0) return h;
        }

        var x = 0;
        while (Math.abs(lf) > p && x < 200) {

            var c = (l + h) / 2;
            var cf = fn(c);
            var cs = Math.sign(cf);
            if (cs === 0) return c;

            if (cs === ls) {
                l = c;
                lf = cf;
            } else {
                h = c;
                hf = cf;
            }

            ++x;
        }

        return Math.round(l*q)*p;
    };


})();
