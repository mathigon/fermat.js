require('../dist/core.js');
require('../dist/fermat.js');

exports.tabulate = function(test){
    test.deepEqual(M.tabulate(function(a){ return a; }, 3), [0, 1, 2], '1D array');
    test.deepEqual(M.tabulate(function(a, b){ return a+b; }, 2, 2), [[0, 1], [1, 2]], '2D array');
    test.equal(M.tabulate(function(){ return 1; }, 3, 3, 3, 3)[0][0][0][0], 1, '4D array');
    test.done();
};

exports.list = function(test){
    // TODO
    test.done();
};

exports.list = function(test){
    // TODO
    test.done();
};
