"use strict";

function Interface(grapher, loader) {
  this._grapher = grapher;
  this._loader = loader;
  this._navbar_elements = $('.navbar .nav li');
  this._configure_nav();
  this._configure_colour_picker();
  this._form = $('#load-results-form');
  this._local_chooser = $('#local-file-chooser');
  this._server_results_chooser = $('#server-results-chooser');

  this._is_local_file_chosen = false;
  this._configure_tab_switching();

  var self = this;

  $.getJSON('data/blast_results.json', function(data) {
    self._populate_blast_results_chooser(data.blast_results);
  });

  this._configure_file_chooser();
  this._configure_query_form();
  this._configure_tour();
  this._configure_help();
  this._configure_hsp_outline_controls();
}

Interface.prototype._configure_hsp_outline_controls = function() {
  var self = this;

  var get_grapher = function(elem) {
    var container = $(elem).parents('.subject');
    return container[0]._grapher;
  }

  $('#results-container').on('click', '.view-alignment', function() {
    get_grapher(this).view_alignments();
  });

  $('#results-container').on('click', '.export-alignment', function() {
    get_grapher(this).export_alignments();
  });

  $('#results-container').on('click', '.deselect-all-hsps', function() {
    get_grapher(this).deselect_all_alignments();
  });

  $('#results-container').on('change', '.toggle-hsp-outline', function() {
    var grapher = get_grapher(this);
    if(this.checked) {
      grapher.enable_hsp_outlines();
    } else {
      grapher.disable_hsp_outlines();
    }
  });
}

Interface.prototype._configure_tab_switching = function() {
  var self = this;
  $('#control-panel-load [data-toggle="tab"]').on('shown.bs.tab', function(e) {
    var active_tab = $(e.target).attr('id');

    if(active_tab === 'load-server-nav') {
      self._enable_form_submission(true);
    } else {
      // This ensures that if user chooses file, switches to "load server" tab,
      // then switches back to "load local" tab, the button will remain
      // enabled.
      self._enable_form_submission(self._is_local_file_chosen);
    }
  });
}

Interface.prototype._enable_form_submission = function(enable) {
  var submit_control = this._form.find('[type=submit]');
  if(enable) {
    submit_control.removeClass('disabled');
  } else {
    submit_control.addClass('disabled');
  }
}

Interface.prototype._set_local_file_chosen = function(is_file_chosen) {
  this._is_local_file_chosen = is_file_chosen;
  this._enable_form_submission(is_file_chosen);
}

Interface.prototype._configure_colour_picker = function() {
  var choose_colour = $('#choose-graph-colour');
  var default_colour = this._grapher.get_graph_colour();
  var colour_example = $('#graph-colour-example');
  colour_example.css('backgroundColor', '#' + $.colpick.rgbToHex(default_colour));

  var self = this;
  var picker = choose_colour.colpick({
    onChange: function(hsb, hex, rgb, cont) {
      self._grapher.set_graph_colour(rgb);
      colour_example.css('backgroundColor', '#' + hex);
    },
    submit: false,
    color: default_colour,
  });
  colour_example.click(function() {
    choose_colour.click();
  });
}

Interface.prototype._configure_nav = function() {
  var self = this;

  this._navbar_elements.click(function() {
    if($(this).hasClass('disabled-nav'))
      return;

    $('.navbar-collapse').collapse('hide');
    if($(this).hasClass('active')) {
      self.deactivate_active_panel();
    } else {
      self.activate_panel(this);
    }
  });
}

Interface.prototype._resolve_panel_for_nav = function(nav_elem) {
  var target = nav_elem.children('a').attr('href').substring(1);
  return $('#control-panel-' + target);
}

Interface.prototype.activate_panel = function(nav_target) {
  nav_target = $(nav_target);
  if(nav_target.hasClass('active'))
    return;

  $('.control-panel').slideUp();
  this._navbar_elements.removeClass('active');

  nav_target.addClass('active');
  var panel = this._resolve_panel_for_nav(nav_target);
  panel.slideDown();
}

Interface.prototype.deactivate_active_panel = function() {
  var active_nav = this._navbar_elements.filter('.active');
  // If no navigation active, then no panel should be closed.
  if(active_nav.length === 0)
    return;

  var panel = this._resolve_panel_for_nav(active_nav);
  // If user has scrolled within panel because it isn't fully visible given
  // his viewport height, scroll back to top. Though the display "content"
  // before sliding up, this is better than calling scrollTop(0) when the
  // panel appears, since the user is less likely to be watching the panel
  // closely after dismissing it. Curiously, calling it after the panel has
  // already slid up does not work.
  panel.scrollTop(0);
  panel.slideUp({
    complete: function() {
      active_nav.removeClass('active');
    }
  });
}

