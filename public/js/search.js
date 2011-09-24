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

$(document).ready(function(){
    var prev_seq = prev_seq_type = '';

    //main() is our ui workhorse; it constantly polls #sequence for a change in
    //the user input, and acts accordingly
    (function main(){
        setTimeout(function(){
          var seq, seq_type;
          seq = $('#sequence').val();

          //act only if user input has changed
          if (seq != prev_seq){
              prev_seq = seq;

              //get input sequence type from the server
              $.post('', {sequence: seq}, function(seq_type){
                  if (seq_type != prev_seq_type){
                      prev_seq_type = seq_type;

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
                          $('.blastmethods input[type=radio]').uncheck().enable().first().change();
                      }
                  }
              });
          }
          main();
        }, 100);
    })();

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
});
