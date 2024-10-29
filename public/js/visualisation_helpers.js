import _ from 'underscore';
import * as d3 from 'd3';
export function get_colors_for_evalue(evalue, hits) {
    var colors = d3.scaleLog()
        .domain([
            d3.min([1e-5, d3.min(hits.map(function (d) {
                if (parseFloat(d.evalue) === 0.0) return undefined;
                return d.evalue;
            }))]),
            d3.max(hits.map(function (d) {
                return d.evalue;
            }))
        ])
        .range([0,0.8]);
    var rgb = colors(evalue);
    return d3.hsl(20, 0.82 , rgb);
}

export function toLetters(num) {
    var mod = num % 26,
        pow = num / 26 | 0,
        out = mod ? String.fromCharCode(96 + mod) : (--pow, 'z');
    return pow ? toLetters(pow) + out : out;
}

export function getPrefix(str) {
    if (str.length === 0) return '';

    var lastChar = str.charAt(str.length - 1);
    return /[a-zA-Z]/.test(lastChar) ? lastChar : '';
}

/**
* Defines how ticks will be formatted.
 *
 * Examples: 200 aa, 2.4 kbp, 7.6 Mbp.
 *
 * Borrowed from Kablammo. Modified by Priyam based on https://github.com/mbostock/d3/issues/1722.
 */
export function tick_formatter(scale, seq_type) {
    const prefix = d3.format('~s')
    const suffixes = {amino_acid: 'aa', nucleic_acid: 'bp'};

    return function (d) {
        const formatted = prefix(d);

        return `${formatNumberUnits(formatted)}${suffixes[seq_type]}`;
    };
}

function extractSuffix(str) {
    const suffix = str.replace(/[0-9.]/g, '');
    const numericPart = d3.format('.2f')(parseFloat(str));

    return [parseFloat(numericPart), suffix];
}

export function formatNumberUnits(number, threshold = 0.95) {
    const [numericPart, suffix] = extractSuffix(number);
    const integerPart = Math.floor(numericPart);
    const fractionalPart = parseFloat((numericPart - integerPart).toFixed(2));

    // when fractionalPart more than the threshold round up
    // example:
    //  threshold 0.95
    //  2.95 -> 3
    //  2.94 -> 2.9
    const formatted = fractionalPart >= threshold ? integerPart + 1 : Math.floor(numericPart * 10) / 10;

    return `${formatted} ${suffix}`;
}

export function get_seq_type(algorithm) {
    var SEQ_TYPES = {
        blastn: {
            query_seq_type:   'nucleic_acid',
            subject_seq_type: 'nucleic_acid'
        },
        blastp: {
            query_seq_type:   'amino_acid',
            subject_seq_type: 'amino_acid'
        },
        blastx: {
            query_seq_type:   'nucleic_acid',
            subject_seq_type: 'amino_acid'
        },
        tblastx: {
            query_seq_type:   'nucleic_acid',
            subject_seq_type: 'nucleic_acid'
        },
        tblastn: {
            query_seq_type:   'amino_acid',
            subject_seq_type: 'nucleic_acid'
        }
    };
    return SEQ_TYPES[algorithm];
}

export function prettify_evalue(evalue) {
    var matches = evalue.toString().split('e');
    var base  = matches[0];
    var power = matches[1];

    if (power)
    {
        var s = parseFloat(base).toFixed(2);
        var element = '<span>'+s+' &times; 10<sup>'+power+'</sup></span>';
        return element;
    }
    else {
        if (!(base % 1==0))
            return parseFloat(base).toFixed(2);
        else
            return base;
    }
}
