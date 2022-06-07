import * as Exporter from './exporter';
import _ from 'underscore';
import { toLetters } from './visualisation_helpers';
export default class AlignmentExporter {
    constructor() {}

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
            fasta += '>'+hsp.query_id+':'+hsp.qstart+'-'+hsp.qend+'_hit_'+hsp.hit_number+'_hsp_'+toLetters(hsp.number)+'\n';
            fasta += hsp.qseq+'\n';
            fasta += '>'+hsp.query_id+':'+hsp.qstart+'-'+hsp.qend+'_hit_'+hsp.hit_number+'_hsp_'+toLetters(hsp.number)+
            '_alignment_'+hsp.hit_id+':'+hsp.sstart+'-'+hsp.send+'\n';
            fasta += hsp.midline+'\n';
            fasta += '>'+hsp.hit_id+':'+hsp.sstart+'-'+hsp.send+'_hit_'+hsp.hit_number+'_hsp_'+toLetters(hsp.number)+'\n';
            fasta += hsp.sseq+'\n\n';
        }, this));
        return fasta;
    }

    export_alignments(hsps, filename_prefix) {
        var fasta = this.generate_fasta(hsps);

        var blob = new Blob([fasta], { type: 'text/fasta' });
        // var filename_prefix = query_def + '_' + subject_def;
        // var filename_prefix = query_id + '_' + subject_id;
        var filename = Exporter.sanitize_filename(filename_prefix) + '.txt';
        Exporter.download_blob(blob, filename);
    }

    export_alignments_of_all(hsps, name) {

    }
}
