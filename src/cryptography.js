// =================================================================================================
// Fermat.js | TODO
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    var LOWER_CASE = 'abcdefghijklmnopqrstuvwxyz';
    var UPPER_CASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var ENGLISH_FREQUENCY = {
        a: 0.08167, b: 0.01492, c: 0.02782, d: 0.04253, e: 0.12702, f: 0.02228, g: 0.02015,
        h: 0.06094, i: 0.06966, j: 0.00154, k: 0.00772, l: 0.04024, m: 0.02406, n: 0.06749,
        o: 0.07507, p: 0.01929, q: 0.00095, r: 0.05987, s: 0.06327, t: 0.09056, u: 0.02758,
        v: 0.00978, w: 0.02360, x: 0.00150, y: 0.01974, z: 0.00074
    };


    M.caesarCypher = function(msg, shift) {
        var cipher = '';

        for (var i = 0, len = msg.length; i < len; i++) {
            if (msg[i] >= 'a' && msg[i] <= 'z') {
                cipher = cipher + LOWER_CASE[(LOWER_CASE.indexOf(msg[i]) + shift) % 26];
            } else if (msg[i] >= 'A' && msg[i] <= 'Z') {
                cipher = cipher + UPPER_CASE[(UPPER_CASE.indexOf(msg[i]) + shift) % 26];
            } else {
                cipher = cipher + msg[i];
            }
        }

        return cipher;
    };


    // Apply Vigenere cipher shift to a string,
    M.vigenereCypher = function(msg, key) {

        var cipher = '';
        var shift = 0;
        var count = 0;  // Don't count spaces when iterating the key word
        var k = key.toLowerCase();

        for (var i = 0, len = msg.length, keyLen = k.length; i < len; i++) {
            // Grab shift for the current sequence of the key word
            shift = LOWER_CASE.indexOf(k[count % keyLen]);

            if (msg[i] >= 'a' && msg[i] <= 'z') {
                cipher = cipher + LOWER_CASE[(LOWER_CASE.indexOf(msg[i]) + shift) % 26];
                count++;
            }
            else if (msg[i] >= 'A' && msg[i] <= 'Z') {
                cipher = cipher + UPPER_CASE[(UPPER_CASE.indexOf(msg[i]) + shift) % 26];
                count++;
            }
            else {
                cipher = cipher + msg[i];
            }
        }

        return cipher;
    };


    // Returns the probability of a given letter in english
    M.letterFreqency = function(letter) {
        return ENGLISH_FREQUENCY[letter.toLowerCase()];
    };


    // Count Cipher letter frequency
    M.cipherLetterFreq = function(cipher) {
        var msg = cipher.toLowerCase();
        var freq = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

        for (var i = 0, len = msg.length; i < len; ++i) {
            if (msg[i] >= 'a' && msg[i] <= 'z') {
                freq[LOWER_CASE.indexOf(msg[i])]++;
            }
        }

        return freq;
    };

})();
