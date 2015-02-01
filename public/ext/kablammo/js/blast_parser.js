"use strict";

function BlastParser(use_complement_coords) {
  this._use_complement_coords = use_complement_coords;

  // Specify types of query and subject sequences given in each program.
  //
  // This list is taken from http://en.wikipedia.org/wiki/BLAST#Program. I
  // don't know whether all listed BLAST types will appear in BLAST's XML
  // output.
  this._seq_types = {
    blastn: {
      query:   'nucleic_acid',
      subject: 'nucleic_acid',
    },
    blastp: {
      query:   'amino_acid',
      subject: 'amino_acid',
    },
    blastpgp: {
      query:   'amino_acid',
      subject: 'amino_acid',
    },
    blastx: {
      query:   'nucleic_acid',
      subject: 'amino_acid',
    },
    tblastx: {
      query:   'nucleic_acid',
      subject: 'nucleic_acid',
    },
    tblastn: {
      query:   'amino_acid',
      subject: 'nucleic_acid',
    },
  };
}

// Always ensure that sequence coordinates are ordered such that start < end.
// This is not necessarily the case in BLAST results -- when a hit is found to
// the subject's reverse complement, the subject coordinates may be ordered
// [end, start], depending on which BLAST variant you're using. Here, we
// correct this inconsistency to simplify downstream use of the parsed data.
//
// Furthermore, if this._use_complement_coords == true, we recalculate the
// coordinates for nucleotide sequences that were found on the complement of
// the original strand used, regardless of whether this corresponds to the
// subject and/or query sequences. Suppose you're doing a blastn search, such
// that the query sequence falls on the original strand, but the hit (subject)
// sequence falls on the complement of a sequence in the DB. To ensure proper
// visual representation, you have two choices:
//
// 1. Retain the hit coordinates reported by BLAST, but swap them if necessary
//    to ensure start < end. (This makes consumption of the results simpler, as
//    one can always operate on the assumption start < end. Note also that
//    while blastn reports coordinates with end < start for complementary
//    sequences, the same is not true with, for example, blastx, which reports
//    the query's nucleotide coordinates with start < end even for hits that
//    lie on the query's complement. Thus, enforcing start < end ensures
//    consistency for this code's clients.) Render the hit axis with its 5' end
//    on the right and 3' end on the left.
//
// 2. Recalculate the hit coordinates so they refer to positions on the
//    complement of the subject sequence. (Also perform the swapping so start <
//    end.) Render the hit axis with its 5' end on the left and 3' end on the
//    right.
//
// The first approach has the advantage that sequenence coordinates are not
// recalculated relative to those reported by BLAST (and presumably by other
// tools using its output), so that Kablammo's reported coordinates will be
// consistent with others'. It also has the advantage that complementary
// sequences are rendered right-to-left, which is a convention used by BLAST
// and other software.
//
// The second approach, hwoever, is clearer in showing you the alignment's
// composition. Imagine you have two HSPs -- one in the first half of the
// query, and one in the second half. Then, both the query and subject axes
// will run left-to-right for 5' to 3', with the nucleotides represented by the
// subject axis corresponding exactly to the aligned nucleotides on the query
// axis.
//
// On the whole, consistency with other tools and conventions is more important
// than clarity, so I prefer option #1. Option #2 is still supported, however,
// primarily to demonstrate that I've carefully considered this tool's output
// to ensure its accuracy. (Note the rendered polygons are identical -- both
// options produce correct visualizations, differing only in whether
// complementary sequences' coordinates have been recalculated, and the
// directions of their axes.) If you opt to use option #1 in the scenario
// above, it helps to imagine an invisible complementary axis floating
// immediately above the rendered subject axis, with hits going to this axis
// instead.
//
// The above applies to blastx (nculeotide query, protein subject) as well as
// blastn.
BlastParser.prototype._correct_hit_positions = function(hsp, frame_key, start_key, end_key, length) {
  // In blastn results, for a given sequence (whether subject or query), if the
  // sequence's reading frame is negative (meaning that the subject or query
  // corresponds to the reverse complement of the actual sequence), then the
  // sequence's coordinates are specified such that start > end. That is, the
  // coordinates [6, 3] means that the given fragment runs from positions 3 to 6
  // of the *reverse complement* of the sequence. When this occurs, we will
  // render the corresponding axis such that it *decreases* from left to right,
  // with the 0 position on the right of the axis.
  //
  // Now, the above is all well and good with regard to blastn, but for blastx
  // (and perhaps other BLAST variants), the behaviour is slightly different. In
  // sequences with a negative reading frame, the coordinates won't be reversed
  // -- you will always be given the coordinates [3, 6], even if the fragment
  // occurs within the reverse complement.
  //
  // To resolve the inconsistency between BLAST variants, we munge sequence
  // coordinates here to guarantee that start < end. You can then look at
  // hsp.{query,subject}_frame to determine whether the coordinates refer to
  // the original or reverse-complement sequence.

  if(hsp[frame_key] < 0) {
    var start = hsp[start_key],
        end   = hsp[end_key];
    // Ensure start < end always holds -- swap values if necessary.
    if(start > end) {
      var tmp = start;
      start = end;
      end = tmp;
    }

    if(this._use_complement_coords) {
      // Use complementary coordinates, allowing us to *always* render the
      // sequence with its 5' end on the left, and 3' end on the right.
      hsp[end_key]   = length - start + 1;
      hsp[start_key] = length - end   + 1;
    } else {
      hsp[start_key ] = start;
      hsp[end_key]    = end;
    }
  }
}

