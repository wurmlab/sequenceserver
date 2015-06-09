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
            placement: 'left'
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


    /**
     * Check's every 100 ms if an element's value has changed. Triggers
     * `change` event on the element if it has.
     */
    $.fn.poll = function () {
        var that = this;
        var val  = null;
        var newval;

        (function ping () {
            newval = that.val();

            if (newval != val){
                val = newval;
                that.change();
            }

            setTimeout(ping, 100);
        }());

        return this;
    };
}(jQuery));

/**
 * Define global SS object.
 */
var SS = {}

// Starts with >.
SS.FASTA_FORMAT = /^>/;

SS.setupTooltips = function () {
    $('.pos-label').each(function () {
        $(this).tooltip({
            placement: 'right'
        });
    });

    $('.downloads a').each(function () {
        $(this).tooltip();
    });
};

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
};
