import * as Exporter from './exporter';
import _ from 'underscore';
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

    generate_fasta(hsps, query_def, query_id, subject_def, subject_id) {

        var fasta = "Alignment-Details \n";

        _.each(hsps, _.bind(function (hsp) {
            fasta += query_id+" "+hsp.qstart+" "+hsp.qend+"\n";
            fasta += subject_id+" "+hsp.sstart+" "+hsp.send+"\n";
            fasta += hsp.qseq+"\n";
            fasta += hsp.midline+"\n";
            fasta += hsp.sseq+"\n";
            // fasta += this.wrap_string(hsp.qseq, 80)+"\n";
            // fasta += this.wrap_string(hsp.midline, 80)+"\n";
            // fasta += this.wrap_string(hsp.sseq, 80)+"\n";
            fasta += "-------------------------------------------\n";
        }, this));
        return fasta;
    }

    export_alignments(hsps, query_def, query_id, subject_def, subject_id) {
        var fasta = this.generate_fasta(hsps, query_def, query_id, subject_def, subject_id);

        var blob = new Blob([fasta], { type: 'application/fasta' });
        // var filename_prefix = query_def + '_' + subject_def;
        var filename_prefix = query_id + '_' + subject_id;
        var filename = Exporter.sanitize_filename(filename_prefix) + '.txt';
        Exporter.download_blob(blob, filename);
    }
}