BlastParser.prototype._find_max_bit_score_for_hit = function(hit) {
  return d3.max(hit.hsps, function(hsp) {
    return hsp.bit_score;
  });
}

BlastParser.prototype._find_max_bit_score_for_iteration = function(iteration) {
  var self = this;
  return d3.max(iteration.hits, function(hit) {
    return self._find_max_bit_score_for_hit(hit);
  });
}

BlastParser.prototype._add_normalized_bit_scores = function(iterations) {
  var self = this;
  // TODO: optimize -- input is already sorted, so we don't need to search across all iterations & hits.
  var max_global_bit_score = d3.max(iterations, function(iteration) {
    return self._find_max_bit_score_for_iteration(iteration);
  });

  iterations.forEach(function(iteration) {
    iteration.hits.forEach(function(hit) {
      hit.hsps.forEach(function(hsp) {
        hsp.normalized_bit_score = hsp.bit_score / max_global_bit_score;
      });
    });
  });
}

BlastParser.prototype._sort_by_score = function(iterations) {
  var self = this;
  var _rev_compare = function(a, b) {
    if(a < b)
      return 1;
    else if(a > b)
      return -1;
    else
      return 0;
  };

  var _sort_hits = function(iteration) {
    iteration.hits.sort(function(a, b) {
      var max_bs_a = self._find_max_bit_score_for_hit(a);
      var max_bs_b = self._find_max_bit_score_for_hit(b);
      return _rev_compare(max_bs_a, max_bs_b);
    });
  };
  // Sort hits within each iteration, so that each iteration's first hit will
  // be the one with the highest-scoring HSP.
  iterations.forEach(_sort_hits);

  // Sort iterations by hit scores (so that first iteration has highest-scoring
  // hit of all iterations). This could be optimized, since prior step ensures
  // that each iteration's hits are alredy sorted, but it doesn't seem to be a
  // bottleneck.
  iterations.sort(function(a, b) {
      var max_bs_a = self._find_max_bit_score_for_iteration(a);
      var max_bs_b = self._find_max_bit_score_for_iteration(b);
      return _rev_compare(max_bs_a, max_bs_b);
  });
}

