import React from 'react';

var Utils = {

    /**
     * Render URL for sequence-viewer.
     */
    a: function (link) {
        if (link.title && link.url)
        {
            return (
                <a href={link.url} className={link.class} target='_blank'>
                    {link.icon && <i className={"fa " + link.icon}></i>}
                    {" " + link.title + " "}
                </a>
            );
        }
    },


    /***********************************
     * Formatters for hits & hsp table *
     ***********************************/

    // Formats an array of two elements as "first (last)".
    format_2_tuple: function (tuple) {
        return (tuple[0] + " (" + tuple[tuple.length - 1] + ")");
    },

    /**
     * Returns fraction as percentage
     */
    inPercentage: function (num , den) {
        return `${(num * 100.0 / den).toFixed(2)}%`;
    },

    /**
     * Returns fractional representation as String.
     */
    inFraction: function (num , den) {
        return num + "/" + den;
    },

    /**
     * Returns given Float as String formatted to two decimal places.
     */
    inTwoDecimal: function (num) {
        return num.toFixed(2)
    },

    /**
     * Returns zero if num is zero. Returns two decimal representation of num
     * if num is between [1..10). Returns num in scientific notation otherwise.
     */
    inExponential: function (num) {
        // Nothing to do if num is 0.
        if (num === 0) {
            return 0
        }

        // Round to two decimal places if in the rane [1..10).
        if (num >= 1 && num < 10)
        {
            return this.inTwoDecimal(num)
        }

        // Return numbers in the range [0..1) and [10..Inf] in
        // scientific format.
        var exp = num.toExponential(2);
        var parts = exp.split("e");
        var base  = parts[0];
        var power = parts[1];
        return <span>{base} &times; 10<sup>{power}</sup></span>;
    }
};

export default Utils;
