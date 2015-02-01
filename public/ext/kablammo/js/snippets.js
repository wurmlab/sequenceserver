function calc_interval_bit_score(query_start_pos, step, hits) {
  var cum_bs = 0;
  var num_values = 0;
  var query_end_pos = query_start_pos + step;

  hits.forEach(function(hit) {
    hit.hsps.forEach(function(hsp) {
      for(var pos = query_start_pos; pos < query_end_pos; pos++) {
        if(hsp.query_start <= pos && pos < hsp.query_end) {
          cum_bs += hsp.bit_score;
          num_values += 1;
        }
      }
    });
  });

  return cum_bs / num_values;
}

function visualize_query_coverage() {
  var query_length = blast_results.query_length;
  var element_length = 1000;

  var step = Math.ceil(query_length / element_length);
}
