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

    // Starts with >.
    SS.FASTA_FORMAT = /^>/;

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
    };

    SS.generateGraphicalOverview = function () {
        $("[data-graphit='overview']").each(function () {
            $.graphIt(this, 0, 20);
        });
    };

    /* Update the FASTA downloader button's state appropriately.
     *
     * When more than 30 hits are obtained, the link is disabled.
     * When no hits are obtained, the link is not present at all.
     */
    SS.updateFaDownloader = function () {
        var $checkboxes = $('.hit-checkbox:checkbox'),
            $checked_boxes = $('.hit-checkbox:checkbox:checked');
            $a = $('.download-many-sequences');

        if (!$a.length) return;

        if ($checkboxes.length > 30 && $checked_boxes.length === 0) {
            $a.disable();
        }
        else {
            var sequence_ids = $checked_boxes.map(function () {
                return this.value;
            }).get();

            if (sequence_ids.length < 1) {
                sequence_ids = $checkboxes.map(function() {
                    return this.value;
                }).get();
            }

            $a.attr('href', SS.generateURI(sequence_ids, $a.data().databases));
        }
    };

    SS.generateURI = function (sequence_ids, database_ids) {
        // Encode URIs against strange characters in sequence ids.
        sequence_ids = encodeURIComponent(sequence_ids.join(' '));

        var url = "get_sequence/?sequence_ids=" + sequence_ids +
            "&database_ids=" + database_ids + '&download=fasta';

        return url;
    },

    SS.showErrorModal = function (jqXHR, beforeShow) {
        setTimeout(function () {
            beforeShow();
            if (jqXHR.responseText) {
                $("#error").html(jqXHR.responseText).modal();
            }
            else {
                $("#error-no-response").modal();
            }
        }, 500);
    },

    SS.init = function () {
        this.$sequence = $('#sequence');
        this.$sequenceFile = $('#sequence-file');
        this.$sequenceControls = $('.sequence-controls');

        this.$sequence.poll();

        SS.blast.init();
    };

}()); //end SS module

SS.showSequenceViewer = (function () {

    // Do not fetch and render sequences bigger than a threshold.
    var MAX_LENGTH = 10000;

    var $viewer = $('#fasta');
    var $viewerBody = $('.modal-body', $viewer);
    var $viewerFooter = $('.modal-footer', $viewer);

    var $spinner = $('#sequence-spinner');

    var initViewer = function ($clicked) {
        $viewerBody.empty();
        $viewerFooter.empty();

        initFooter($clicked);
        $spinner.show();
        $viewer.modal('show');
    };

    var initFooter = function ($clicked) {
        // Generate links in the footer.
        var links = $clicked.parent().clone();
        var viewSequenceLink = links.find('.view-sequence');
        var nextSeparator = $(viewSequenceLink[0].nextSibling);
        viewSequenceLink.remove();
        nextSeparator.remove();
        $viewerFooter.empty().append(links);
    };

    var showSequences = function (sequence_ids, sequences, databases) {
        // Inform user if number of sequences retrieved is more or less than requested for.
        if (sequence_ids.length != sequences.length) {
            showLessOrMoreSequencesRetrievedMessage(sequence_ids, sequences, databases);
        }

        // Render sequence.
        sequences.forEach(showSequence);
    };

    var showSequence = function (sequence) {
        // generate html template
        var header = sequence.id + "<small>&nbsp;" + sequence.title + "</small>";
        var sequenceDiv = sequence.id.replace(/[^\w\s]/gi, '');
        var counter = $('#' + sequenceDiv).length;

        // Give unique values to sequence.js target divs.
        if (counter > 0) {
          sequenceDiv = sequenceDiv + counter.toString();
        }

        $viewerBody
        .append(
            $('<div/>')
            .addClass('fastan')
            .append(
                $('<div/>')
                .addClass('page-header')
                .append(
                    $('<h4>')
                    .html(header)
                ),
                $('<div>')
                .attr('id', sequenceDiv)
                .addClass('sequence-js')
            )
        );

        // attach BioJS sequence viewer
        var widget = new Sequence({
            sequence: sequence.value,
            target: sequenceDiv,
            format: 'PRIDE',
            id: sequence.id,
            columns: {
                size: 50,
                spacedEach: 10
            },
            formatOptions: {
                title: false,
                footer: false
            }
        });
        widget.hideFormatSelector();
    };

    showLessOrMoreSequencesRetrievedMessage = function (sequence_ids, sequences, databases) {
        $viewerBody
        .append(
            $('<h4/>')
            .html("ERROR: incorrect number of sequences found."),
            $('<p/>')
            .html('You requested ' + sequence_ids.length +
                  ' sequence(s) with the following identifiers: <br>' +
                  '<code>' + sequence_ids.join(', ') + '</code> <br>' +
                  'from the following databases: <br>' +
                  '<code>' + databases.join(', ') + '</code> <br>' +
                  'but we found ' + sequences.length + ' sequence(s).'),
            $('<p/>')
            .html('This is likley due to a problem with how databases ' +
                  'are formatted.<strong> Please share this text with ' +
                  'the person managing this website so that the issue ' +
                  'can be resolved.'),
            $('<p/>')
            .html('If any sequences were retrieved, you ' +
                  'can find them below (but some may be incorrect, so ' +
                  'be careful!)')
        );
    };

    showSequenceTooLongMessage = function () {
        $viewerBody
        .append(
            $('<h4>')
            .html('<i class="fa fa-warning"></i> Sequence is too long to' +
                  ' show. Please view it locally after download.')
        );
    };

    return function (clicked) {
        var $clicked = $(clicked);
        initViewer($clicked);

        // Do not fetch and show sequence if sequence bigger than MAX_LENGTH.
        var $hitn = $clicked.closest('.hitn');
        if ($hitn.data().hitLen > MAX_LENGTH) {
            showSequenceTooLongMessage();
            $spinner.hide();
            return;
        }

        var url = $clicked.attr('href');
        $.getJSON(url)
        .done(function (response) {
            showSequences(response.sequence_ids, response.sequences, response.databases);
            $spinner.hide();
        })
        .fail(function (jqXHR, status, error) {
            SS.showErrorModal(jqXHR, function () {
                $viewer.modal('hide');
            });
        });
    };
}());

