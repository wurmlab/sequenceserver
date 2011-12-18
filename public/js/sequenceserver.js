//helpers methods to disable, enable, and uncheck radio buttons and checkboxes
(function( $ ){
    //disable an element
    $.fn.disable = function() {
        return this.attr('disabled', 'disabled');
    };
})( jQuery );

(function( $ ){
    //enable an element
    $.fn.enable = function() {
        return this.removeAttr('disabled');
    };
})( jQuery );

(function( $ ){
    //uncheck an element
    $.fn.uncheck = function() {
        return this.removeAttr('checked');
    };
})( jQuery );

(function( $ ){
    //check an element
    $.fn.check = function() {
        return this.attr('checked', 'checked');
    };
})( jQuery );

(function( $ ){
    //(pre-)check the only active database checkbox
    $.onedb = function(selector) {
        active_dbs = $(".databases input[type=checkbox]").not(":disabled")
        if (active_dbs.length == 1){
            active_dbs.check()
        }
        return active_dbs;
    };
})( jQuery );

(function( $ ){
    //highlight an element
    $.fn.highlight = function() {
        return this.addClass('focussed');
    };
})( jQuery );

(function( $ ){
    //unhighlight an element
    $.fn.unhighlight = function() {
        return this.removeClass('focussed');
    };
})( jQuery );

/*
    SS - SequenceServer's JavaScript module

    Define a global SS (acronym for SequenceServer) object containing the
    following methods:

        main():
            SequenceServer's main event loop. It watches for changes in user
            input and triggers appropriate SequenceServer specific events.


    SequenceServer defines the following events:

        sequence_type_changed:
            When the type (nucleotide or protein) of the input sequence changes.
*/

//define global SS object
var SS;
if (!SS) {
    SS = {};
}

//SS module
(function () {

    /* private methods */

    /* determine input sequence type, store it, and trigger
       sequence_type_changed' event if the input sequence has changed
       (TODO: the method is doing too much; split it)
    */
    var check_sequence_type = function () {
        var prev_seq = prev_seq_type = '';

        (function poll () {
            setTimeout(function (){
                var seq, seq_type;
                seq = $('#sequence').val();

                //act only if user input has changed
                if (seq != prev_seq){
                    prev_seq = seq;

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


    /* public methods */

    /* setup listeners for user input changes that trigger appropriate
       SequenceServer events
    */
    SS.main = function () {
        check_sequence_type();
    }
}()); //end SS module

$(document).ready(function(){
    // start SequenceServer's event loop
    SS.main();

    $('#sequence').bind('sequence_type_changed', function(){
        var seq_type = $(this).data('sequence_type');
        if (seq_type == "nucleotide"){
            $("#blastn, #tblastx, #blastx").enable();
            $("#blastp, #tblastn").uncheck().disable().first().change();
        }
        else if (seq_type == "protein"){
            $("#blastp, #tblastn").enable();
            $("#blastn, #tblastx, #blastx").uncheck().disable().first().change();
        }
        else if (seq_type == ""){
            //reset blast methods
            $('.blastmethods input[type=radio]').enable().first().change();
        }
    });

    $(".advanced label").click(function(event){
        //toggle display of advanced options when "Advanced parameters" text is
        //clicked
        $(".advanced .help").toggle("fast");

        //stop event propagation here; jQuery will call `click()` on input box
        //otherwise
        return false;
    });

    $(".advanced input").click(function(event){
        //but for input box toggling might get annoying
        $(".advanced .help").show("fast");
    });

    $("input#advanced").enablePlaceholder({"withPlaceholderClass": "greytext"});
    $("textarea#sequence").enablePlaceholder({"withPlaceholderClass": "greytext"});

    //when a blast method is selected
    $('#blastp, #blastx, #blastn, #tblastx, #tblastn').change(function(event){
        //then find the selected blast method
        var method = $('.blastmethods input[type=radio]').filter(':checked').val();

        //and accordingly disable incompatible databases
        if (method == 'blastx' || method == 'blastp'){
            $('.databases.nucleotide input[type=checkbox]').uncheck().disable();
            $('.databases.protein input[type=checkbox]').enable();
        }
        else if (method == 'blastn' || method == 'tblastx' || method == 'tblastn'){
            $('.databases.protein input[type=checkbox]').uncheck().disable();
            $('.databases.nucleotide input[type=checkbox]').enable();
        }
        else{
            $('.databases input[type=checkbox]').enable();
        }

        $.onedb();
    });

    $('input:submit').click(function(){
        var button = $(this);

        //prevent submitting another query while this one is being processed
        button.disable();

        //overlay div will contain the spinner
        $('body').append('<div id="overlay"></div>')

        //activate spinner to indicate query in progress
        $('#overlay').css({
           top:              '0px',
           left:             '0px',
           width:            '100%',
           height:           '100%',
           position:         'fixed',
           'z-index':        1000,
           'pointer-events': 'none',
        }).activity({
           segments: 8,
           length:   40,
           width:    16,
           speed:    1.8
        });

        // BLAST now
        $.post('', $('form').serialize()).
          done(function (data) {
            // BLASTed successfully

            // display the result
            $('#result').html(data);
            location.hash = '#result';
        }).
          fail(function (jqXHR, status, error) {
            // BLAST failed

            //alert user
            alert('BLAST failed: ' + error);
        }).
          always(function () {
            // BLAST complete (succefully or otherwise)

            // remove progress notification
            $('#overlay').activity(false).remove();

            // allow submitting a new query
            button.enable();
        });

        return false;
    });

    $(window).scroll(function() {
      var areaHeight = $(this).height();

      $('.resultn').each(function() {
        var scrolled = $(window).scrollTop();
        var start    = $(this).offset().top   - screen.height/2;
        var end      = start + $(this).height();

        if (scrolled > start && scrolled < end){
          $(this).highlight();
        }
        else {
          $(this).unhighlight();
        }
      });
    });
});
