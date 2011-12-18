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

    TODO: should (probably) access UI objects through some sort of interface
*/
SS.blast = (function () {
    /* private methods */

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
    }

    return blast;
}());