$(document).ready(function(){
    SS.init();

    var notification_timeout;

    // drag-and-drop code
    var tgtMarker = $('.dnd-overlay');
    var $sequence = $('#sequence');

    var dndError = function (id) {
        $('.dnd-error').hide();
        $('#' + id + '-notification').show();
        tgtMarker.effect('fade', 2500);
    };

    $(document)
    .on('dragenter', function (evt) {
        // Based on http://stackoverflow.com/a/8494918/1205465.
        // Contrary to what the above link says, the snippet below can't
        // distinguish directories from files. We handle that on drop.
        var dt = evt.originalEvent.dataTransfer;
        var isFile = dt.types && ((dt.types.indexOf &&  // Chrome and Safari
                                  dt.types.indexOf('Files') != -1) ||
                                  (dt.types.contains && // Firefox
                                   dt.types.contains('application/x-moz-file')));

        if (!isFile) { return; }

        $('.dnd-error').hide();
        tgtMarker.stop(true, true);
        tgtMarker.show();
        dt.effectAllowed = 'copy';
        if ($sequence.val() === '') {
            $('.dnd-overlay-overwrite').hide();
            $('.dnd-overlay-drop').show('drop', {direction: 'down'}, 'fast');
        }
        else {
            $('.dnd-overlay-drop').hide();
            $('.dnd-overlay-overwrite').show('drop', {direction: 'down'}, 'fast');
        }
    })
    .on('dragleave', '.dnd-overlay', function (evt) {
        tgtMarker.hide();
        $('.dnd-overlay-drop').hide();
        $('.dnd-overlay-overwrite').hide();
    })
    .on('dragover', '.dnd-overlay', function (evt) {
        evt.originalEvent.dataTransfer.dropEffect = 'copy';
        evt.preventDefault();
    })
    .on('drop', '.dnd-overlay', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();

        var textarea  = $('#sequence');
        var indicator = $('#sequence-file');
        textarea.focus();

        var files = evt.originalEvent.dataTransfer.files;
        if (files.length > 1) {
            dndError('dnd-multi');
            return;
        }

        var file = files[0];
        if (file.size > 10 * 1048576) {
            dndError('dnd-large-file');
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            var content = e.target.result;
            if (SS.FASTA_FORMAT.test(content)) {
                textarea.val(content);
                indicator.text(file.name);
                tgtMarker.hide();
            } else {
                // apparently not FASTA
                dndError('dnd-format');
            }
        };
        reader.onerror = function (e) {
            // Couldn't read. Means dropped stuff wasn't FASTA file.
            dndError('dnd-format');
        }
        reader.readAsText(file);
    });
    // end drag-and-drop

    SS.$sequence.change(function () {
        if (SS.$sequence.val()) {
            // Calculation below is based on -
            // http://chris-spittles.co.uk/jquery-calculate-scrollbar-width/
            var sequenceControlsRight = SS.$sequence[0].offsetWidth -
                SS.$sequence[0].clientWidth;
            SS.$sequenceControls.css('right', sequenceControlsRight + 17);
            SS.$sequenceControls.removeClass('hidden');
        }
        else {
            SS.$sequenceFile.empty();
            SS.$sequenceControls.addClass('hidden');
            SS.$sequence.parent().removeClass('has-error');
        }
    });

    // Handle clearing query sequences(s) when x button is pressed.
    $('#btn-sequence-clear').click(function (e) {
        $('#sequence').val("").focus();
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
        $(this).parent().removeClass('has-error');
        $('.notifications .active').hide().removeClass('active');

        if (type) {
            $('#' + type + '-sequence-notification').show('drop', {direction: 'up'}).addClass('active');

            notification_timeout = setTimeout(function () {
                $('.notifications .active').hide('drop', {direction: 'up'}).removeClass('active');
            }, 5000);

            if (type === 'mixed') {
                $(this).parent().addClass('has-error');
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
                $('.databases.nucleotide .checkbox').addClass('disabled');
                break;
            case 'nucleotide':
                $('.databases.protein input:checkbox').uncheck().disable();
                $('.databases.protein .checkbox').addClass('disabled');
                break;
            default:
                $('.databases input:checkbox').enable();
                $('.databases .checkbox').removeClass('disabled');
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

    // HACK to allow users to select names from hit headers

    $('.result').on('mousedown', ".hitn > .page-header > h4", function (event) {
        var $this = $(this);
        $this.on('mouseup mousemove', function handler(event) {
            if (event.type === 'mouseup') {
                // user wants to toggle
                $this.attr('data-toggle', 'collapse');
                $this.find('.fa-chevron-down').toggleClass('fa-rotate-270');
            } else {
                // user wants to select
                $this.attr('data-toggle', '');
            }
            $this.off('mouseup mousemove', handler);
        });
    });

    $('.result').on('click', '.view-sequence', function (event) {
        event.preventDefault();
        event.stopPropagation();
        SS.showSequenceViewer(event.target);
    });

    $('.result').on('change', '.hit-checkbox:checkbox', function (event) {
        var checkboxes = $('.hit-checkbox:checkbox').length,
            checked_boxes = $('.hit-checkbox:checkbox:checked').length,
            $a = $('.download-many-sequences'),
            text = $a.html();

        if (checked_boxes > 0 &&
            checked_boxes !== checkboxes) {
            $a.html(text.replace('all', 'selected'));
        }
        else {
            $a.html(text.replace('selected', 'all'));
        }

        // add and remove disabled class when user selects
        // more than 30 links or unselects all links
        if (checked_boxes > 0 && checked_boxes <= 30) {
            $a.enable();
        }
        else if ((checked_boxes === 0 && checkboxes > 30) ||
                checked_boxes > 30) {
            $a.disable();
        }

        if(this.checked) {
            $(this)
            .closest('.hitn')
            .css('background-color', '#fffff4');
        } else {
            $(this)
            .closest('.hitn')
            .css('background-color', "");
        }

        var sequence_ids = $('.hit-checkbox:checkbox:checked').map(function () {
            return this.value;
        }).get();

        if (sequence_ids.length < 1) {
            sequence_ids = $('.hit-checkbox:checkbox').map(function() {
                return this.value;
            }).get();
        }

        $a.attr('href', SS.generateURI(sequence_ids, $a.data().databases));

        event.stopPropagation();
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
            if ($index.length !== 0) {
                $index.affix({
                    offset: {
                        top: $index.offset().top
                    }
                })
                .width($index.width());
            }

            // affix query headers
            var $queries = $('.resultn > .page-header');
            $queries.each(function () {
                var $query = $(this);
                $query.affix({
                    offset: {
                        top: $query.offset().top
                    }
                })
                .on('affixed.bs.affix',     function (e) {
                    $('.download-many-sequences', e.target).show();
                })
                .on('affixed-top.bs.affix', function (e) {
                    if (!$(e.target).is($('.resultn:first > .page-header'))) {
                        $('.download-many-sequences', e.target).hide();
                    }
                })
                .width($query.width());
            });

            //jump to the results
            location.hash = hash;

            SS.generateGraphicalOverview();

            SS.updateFaDownloader();

            $('body').scrollspy({target: '.index-container'});

            $('#spinner').modal('hide');

        }).
          fail(function (jqXHR, status, error) {
            SS.showErrorModal(jqXHR, function () {
                $('#spinner').modal('hide');
            });
        });

        return false;
    });
});
