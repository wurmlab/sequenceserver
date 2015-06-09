/**
 * Load necessary polyfills.
 */
$.webshims.polyfill('forms');

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

        database_type_changed:
            When a user selects one type of database (nucleotide or protein) over the other.

        blast_method_changed:
            When the change in input parameters lead to a change in the preferred blast method.

    TODO: should (probably) access UI objects through some sort of interface
*/
(function (SS) {
    // TODO: embedding magic numbers in the code is bad
    // TODO: magic numbers in JS and Ruby should be in sync
    var guess_sequence_type = function (sequence) {
        // remove 'noisy' characters
        sequence = sequence.replace(/[^A-Z]/gi, ''); // non-letter characters
        sequence = sequence.replace(/[NX]/gi,   ''); // ambiguous  characters

        // can't determine the type of ultrashort queries
        if (sequence.length < 10) { return undefined; }

        var putative_NA_count, threshold, i;
        putative_NA_count = 0;
        threshold = 0.9 * sequence.length;

        // count the number of putative NA
        for (i = 0; i < sequence.length; i++) {
            if (sequence[i].match(/[ACGTU]/i)) {
                putative_NA_count += 1;
            }
        }

        return putative_NA_count > threshold ? 'nucleotide' : 'protein';
    };

    var type_of_sequences = function () {
        var sequences = $('#sequence').val().split(/>.*/);
        var type, tmp, i;

        for (i = 0; i < sequences.length; i++) {
            tmp = guess_sequence_type(sequences[i]);

            // could not guess the sequence type; try the next sequence
            if (!tmp) { continue; }

            if (!type) {
              // successfully guessed the type of atleast one sequence
              type = tmp;
            }
            else if (tmp !== type) {
              // user has mixed different type of sequences
              return 'mixed';
            }
        }

        return type;
    };

    /* */
    var type_of_databases = function () {
        return $('.databases input:checked').data('type');
    };

    /*
        check if blast is valid (sufficient input to blast or not)
    */
    var required_params_present = function () {
        // must enter a query
        if (!$('#sequence').val()) {
            return false;
        }

        // must select atleast one database
        if (!$('.databases input:checked').val()) {
            return false;
        }

        // everything good
        return true;
    };

    /**
     * Determine input sequence type, and trigger 'sequence_type_changed' event
     * if the input sequence type has changed, or cannot be determined.
     */
    var signal_sequence_type_changed = function () {
        var type, _type;

        $('#sequence').change(function () {
            _type = type_of_sequences();

            if (!_type || _type !== type) {
                type = _type;

                //notify listeners
                $(this).trigger('sequence_type_changed', type);
            }
        });
    };

    /* determine */
    var signal_database_type_changed = function () {
        var type = type_of_databases(), tmp;

        $('.databases input').change(function () {
            tmp = type_of_databases();

            if (tmp != type) {
                type = tmp;

                //notify listeners
                $(this).trigger('database_type_changed', type);
            }
        });
    };

    /**
     * Triggers 'blast_method_changed' event if BLAST algorithms that can be
     * used for the user input have changed.
     */
    var signal_blast_method_changed = function () {
        var method, _method;

        $('#blast').on('sequence_type_changed database_type_changed',
            function (event) {
                  _method = determine_blast_method();

                  if (!_.isEqual(_method, method)) {
                      method = _method;

                      //notify listeners
                      $(this).trigger('blast_method_changed', [method.slice()]);
                  }
            });
    };

    /**
     * Returns name of BLAST algorithms that can be used for the input query
     * and selected database combination.
     *
     * Returns empty array if no BLAST algorithm is appropriate for the user
     * input.
     */
    var determine_blast_method = function () {
        if (!required_params_present()) {
            return [];
        }

        var database_type = type_of_databases();
        var sequence_type = type_of_sequences();

        //database type is always known
        switch (database_type) {
            case 'protein':
                switch (sequence_type) {
                    case undefined:
                        return ['blastp', 'blastx'];
                    case 'protein':
                        return ['blastp'];
                    case 'nucleotide':
                        return ['blastx'];
                }
                break;
            case 'nucleotide':
                switch (sequence_type) {
                    case undefined:
                        return ['tblastn', 'blastn', 'tblastx'];
                    case 'protein':
                        return ['tblastn'];
                    case 'nucleotide':
                        return ['blastn', 'tblastx'];
                }
                break;
        }

        return [];
    };

    var blast = function () {
        return undefined;
    };

    SS.init_search_form = function () {
        this.$sequence = $('#sequence');
        this.$sequenceFile = $('#sequence-file');
        this.$sequenceControls = $('.sequence-controls');

        signal_sequence_type_changed();
        signal_database_type_changed();
        signal_blast_method_changed();
    };

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

    /**
     * Pre-check the only active database checkbox.
     */
    SS.onedb = function () {
        var database_checkboxes = $(".databases input:checkbox");
        if (database_checkboxes.length === 1) {
            database_checkboxes.check();
        }
    };
}(SS));

$(document).ready(function(){
    SS.init_search_form();

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
        // Do not activate DnD if a modal is active.
        if ($.modalActive()) return;

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
        };
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
    });

    // Pre-select if only one database available.
    SS.onedb();

    // Show tooltip on BLAST button.
    $('#methods').tooltip({
        title: function () {
            var selected_databases = $(".databases input:checkbox:checked");
            if (selected_databases.length === 0) {
                return "You must select one or more databases above before" +
                       " you can run a search!";
            }
        }
    });
    $('#method').tooltip({
        title: function () {
            var title = "Click to BLAST or press Ctrl+Enter.";
            if ($(this).siblings().length !== 0) {
                title += " Click dropdown button on the right for other" +
                         " BLAST algorithms that can be used.";
            }
            return title;
        },
        delay: {
            show: 1000,
            hide: 0
        }
    });

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
                $('.databases.nucleotide input:checkbox').disable();
                $('.databases.nucleotide .checkbox').addClass('disabled');
                break;
            case 'nucleotide':
                $('.databases.protein input:checkbox').disable();
                $('.databases.protein .checkbox').addClass('disabled');
                break;
            default:
                $('.databases input:checkbox').enable();
                $('.databases .checkbox').removeClass('disabled');
                break;
        }
    });

    $('form').on('blast_method_changed', function (event, methods) {
        // reset
        $('#method')
        .disable().val('').html('blast');

        $('#methods')
        .removeClass('input-group')
        .children().not('#method').remove();

        // set
        if (methods.length > 0) {
            var method = methods.shift();

            $('#method')
            .enable().val(method).html(SS.decorate(method));

            if (methods.length >=1) {
                $('#methods')
                .addClass('input-group')
                .append
                (
                    $('<div/>')
                    .addClass('input-group-btn')
                    .append
                    (
                        $('<button/>')
                        .attr('type', 'button')
                        .addClass("btn btn-primary dropdown-toggle")
                        .attr('data-toggle', 'dropdown')
                        .append
                        (
                            $('<span/>')
                            .addClass('caret')
                        ),
                        $('<ul/>')
                        .addClass('dropdown-menu dropdown-menu-right')
                        .append
                        (
                            $.map(methods, function (method) {
                                return $('<li/>').html(SS.decorate(method));
                            })
                        )
                    )
                );
            }

            // jiggle
            $("#methods").wiggle();
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
        $("#methods").wiggle();
    });

    SS.$sequence.poll();
});
