SS.generateGraphicalOverview = function () {
    $("[data-graphit='overview']").each(function () {
        var $this = $(this);
        var $graphDiv = $('<div/>').addClass('graphical-overview');
        $this.children().eq(1).children().eq(0).before($graphDiv);

        $.graphIt($this, $graphDiv, 0, 20);
    });
};

SS.updateDownloadFastaOfAllLink = function () {
    var num_hits = $('.hitn').length;

    var $a = $('.download-fasta-of-all');
    if (num_hits >= 1 && num_hits <= 30) {
        var sequence_ids = $('.hitn :checkbox').map(function() {
            return this.value;
        }).get();
        $a
        .enable()
        .attr('href', SS.generateURI(sequence_ids, $a.data().databases))
        .tooltip({
            title: num_hits + " hit(s)."
        });
        return;
    }

    if (num_hits === 0) {
        $a.tooltip({
            title: "No hit to download."
        });
    }

    if (num_hits > 30) {
        $a.tooltip({
            title: "Can't download more than 30 hits."
        });
    }

    $a
    .disable()
    .removeAttr('href');
};

/* Update the FASTA downloader button's state appropriately.
    *
    * When more than 30 hits are obtained, the link is disabled.
    * When no hits are obtained, the link is not present at all.
    */
SS.updateDownloadFastaOfSelectedLink = function () {
    var num_checked  = $('.hitn :checkbox:checked').length;

    var $a = $('.download-fasta-of-selected');
    var $n = $a.find('span');

    if (num_checked >= 1 && num_checked <= 30) {
        var sequence_ids = $('.hitn :checkbox:checked').map(function () {
            return this.value;
        }).get();

        $a
        .enable()
        .attr('href', SS.generateURI(sequence_ids, $a.data().databases))
        .tooltip({
            title: num_checked + " hit(s) selected."
        })
        .find('span').html(num_checked);
        return;
    }

    if (num_checked === 0) {
        $n.empty();
        $a.tooltip({
            title: "No hit selected."
        });
    }

    if (num_checked > 30) {
        $a.tooltip({
            title: "Can't download more than 30 hits."
        });
    }

    $a
    .disable()
    .removeAttr('href');
};

SS.updateSequenceViewerLinks = function () {
    var MAX_LENGTH = 10000;

    $('.view-sequence').each(function () {
        var $this = $(this);
        var $hitn = $this.closest('.hitn');
        if ($hitn.data().hitLen > MAX_LENGTH) {
            $this
            .disable()
            .removeAttr('href')
            .tooltip({
                title: 'Sequence too long to show. Please view it ' +
                        'locally after download.'
            });
        }
    });
};

SS.setupDownloadLinks = function () {
    $('.download').on('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (event.target.disabled) return;

        var url = this.href;
        $.get(url)
        .done(function (data) {
            window.location.href = url;
        })
        .fail(function (jqXHR, status, error) {
            SS.showErrorModal(jqXHR, function () {});
        });
    });
};

SS.generateURI = function (sequence_ids, database_ids) {
    // Encode URIs against strange characters in sequence ids.
    sequence_ids = encodeURIComponent(sequence_ids.join(' '));
    database_ids = encodeURIComponent(database_ids);

    var url = "get_sequence/?sequence_ids=" + sequence_ids +
        "&database_ids=" + database_ids + '&download=fasta';

    return url;
};

/**
 * Highlight hit div corresponding to given checkbox and update bulk download
 * link.
 */
SS.selectHit = function (checkbox) {
    if (!checkbox || !checkbox.value) return;

    var $hitn = $($(checkbox).data('target'));

    // Highlight selected hit and sync checkboxes if sequence viewer is open.
    if(checkbox.checked) {
        $hitn
        .addClass('glow')
        .find(":checkbox").not(checkbox).check();
    } else {
        $hitn
        .removeClass('glow')
        .find(":checkbox").not(checkbox).uncheck();
    }

    this.updateDownloadFastaOfSelectedLink();
};

SS.showSequenceViewer = (function () {

    var $viewer = $('#sequence-viewer');
    var $spinner = $('.spinner', $viewer);
    var $viewerBody = $('.modal-body', $viewer);
    var $viewerFooter = $('.modal-footer', $viewer);

    var widgetClass = 'biojs-vis-sequence';

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

    var showSequences = function (error_msgs, sequences) {
        error_msgs.forEach(renderErrorMsg);
        sequences.forEach(renderSequence);
    };

    var renderSequence = function (sequence) {
        // generate html template
        var header = sequence.id + "<small>&nbsp;" + sequence.title + "</small>";
        var widgetId = widgetClass + (new Date().getUTCMilliseconds());

        $viewerBody
        .append(
            $('<div/>')
            .addClass('fastan')
            .append(
                $('<div/>')
                .addClass('page-header')
                .append(
                    $('<h4/>')
                    .html(header)
                ),
                $('<div/>')
                .attr('id', widgetId)
                .addClass(widgetClass)
                .addClass('page-content')
            )
        );

        // attach BioJS sequence viewer
        var widget = new Sequence({
            sequence: sequence.value,
            target: widgetId,
            format: 'PRIDE',
            columns: {
                size: 40,
                spacedEach: 5
            },
            formatOptions: {
                title: false,
                footer: false
            }
        });
        widget.hideFormatSelector();
    };

    var renderErrorMsg = function (error_msg) {
        $viewerBody
        .append(
            $('<div/>')
            .addClass('page-header')
            .append(
                $('<h4/>')
                .html(error_msg[0])
            ),
            $('<div/>')
            .addClass('page-content')
            .append(
                $('<pre/>')
                .addClass('pre-reset')
                .html(error_msg[1])
            ),
            $('<br>')
        );
    };

    return function (clicked) {
        var $clicked = $(clicked);
        initViewer($clicked);

        var url = $clicked.attr('href');
        $.getJSON(url)
        .done(function (response) {
            showSequences(response.error_msgs, response.sequences);
            $spinner.hide();
        })
        .fail(function (jqXHR, status, error) {
            SS.showErrorModal(jqXHR, function () {
                $viewer.modal('hide');
            });
        });
    };
}());

$(function () {

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
        if (!event.target.disabled)
            SS.showSequenceViewer(event.target);
    });

    $(document).on('change', '.hitn :checkbox', function (event) {
        event.stopPropagation();
        SS.selectHit(this);
    });

    var fetch_and_show_results = function () {
        $.get(location.href + '.html', function (data, _, jqXHR) {
            if (jqXHR.status === 202) {
                setTimeout(fetch_and_show_results, 5000);
                return;
            }

            $('.result').html(data).show();

            // affix sidebar
            var $sidebar = $('.sidebar');
            if ($sidebar.length !== 0) {
                $sidebar.affix({
                    offset: {
                        top: $sidebar.offset().top
                    }
                })
                .width($sidebar.width());
            }

            SS.generateGraphicalOverview();

            SS.updateDownloadFastaOfAllLink();
            SS.updateDownloadFastaOfSelectedLink();
            SS.updateSequenceViewerLinks();
            SS.setupTooltips();
            SS.setupDownloadLinks();

            $('body').scrollspy({target: '.sidebar'});

            $('#spinner').modal('hide');
        });
    }

    $('#spinner').modal();
    fetch_and_show_results();
});
