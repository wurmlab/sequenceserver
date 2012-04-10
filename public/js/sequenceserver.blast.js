/*
    SequenceServer's BLAST module/method

    Adds `blast` method to `SS`.

    blast():
        not implemented

    `blast` defines the following methods:
        init():
           initialize `blast` object

    This module defines the following events:

        sequence_type_changed:
            When the type (nucleotide or protein) of the input sequence changes.

        blast_valid:
            If the current user input is sufficient to launch a BLAST

        blast_invalid:
            If the current user input is not sufficient to launch a BLAST

    TODO: should (probably) access UI objects through some sort of interface
*/
SS.blast = (function () {
    /* private methods */

    // TODO: embedding magic numbers in the code is bad
    // TODO: magic numbers in JS and Ruby should be in sync
    var guess_sequence_type = function (sequence) {
        var putative_NA_count, threshold, i;

        putative_NA_count = 0;

        // remove 'noisy' characters
        sequence = sequence.replace(/[^A-Z]/gi, '') // non-letter characters
        sequence = sequence.replace(/[NX]/gi,   '') // ambiguous  characters

        // guessing the type of a small sequence is unsafe
        if (sequence.length < 10) {
            return undefined
        }

        // count the number of putative NA
        for (i = 0; i < sequence.length; i++) {
            if (sequence[i].match(/[ACGTU]/i)) {
                putative_NA_count += 1;
            }
        }

        threshold = 0.9 * sequence.length

        return putative_NA_count > threshold ? 'nucleotide' : 'protein'
    }

    var type_of_sequences = function () {
        var sequences = $('#sequence').val().split(/>.*/)
        var type, tmp, i;

        for (i = 0; i < sequences.length; i++) {
            tmp = guess_sequence_type(sequences[i]);

            // could not guess the sequence type; try the next sequence
            if (!tmp) { continue }

            if (!type) {
              // successfully guessed the type of atleast one sequence
              type = tmp
            }
            else if (tmp !== type) {
              // user has mixed different type of sequences
              return undefined
            }
        }

        return type;
    }

    /*
        check if blast is valid (sufficient input to blast or not)
    */
    var is_valid = function () {
        // must enter a query
        if (!$('#sequence').val()) {
            return false;
        }

        // must select a blast method
        if (!$('.blastmethods input:checked').val()) {
            return false;
        }

        // must select atleast one database
        if (!$('.databases input:checked').val()) {
            return false;
        }

        // everything good
        return true;
    }

    /*
        signal blast's validity (sufficient input to blast or not)
    */
    var signal_blast_validity = function () {
        $('#sequence, .blastmethods, .databases').change(function () {
          if (is_valid()) {
              $('form').trigger('blast_valid');
          }
          else {
              $('form').trigger('blast_invalid');
          }
        });
    }

    /*
        determine input sequence type, and trigger 'sequence_type_changed'
        event if the input sequence type has changed
    */
    var signal_sequence_type_changed = function () {
        var type, tmp;

        $('#sequence').change(function () {
            tmp = type_of_sequences();

            if (tmp != type){
              type = tmp;

              //notify listeners
              $(this).trigger('sequence_type_changed', type);
            }
        });
    };


    /* public interface */

    var blast = function () {
        return undefined;
    }

    blast.init = function () {
        signal_sequence_type_changed();
        signal_blast_validity();
    }

    return blast;
}());
