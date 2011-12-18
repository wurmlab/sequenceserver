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
        determine input sequence type, store it, and trigger
        'sequence_type_changed' event if the input sequence has changed
        (TODO: the method is doing too much; split it)
    */
    var signal_sequence_type_changed = function () {
        var prev_seq = prev_seq_type = '';

        (function poll () {
            setTimeout(function (){
                var seq, seq_type;
                seq = $('#sequence').val();

                //act only if user input has changed
                if (seq != prev_seq){
                    prev_seq = seq;
                    $('#sequence').change();

                    //get input sequence type from the server
                    $.post('', {sequence: seq}, function(seq_type){
                        if (seq_type != prev_seq_type){
                            prev_seq_type = seq_type;

                            //store sequence type and notify listeners
                            $('#sequence').data('sequence_type', seq_type).trigger('sequence_type_changed');
                        }
                    });
                }
                poll();
              }, 100)
        }());
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
