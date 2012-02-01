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
        determine input sequence type, and trigger 'sequence_type_changed'
        event if the input sequence type has changed
    */
    var signal_sequence_type_changed = function () {
        var type, tmp;

        $('#sequence').change(function () {
            var that = $(this);

            //get input sequence type from the server
            $.post('', {sequence: that.val()}, function(tmp){
                if (tmp != type){
                    type = tmp;

                    //notify listeners
                    that.trigger('sequence_type_changed', type);
                }
            });
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