BlastParser.prototype._filter_by_thresholds = function(iterations) {
  var evalue_threshold = parseFloat($('#evalue-threshold').val());
  var bitscore_threshold = parseFloat($('#bitscore-threshold').val());
  var coverage_threshold = parseFloat($('#hsp-coverage-threshold').val()) / 100;

  iterations = iterations.filter(function(iteration) {
    var query_length = iteration.query_length;

    iteration.filtered_hits = iteration.filtered_hits.filter(function(hit) {
      hit.filtered_hsps = hit.hsps.filter(function(hsp) {
        var coverage = (hsp.query_end - hsp.query_start + 1) / query_length;
        return hsp.evalue <= Math.pow(10, evalue_threshold) &&
          hsp.bit_score >= bitscore_threshold &&
          coverage >= coverage_threshold;
      });
      // Exclude hits without any HSPs that pass filter.
      return hit.filtered_hsps.length > 0;
    });
    return iteration.filtered_hits.length > 0;
  });

  return iterations;
}

BlastParser.prototype._filter_by_names = function(iterations) {
  // TODO: eliminate dependence on DOM. Pass filter values as parameters.
  var query_filter = $('#query-filter').val().toLowerCase();
  var subject_filter = $('#subject-filter').val().toLowerCase();

  if(query_filter === '') {
    var filtered_iterations = iterations;
  } else {
    var filtered_iterations = iterations.filter(function(iteration) {
      var query_name = iteration.query_def;
      return query_name.toLowerCase().indexOf(query_filter) > -1;
    });
  }

  filtered_iterations.forEach(function(iteration) {
    // Don't overwrite original "hits" attribute, as results are cached on
    // first load. Thus, if user changes filter, we must have access to
    // original "hits" value so that we may filter it appropriately.
    if(subject_filter === '') {
      iteration.filtered_hits = iteration.hits;
    } else {
      iteration.filtered_hits = iteration.hits.filter(function(hit) {
        return hit.subject_def.toLowerCase().indexOf(subject_filter) > -1;
      });
    }
  });

  return filtered_iterations;
}

BlastParser.prototype._slice_blast_iterations = function(iterations) {
  // TODO: eliminate dependence on DOM. Pass filter values as parameters.
  var max_query_seqs = parseInt($('#max-query-seqs').val(), 10);
  var max_hits_per_query_seq = parseInt($('#max-subjects-per-query-seq').val(), 10);

  var sliced_iterations = iterations.slice(0, max_query_seqs);
  sliced_iterations.forEach(function(iteration) {
    iteration.filtered_hits = iteration.filtered_hits.slice(0, max_hits_per_query_seq);
  });

  return sliced_iterations;
}

BlastParser.prototype._determine_strand = function(frame) {
  if(frame > 0)
    return '+';
  else if(frame < 0)
    return '-';
  else
    return '.';
}

BlastParser.prototype._segregate_hsps_by_strand = function(hsps) {
  var segregated = {};
  var self = this;

  hsps.forEach(function(hsp) {
    var query_strand   = self._determine_strand(hsp.query_frame);
    var subject_strand = self._determine_strand(hsp.subject_frame);
    var key = query_strand + subject_strand;

    if(typeof segregated[key] === 'undefined')
      segregated[key] = [];
    segregated[key].push(hsp);
  });

  return segregated;
}

