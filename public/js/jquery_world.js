import $ from 'jquery';
import '../packages/jquery-ui@1.13.3';

global.$ = $;
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
     * Tooltip
     */
    $(document).tooltip({
        position: {
            my: 'center bottom-20',
            at: 'center top',
            using: function( position, feedback ) {
              $(this).css(position);
              $("<div>")
                .addClass("arrow")
                .addClass(feedback.vertical)
                .addClass(feedback.horizontal)
                .appendTo(this);
            }
        },
        items: 'rect',
        show: false,
        hide: false,
        content: function() {
            var title = $(this).attr('title');
            if (!title) return false;
            var parsedHTML = $.parseHTML(title);
            return parsedHTML;
        }
    });

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
        this.finish().effect('bounce', {
            direction: 'left',
            distance: 24,
            times: 4,
        }, 250);
    };
}(jQuery));