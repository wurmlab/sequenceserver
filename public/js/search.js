(function( $ ){
    //toggle disabling of an html element
    $.fn.toggle_disabled = function() {
        return this.attr('disabled') ? this.removeAttr('disabled') : this.attr('disabled', 'disabled');
    };
})( jQuery );

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

    $("#sequence").bind("paste", function(event){
        //store the matched element
        var element = $(this);

        //the pasted text isn't immediately set as the value of the textbox,
        //so we trigger sequence detection after 10ms
        setTimeout(function(){
            var seq = element.val();
            var seq_type;
            $.post('/ajax', {sequence: seq}, function(data){
                seq_type = data;
                if (seq_type == "nucleotide"){
                    $("#blastp").attr('disabled', 'disabled');
                    $("#tblastn").attr('disabled', 'disabled');
                }
                else if (seq_type == "protein"){
                    $("#blastn").attr('disabled', 'disabled');
                    $("#tblastx").attr('disabled', 'disabled');
                    $("#blastx").attr('disabled', 'disabled');
                }
            });
        }, 10);
    });

    //when a blast method is selected
    $('#blastp, #blastx, #blastn, #tblastx, #tblastn').change(function(event){
        //we first reset all disabled database check boxes
        $('.databases input[type=checkbox]').filter(':disabled').enable();

        //then find the selected blast method
        var method = $('.blastmethods input[type=radio]').filter(':checked').val();

        //and accordingly disable incompatible databases
        if (method == 'blastx' || method == 'blastp'){
            $('.databases.nucleotide input[type=checkbox]').toggle_disabled();
        }
        else if (method == 'blastn' || method == 'tblastx' || method == 'tblastn'){
            $('.databases.protein input[type=checkbox]').disable();
        }
    });
});

