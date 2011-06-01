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

$(document).ready(function(){
    $("fieldset.advanced span").click(function(event){
        //toggle display of advanced options when "Advanced parameters" text is
        //clicked
        $(this).siblings("pre").toggle("fast");
    });

    $("input#advanced").click(function(event){
        //but for input box toggling might get annoying
        $(this).next("pre").show("fast");
    });

    $("input#advanced").enablePlaceholder({"withPlaceholderClass": "greytext"});
    $("textarea#sequence").enablePlaceholder({"withPlaceholderClass": "greytext"});

    //For the sequence input box we handle cut, paste, and keydown events. Cut,
    //and paste events take care of all possible ways to cut/paste text; with
    //keydown alone we could only have dealt with Ctrl-X, and Ctrl-V.

    $("#sequence").bind("paste", function(event){
        var element = $(this);

        //the pasted text isn't immediately set as the value of the textbox,
        //so we trigger sequence detection after 10ms
        setTimeout(function(){
            var seq = element.val();
            var seq_type;
            $.post('/ajax', {sequence: seq}, function(data){
                seq_type = data;
                if (seq_type == "nucleotide"){
                    $("#blastp, #tblastn").disable();
                }
                else if (seq_type == "protein"){
                    $("#blastn, #tblastx, #blastx").disable();
                }
            });
        }, 10);
    });

    $('#sequence').keydown(function(event){
        var element = $(this);

        setTimeout(function(){
            var seq = element.val();

            //if the sequence has been deleted, we reset the disabled blast
            //method's radio button, else we redo sequence detection and
            //disable incompatible blast methods
            if (seq == ''){
                //TODO: actually this just checks if the textbox is empty, and not
                //that it has been emptied, so this will be triggered on any
                //keypress even if the textbox is empty
                $('.blastmethods input[type=radio]').filter(':disabled').enable();
                $('.blastmethods input[type=radio]').filter(':checked').uncheck();
                $('.databases input[type=checkbox]').filter(':disabled').enable();
                $('.databases input[type=checkbox]').filter(':checked').uncheck();
            }
            //TODO: maybe take care of some other (special) keystrokes too
            else{
                //TODO: we should probably optimize triggering query detection here
                $.post('/ajax', {sequence: seq}, function(data){
                  seq_type = data;
                  if (seq_type == "nucleotide"){
                      $("#blastp, #tblastn").disable();
                  }
                  else if (seq_type == "protein"){
                      $("#blastn, #tblastx, #blastx").disable();
                  }
                });
            }
        }, 10);
    });

    $("#sequence").bind("cut", function(event){
        //store the matched element
        var element = $(this);

        setTimeout(function(){
            var seq = element.val();
            if (seq == ''){
                //TODO: actually this just checks if the textbox is empty, and not
                //that it has been emptied, so this will be triggered on any
                //keypress even if the textbox is empty
                $('.blastmethods input[type=radio]').filter(':disabled').enable();
                $('.blastmethods input[type=radio]').filter(':checked').uncheck();
                $('.databases input[type=checkbox]').filter(':disabled').enable();
                $('.databases input[type=checkbox]').filter(':checked').uncheck();
            }
        }, 10);
    });

    //when a blast method is selected
    $('#blastp, #blastx, #blastn, #tblastx, #tblastn').change(function(event){
        //we first reset all disabled database check boxes
        $('.databases input[type=checkbox]').filter(':disabled').enable();
        $('.databases input[type=checkbox]').filter(':checked').uncheck();

        //then find the selected blast method
        var method = $('.blastmethods input[type=radio]').filter(':checked').val();

        //and accordingly disable incompatible databases
        if (method == 'blastx' || method == 'blastp'){
            $('.databases.nucleotide input[type=checkbox]').disable();
        }
        else if (method == 'blastn' || method == 'tblastx' || method == 'tblastn'){
            $('.databases.protein input[type=checkbox]').disable();
        }
    });
});