BlastParser.prototype._parse_hsp = function(hsp, query_length, subject_length) {
  hsp = $(hsp);

  // Possible values for query_frame and subject frame:
  //   (See ncbi-blast-2.2.28+-src/c++/src/algo/blast/format/blastxml_format.cpp
  //   for details. Code snippets from this file are included below.)
  //
  //   frame ε {1, 2, 3}: hit lies on original query or subject strand.
  //     frame = (start - 1) % 3 + 1; // Using 1-offset coordinates
  //   frame ε {-1, -2, -3}: hit lies on reverse complement of original query or subject strand
  //     frame = -((seq_length - end) % 3 + 1);
  //   frame = 0: corresponding sequence was composed of amino acids, not nucleic acids
  //
  // Suppose your query or subject (or both) is a nucleic acid sequence.
  // If your search translates the NA seq to an AA seq, the corresponding
  // frame value may be one of {1, 2, 3} or {-1, -2, -3}. If, however, no
  // translation occurred, frame will *always* be 1 or -1 -- i.e., its
  // value indicates only strandedness, not a reading frame as such. To
  // see how this occurs, search
  // ncbi-blast-2.2.28+-src/c++/src/algo/blast/format/blastxml_format.cpp
  // for "kTranslated".
  //
  // Examples: I haven't verified what follows, but I believe it is correct.
  // BLAST type reference: http://www.bios.niu.edu/johns/bioinform/blast_info.htm
  //   blastn:
  //     Query frame:   1 or -1
  //     Subject frame: 1 or -1
  //   blastp:
  //     Query frame:   0
  //     Subject frame: 0
  //   blastx:
  //     Query frame:   {-3, -2, -1, 1, 2, 3}
  //     Subject frame: 0
  //   tblastn:
  //     Query frame:   0
  //     Subject frame: {-3, -2, -1, 1, 2, 3}
  //   tblastx:
  //     Query frame:   {-3, -2, -1, 1, 2, 3}
  //     Subject frame: {-3, -2, -1, 1, 2, 3}
  var hsp_attribs = {
    query_start: parseInt(hsp.find('Hsp_query-from').text(), 10),
    query_end: parseInt(hsp.find('Hsp_query-to').text(), 10),
    query_frame: parseInt(hsp.find('Hsp_query-frame').text(), 10),
    subject_start: parseInt(hsp.find('Hsp_hit-from').text(), 10),
    subject_end: parseInt(hsp.find('Hsp_hit-to').text(), 10),
    subject_frame: parseInt(hsp.find('Hsp_hit-frame').text(), 10),
    alignment_length: parseInt(hsp.find('Hsp_align-len').text(), 10),
    bit_score: parseFloat(hsp.find('Hsp_bit-score').text()),
    evalue: parseFloat(hsp.find('Hsp_evalue').text()),
    query_seq: hsp.find('Hsp_qseq').text(),
    subject_seq: hsp.find('Hsp_hseq').text(),
    midline_seq: hsp.find('Hsp_midline').text()
  };

  this._correct_hit_positions(hsp_attribs, 'query_frame',
    'query_start', 'query_end', query_length);
  this._correct_hit_positions(hsp_attribs, 'subject_frame',
    'subject_start', 'subject_end', subject_length);

  return hsp_attribs;
}

BlastParser.prototype._parse_hit = function(hit, query_length) {
  var self = this;
  var hit = $(hit);

  var hit_attribs = {};
  hit_attribs.subject_id = hit.children('Hit_id').text();
  hit_attribs.subject_def = hit.children('Hit_def').text();
  hit_attribs.subject_length = parseInt(hit.children('Hit_len').text(), 10);
  var unsegregated_hsps = hit.children('Hit_hsps').children('Hsp').map(function() {
    return self._parse_hsp(this, query_length, hit_attribs.subject_length);
  }).get();

  hit_attribs.hsps = self._segregate_hsps_by_strand(unsegregated_hsps);
  return hit_attribs;
}

