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
    $.fn.poll = function () {
        var that, val, tmp;

        that = this;
        val  = that.val();

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

    SS.decorate = function (name) {
      return name.match(/(.?)(blast)(.?)/).slice(1).map(function (token, _) {
        if (token) {
            if (token !== 'blast'){
                return '<strong>' + token + '</strong>';
            }
            else {
              return token;
            }
        }
      }).join('');
    }

    SS.init = function () {
        this.$sequence = $('#sequence');
        this.$sequenceControls = $('.sequence-controls');

        this.$sequence.poll();

        SS.blast.init();
    }
}()); //end SS module

$(document).ready(function(){
    SS.init();

    var notification_timeout;

    SS.$sequence.change(function () {
        if (SS.$sequence.val()) {
            SS.$sequenceControls.removeClass('hidden');
        }
        else {
            SS.$sequenceControls.addClass('hidden');
        }
    });

    // Handle clearing query sequences(s) when x button is pressed.
    $('#btn-sequence-clear').click(function (e) {
        $('#sequence').val("");
    })

    // pre-select if only on db
    $.onedb();

    // Handles the form submission when Ctrl+Enter is pressed anywhere on page
    $(document).bind("keydown", function (e) {
        if (e.ctrlKey && e.keyCode === 13 && !$('#method').is(':disabled')) {
            $('#method').trigger('submit');
        }
    });

    $('#sequence').on('sequence_type_changed', function (event, type) {
        clearTimeout(notification_timeout);
        $(this).parent().parent().removeClass('has-error');
        $('.notifications .active').hide().removeClass('active');

        if (type) {
            $('#' + type + '-sequence-notification').show('drop', {direction: 'up'}).addClass('active');

            notification_timeout = setTimeout(function () {
                $('.notifications .active').hide('drop', {direction: 'up'}).removeClass('active');
            }, 5000);

            if (type === 'mixed') {
                $(this).parent().parent().addClass('has-error');
            }
        }
    });

    $('body').click(function () {
        $('.notifications .active').hide('drop', {direction: 'up'}).removeClass('active');
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
        // reset
        $('#methods .dropdown-menu').html('');
        $('#method').disable().val('').html('blast');
        $('#methods').removeClass('btn-group').children('.dropdown-toggle').hide();

        if (methods) {
            var method = methods.shift();

            $('#method').enable().val(method).html(SS.decorate(method));

            if (methods.length >=1) {
                $('#methods').addClass('btn-group').
                    children('.dropdown-toggle').show();

                var methods_list = $.map(methods, function (method, _) {
                    return "<li>" + SS.decorate(method) + "</li>";
                }).join('');

                $('#methods .dropdown-menu').html(methods_list);
            }

            // jiggle
            $("#methods").effect("bounce", { times:5, direction: 'left', distance: 12 }, 120);
        }
    });

    // The list of possible blast methods is dynamically generated.  So we
    // leverage event bubbling and delegation to trap 'click' event on the list items.
    // Please see : http://api.jquery.com/on/#direct-and-delegated-events

    $(document).on("click", "#methods .dropdown-menu li", function(event) {
        var clicked = $(this);
        var mbutton = $('#method');
        var old_method = mbutton.text();
        var new_method = clicked.text();

        // swap
        clicked.html(SS.decorate(old_method));
        mbutton.val(new_method).html(SS.decorate(new_method));

        // jiggle
        $("#methods").effect("bounce", { times:5, direction: 'left', distance: 12 }, 120);
    });

    $("input#advanced").enablePlaceholder({"withPlaceholderClass": "greytext"});
    $("textarea#sequence").enablePlaceholder({"withPlaceholderClass": "greytext"});

    $('.advanced pre').hover(function () {
        $(this).addClass('hover-focus');
    },
    function () {
        $(this).removeClass('hover-focus');
    });

    $('#blast').submit(function(){
        //parse AJAX URL
        var action = $(this).attr('action');
        var index  = action.indexOf('#');
        var url    = action.slice(0, index);
        var hash   = action.slice(index, action.length);

        // reset hash so we can always _jump_ back to result
        location.hash = '';

        // show activity spinner
        $('#spinner').modal();

        // BLAST now
        var data = ($(this).serialize() + '&method=' + $('#method').val());
        $.post(url, data).
          done(function (data) {
            // BLASTed successfully

            // display the result
            $('.result').html(data).show();

            // affix the index
            var $index = $('.index');
            $index.affix({
                offset: {
                    top: $index.offset().top
                }
            })
            .width($index.width());

            //jump to the results
            location.hash = hash;

            $("[data-graphit='overview']").each( function(i) {
                $.graphIt(this, 0, 20);
            });

            $('.more').on('click', function(e) {
                var howMany = 20;
                var pId = '#'+$(this).data().parentQuery;
                var start = $(pId).find('.ghit > g').length;
                if(start < 20) {
                    $(this).attr('disabled', 'disabled');
                    e.stopPropagation();
                }
                else {
                    $.graphIt((pId), start, howMany);
                    if(start+howMany >= $(pId).data().hitCount) {
                        $(this).attr('disabled', 'disabled');
                    }
                }
            });

            $('[data-toggle="tooltip"]').tooltip({
                'placement': 'top',
                'container': 'body',
                'html': 'true',
                'white-space': 'nowrap'
            });

            $('.resultn').
                scrollspy({
                    approach: screen.height / 4
                }).
                on('enter.scrollspy', function () {
                    var id = $(this).attr('id');
                    $(this).highlight();
                    $('.index').find('a[href="#' + id + '"]').parent().highlight();

                    return false;
                }).
                on('leave.scrollspy', function () {
                    var id = $(this).attr('id');
                    $(this).unhighlight();
                    $('.index').find('a[href="#' + id + '"]').parent().unhighlight();

                    return false;
                });

                $('a.link-fasta')
                .on('click', function (event) {
                    event.preventDefault();
                    var clicked = $(event.target);

                    var url = clicked.attr('href');
                    $.get(url)
                    .done(function (sequences) {
                        $('#fasta').html(sequences).modal();
                    })
                    .fail(function (jqXHR, status, error) {
                        //alert user
                        if (jqXHR.responseText) {
                            $("#error").html(jqXHR.responseText).modal();
                        }
                        else {
                            $("#error-no-response").modal();
                        }
                    });
                });
        }).
          fail(function (jqXHR, status, error) {
            //alert user
            if (jqXHR.responseText) {
                $("#error").html(jqXHR.responseText).modal();
            }
            else {
                $("#error-no-response").modal();
            }
        }).
          always(function () {
            // BLAST complete (succefully or otherwise)
            // remove progress notification
            $('#spinner').modal('hide');
        });

        return false;
    });
});
