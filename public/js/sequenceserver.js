import 'jquery';
import 'jquery-ui';
import 'bootstrap';
import 'webshim';

import React from 'react';
import Router from 'react-router';

import {Page as Search} from './search';
import {Page as Report} from './report';

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;

/**
 * Simple, small jQuery extensions for convenience.
 */
(function ($) {
    /**
     * Disable an element.
     *
     * Sets `disabled` property to `true` and adds `disabled` class.
     */
    $.fn.disable = function () {
        return this.prop('disabled', true).addClass('disabled');
    };

    /**
     * Enable an element.
     *
     * Sets `disabled` property to `false` and removes `disabled` class
     * if present.
     */
    $.fn.enable = function () {
        return this.prop('disabled', false).removeClass('disabled');
    };

    /**
     * Check an element.
     *
     * Sets `checked` property to `true`.
     */
    $.fn.check = function () {
        return this.prop('checked', true);
    };

    /**
     * Un-check an element.
     *
     * Sets `checked` property to `false`.
     */
    $.fn.uncheck = function () {
        return this.prop('checked', false);
    };


    /**
     * Initialise Bootstrap tooltip on an element with presets. Takes title.
     */
    $.fn._tooltip = $.fn.tooltip;
    $.fn.tooltip  = function (options) {
        return this
        ._tooltip('destroy')
        ._tooltip($.extend({
            container: 'body',
            placement: 'left',
            delay: {
                show: 1000
            }
        }, options));
    };

    /**
     * Returns true / false if any modal is active.
     */
    $.modalActive = function () {
        var active = false;
        $('.modal').each(function () {
            var modal = $(this).data('bs.modal');
            if (modal) {
                active = modal.isShown;
                return !active;
            }
        });
        return active;
    };


    /**
     * Wiggle an element.
     *
     * Used for wiggling BLAST button.
     */
    $.fn.wiggle = function () {
        this.finish().effect("bounce", {
            direction: 'left',
            distance: 24,
            times: 4,
        }, 250);
    };
}(jQuery));

SequenceServer = React.createClass({

    // Class methods. //

    statics: {
        FASTA_FORMAT: /^>/,

        setupTooltips: function () {
            $('.pos-label').each(function () {
                $(this).tooltip({
                    placement: 'right'
                });
            });

            $('.downloads a').each(function () {
                $(this).tooltip();
            });
        },

        showErrorModal: function (jqXHR, beforeShow) {
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

        routes: function () {
            return (
                <Route handler={SequenceServer}>
                    <Route path="/"     handler={Search}/>
                    <Route path="/:jid" handler={Report}/>
                </Route>
            );
        },

        run: function () {
            Router.run(this.routes(), Router.HistoryLocation, function (Root) {
                React.render(<Root/>, document.getElementById("view"));
            });
        }
    },


    // Lifecycle methods. //

    render: function () {
        return (<RouteHandler/>);
    }
});

SequenceServer.run();
