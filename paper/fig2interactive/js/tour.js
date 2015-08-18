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
        .attr('href', 'get_sequence/sequenceserver-2_hits.fa')
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

$(function () {
    // Setup results.
    var $sidebar = $('.sidebar');
    if ($sidebar.length !== 0) {
        $sidebar.affix({
            offset: {
                top: $sidebar.offset().top
            }
        })
        .width($sidebar.width());
    }
    SS.setupTooltips();
    SS.setupDownloadLinks();
    SS.generateGraphicalOverview();
    SS.updateSequenceViewerLinks();

    // Tour helpers.
    var disableClick = function () {
        $('.backdrop').show();
    };

    var enableClick = function () {
        $('.backdrop').hide();
    };

    $('.backdrop').click(function () {
        alert('Sorry! Clicking elsewhere during the tour is not allowed.');
    });

    // The Tour. //

    // Setup.
    var tour = new Shepherd.Tour({
        defaults: {
            classes: 'shepherd-theme-arrows',
            scrollTo: false,
            when: {
                show: function () {
                    $(this.options.attachTo.element)
                    .addClass('tour-highlight');
                },
                hide: function () {
                    $(this.options.attachTo.element)
                    .removeClass('tour-highlight');
                }
            }
        }
    });

    // Steps.
    tour
    .addStep({
        attachTo: {
            element: $('.index-container')[0],
        },
        tetherOptions: {
            targetAttachment: 'top left',
            attachment: 'top right'
        },
        text:
            '<p>Index summarises the query and database information, and provides links to results for each query.</p>',
        buttons: [
            {
                text: 'Okay',
                action: tour.next
            }
        ]
    })
    .addStep({
        attachTo: {
            element: $('.index .active a')[0],
            on: 'left'
        },
        text:
            '<p>The query sequence for which results are being viewed is highlighted in bold.</p>',
        buttons: [
            {
                text: 'Okay',
                action: tour.next
            }
        ]
    })
    .addStep({
        attachTo: {
            element: $('.resultn')[0]
        },
        tetherOptions: {
            targetAttachment: 'top right',
            attachment: 'top left'
        },
        text:
            '<p>Results for the query <code>SI2.2.0_02806</code>.</p>',
        buttons: [
            {
                text: 'Okay',
                action: tour.next
            }
        ]
    })
    .addStep({
        attachTo: {
            element: $('.graphical-overview')[0],
            on: 'right'
        },
        tetherOptions: {
            targetAttachment: 'top right',
            attachment: 'top left'
        },
        text:
            '<p>For each query, the results include a graphical overview indicating how each database hit sequence aligns to the query sequence. Hovering over a hit will show its identifier and the alignment evalue in a tooltip. Clicking on the hit will jump to the corresponding alignment details.</p>',
        buttons: [
            {
                text: 'Show me',
                action: tour.next
            }
        ]
    })
    .addStep({
        attachTo: {
            element: $('.graphical-overview a')[2],
            on: 'right',
        },
        text: '<p>Try clicking me.</p>',
        buttons: [],
        when: $.extend({
            'before-show': function () {
                $(this.options.attachTo.element).on('click', tour.next);
                enableClick();
            },
            'before-hide': function () {
                disableClick();
                $(this.options.attachTo.element).off('click', tour.next);
            }
        }, tour.options.defaults.when)
    })
    .addStep({
        attachTo: {
            element: $('#Query_3_hit_3')[0]
        },
        tetherOptions: {
            targetAttachment: 'top right',
            attachment: 'top left'
        },
        text:
            '<p>Alignment details for the hit sequence <code>sp|Q868N5|VIT_APIME</code>.</p>',
        buttons: [
            {
                text: 'Continue',
                action: tour.next
            }
        ],
        when: $.extend({
            'before-hide': function () {
                // TODO: Will this work across browsers?
                history.back();
            }
        }, tour.options.defaults.when)
    })
    .addStep({
        attachTo: {
            element: $('.tabular-view')[0]
        },
        tetherOptions: {
            targetAttachment: 'top right',
            attachment: 'top left'
        },
        text: '<p>Additionally, details including alignment bitscore and e-value, as well as hit length are summarised in a table. Hits are numbered. Clicking on the hit will jump to the corresponding alignment details.</p>',
        buttons: [
            {
                text: 'Show me',
                action: tour.next
            }
        ]
    })
    .addStep({
        attachTo: {
            element: $('.tabular-view a')[0],
            on: 'right',
        },
        text: '<p>Try clicking me.</p>',
        buttons: [],
        when: $.extend({
            'before-show': function () {
                $(this.options.attachTo.element).on('click', tour.next);
                enableClick();
            },
            'before-hide': function () {
                disableClick();
                $(this.options.attachTo.element).off('click', tour.next);
            }
        }, tour.options.defaults.when)
    })
    .addStep({
        attachTo: {
            element: $('#Query_3_hit_1')[0]
        },
        tetherOptions: {
            targetAttachment: 'top right',
            attachment: 'top left'
        },
        text:
            '<p>Details for the hit sequence <code>sp|Q2VQM6|VIT2_SOLIN</code>.</p>',
        buttons: [
            {
                text: 'Continue',
                action: tour.next
            }
        ]
    })
    .addStep({
        attachTo: {
            element: $('.hsp')[0]
        },
        tetherOptions: {
            targetAttachment: 'top right',
            attachment: 'top left'
        },
        text: '<p>For each hit, the details of each alignment are shown.</p>',
        buttons: [
            {
                text: 'Okay',
                action: tour.next
            }
        ]
    })
    .addStep({
        attachTo: {
            element: $('.hit-links')[0],
            on: 'bottom',
        },
        text: '<p>Additionally, several links are provided to aid follow up analyses. The links are customisable: new links can be added (e.g., genome browser), and default links can be disabled.</p>',
        buttons: [
            {
                text: 'Okay',
                action: tour.next
            }
        ],
        when: $.extend({
            'before-show': enableClick,
            'before-hide': disableClick
        }, tour.options.defaults.when)
    })
    .addStep({
        attachTo: {
            element: $('#Query_3_hit_1_alignment .hit-links a:last-child')[0],
            on: 'bottom',
        },
        text: '<p>UniProt page for the hit. SequenceServer generates these by default for hit sequences with a UniProt identifier. You can click on the link and check it out.</p>',
        buttons: [
            {
                text: 'Okay',
                action: tour.next
            }
        ],
        when: $.extend({
            'before-show': enableClick,
            'before-hide': disableClick
        }, tour.options.defaults.when)
    })
    .addStep({
        attachTo: {
            element: $('#Query_3_hit_1_alignment .hit-links .download')[0],
            on: 'bottom',
        },
        text: '<p>Link to download the hit sequence in FASTA format. You can click on the link and check it out.</p>',
        buttons: [
            {
                text: 'Okay',
                action: tour.next
            }
        ],
        when: $.extend({
            'before-show': enableClick,
            'before-hide': disableClick
        }, tour.options.defaults.when)
    })
    .addStep({
        attachTo: {
            element: $('#Query_3_hit_1_alignment .hit-links .view-sequence')[0],
            on: 'bottom',
        },
        text: '<p>Link to view hit sequence. Try clicking on it.</p>',
        buttons: [],
        when: $.extend({
            'before-show': function () {
                $(this.options.attachTo.element).on('click', tour.next);
                enableClick();
            },
            'before-hide': function () {
                disableClick();
                $(this.options.attachTo.element).off('click', tour.next);
            }
        }, tour.options.defaults.when)
    })
    .addStep({
        attachTo: {
            element: $('#sequence-viewer .modal-dialog')[0]
        },
        tetherOptions: {
            targetAttachment: 'top right',
            attachment: 'top left'
        },
        text: '<p>Sequence viewer.</p>',
        buttons: [
            {
                text: 'Okay',
                action: tour.next
            }
        ],
        beforeShowPromise: function () {
            var deferred = $.Deferred();
            _.delay(deferred.resolve, 100);
            return deferred.promise();
        },
        when: $.extend({
            'before-hide': function () {
                $('#sequence-viewer').modal('hide');
            }
        }, tour.options.defaults.when)
    })
    .addStep({
        attachTo: {
            element: $('#Query_3_hit_1_alignment .hit-links label')[0],
            on: 'bottom',
        },
        text: '<p>Select a sequence for bulk download. Try clicking on it.</p>',
        buttons: [],
        when: $.extend({
            'before-show': function () {
                enableClick();
                $(document).on('change', '#Query_3_hit_1_alignment .hit-links :checkbox', tour.next);
            },
            'before-hide': function () {
                disableClick();
                $(document).off('change', '#Query_3_hit_1_alignment .hit-links :checkbox', tour.next);
            }
        }, tour.options.defaults.when)
    })
    .addStep({
        attachTo: {
            element: $('#Query_3_hit_1 .page-header')[0],
            on: 'bottom',
        },
        text: '<p>Hits can be folded/un-folded by clicking on the header.</p>',
        buttons: [],
        when: {
            'before-show': function () {
                $('#Query_3_hit_1 .page-content').on('hidden.bs.collapse', tour.next);
                enableClick();
            },
            'before-hide': function () {
                disableClick();
                $('#Query_3_hit_1 .page-content').off('hidden.bs.collapse', tour.next);
            }
        }
    })
    .addStep({
        attachTo: {
            element: $('#Query_3_hit_2_alignment .hit-links label')[0],
            on: 'bottom',
        },
        text: '<p>Let\'s select one more hit.</p>',
        buttons: [],
        when: $.extend({
            'before-show': function () {
                enableClick();
                $(document).on('change', '#Query_3_hit_2_alignment .hit-links :checkbox', tour.next);
            },
            'before-hide': function () {
                disableClick();
                $(document).off('change', '#Query_3_hit_2_alignment .hit-links :checkbox', tour.next);
            }
        }, tour.options.defaults.when)
    })
    .addStep({
        attachTo: {
            element: $('#Query_3_hit_2 .page-header')[0],
            on: 'bottom',
        },
        text: '<p>... and fold it away.</p>',
        buttons: [],
        when: {
            'before-show': function () {
                $('#Query_3_hit_2 .page-content').on('hidden.bs.collapse', tour.next);
                enableClick();
            },
            'before-hide': function () {
                disableClick();
                $('#Query_3_hit_2 .page-content').off('hidden.bs.collapse', tour.next);
            }
        }
    })
    .addStep({
        attachTo: {
            element: $('.downloads-container')[0],
            on: 'left',
        },
        text: '<p>Finally, you can download the results in a variety of formats. Hovering over each link provides a description of the data.</p>',
        buttons: [
            {
                text: 'Okay',
                action: tour.next
            }
        ],
        when: $.extend({
            'before-show': enableClick,
            'before-hide': disableClick
        }, tour.options.defaults.when)
    });

    // Start.
    var welcome = $('#tour-welcome');
    welcome.on('hidden.bs.modal', _.bind(tour.start, tour));
    welcome.modal('show');

    // Complete.
    tour.on('complete', function () {
        $('#tour-complete').modal('show');
    });
});
