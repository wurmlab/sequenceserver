import * as Exporter from './exporter';
import _ from 'underscore';
export default class AlignmentExporter {
    constructor() {
        this.prepare_alignments_for_export = this.prepare_alignments_for_export.bind(this);
        this.export_alignments = this.export_alignments.bind(this);
    }

    wrap_string(str, width) {
        var idx = 0;
        var wrapped = '';
        while(true) {
            wrapped += str.substring(idx, idx + width);
            idx += width;
            if(idx < str.length) {
                wrapped += '\n';
            } else {
                break;
            }
        }
        return wrapped;
    }

    generate_fasta(hsps) {

        var fasta = '';

        _.each(hsps, _.bind(function (hsp) {
            fasta += '>'+hsp.query_id+':'+hsp.qstart+'-'+hsp.qend+'\n';
            fasta += hsp.qseq+'\n';
            fasta += '>'+hsp.query_id+':'+hsp.qstart+'-'+hsp.qend+'_alignment_'+hsp.hit_id+':'+hsp.sstart+'-'+hsp.send+'\n';
            fasta += hsp.midline+'\n';
            fasta += '>'+hsp.hit_id+':'+hsp.sstart+'-'+hsp.send+'\n';
            fasta += hsp.sseq+'\n';
        }, this));
        return fasta;
    }

    get_alignments_download_metadata(hsps, filename_prefix){
        var fasta = this.generate_fasta(hsps);
        var blob = new Blob([fasta], { type: 'text/fasta' });
        var filename = Exporter.sanitize_filename(filename_prefix) + '.txt';
        return {filename, blob};
    }

    
    prepare_alignments_for_export(hsps, filename_prefix) {
        const { filename, blob } = this.get_alignments_download_metadata(hsps, filename_prefix);
        const blob_url = Exporter.generate_blob_url(blob, filename);
        return blob_url;
    }
    
    export_alignments(hsps, filename_prefix) {
        const { filename, blob } = this.get_alignments_download_metadata(hsps, filename_prefix);
        Exporter.download_blob(blob, filename);
    }
}
