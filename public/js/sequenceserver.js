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

(function ($) {
    //pass `null` to unset
    $.fn.set_blast_method = function (name) {
        var value = name || '';
        var name  = name || 'blast';
        var tokens = name.split('blast');
        this.val(value).children('span.highlight').each(function (i) {
            $(this).text(tokens[i]);
        });
    };
})(jQuery);

(function ($) {
    $.fn.poll = function () {
        var that, val, tmp;

        that = this;

        (function ping () {
            tmp = that.val();

            if (tmp != val){
                val = tmp;
                that.change();
            }

            setTimeout(ping, 100);
        }());

        return this;
    };
}(jQuery));

/*
    SS - SequenceServer's JavaScript module

    Define a global SS (acronym for SequenceServer) object containing the
    following methods:

        main():
            Initializes SequenceServer's various modules.
*/

//define global SS object
var SS;
if (!SS) {
    SS = {};
}

//SS module
(function () {

    /*
        ask each module to initialize itself
    */
    SS.main = function () {
        SS.blast.init();
    }
}()); //end SS module

$(document).ready(function(){
    // poll the sequence textbox for a change in user input
    $('#sequence').poll();

    // start SequenceServer's event loop
    SS.main();
    $('#method').disable();
    $('#methods').removeClass('btn-group').children('.dropdown-toggle').hide();

    $('.results').hide();

    $('#sequence').on('sequence_type_changed', function (event, type) {
        //protein sequences can't be translated
        switch (type){
            case 'nucleotide':
                $('#translate-sequence').removeClass('invisible');
                break;
            default:
                $('#translate-sequence').addClass('invisible');
        }
    });

    $('.databases').on('database_type_changed', function (event, type) {
        switch (type) {
            case 'protein':
                $('.databases.nucleotide input:checkbox').uncheck().disable();
                break;
            case 'nucleotide':
                $('.databases.protein input:checkbox').uncheck().disable();
                break;
            default:
                $('.databases input:checkbox').enable();
                break;
        }
    });

    $('form').on('blast_method_changed', function (event, methods){
        if (methods) {
            var method = methods.shift();

            $('#method').enable().set_blast_method(method);

            if (methods.length >=1) {
                $('#methods').addClass('btn-group').
                    children('.dropdown-toggle').show().
                    siblings('.dropdown-menu').children('li').
                    each(function (i){
                        $(this).text(methods[i]);
                    }).
                    click(function (event) {
                        var old    = $('#method').text();
                        var method = $(this).text();

                        //swap
                        $(this).text(old);
                        $('#method').set_blast_method(method);

                        event.preventDefault();
                    });
            }
        }
        else {
            $('#method').disable().set_blast_method(null);
            $('#methods').removeClass('btn-group').children('.dropdown-toggle').hide();
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

    $('#blast').submit(function(){
        //parse AJAX URL
        var action = $(this).attr('action');
        var index  = action.indexOf('#');
        var url    = action.slice(0, index);
        var hash   = action.slice(index, action.length);

        var button = $(this).find('#method');

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
        var data = ($(this).serialize() + '&method=' + $('#method').val());
        $.post(url, data).
          done(function (data) {
            // BLASTed successfully

            // display the result
            $('.results').show();
            $('#result').html(data);

            //generate index
            $('.resultn').index({container: '.results'});

            //jump to the results
            location.hash = hash;

            $('#result').
                scrollspy().
                on('enter.scrollspy', function () {
                    $('.index').removeAttr('style');
                }).
                on('leave.scrollspy', function () {
                    $('.index').css({position: 'absolute', top: $(this).offset().top});
                });

            $('.resultn').
                scrollspy({
                    approach: screen.height / 4
                }).
                on('enter.scrollspy', function () {
                    var id = $(this).attr('id');
                    $('.index').find('a[href="#' + id + '"]').parent().highlight();

                    return false;
                }).
                on('leave.scrollspy', function () {
                    var id = $(this).attr('id');
                    $('.index').find('a[href="#' + id + '"]').parent().unhighlight();

                    return false;
                });
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
      $('.resultn').each(function() {
        var scrolled = $(window).scrollTop();
        var start    = $(this).offset().top   - screen.height/4;
        var end      = start + $(this).height();

        if (scrolled > start && scrolled < end){
          $(this).highlight();
        }
        else {
          $(this).unhighlight();
        }
      });
    });

    $('.results').
        on('add.index', function (event, index) {
            // make way for index
            $('#result').css({width: '660px'});

            $(index).addClass('box');
        }).
        on('remove.index', function () {
            $('#result').removeAttr('style');
        });
});
