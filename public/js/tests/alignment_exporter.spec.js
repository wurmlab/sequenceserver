import AlignmentExporter from '../alignment_exporter';

describe('AlignmentExporter', () => {
  let exporter;

  beforeEach(() => {
    exporter = new AlignmentExporter();
  });

  describe('wrap_string', () => {
    it('wraps a string to a specified width', () => {
      const str = 'abcdefghijklmnopqrstuvwxyz';
      const width = 5;
      const expected = 'abcde\nfghij\nklmno\npqrst\nuvwxy\nz';
      expect(exporter.wrap_string(str, width)).toBe(expected);
    });
  });

  describe('generate_fasta', () => {
    it('generates a fasta string from hsps', () => {
      const hsps = [
        {
          query_id: 'query1',
          qstart: 1,
          qend: 10,
          qseq: 'ATGCATGCAT',
          hit_id: 'hit1',
          sstart: 1,
          send: 10,
          midline: '||||||||||',
          sseq: 'ATGCATGCAT',
        },
      ];
      const expected = '>query1:1-10\nATGCATGCAT\n>query1:1-10_alignment_hit1:1-10\n||||||||||\n>hit1:1-10\nATGCATGCAT\n';
      expect(exporter.generate_fasta(hsps)).toBe(expected);
    });
  });
});
