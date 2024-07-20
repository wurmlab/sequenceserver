import * as Exporter from './exporter';
import _ from 'underscore';

export default class AlignmentExporter {
    constructor() {
        this.prepare_alignments_for_export = this.prepare_alignments_for_export.bind(this);
        this.export_alignments = this.export_alignments.bind(this);
    }

    wrap_string(str, width) {
        return str.match(new RegExp(`.{1,${width}}`, 'g')).join('\n');
    }

    generate_fasta(hsps) {
        let fasta = '';

        hsps.map(hsp => {
            fasta += `>${hsp.query_id}:${hsp.qstart}-${hsp.qend}\n`;
            fasta += `${hsp.qseq}\n`;
            fasta += `>${hsp.query_id}:${hsp.qstart}-${hsp.qend}_alignment_${hsp.hit_id}:${hsp.sstart}-${hsp.send}\n`;
            fasta += `${hsp.midline}\n`;
            fasta += `>${hsp.hit_id}:${hsp.sstart}-${hsp.send}\n`;
            fasta += `${hsp.sseq}\n`;
        });

        return fasta;
    }

    get_alignments_download_metadata(hsps, filename_prefix){
        const fasta = this.generate_fasta(hsps);
        const blob = new Blob([fasta], { type: 'text/fasta' });
        const filename = Exporter.sanitize_filename(filename_prefix) + '.txt';
        return {filename, blob};
    }

    prepare_alignments_for_export(hsps, filename_prefix) {
        const { filename, blob } = this.get_alignments_download_metadata(hsps, filename_prefix);
        return Exporter.generate_blob_url(blob, filename);
    }

    export_alignments(hsps, filename_prefix) {
        const { filename, blob } = this.get_alignments_download_metadata(hsps, filename_prefix);
        Exporter.download_blob(blob, filename);
    }
}
