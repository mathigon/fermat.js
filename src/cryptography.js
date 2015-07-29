// ============================================================================
// Fermat.js | Cryptography
// (c) 2015 Mathigon
// ============================================================================



const LOWER_CASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPER_CASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const ENGLISH_FREQUENCY = {
    a: 0.08167, b: 0.01492, c: 0.02782, d: 0.04253, e: 0.12702, f: 0.02228,
    g: 0.02015, h: 0.06094, i: 0.06966, j: 0.00154, k: 0.00772, l: 0.04024,
    m: 0.02406, n: 0.06749, o: 0.07507, p: 0.01929, q: 0.00095, r: 0.05987,
    s: 0.06327, t: 0.09056, u: 0.02758, v: 0.00978, w: 0.02360, x: 0.00150,
    y: 0.01974, z: 0.00074
};

const ZEROS = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];


// -----------------------------------------------------------------------------
// CIPHER

function caesarCipher(msg, shift = 0) {
    let cipher = '';

    for (let l of msg) {
        if (l >= 'a' && l <= 'z') {
            cipher += LOWER_CASE[(LOWER_CASE.indexOf(l) + shift) % 26];
        } else if (l >= 'A' && l <= 'Z') {
            cipher += UPPER_CASE[(UPPER_CASE.indexOf(l) + shift) % 26];
        } else {
            cipher += l;
        }
    }

    return cipher;
}

function vigenereCipher(msg, key = '') {
    let cipher = '';
    let count = 0;
    let keyLength = key.length;
    key = key.toLowerCase();

    for (let l of msg) {
        // The shift changes after every iteration, based on the key word
        let shift = LOWER_CASE.indexOf(k[count % keyLength]);

        if (l >= 'a' && l <= 'z') {
            cipher += LOWER_CASE[(LOWER_CASE.indexOf(l) + shift) % 26];
            count++;
        } else if (l >= 'A' && l <= 'Z') {
            cipher += UPPER_CASE[(UPPER_CASE.indexOf(l) + shift) % 26];
            count++;
        } else {
            cipher += l;
        }
    }

    return cipher;
}


// -----------------------------------------------------------------------------
// FREQUENCY UTILITIES

function letterFreqency(letter) {
    return ENGLISH_FREQUENCY[letter.toLowerCase()];
}

function cipherLetterFreq(cipher) {
    let msg = cipher.toLowerCase();
    let freq = ZEROS.slice(0);

    for (let l of msg) {
        if (l >= 'a' && l <= 'z') {
            freq[LOWER_CASE.indexOf(l)] += 1;
        }
    }

    return freq;
}

// -----------------------------------------------------------------------------

export default {
    caesarCipher, vigenereCipher, letterFreqency, cipherLetterFreq
};