BlastParser.prototype._parse_iterations = function(doc) {
  var self = this;

  // Within BLAST results, you have:
  //   Multiple iterations (i.e., query sequences input by user), each of which has ...
  //     Multiple hits (i.e., subject sequences pulled out of BLAST DB), each of which has ...
  //       Multiple HSPs (high-scoring pairs), corresponding to subset of query and subject
  //       sequences demonstrating sequence similarity
  var iterations = doc.find('BlastOutput_iterations > Iteration').map(function() {
    var iteration = $(this);
    var hits = iteration.find('Iteration_Hits > Hit');
    if(hits.length === 0)
      return null;

    var query_attribs = {
      query_id: iteration.find('Iteration_query-ID').text(),
      query_def: iteration.find('Iteration_query-def').text(),
      query_length: parseInt(iteration.find('Iteration_query-len').text(), 10)
    };

    // In Chrome, the below function call is inordinately slow.
    query_attribs.hits = hits.map(function() {
      return self._parse_hit(this, query_attribs.query_length);
    }).get();
    return query_attribs;
  }).get();
  // Remove any iterations that lack hits, as per above map() call. This means
  // that all iterations present in result set will have at least one hit, each
  // of which will have at least one HSP (or BLAST would not have included the
  // hit in the result set). Any filtering that occurs in slice_and_dice() is
  // then independent of this -- even if you don't call slice_and_dice(), you
  // are thus guaranteed that all iterations have at least one hit.
  iterations = iterations.filter(function(iteration) {
    return iteration !== null;
  });

  iterations = this._flatten(iterations);
  this._sort_by_score(iterations);
  this._add_normalized_bit_scores(iterations);

  return iterations;
}

// Change representation of results from
//   Iterations (Queries) -> Subjects -> Strand pairs (++, +-, -+, --) -> Individual HSPs
// to
//   Iterations (Queries) -> Subjects ->  Individual HSPs.
//
// In the new format, there will be a separate Subject object for each strand
// pair (i.e., a given subject is represented once for each combination of
// query & subject strands). This format is best for downstream uses -- the
// graphing code needs HSPs separated by strand, as HSPs for a query/subject
// pair but on different combinations of query/subject strands should not be
// rendered on the same graph. This way, the graphing code can treat each such
// query/subject strand combination as a distinct subject. This ensures, for
// example, that the sorting routines in this class work without having to
// consider strandedness.
BlastParser.prototype._flatten = function(iterations) {
  iterations = iterations.map(function(iteration) {
    var hits = iteration.hits.map(function(hit) {
      var collected = [];
      Object.keys(hit.hsps).forEach(function(strand_pair) {
        var hsps = hit.hsps[strand_pair];
        var cloned_hit = $.extend({}, hit);
        cloned_hit.query_strand = strand_pair[0];
        cloned_hit.subject_strand = strand_pair[1];
        cloned_hit.hsps = hsps;
        collected.push(cloned_hit);
      });
      return collected;
    });

    var flattened_hits = [];
    flattened_hits = flattened_hits.concat.apply(flattened_hits, hits);
    iteration.hits = flattened_hits;
    return iteration;
  });
  return iterations;
}

BlastParser.prototype._determine_seq_types = function(doc) {
  var blast_variant = doc.find('BlastOutput > BlastOutput_program').text();
  var seq_types = this._seq_types[blast_variant];

  return {
    query_seq_type:   seq_types.query,
    subject_seq_type: seq_types.subject,
  };
}

BlastParser.prototype.parse_blast_results = function(xml_doc) {
  var doc = $(xml_doc);

  var parsed = {};
  parsed.iterations = this._parse_iterations(doc);
  $.extend(parsed, this._determine_seq_types(doc));

  return parsed;
}

BlastParser.prototype.slice_and_dice = function(blast_results) {
  var _calc_num_hits = function(iterations) {
    return d3.sum(iterations, function(iteration) {
      return iteration.hits.length;
    })
  };

  var iterations = blast_results.iterations;
  // Store iterations_count to unify interface for determining count, given
  // that we set filtered_iterations_count below.
  blast_results.iterations_count = iterations.length;
  blast_results.hits_count = _calc_num_hits(iterations);

  // Filter iterations and hits.
  iterations = this._filter_by_names(iterations);
  iterations = this._filter_by_thresholds(iterations);

  // Store filtered_iterations_count, as next step slices the variable
  // iterations, meaning the number of filtered iterations pre-slicing will
  // be lost.
  blast_results.filtered_iterations_count = iterations.length;
  blast_results.filtered_hits_count = _calc_num_hits(iterations);

  // Slice iterations and hits.
  iterations = this._slice_blast_iterations(iterations);

  blast_results.filtered_iterations = iterations;
}
