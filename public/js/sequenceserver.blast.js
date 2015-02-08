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

        database_type_changed:
            When a user selects one type of database (nucleotide or protein) over the other.

        blast_method_changed:
            When the change in input parameters lead to a change in the preferred blast method.

    TODO: should (probably) access UI objects through some sort of interface
*/
SS.blast = (function () {
    /* private methods */

    // TODO: embedding magic numbers in the code is bad
    // TODO: magic numbers in JS and Ruby should be in sync
    var guess_sequence_type = function (sequence) {
        // remove 'noisy' characters
        sequence = sequence.replace(/[^A-Z]/gi, ''); // non-letter characters
        sequence = sequence.replace(/[NX]/gi,   ''); // ambiguous  characters

        // can't determine the type of ultrashort queries
        if (sequence.length < 10) { return undefined; }

        var putative_NA_count, threshold, i;
        putative_NA_count = 0;
        threshold = 0.9 * sequence.length;

        // count the number of putative NA
        for (i = 0; i < sequence.length; i++) {
            if (sequence[i].match(/[ACGTU]/i)) {
                putative_NA_count += 1;
            }
        }

        return putative_NA_count > threshold ? 'nucleotide' : 'protein';
    };

    var type_of_sequences = function () {
        var sequences = $('#sequence').val().split(/>.*/);
        var type, tmp, i;

        for (i = 0; i < sequences.length; i++) {
            tmp = guess_sequence_type(sequences[i]);

            // could not guess the sequence type; try the next sequence
            if (!tmp) { continue; }

            if (!type) {
              // successfully guessed the type of atleast one sequence
              type = tmp;
            }
            else if (tmp !== type) {
              // user has mixed different type of sequences
              return 'mixed';
            }
        }

        return type;
    };

    /* */
    var type_of_databases = function () {
        return $('.databases input:checked').data('type');
    };

    /*
        check if blast is valid (sufficient input to blast or not)
    */
    var required_params_present = function () {
        // must enter a query
        if (!$('#sequence').val()) {
            return false;
        }

        // must select atleast one database
        if (!$('.databases input:checked').val()) {
            return false;
        }

        // everything good
        return true;
    };

    /**
     * Determine input sequence type, and trigger 'sequence_type_changed' event
     * if the input sequence type has changed, or cannot be determined.
     */
    var signal_sequence_type_changed = function () {
        var type, _type;

        $('#sequence').change(function () {
            _type = type_of_sequences();

            if (!_type || _type !== type) {
                type = _type;

                //notify listeners
                $(this).trigger('sequence_type_changed', type);
            }
        });
    };

    /* determine */
    var signal_database_type_changed = function () {
        var type = type_of_databases(), tmp;

        $('.databases input').change(function () {
            tmp = type_of_databases();

            if (tmp != type) {
                type = tmp;

                //notify listeners
                $(this).trigger('database_type_changed', type);
            }
        });
    };

    /**
     * Triggers 'blast_method_changed' event if BLAST algorithms that can be
     * used for the user input have changed.
     */
    var signal_blast_method_changed = function () {
        var method, _method;

        $('#blast').on('sequence_type_changed database_type_changed',
            function (event) {
                  _method = determine_blast_method();

                  if (!_.isEqual(_method, method)) {
                      method = _method;

                      //notify listeners
                      $(this).trigger('blast_method_changed', [method.slice()]);
                  }
            });
    };

    /**
     * Returns name of BLAST algorithms that can be used for the input query
     * and selected database combination.
     *
     * Returns empty array if no BLAST algorithm is appropriate for the user
     * input.
     */
    var determine_blast_method = function () {
        if (!required_params_present()) {
            return [];
        }

        var database_type = type_of_databases();
        var sequence_type = type_of_sequences();

        //database type is always known
        switch (database_type) {
            case 'protein':
                switch (sequence_type) {
                    case undefined:
                        return ['blastp', 'blastx'];
                    case 'protein':
                        return ['blastp'];
                    case 'nucleotide':
                        return ['blastx'];
                }
                break;
            case 'nucleotide':
                switch (sequence_type) {
                    case undefined:
                        return ['tblastn', 'blastn', 'tblastx'];
                    case 'protein':
                        return ['tblastn'];
                    case 'nucleotide':
                        return ['blastn', 'tblastx'];
                }
                break;
        }

        return [];
    };

    /* public interface */

    var blast = function () {
        return undefined;
    };

    blast.init = function () {
        signal_sequence_type_changed();
        signal_database_type_changed();
        signal_blast_method_changed();
    };

    return blast;
}());