Interface.prototype._populate_blast_results_chooser = function(valid_sources) {
  var self = this;
  valid_sources.forEach(function(source) {
    self._server_results_chooser.append($('<option>', {
      value: source,
      text:  source
    }));
  });
}

Interface.prototype.create_query_header = function(container, label, query_index, num_filtered_queries, num_hidden_queries) {
  // Don't show label if no valid one present.
  if(label === 'No definition line')
    label = '';
  var header = $('#example-query-header').clone().removeAttr('id');
  header.find('.query-name').text(label);

  var count_label = 'Query ' + query_index + ' of ' + num_filtered_queries;
  if(num_hidden_queries > 0) {
    count_label += ' (' + num_hidden_queries + ' hidden)';
  }
  header.find('.query-index').text(count_label);

  $(container).append(header);
}

Interface.prototype._configure_file_chooser = function() {
  var self = this;

  $('#choose-file').click(function(evt) {
    evt.preventDefault();
    self._local_chooser.click();
  })

  self._local_chooser.change(function() {
    var label = $(this).parent().find('.file-label');
    var file = self._local_chooser.get(0).files[0];

    if(file) {
      var label_text = file.name;
      self._set_local_file_chosen(true);
    } else {
      var label_text = '';
      self._set_local_file_chosen(false);
    }

    // Before setting text, remove any elements contained within.
    label.html('').text(label_text);
  });
}

Interface.prototype._on_load_server = function(on_complete) {
  this.deactivate_active_panel();

  var self = this;
  Interface.show_curtain(function() {
    var server_results_chooser = $('#server-results-chooser');
    var blast_results_filename = server_results_chooser.val();
    self._loader.load_from_server(blast_results_filename, function(results) {
      self._display_results(results, on_complete);
    });
  });
}

Interface.prototype._on_load_local = function() {
  // This ensures that if user submitted form by pressing enter in control
  // instead of clicking button, further processing will occur only if valid
  // data has been loaded. (The "Display results" button is enabled/disabled
  // separately.)
  if(!this._is_local_file_chosen)
    return;

  var file = this._local_chooser.get(0).files[0];
  // User hasn't selected file.
  if(!file)
    return;

  this.deactivate_active_panel();
  var self = this;
  Interface.show_curtain(function() {
    self._loader.load_local_file(file, function(results) {
      self._display_results(results);
    });
  });
}

Interface.prototype._configure_query_form = function() {
  var self = this;

  this._form.submit(function(evt) {
    evt.preventDefault();

    var active_id = $(this).find('.tab-pane.active').attr('id');

    if(active_id === 'load-server') {
      self._on_load_server();
    } else if(active_id === 'load-local') {
      self._on_load_local();
    } else {
      throw 'Invalid active tab ID: ' + active_id;
    }
  });
}

Interface.prototype._configure_tour = function() {
  var self = this;
  $('.start-tour').click(function() {
    // Switch to this tab in the (hidden) navigation, so that if user opens "load
    // results," the tab corresponding to the displayed results will be shown.
    $('#load-server-nav').tab('show');
    self._on_load_server(function() {
      var tour_guide = new TourGuide(self);
      tour_guide.start();
    });
  });
}

Interface.prototype._configure_help = function() {
  $('.show-help').click(function() {
    $('#help').click();
  });
}

Interface.error = function(msg) {
  // Hide curtain in case it is showing, which would obscure error.
  Interface.hide_curtain();

  var container = $('#errors');
  var error = $('#example-error').clone().removeAttr('id');
  error.find('.message').text(msg);
  container.append(error);
}

Interface.show_curtain = function(on_done) {
  $('#curtain').fadeIn(500, on_done);
}

Interface.hide_curtain = function(on_done) {
  $('#curtain').fadeOut(500, on_done);
}

Interface.prototype._display_results = function(results, on_complete) {
  this._grapher.display_blast_results(results, '#results-container', this);
  Interface.hide_curtain();
  $('html, body').scrollTop(0);
  if(typeof on_complete !== 'undefined')
    on_complete();
}
