import AlignmentExporter from '../alignment_exporter';

export const preventCollapseOnSelection = () => {
    $('body').on('mousedown', '.hit > .section-header > h4', function (event) {
        var $this = $(this);
        $this.on('mouseup mousemove', function handler(event) {
            if (event.type === 'mouseup') {
                // user wants to toggle
                var hitID = $this.parents('.hit').attr('id');
                $(`div[data-parent-hit=${hitID}]`).toggle();
                $this.find('i').toggleClass('fa-square-minus fa-square-plus');
                $($this.data('parent-id')).toggleClass('print:hidden');
            } else {
                // user wants to select
                $this.attr('data-toggle', '');
            }
            $this.off('mouseup mousemove', handler);
        });
    });
}

export const setupScrollSpy = ($) => {
    var sectionIds = $('a.side-nav');

    $(document).scroll(function(){
        sectionIds.each(function(){

            var container = $(this).attr('href');
            var containerOffset = $(container).offset().top;
            var containerHeight = $(container).outerHeight();
            var containerBottom = containerOffset + containerHeight;
            var scrollPosition = $(document).scrollTop();

            if(scrollPosition < containerBottom - 20 && scrollPosition >= containerOffset - 20){
                $(this).addClass('active');
            } else {
                $(this).removeClass('active');
            }
        });
    });
}

export const populate_hsp_array = (hit, query_id) => {
    return hit.hsps.map(hsp => Object.assign(hsp, {hit_id: hit.id, query_id}));
}

export const prepareAlignmentOfAllHits = (queries) => {
    console.log('prepareAlignmentOfAllHits', queries);
    // Get number of hits and array of all hsps.
    var num_hits = 0;
    var hsps_arr = [];
    if(!queries.length){
        return;
    }
    queries.forEach(
        (query) => query.hits.forEach(
            (hit) => {
                num_hits++;
                hsps_arr = hsps_arr.concat(populate_hsp_array(hit, query.id));
            }
        )
    );

    var aln_exporter = new AlignmentExporter();
    var file_name = `alignment-${num_hits}_hits.txt`;
    const blob_url = aln_exporter.prepare_alignments_for_export(hsps_arr, file_name);
    $('.download-alignment-of-all')
        .attr('href', blob_url)
        .attr('download', file_name);
    return false;
}
