(function ($) {
    var defaults = {
        threshold: 1
    };

    /*
        Generate an index from the selected elements and add to or replace it
        in the given container element.

        Events:

            add.index:

                After the index has been created and added to the container.

            remove.index:

                When an index on the selected element is removed.

        Options:

            threshold:

                Maximum number of elements selected with 'map' for which no
                index is to be created.  Or the index should be deleted if
                already exists.

            container:

                A jQuery selector.  The index is appended to or deleted from
                the container.

        Usage:

            $('.resultn').index({container: '.results'})

    */
    $.fn.index = function (options) {
        options = $.extend({}, defaults, options);
        var container = $(options.container);

        if (this.length > options.threshold) {
            var entries = this.map(function () {
                var id  = $(this).attr('id');
                var sid = (id.length > 25) ? (id.slice(0, 22) + ' ...') : id; // sid => short/display id :P
                return '<li><a href="#' + id + '" title="' + id + '">' + sid + '</a></li>';
            });

            var index = $('<ul class="index">' + entries.get().join('') + '</ul>');

            // remove previous index if any
            container.find('.index').remove();
            container.trigger('remove.index');

            // add the new one
            container.append(index);
            container.trigger('add.index', index);
        }
        else {
            // remove previous index if any
            container.find('.index').remove();
            container.trigger('remove.index');
        }

        return this;
    };
}(jQuery));
