(function ($) {
    var defaults = {
        approach:   0,
        overtravel: 0
    };

    /*
        Trigger appropriate events when the selected element is scrolled in or
        out of view.

        An element is considered to be in view if the length of document
        scrolled is greater than or equal to the offset of the element relative
        to the top of the document and within the vertical span of the element.
        (its height).

        Vertical span of the element can be modified by adding required
        'approach' and 'overtravel' length.

        Events:

            enter.scrollspy:

                When the selected element scrolls into the view.

            leave.scrollspy:

                When the selected element scrolls out of the view.

        Options:

            approach:

                Extend vertical span of the element from top.  It can be
                positive or negative.

            overtravel:

                Extend vertical span of the element from bottom.  It can be
                positive or negative.

            The terminology: approach and overtravel, are borrowed from
            Machining :).

        Usage:

            $('.resultn').scrollspy();

    */
    $.fn.scrollspy = function (options) {
        var elements = this;
        options = $.extend({}, defaults, options);

        $(window).scroll(function () {
            var scrolled = $(this).scrollTop();

            elements.each(function () {
                var element = $(this);

                //compute threshold
                var start = element.offset().top - options.approach;
                var end   = start + element.height() + options.overtravel;

                if (scrolled >= start && scrolled <= end) {
                    element.trigger('enter.scrollspy');
                }
                else {
                    element.trigger('leave.scrollspy');
                }
            });
        });

        return this;
    };
}(jQuery));
