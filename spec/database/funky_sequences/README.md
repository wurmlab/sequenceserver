[BLAST allows * and - in amino acid sequences and - in nucleotide sequences][1].
The sequences in this directory present an example of the same.

**Thursday, 4th February 2016**

_BLAST 2.2.31+_

- `blastdbcmd -outfmt '%s'` returns illegal 0xFF UTF-8 byte if it encounters \*
  or \- in an amino acide sequence. `blastdbcmd -outfmt '%f'` works fine
  though.
- Both `blastdbcmd -outfmt '%s'` and `blastdbcmd -outfmt '%f'` returns N if it
  encounters \- in a nucleotide sequence.

[1]: http://blast.ncbi.nlm.nih.gov/blastcgihelp.shtml
