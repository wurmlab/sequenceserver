import $ from 'jquery';

require = (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == 'function' && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error('Cannot find module \'' + o + '\''); throw f.code = 'MODULE_NOT_FOUND', f; } var l = n[o] = { exports: {} }; t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e); }, l, l.exports, e, t, n, r); } return n[o].exports; } var i = typeof require == 'function' && require; for (var o = 0; o < r.length; o++)s(r[o]); return s; })({
    1: [function (require, module, exports) {
    // legacy!!
        $.browser = require('jquery-browser-plugin');

        /**
     * THIS FILE HAS BEEN MODIFIED FROM THE ORIGINAL
     * (https://github.com/ljgarcia/biojs-vis-sequence/blob/master/lib/index.js).
     *
     * Sequence component
     *
     * @class
     * @extends Biojs
     *
     * @author <a href="mailto:johncar@gmail.com">John Gomez</a>, <a href="mailto:secevalliv@gmail.com">Jose Villaveces</a>
     * @version 1.0.0
     * @category 3
     *
     * @requires <a href='http://blog.jquery.com/2011/09/12/jquery-1-6-4-released/'>jQuery Core 1.6.4</a>
     * @dependency <script language="JavaScript" type="text/javascript" src="../biojs/dependencies/jquery/jquery-1.4.2.min.js"></script>
     *
     * @requires <a href='http://jqueryui.com/download'>jQuery UI 1.8.16</a>
     * @dependency <script language="JavaScript" type="text/javascript" src="../biojs/dependencies/jquery/jquery-ui-1.8.2.custom.min.js"></script>
     *
     * @requires <a href='Biojs.Tooltip.css'>Biojs.Tooltip</a>
     * @dependency <script language="JavaScript" type="text/javascript" src="src/Biojs.Tooltip.js"></script>
     *
     * @param {Object} options An object with the options for Sequence component.
     *
     * @option {string} target
     *    Identifier of the DIV tag where the component should be displayed.
     *
     * @option {string} sequence
     *    The sequence to be displayed.
     *
     * @option {string} [id]
     *    Sequence identifier if apply.
     *
     * @option {string} [format="FASTA"]
     *    The display format for the sequence representation.
     *
     * @option {Object[]} [highlights]
     * 	  For highlighting multiple regions.
     *    <pre class="brush: js" title="Syntax:">
     *    [
     *    	// Highlight aminoacids from 'start' to 'end' of the current strand using the specified 'color' (optional) and 'background' (optional).
     *    	{ start: &lt;startVal1&gt;, end: &lt;endVal1&gt; [, id:&lt;idVal1&gt;] [, color: &lt;HTMLColor&gt;] [, background: &lt;HTMLColor&gt;]},
     *    	//
     *    	// Any others highlights
     *    	...,
     *    	//
     *    	{ start: &lt;startValN&gt;, end: &lt;endValN&gt; [, id:&lt;idValN&gt;] [, color: &lt;HTMLColor&gt;] [, background: &lt;HTMLColor&gt;]}
     *    ]</pre>
     *
     * <pre class="brush: js" title="Example:">
     * highlights : [
     * 		{ start:30, end:42, color:"white", background:"green", id:"spin1" },
     *		{ start:139, end:140 },
     *		{ start:631, end:633, color:"white", background:"blue" }
     *	]
     * </pre>
     *
     * @option {Object} [columns={size:40,spacedEach:10}]
     * 	  Options for displaying the columns. Syntax: { size: &lt;numCols&gt;, spacedEach: &lt;numCols&gt;}
     *
     * @option {Object} [selection]
     * 	  Positions for the current selected region. Syntax: { start: &lt;startValue&gt;, end: &lt;endValue&gt;}
     *
     * @option {Object[]} [annotations]
     *    Set of overlapping annotations. Must be an array of objects following the syntax:
     *     		<pre class="brush: js" title="Syntax:">
     *            [
     *              // An annotation:
     *              { name: &lt;name&gt;,
     *                html: &lt;message&gt;,
     *                color: &lt;color_code&gt;,
     *                regions: [{ start: &lt;startVal1&gt;, end: &lt;endVal1&gt; color: &lt;HTMLColor&gt;}, ...,{ start: &lt;startValN&gt;, end: &lt;endValN&gt;, color: &lt;HTMLColor&gt;}]
     *              },
     *
     *              // ...
     *              // more annotations here
     *              // ...
     *            ]
     *    		 </pre>
     *    where:
     *      <ul>
     *        <li><b>name</b> is the unique name for the annotation</li>
     *        <li><b>html</b> is the message (can be HTML) to be displayed in the tool tip.</li>
     *        <li><b>color</b> is the default HTML color code for all the regions.</li>
     *        <li><b>regions</b> array of objects defining the intervals which belongs to the annotation.</li>
     *        <li><b>regions[i].start</b> is the starting character for the i-th interval.</li>
     *        <li><b>regions[i].end</b> is the ending character for the i-th interval.</li>
     *        <li><b>regions[i].color</b> is an optional color for the i-th interval.
     *      </ul>
     *
     * @option {Object} [formatOptions={title:true, footer:true}]
     * 	  Options for displaying the title. by now just affecting the CODATA format.
     *    <pre class="brush: js" title="Syntax:">
     * 		formatOptions : {
     * 			title:false,
     * 			footer:false
     * 		}
     *    </pre>
     *
     * @example
     * var theSequence = "METLCQRLNVCQDKILTHYENDSTDLRDHIDYWKHMRLECAIYYKAREMGFKHINHQVVPTLAVSKNKALQAIELQLTLETIYNSQYSNEKWTLQDVSLEVYLTAPTGCIKKHGYTVEVQFDGDICNTMHYTNWTHIYICEEAojs SVTVVEGQVDYYGLYYVHEGIRTYFVQFKDDAEKYSKNKVWEVHAGGQVILCPTSVFSSNEVSSPEIIRQHLANHPAATHTKAVALGTEETQTTIQRPRSEPDTGNPCHTTKLLHRDSVDSAPILTAFNSSHKGRINCNSNTTPIVHLKGDANTLKCLRYRFKKHCTLYTAVSSTWHWTGHNVKHKSAIVTLTYDSEWQRDQFLSQVKIPKTITVSTGFMSI";
     * var mySequence = new Sequence({
     * 		sequence : theSequence,
     * 		target : "YourOwnDivId",
     * 		format : 'CODATA',
     * 		id : 'P918283',
     * 		annotations: [
     *        { name:"CATH",
     * 	  		color:"#F0F020",
     * 	  		html: "Using color code #F0F020 ",
     * 	  		regions: [{start: 122, end: 135}]
     * 		  },
     *        { name:"TEST",
     *          html:"&lt;br&gt; Example of &lt;b&gt;HTML&lt;/b&gt;",
     *          color:"green",
     *          regions: [
     *            {start: 285, end: 292},
     *            {start: 293, end: 314, color: "#2E4988"}]
     *        }
     *      ],
     *      highlights : [
     *      	{ start:30, end:42, color:"white", background:"green", id:"spin1" },
     *      	{ start:139, end:140 },
     *      	{ start:631, end:633, color:"white", background:"blue" }
     *      ]
     * });
     *
     */

        var Class = require('js-class');

        var EVT_ON_SELECTION_CHANGE = 'onSelectionChange';
        var EVT_ON_SELECTION_CHANGED = 'onSelectionChanged';
        var EVT_ON_ANNOTATION_CLICKED = 'onAnnotationClicked';

        global.Sequence = Class(
            /** @lends Sequence# */
            {
                constructor: function (options) {
                    var self = this;

                    this.opt = jQuery.extend(this.opt, options);

                    this._container = jQuery(this.opt.target);

                    // legacy support (target id without '#')
                    if (this._container.length == 0) {
                        this._container = jQuery('#' + this.opt.target);
                    }

                    if (this._container.length == 0) {
                        console.log('empty target container');
                    }

                    // legacy: copy target id
                    this.opt.target = this._container[0].id;

                    // Lazy initialization
                    this._container.ready(function () {
                        this._ready = false;
                        self._initialize();
                    });
                },

                /**
         * Default values for the options
         * @name Sequence-opt
         */
                opt: {

                    sequence: '',
                    id: '',
                    target: '',
                    format: 'FASTA',
                    selection: { start: 0, end: 0 },
                    columns: { size: 35, spacedEach: 10 },
                    highlights: [],
                    annotations: [],
                    sequenceUrl: 'http://www.ebi.ac.uk/das-srv/uniprot/das/uniprot/sequence',

                    // Styles
                    selectionColor: 'Yellow',
                    selectionFontColor: 'black',
                    highlightFontColor: 'red',
                    highlightBackgroundColor: 'white',
                    fontColor: 'inherit',
                    backgroundColor: 'inherit',
                    width: undefined,
                    height: undefined,
                    formatSelectorVisible: true
                },

                /**
         * Array containing the supported event names
         * @name Sequence-eventTypes
         */
                eventTypes: [
                    /**
           * @name Sequence#onSelectionChanged
           * @event
           * @param {function} actionPerformed An function which receives an {@link Biojs.Event} object as argument.
           * @eventData {Object} source The component which did triggered the event.
           * @eventData {string} type The name of the event.
           * @eventData {int} start A number indicating the start of the selection.
           * @eventData {int} end A number indicating the ending of selection.
           * @example
           * mySequence.onSelectionChanged(
           *    function( objEvent ) {
           *       alert("Selected: " + objEvent.start + ", " + objEvent.end );
           *    }
           * );
           *
           * */
                    'onSelectionChanged',

                    /**
           * @name Sequence#onSelectionChange
           * @event
           * @param {function} actionPerformed An function which receives an {@link Biojs.Event} object as argument.
           * @eventData {Object} source The component which did triggered the event.
           * @eventData {string} type The name of the event.
           * @eventData {int} start A number indicating the start of the selection.
           * @eventData {int} end A number indicating the ending of selection.
           * @example
           * mySequence.onSelectionChange(
           *    function( objEvent ) {
           *       alert("Selection in progress: " + objEvent.start + ", " + objEvent.end );
           *    }
           * );
           *
           *
           * */
                    'onSelectionChange',

                    /**
           * @name Sequence#onAnnotationClicked
           * @event
           * @param {function} actionPerformed An function which receives an {@link Biojs.Event} object as argument.
           * @eventData {Object} source The component which did triggered the event.
           * @eventData {string} type The name of the event.
           * @eventData {string} name The name of the selected annotation.
           * @eventData {int} pos A number indicating the position of the selected amino acid.
           * @example
           * mySequence.onAnnotationClicked(
           *    function( objEvent ) {
           *       alert("Clicked " + objEvent.name + " on position " + objEvent.pos );
           *    }
           * );
           *
           * */
                    'onAnnotationClicked'
                ],

                getId: function () {
                    return this.opt.id;
                },

                // internal members
                _headerDiv: null,
                _contentDiv: null,

                // Methods

                _initialize: function () {

                    if (this.opt.width !== undefined) {
                        this._container.width(this.opt.width);
                    }

                    if (this.opt.height !== undefined) {
                        this._container.height(this.opt.height);
                    }

                    // DIV for the format selector
                    this._buildFormatSelector();

                    // DIV for the sequence
                    this._contentDiv = jQuery('<div/>').appendTo(this._container);

                    // Initialize highlighting
                    this._highlights = this.opt.highlights;

                    // Initialize annotations
                    this._annotations = this.opt.annotations;

                    //Initialize tooltip
                    var tooltip = 'sequenceTip' + this.opt.target;
                    jQuery('<div id="' + tooltip + '"></div>')
                        .appendTo('.fastan-content')
                        .addClass('absolute top-0 left-0')
                        .show()
                    this.opt._tooltip = document.getElementById(tooltip);

                    if ((this.opt.sequence)) {
                        this._redraw();

                    } else if ((this.opt.id)) {
                        this._requestSequence(this.opt.id);

                    } else {
                        this.clearSequence('No sequence available', '../biojs/css/images/warning_icon.png');
                    }

                    this._ready = true;
                },


                /**
         * Shows the columns indicated by the indexes array.
         * @param {string} seq The sequence strand.
         * @param {string} [identifier] Sequence identifier.
         *
         * @example
         * mySequence.setSequence("P99999");
         *
         */
                setSequence: function (seq, identifier) {

                    if (seq.match(/^([A-N,R-Z][0-9][A-Z][A-Z, 0-9][A-Z, 0-9][0-9])|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?$/i)) {
                        this._requestSequence(arguments[0]);

                    } else {
                        this.opt.sequence = seq;
                        this.opt.id = identifier;
                        this._highlights = [];
                        this._highlightsCount = 0;
                        this.opt.selection = { start: 0, end: 0 };
                        this._annotations = [];

                        this._contentDiv.children().remove();
                        this._redraw();
                    }
                },

                _requestSequence: function (accession) {
                    var self = this;

                    console.log('Requesting sequence for: ' + accession);

                    jQuery.ajax({
                        url: self.opt.sequenceUrl,
                        dataType: 'xml',
                        data: { segment: accession }
                    }).done(function(xml) {
                        try {
                            var sequenceNode = jQuery(xml).find('SEQUENCE:first');
                            self.setSequence(sequenceNode.text(), sequenceNode.attr('id'), sequenceNode.attr('label'));
                        } catch (e) {
                            console.log('Error decoding response data: ' + e.message);
                            self.clearSequence('No sequence available', '../biojs/css/images/warning_icon.png');
                        }
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        console.log('Error requesting the sequence: ' + textStatus);
                        self.clearSequence('Error requesting the sequence to the server ' + this.url, '../biojs/css/images/warning_icon.png');
                    });
                },

                /**
       * Shows the columns indicated by the indexes array.
       * @param {string} [showMessage] Message to be showed.
       * @param {string} [icon] Icon to be showed a side of the message
       *
       * @example
       * mySequence.clearSequence("No sequence available", "../biojs/css/images/warning_icon.png");
       *
       */
                clearSequence: function (showMessage, icon) {

                    var message = undefined;

                    this.opt.sequence = '';
                    this.opt.id = '';
                    this._highlights = [];
                    this._highlightsCount = 0;
                    this.opt.selection = { start: 0, end: 0 };
                    this._annotations = [];
                    this._contentDiv.children().remove();

                    this._headerDiv.hide();

                    if (undefined !== showMessage) {
                        message = jQuery('<div>' + showMessage + '</div>')
                            .appendTo(this._contentDiv)
                            .addClass('message');

                        if (undefined !== icon) {
                            message.css({
                                'background': 'transparent url("' + icon + '") no-repeat center left',
                                'padding-left': '20px'
                            });
                        }
                    }
                },

                /**
          * Set the current selection in the sequence causing the event {@link Sequence#onSelectionChanged}
          *
          * @example
          * // set selection from the position 100 to 150
          * mySequence.setSelection(100, 150);
          *
          * @param {int} start The starting character of the selection.
          * @param {int} end The ending character of the selection
          */
                setSelection: function (start, end) {
                    if (start > end) {
                        var aux = end;
                        end = start;
                        start = aux;

                    }

                    if (start != this.opt.selection.start || end != this.opt.selection.end) {
                        this._setSelection(start, end);
                        this.trigger(
                            EVT_ON_SELECTION_CHANGED,
                            { 'start': start, 'end': end }
                        );
                    }
                },

                _buildFormatSelector: function () {
                    var self = this;

                    console.log('build format selector container', this._container);
                    this._headerDiv = jQuery('<div></div>').appendTo(this._container);
                    this._headerDiv.append('Format: ');

                    this._formatSelector = jQuery('<select> ' +
            '<option value="FASTA">FASTA</option>' +
            '<option value="CODATA">CODATA</option>' +
            '<option value="PRIDE">PRIDE</option>' +
            '<option value="RAW">RAW</option></select>').appendTo(self._headerDiv);

                    this._formatSelector.change(function (e) {
                        self.opt.format = jQuery(this).val();
                        self._redraw();
                    });

                    this._formatSelector.val(self.opt.format);

                    this.formatSelectorVisible(this.opt.formatSelectorVisible);
                },

                /**
          * Highlights a region using the font color defined in {Sequence#highlightFontColor} by default is red.
          *
          * @example
          * // highlight the characters within the position 100 to 150, included.
          * mySequence.addHighlight( { "start": 100, "end": 150, "color": "white", "background": "red", "id": "aaa" } );
          *
          * @param {Object} h The highlight defined as follows:
          *
          *
          * @return {int} representing the id of the highlight on the internal array. Returns -1 on failure
          */
                addHighlight: function (h) {
                    var id = '-1';
                    var color = '';
                    var background = '';
                    var highlight = {};

                    if (h instanceof Object && h.start <= h.end) {

                        color = ('string' == typeof h.color) ? h.color : this.opt.highlightFontColor;
                        background = ('string' == typeof h.background) ? h.background : this.opt.highlightBackgroundColor;
                        id = ('string' == typeof h.id) ? h.id : (new Number(this._highlightsCount++)).toString();

                        highlight = { 'start': h.start, 'end': h.end, 'color': color, 'background': background, 'id': id };

                        this._highlights.push(highlight);
                        this._applyHighlight(highlight);
                        this._restoreSelection(h.start, h.end);
                    }

                    return id;
                },
                /*
           * Function: Sequence._applyHighlight
           * Purpose:  Apply the specified color and background to a region between 'start' and 'end'.
           * Returns:  -
           * Inputs: highlight -> {Object} An object containing the fields start (int), end (int),
           * 						color (HTML color string) and background (HTML color string).
           */
                _applyHighlight: function (highlight) {
                    var zindex = 0,
                        z = 0,
                        o = 0;
                    var seq = this._contentDiv.find('.sequence');
                    for (var i = highlight.start - 1; i < highlight.end; i++) {
                        zindex = jQuery(seq[i]).css('z-index');
                        if (zindex == 'auto') {
                            z = 1;
                            o = 1;
                        }
                        else {
                            z = 0;
                            o = 0.5;
                        }
                        jQuery(seq[i])
                            .css({
                                'color': highlight.color,
                                'background-color': highlight.background,
                                'z-index': z,
                                'opacity': o
                            })
                            .addClass('highlighted');
                    }
                },
                /*
           * Function: Sequence._applyHighlights
           * Purpose:  Apply the specified highlights.
           * Returns:  -
           * Inputs: highlights -> {Object[]} An array containing the highlights to be applied.
           */
                _applyHighlights: function (highlights) {
                    for (var i in highlights) {
                        this._applyHighlight(highlights[i]);
                    }
                },
                /*
           * Function: Sequence._restoreHighlights
           * Purpose:  Repaint the highlights in the specified region.
           * Returns:  -
           * Inputs: start -> {int} Start of the region to be restored.
           * 		   end -> {int} End of the region to be restored.
           */
                _restoreHighlights: function (start, end) {
                    var h = this._highlights;
                    // paint the region using default blank settings
                    this._applyHighlight({
                        'start': start,
                        'end': end,
                        'color': this.opt.fontColor,
                        'background': this.opt.backgroundColor
                    });
                    // restore highlights in that region
                    for (var i in h) {
                        // interval intersects with highlight i ?
                        if (!(h[i].start > end || h[i].end < start)) {
                            a = (h[i].start < start) ? start : h[i].start;
                            b = (h[i].end > end) ? end : h[i].end;
                            this._applyHighlight({
                                'start': a,
                                'end': b,
                                'color': h[i].color,
                                'background': h[i].background
                            });
                        }
                    }
                },
                /*
           * Function: Sequence._restoreSelection
           * Purpose:  Repaint the current selection in the specified region.
           * 			 It is used in the case of any highlight do overriding of the current selection.
           * Returns:  -
           * Inputs: start -> {int} Start of the region to be restored.
           * 		   end -> {int} End of the region to be restored.
           */
                _restoreSelection: function (start, end) {
                    var sel = this.opt.selection;
                    // interval intersects with current selection ?
                    // restore selection
                    if (!(start > sel.end || end < sel.start)) {
                        a = (start < sel.start) ? sel.start : start;
                        b = (end > sel.end) ? sel.end : end;

                        this._applyHighlight({
                            'start': a,
                            'end': b,
                            'color': this.opt.selectionFontColor,
                            'background': this.opt.selectionColor,
                        });
                    }
                },

                /**
          * Remove a highlight.
          *
          * @example
          * // Clear the highlighted characters within the position 100 to 150, included.
          * mySequence.removeHighlight("spin1");
          *
          * @param {string} id The id of the highlight on the internal array. This value is returned by method highlight.
          */
                removeHighlight: function (id) {
                    var h = this._highlights;
                    for (i in h) {
                        if (h[i].id == id) {
                            start = h[i].start;
                            end = h[i].end;
                            h.splice(i, 1);

                            this._restoreHighlights(start, end);
                            this._restoreSelection(start, end);

                            break;
                        }
                    }
                },

                /**
          * Remove all the highlights of whole sequence.
          *
          * @example
          * mySequence.removeAllHighlights();
          */
                removeAllHighlights: function () {
                    this._highlights = [];
                    this._restoreHighlights(1, this.opt.sequence.length);
                    this._restoreSelection(1, this.opt.sequence.length);
                },

                /**
          * Changes the current displaying format of the sequence.
          *
          * @example
          * // Set format to 'FASTA'.
          * mySequence.setFormat('FASTA');
          *
          * @param {string} format The format for the sequence to be displayed.
          */
                setFormat: function (format) {
                    if (this.opt.format != format.toUpperCase()) {
                        this.opt.format = format.toUpperCase();
                        this._redraw();
                    }

                    var self = this;
                    // Changes the option in the combo box
                    this._headerDiv.find('option').each(function () {
                        if (jQuery(this).val() == self.opt.format.toUpperCase()) {
                            jQuery(this).attr('selected', 'selected');
                        }
                    });
                },

                /**
          * Changes the current number of columns in the displayed sequence.
          *
          * @example
          * // Set the number of columns to 70.
          * mySequence.setNumCols(70);
          *
          * @param {int} numCols The number of columns.
          */
                setNumCols: function (numCols) {
                    this.opt.columns.size = numCols;
                    this._redraw();
                },

                /**
          * Set the visibility of the drop-down list of formats.
          *
          * @param {boolean} visible true: show; false: hide.
          */
                formatSelectorVisible: function (visible) {
                    if (visible) {
                        this._headerDiv.show();
                    } else {
                        this._headerDiv.hide();
                    }
                },

                /**
          * This is similar to a {Biojs.Protein3D#formatSelectorVisible} with the 'true' argument.
          *
          * @example
          * // Shows the format selector.
          * mySequence.showFormatSelector();
          *
          */
                showFormatSelector: function () {
                    this._headerDiv.show();
                },

                /**
          * This is similar to a {Biojs.Protein3D#formatSelectorVisible} with the 'false' argument.
          *
          * @example
          * // Hides the format selector.
          * mySequence.hideFormatSelector();
          *
          */
                hideFormatSelector: function () {
                    this._headerDiv.hide();
                },

                /**
          * Hides the whole component.
          *
          */
                hide: function () {
                    this._headerDiv.hide();
                    this._contentDiv.hide();
                },

                /**
          * Shows the whole component.
          *
          */
                show: function () {
                    this._headerDiv.show();
                    this._contentDiv.show();
                },
                /*
           * Function: Sequence._setSelection
           * Purpose:  Update the current selection.
           * Returns:  -
           * Inputs: start -> {int} Start of the region to be selected.
           * 		   end -> {int} End of the region to be selected.
           */
                _setSelection: function (start, end) {
                    //alert("adsas");

                    var current = this.opt.selection;
                    var change = {};

                    // Which is the change on selection?
                    if (current.start == start) {
                        // forward?
                        if (current.end < end) {
                            change.start = current.end;
                            change.end = end;
                        } else {
                            this._restoreHighlights(end + 1, current.end);
                        }
                    } else if (current.end == end) {
                        // forward?
                        if (current.start > start) {
                            change.start = start;
                            change.end = current.start;
                        } else {
                            this._restoreHighlights(current.start, start - 1);
                        }
                    } else {
                        this._restoreHighlights(current.start, current.end);
                        change.start = start;
                        change.end = end;
                    }

                    current.start = start;
                    current.end = end;
                },

                /*
           * Function: Sequence._repaintSelection
           * Purpose:  Repaint the whole current selection.
           * Returns:  -
           * Inputs: -
           */
                _repaintSelection: function () {
                    var s = this.opt.selection;
                    this._setSelection(0, 0);
                    this._setSelection(s.start, s.end);
                },

                /*
           * Function: Sequence._redraw
           * Purpose:  Repaint the current sequence.
           * Returns:  -
           * Inputs: -
           */
                _redraw: function () {
                    var i = 0;
                    var self = this;

                    // Reset the content
                    //this._contentDiv.text('');
                    this._contentDiv.children().remove();

                    // Rebuild the spans of the sequence
                    // according to format
                    if (this.opt.format == 'RAW') {
                        this._drawRaw();
                    } else if (this.opt.format == 'CODATA') {
                        this._drawCodata();
                    } else if (this.opt.format == 'FASTA') {
                        this._drawFasta();
                    } else {
                        this.opt.format = 'PRIDE';
                        this._drawPride();
                    }

                    // Restore the highlighted regions
                    this._applyHighlights(this._highlights);
                    this._repaintSelection();
                    this._addSpanEvents();
                },
                /*
           * Function: Sequence._drawFasta
           * Purpose:  Repaint the current sequence using FASTA format.
           * Returns:  -
           * Inputs: -
           */
                _drawFasta: function () {
                    var self = this;
                    var a = this.opt.sequence.toUpperCase().split('');
                    var pre = jQuery('<pre></pre>').appendTo(this._contentDiv);

                    var i = 1;
                    var arr = [];
                    var str = '>' + this.opt.id + ' ' + a.length + ' bp<br/>';

                    /* Correct column size in case the sequence is as small peptide */
                    var numCols = this.opt.columns.size;
                    if (this.opt.sequence.length < this.opt.columns.size) {
                        numCols = this.opt.sequence.length;
                    }

                    var opt = {
                        numCols: numCols,
                        numColsForSpace: 0
                    };

                    str += this._drawSequence(a, opt);
                    pre.html(str);

                    this._drawAnnotations(opt);
                },
                /*
           * Function: Sequence._drawCodata
           * Purpose:  Repaint the current sequence using CODATA format.
           * Returns:  -
           * Inputs: -
           */
                _drawCodata: function () {
                    var seq = this.opt.sequence.toUpperCase().split('');

                    // Add header.
                    if (this.opt.formatOptions !== undefined) {
                        if (this.opt.formatOptions.title !== undefined) {
                            if (this.opt.formatOptions.title != false) {
                                var header =
                  $('<pre/>').addClass('header').appendTo(this._contentDiv);
                                header.html('ENTRY           ' + this.opt.id +
                  '<br/>SEQUENCE<br/>');
                            }
                        }
                    }

                    /* Correct column size in case the sequence is as small peptide */
                    var numCols = this.opt.columns.size;
                    if (this.opt.sequence.length < this.opt.columns.size) {
                        numCols = this.opt.sequence.length;
                    }

                    var opt = {
                        numLeft: true,
                        numLeftSize: 7,
                        numLeftPad: ' ',
                        numTop: true,
                        numTopEach: 5,
                        numCols: numCols,
                        numColsForSpace: 0,
                        spaceBetweenChars: true
                    };
                    this._drawSequence(seq, opt);

                    // Add footer.
                    if (this.opt.formatOptions !== undefined) {
                        if (this.opt.formatOptions.footer !== undefined) {
                            if (this.opt.formatOptions.footer != false) {
                                var footer =
                  $('<pre/>').addClass('footer').appendTo(this._contentDiv);
                                footer.html('<br/>///');
                            }
                        }
                    }

                    this._drawAnnotations(opt);
                },
                /*
           * Function: Sequence._drawAnnotations
           * Purpose:  Paint the annotations on the sequence.
           * Returns:  -
           * Inputs: settings -> {object}
           */
                _drawAnnotations: function (settings) {

                    var self = this;
                    var a = this.opt.sequence.toLowerCase().split('');
                    var annotations = this._annotations;
                    var leftSpaces = '';
                    var row = '';
                    var annot = '';

                    // Index at the left?
                    if (settings.numLeft) {
                        leftSpaces += this._formatIndex(' ', settings.numLeftSize + 2, ' ');
                    }

                    for (var i = 0; i < a.length; i += settings.numCols) {
                        row = '';
                        for (var key in annotations) {
                            annotations[key].id = this.getId() + '_' + key;
                            annot = this._getHTMLRowAnnot(i + 1, annotations[key], settings);
                            if (annot.length > 0) {
                                row += '<br/>';
                                row += leftSpaces;
                                row += annot;
                                row += '<br/>';
                            }
                        }

                        var numCols = settings.numCols;
                        var charRemaining = a.length - i;
                        if (charRemaining < numCols) {
                            numCols = charRemaining;
                        }

                        if (settings.numRight) {
                            jQuery(row).insertAfter('div#' + self.opt.target + ' div pre span#numRight_' + this.getId() + '_' + (i + numCols));
                        } else {
                            jQuery(row).insertAfter('div#' + self.opt.target + ' div pre span#' + this.getId() + '_' + (i + numCols));
                        }
                    }

                    // add tool tips and background' coloring effect
                    jQuery(this._contentDiv).find('.annotation').each(function () {
                        self._addToolTip(this, function () {
                            return self._getAnnotationString(jQuery(this).attr('id'));
                        });

                        jQuery(this).mouseover(function (e) {
                            jQuery('.annotation.' + jQuery(e.target).attr('id')).each(function () {
                                jQuery(this).css('background-color', jQuery(this).attr('color'));
                            });
                        }).mouseout(function () {
                            jQuery('.annotation').css('background-color', 'transparent');

                        }).click(function (e) {
                            var name = undefined;
                            var id = jQuery(e.target).attr('id');
                            for (var i = 0; i < self._annotations.length; i++) {
                                if (self._annotations[i].id == id) {
                                    name = self._annotations[i].name;
                                    continue;
                                }
                            }
                            self.trigger(EVT_ON_ANNOTATION_CLICKED, {
                                'name': name,
                                //"pos": parseInt( jQuery(e.target).attr("pos") )
                            });
                        });

                    });

                },
                /*
         * Function: Sequence._getAnnotationString
         * Purpose:  Get the annotation text message for the tooltip
         * Returns:  {string} Annotation text for the annotation
         * Inputs:   id -> {int} index of the internal annotation array
         */
                _getAnnotationString: function (id) {
                    var annotation = this._annotations[id.substr(id.indexOf('_') + 1)];
                    return annotation.name + '<br/>' + ((annotation.html) ? annotation.html : '');
                },

                /*
         * Function: Sequence._getHTMLRowAnnot
         * Purpose:  Build an annotation
         * Returns:  HTML of the annotation
         * Inputs:   currentPos -> {int}
         * 			 annotation -> {Object}
         *  		 settings -> {Object}
         */
                _getHTMLRowAnnot: function (currentPos, annotation, settings) {
                    var styleBegin = 'border-left:1px solid; border-bottom:1px solid; border-color:';
                    var styleOn = 'border-bottom:1px solid; border-color:';
                    var styleEnd = 'border-bottom:1px solid; border-right:1px solid; border-color:';
                    var styleBeginAndEnd = 'border-left:1px solid; border-right:1px solid; border-bottom:1px solid; border-color:';

                    var row = [];
                    var end = (currentPos + settings.numCols);
                    var spaceBetweenChars = (settings.spaceBetweenChars) ? ' ' : '';
                    var defaultColor = annotation.color;
                    var id = annotation.id;
                    for (var pos = currentPos; pos < end; pos++) {
                        // regions
                        for (var r in annotation.regions) {
                            region = annotation.regions[r];

                            spaceAfter = '';
                            spaceAfter += (pos % settings.numColsForSpace == 0) ? ' ' : '';
                            spaceAfter += spaceBetweenChars;

                            color = ((region.color) ? region.color : defaultColor);
                            data = 'class="annotation ' + id + '" id="' + id + '" color="' + color + '" pos="' + pos + '"';

                            if (pos == region.start && pos == region.end) {
                                row[pos] = '<span style="' + styleBeginAndEnd + color + '" ' + data + '> ';
                                row[pos] += spaceAfter;
                                row[pos] += '</span>';
                            } else if (pos == region.start) {
                                row[pos] = '<span style="' + styleBegin + color + '" ' + data + '> ';
                                row[pos] += spaceAfter;
                                row[pos] += '</span>';
                            } else if (pos == region.end) {
                                row[pos] = '<span style="' + styleEnd + color + ' " ' + data + '> ';
                                //row[pos] += spaceAfter;
                                row[pos] += '</span>';
                            } else if (pos > region.start && pos < region.end) {
                                row[pos] = '<span style="' + styleOn + color + '" ' + data + '> ';
                                row[pos] += spaceAfter;
                                row[pos] += '</span>';
                            } else if (!row[pos]) {
                                row[pos] = ' ';
                                row[pos] += spaceAfter;
                            }
                        }
                    }

                    var str = row.join('');

                    return (str.indexOf('span') == -1) ? '' : str;
                },
                /*
         * Function: Sequence._drawRaw
         * Purpose:  Repaint the current sequence using RAW format.
         * Returns:  -
         * Inputs: -
         */
                _drawRaw: function () {
                    var self = this;
                    var a = this.opt.sequence.toLowerCase().split('');
                    var i = 0;
                    var arr = [];
                    var pre = jQuery('<pre></pre>').appendTo(this._contentDiv);

                    /* Correct column size in case the sequence is as small peptide */
                    var numCols = this.opt.columns.size;
                    if (this.opt.sequence.length < this.opt.columns.size) {
                        numCols = this.opt.sequence.length;
                    }

                    var opt = {
                        numCols: numCols
                    };

                    pre.html(
                        this._drawSequence(a, opt)
                    );

                    this._drawAnnotations(opt);
                },
                /*
           * Function: Sequence._drawPride
           * Purpose:  Repaint the current sequence using PRIDE format.
           * Returns:  -
           * Inputs: -
           */
                _drawPride: function () {
                    var seq = this.opt.sequence.toUpperCase().split('');

                    /* Correct column size in case the sequence is as small peptide */
                    var numCols = this.opt.columns.size;
                    if (this.opt.sequence.length < this.opt.columns.size) {
                        numCols = this.opt.sequence.length;
                    }

                    var opt = {
                        numLeft: true,
                        numLeftSize: 5,
                        numLeftPad: ' ',
                        numRight: false,
                        numRightSize: 5,
                        numRightPad: '',
                        numCols: numCols,
                        numColsForSpace: this.opt.columns.spacedEach
                    };
                    this._drawSequence(seq, opt);
                    this._drawAnnotations(opt);
                },
                /*
           * Function: Sequence._drawSequence
           * Purpose:  Repaint the current sequence using CUSTOM format.
           * Returns:  -
           * Inputs:   a -> {char[]} a The sequence strand.
           * 			 opt -> {Object} opt The CUSTOM format.
           */
                _drawSequence: function (a, opt) {
                    var indL = '';
                    var indT = '';
                    var indR = '\n';
                    var str = '';

                    // Index at top?
                    if (opt.numTop) {
                        indT += '<span class="numTop pos-marker">';
                        var size = (opt.spaceBetweenChars) ? opt.numTopEach * 2 : opt.numTopEach;

                        if (opt.numLeft) {
                            indT += this._formatIndex(' ', opt.numLeftSize, ' ');
                        }

                        indT += this._formatIndex(' ', size, ' ');

                        for (var x = opt.numTopEach; x < opt.numCols; x += opt.numTopEach) {
                            indT += this._formatIndex(x, size, ' ', true);
                        }
                        indT += '</span>';
                    }


                    // Index at the left?
                    if (opt.numLeft) {
                        indL += '<span id="numLeft_' + this.getId() + '_' + 0 + '"';
                        indL += 'class="pos-marker">';
                        indL += this._formatIndex(1, opt.numLeftSize, opt.numLeftPad);
                        indL += '  ';
                        indL += '</span>';
                        indL += '\n';
                    }

                    var j = 1;
                    for (var i = 1; i <= a.length; i++) {

                        if (i % opt.numCols == 0) {
                            str += '<span class="sequence" id="' + this.getId() + '_' + i + '">' + a[i - 1] + '</span>';

                            if (opt.numRight) {
                                indR += '<span id="numRight_' + this.getId() + '_' + i + '"';
                                indR += 'class="pos-marker">';
                                indR += '  ';
                                indR += this._formatIndex(i, opt.numRightSize, opt.numRightPad);
                                indR += '</span>';
                                indR += '\n';
                            }

                            str += '<br/>';

                            var aaRemaining = a.length - i;
                            if (opt.numLeft && aaRemaining > 0) {
                                indL += '<span id="numLeft_' + this.getId() + '_' + i + '"';
                                indL += 'class="pos-marker">';
                                indL += this._formatIndex(i + 1, opt.numLeftSize, opt.numLeftPad);
                                indL += '  ';
                                indL += '</span>';
                                indL += '\n';
                            }

                            j = 1;

                        } else {
                            str += '<span class="sequence" id="' + this.getId() + '_' + i + '"';
                            str += (j % opt.numColsForSpace == 0) ? ' style="letter-spacing: 1em;"' : '';
                            str += (opt.spaceBetweenChars) ? ' style="letter-spacing: 1em;"' : '';
                            str += '">' + a[i - 1];
                            str += '</span>';
                            j++;
                        }
                    }

                    str += '<br/>';

                    if (jQuery.browser.msie) {
                        str = '<pre>' + str + '</pre>';
                    }


                    var ret = [];
                    if (opt.numTop) {
                        $('<pre/>')
                            .html(indT)
                            .addClass('indT')
                            .css({
                                color: '#aaa'
                            })
                            .appendTo(this._contentDiv);
                    }
                    if (opt.numLeft) {
                        $('<pre/>')
                            .html(indL)
                            .addClass('indL hidden sm:inline-block')
                            .appendTo(this._contentDiv);
                    }

                    $('<pre/>')
                        .html(str)
                        .addClass('seqF inline-block')
                        .appendTo(this._contentDiv);

                    if (opt.numRight) {
                        $('<pre/>')
                            .html(indR)
                            .addClass('indR')
                            .css({
                                color: '#aaa',
                                display: 'inline-block'
                            })
                            .appendTo(this._contentDiv);
                    }

                    return str;
                },
                /*
           * Function: Sequence._formatIndex
           * Purpose:  Build the HTML corresponding to counting numbers (top, left, right) in the strand.
           * Returns:  -
           * Inputs:   number -> {int} The number
           * 			 size -> {int} Number of bins to suit the number.
           * 			 fillingChar -> {char} Character to be used for filling out blank bins.
           * 			 alignLeft -> {bool} Tell if aligned to the left.
           */
                _formatIndex: function (number, size, fillingChar, alignLeft) {
                    var str = number.toString();
                    var filling = '';
                    var padding = size - str.length;
                    if (padding > 0) {
                        while (padding-- > 0) {
                            filling += ('<span>' + fillingChar + '</span>');
                        }
                        if (alignLeft) {
                            str = number + filling;
                        } else {
                            str = filling + number;
                        }
                    }
                    return str;
                },
                /*
           * Function: Sequence._addSpanEvents
           * Purpose:  Add the event handlers to the strand.
           * Returns:  -
           * Inputs:   -
           */
                _addSpanEvents: function () {
                    var self = this;
                    var isMouseDown = false;
                    var clickPos;
                    var currentPos;

                    self._contentDiv.find('.sequence').each(function () {

                        // Register the starting position
                        jQuery(this).mousedown(function () {
                            var id = jQuery(this).attr('id');
                            currentPos = parseInt(id.substr(id.indexOf('_') + 1));
                            clickPos = currentPos;
                            self._setSelection(clickPos, currentPos);
                            isMouseDown = true;

                            // Selection is happening, raise an event
                            self.trigger(
                                EVT_ON_SELECTION_CHANGE,
                                {
                                    'start': self.opt.selection.start,
                                    'end': self.opt.selection.end
                                }
                            );

                        }).mouseover(function () {
                            // Update selection
                            // Show tooltip containing the position
                            var id = jQuery(this).attr('id');
                            currentPos = parseInt(id.substr(id.indexOf('_') + 1));

                            if (isMouseDown) {
                                if (currentPos > clickPos) {
                                    self._setSelection(clickPos, currentPos);
                                } else {
                                    self._setSelection(currentPos, clickPos);
                                }

                                // Selection is happening, raise an event
                                self.trigger(EVT_ON_SELECTION_CHANGE, {
                                    'start': self.opt.selection.start,
                                    'end': self.opt.selection.end
                                });
                            }

                        }).mouseup(function () {
                            isMouseDown = false;
                            // Selection is done, raise an event
                            self.trigger(EVT_ON_SELECTION_CHANGED, {
                                'start': self.opt.selection.start,
                                'end': self.opt.selection.end
                            });
                        });

                        // Add a tooltip for this sequence base.
                        self._addToolTip.call(self, this, function () {
                            if (isMouseDown) {
                                return '[' + self.opt.selection.start + ', ' + self.opt.selection.end + ']';
                            } else {
                                return currentPos;
                            }
                        });

                    })
                        .css('cursor', 'pointer');
                },
                /*
           * Function: Sequence._addTooltip
           * Purpose:  Add a tooltip around the target DOM element provided as argument
           * Returns:  -
           * Inputs:   target -> {Element} DOM element wich is the targeted focus for the tooltip.
           * 			 cbGetMessageFunction -> {function} A callback function wich returns the message to be displayed in the tip.
           */
                _addToolTip: function (target, cbGetMessageFunction) {

                    var tipId = this.opt._tooltip;

                    jQuery(target).mouseover(function (e) {

                        var offset = jQuery(e.target).offset();
                        var containerOffset = jQuery(e.target).closest('.seqF').offset();

                        if (!jQuery(tipId).is(':visible')) {
                            jQuery(tipId)
                                .css({
                                    'background-color': '#000',
                                    'padding': '3px 10px 3px 10px',
                                    'top': offset.top - containerOffset.top + jQuery(e.target).height() + 15 + 'px',
                                    'left': offset.left - containerOffset.left + jQuery(e.target).width() + 70 + 'px',
                                    'color': '#fff',
                                    'font-size': '12px',
                                    'position': 'absolute'
                                })
                                .animate({ opacity: '0.85' }, 10)
                                .html(cbGetMessageFunction.call(target))
                                .show();
                        }

                    }).mouseout(function () {
                        //Remove the appended tooltip template
                        jQuery(tipId).hide();
                    });
                },

                /**
          * Annotate a set of intervals provided in the argument.
          *
          * @example
          * // Annotations using regions with different colors.
          * mySequence.addAnnotation({
        *    name:"UNIPROT",
        *    html:"&lt;br&gt; Example of &lt;b&gt;HTML&lt;/b&gt;",
        *    color:"green",
        *    regions: [
        *       {start: 540, end: 560},
        *       {start: 561, end:580, color: "#FFA010"},
        *       {start: 581, end:590, color: "red"},
        *       {start: 690, end:710}]
        * });
        *
          *
          * @param {Object} annotation The intervals belonging to the same annotation.
          * Syntax: { name: &lt;value&gt;, color: &lt;HTMLColorCode&gt;, html: &lt;HTMLString&gt;, regions: [{ start: &lt;startVal1&gt;, end: &lt;endVal1&gt;}, ...,  { start: &lt;startValN&gt;, end: &lt;endValN&gt;}] }
          */
                addAnnotation: function (annotation) {
                    this._annotations.push(annotation);
                    this._redraw();
                },

                /**
          * Removes an annotation by means of its name.
          *
          * @example
          * // Remove the UNIPROT annotation.
          * mySequence.removeAnnotation('UNIPROT');
          *
          * @param {string} name The name of the annotation to be removed.
          *
          */
                removeAnnotation: function (name) {
                    for (var i = 0; i < this._annotations.length; i++) {
                        if (name != this._annotations[i].name) {
                            this._annotations.splice(i, 1);
                            this._redraw();
                            break;
                        }
                    }
                },
                /**
          * Removes all the current annotations.
          *
          * @example
          * mySequence.removeAllAnnotations();
          *
          */
                removeAllAnnotations: function () {
                    this._annotations = [];
                    this._redraw();
                },


            });

        require('biojs-events').mixin(Sequence.prototype);

    }, { 'biojs-events': 2, 'jquery-browser-plugin': 20, 'js-class': 22 }], 2: [function (require, module, exports) {
        var events = require('backbone-events-standalone');

        events.onAll = function (callback, context) {
            this.on('all', callback, context);
            return this;
        };

        // Mixin utility
        events.oldMixin = events.mixin;
        events.mixin = function (proto) {
            events.oldMixin(proto);
            // add custom onAll
            var exports = ['onAll'];
            for (var i = 0; i < exports.length; i++) {
                var name = exports[i];
                proto[name] = this[name];
            }
            return proto;
        };

        module.exports = events;

    }, { 'backbone-events-standalone': 4 }], 3: [function (require, module, exports) {
    /**
     * Standalone extraction of Backbone.Events, no external dependency required.
     * Degrades nicely when Backone/underscore are already available in the current
     * global context.
     *
     * Note that docs suggest to use underscore's `_.extend()` method to add Events
     * support to some given object. A `mixin()` method has been added to the Events
     * prototype to avoid using underscore for that sole purpose:
     *
     *     var myEventEmitter = BackboneEvents.mixin({});
     *
     * Or for a function constructor:
     *
     *     function MyConstructor(){}
     *     MyConstructor.prototype.foo = function(){}
     *     BackboneEvents.mixin(MyConstructor.prototype);
     *
     * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
     * (c) 2013 Nicolas Perriault
     */
        /* global exports:true, define, module */
        (function () {
            var root = this,
                breaker = {},
                nativeForEach = Array.prototype.forEach,
                hasOwnProperty = Object.prototype.hasOwnProperty,
                slice = Array.prototype.slice,
                idCounter = 0;

            // Returns a partial implementation matching the minimal API subset required
            // by Backbone.Events
            function miniscore() {
                return {
                    keys: Object.keys || function (obj) {
                        if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
                            throw new TypeError('keys() called on a non-object');
                        }
                        var key, keys = [];
                        for (key in obj) {
                            if (obj.hasOwnProperty(key)) {
                                keys[keys.length] = key;
                            }
                        }
                        return keys;
                    },

                    uniqueId: function (prefix) {
                        var id = ++idCounter + '';
                        return prefix ? prefix + id : id;
                    },

                    has: function (obj, key) {
                        return hasOwnProperty.call(obj, key);
                    },

                    each: function (obj, iterator, context) {
                        if (obj == null) return;
                        if (nativeForEach && obj.forEach === nativeForEach) {
                            obj.forEach(iterator, context);
                        } else if (obj.length === +obj.length) {
                            for (var i = 0, l = obj.length; i < l; i++) {
                                if (iterator.call(context, obj[i], i, obj) === breaker) return;
                            }
                        } else {
                            for (var key in obj) {
                                if (this.has(obj, key)) {
                                    if (iterator.call(context, obj[key], key, obj) === breaker) return;
                                }
                            }
                        }
                    },

                    once: function (func) {
                        var ran = false, memo;
                        return function () {
                            if (ran) return memo;
                            ran = true;
                            memo = func.apply(this, arguments);
                            func = null;
                            return memo;
                        };
                    }
                };
            }

            var _ = miniscore(), Events;

            // Backbone.Events
            // ---------------

            // A module that can be mixed in to *any object* in order to provide it with
            // custom events. You may bind with `on` or remove with `off` callback
            // functions to an event; `trigger`-ing an event fires all callbacks in
            // succession.
            //
            //     var object = {};
            //     _.extend(object, Backbone.Events);
            //     object.on('expand', function(){ alert('expanded'); });
            //     object.trigger('expand');
            //
            Events = {

                // Bind an event to a `callback` function. Passing `"all"` will bind
                // the callback to all events fired.
                on: function (name, callback, context) {
                    if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
                    this._events || (this._events = {});
                    var events = this._events[name] || (this._events[name] = []);
                    events.push({ callback: callback, context: context, ctx: context || this });
                    return this;
                },

                // Bind an event to only be triggered a single time. After the first time
                // the callback is invoked, it will be removed.
                once: function (name, callback, context) {
                    if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
                    var self = this;
                    var once = _.once(function () {
                        self.off(name, once);
                        callback.apply(this, arguments);
                    });
                    once._callback = callback;
                    return this.on(name, once, context);
                },

                // Remove one or many callbacks. If `context` is null, removes all
                // callbacks with that function. If `callback` is null, removes all
                // callbacks for the event. If `name` is null, removes all bound
                // callbacks for all events.
                off: function (name, callback, context) {
                    var retain, ev, events, names, i, l, j, k;
                    if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
                    if (!name && !callback && !context) {
                        this._events = {};
                        return this;
                    }

                    names = name ? [name] : _.keys(this._events);
                    for (i = 0, l = names.length; i < l; i++) {
                        name = names[i];
                        if (events = this._events[name]) {
                            this._events[name] = retain = [];
                            if (callback || context) {
                                for (j = 0, k = events.length; j < k; j++) {
                                    ev = events[j];
                                    if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                    (context && context !== ev.context)) {
                                        retain.push(ev);
                                    }
                                }
                            }
                            if (!retain.length) delete this._events[name];
                        }
                    }

                    return this;
                },

                // Trigger one or many events, firing all bound callbacks. Callbacks are
                // passed the same arguments as `trigger` is, apart from the event name
                // (unless you're listening on `"all"`, which will cause your callback to
                // receive the true name of the event as the first argument).
                trigger: function (name) {
                    if (!this._events) return this;
                    var args = slice.call(arguments, 1);
                    if (!eventsApi(this, 'trigger', name, args)) return this;
                    var events = this._events[name];
                    var allEvents = this._events.all;
                    if (events) triggerEvents(events, args);
                    if (allEvents) triggerEvents(allEvents, arguments);
                    return this;
                },

                // Tell this object to stop listening to either specific events ... or
                // to every object it's currently listening to.
                stopListening: function (obj, name, callback) {
                    var listeners = this._listeners;
                    if (!listeners) return this;
                    var deleteListener = !name && !callback;
                    if (typeof name === 'object') callback = this;
                    if (obj) (listeners = {})[obj._listenerId] = obj;
                    for (var id in listeners) {
                        listeners[id].off(name, callback, this);
                        if (deleteListener) delete this._listeners[id];
                    }
                    return this;
                }

            };

            // Regular expression used to split event strings.
            var eventSplitter = /\s+/;

            // Implement fancy features of the Events API such as multiple event
            // names `"change blur"` and jQuery-style event maps `{change: action}`
            // in terms of the existing API.
            var eventsApi = function (obj, action, name, rest) {
                if (!name) return true;

                // Handle event maps.
                if (typeof name === 'object') {
                    for (var key in name) {
                        obj[action].apply(obj, [key, name[key]].concat(rest));
                    }
                    return false;
                }

                // Handle space separated event names.
                if (eventSplitter.test(name)) {
                    var names = name.split(eventSplitter);
                    for (var i = 0, l = names.length; i < l; i++) {
                        obj[action].apply(obj, [names[i]].concat(rest));
                    }
                    return false;
                }

                return true;
            };

            // A difficult-to-believe, but optimized internal dispatch function for
            // triggering events. Tries to keep the usual cases speedy (most internal
            // Backbone events have 3 arguments).
            var triggerEvents = function (events, args) {
                var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
                switch (args.length) {
                case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
                case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
                case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
                case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
                default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
                }
            };

            var listenMethods = { listenTo: 'on', listenToOnce: 'once' };

            // Inversion-of-control versions of `on` and `once`. Tell *this* object to
            // listen to an event in another object ... keeping track of what it's
            // listening to.
            _.each(listenMethods, function (implementation, method) {
                Events[method] = function (obj, name, callback) {
                    var listeners = this._listeners || (this._listeners = {});
                    var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
                    listeners[id] = obj;
                    if (typeof name === 'object') callback = this;
                    obj[implementation](name, callback, this);
                    return this;
                };
            });

            // Aliases for backwards compatibility.
            Events.bind = Events.on;
            Events.unbind = Events.off;

            // Mixin utility
            Events.mixin = function (proto) {
                var exports = ['on', 'once', 'off', 'trigger', 'stopListening', 'listenTo',
                    'listenToOnce', 'bind', 'unbind'];
                _.each(exports, function (name) {
                    proto[name] = this[name];
                }, this);
                return proto;
            };

            // Export Events as BackboneEvents depending on current context
            if (typeof define === 'function') {
                define(function () {
                    return Events;
                });
            } else if (typeof exports !== 'undefined') {
                if (typeof module !== 'undefined' && module.exports) {
                    exports = module.exports = Events;
                }
                exports.BackboneEvents = Events;
            } else {
                root.BackboneEvents = Events;
            }
        })(this);

    }, {}], 4: [function (require, module, exports) {
        module.exports = require('./backbone-events-standalone');

    }, { './backbone-events-standalone': 3 }], 5: [function (require, module, exports) {
    // Generated by CoffeeScript 1.8.0
        var GenericReader, xhr;

        xhr = require('nets');

        module.exports = GenericReader = (function () {
            function GenericReader() { }

            GenericReader.read = function (url, callback) {
                var onret;
                onret = (function (_this) {
                    return function (err, response, text) {
                        return _this._onRetrieval(text, callback);
                    };
                })(this);
                return xhr(url, onret);
            };

            GenericReader._onRetrieval = function (text, callback) {
                var rText;
                rText = this.parse(text);
                return callback(rText);
            };

            return GenericReader;

        })();

    }, { 'nets': 12 }], 6: [function (require, module, exports) {
    // Generated by CoffeeScript 1.8.0
        var Fasta, GenericReader, Seq, Str,
            __hasProp = {}.hasOwnProperty,
            __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

        Str = require('./strings');

        GenericReader = require('./generic_reader');

        Seq = require('biojs-model').seq;

        module.exports = Fasta = (function (_super) {
            __extends(Fasta, _super);

            function Fasta() {
                return Fasta.__super__.constructor.apply(this, arguments);
            }

            Fasta.parse = function (text) {
                var currentSeq, database, databaseID, identifiers, k, label, line, seqs, _i, _len;
                seqs = [];
                if (Object.prototype.toString.call(text) !== '[object Array]') {
                    text = text.split('\n');
                }
                for (_i = 0, _len = text.length; _i < _len; _i++) {
                    line = text[_i];
                    if (line[0] === '>' || line[0] === ';') {
                        label = line.slice(1);
                        currentSeq = new Seq('', label, seqs.length);
                        seqs.push(currentSeq);
                        if (Str.contains('|', line)) {
                            identifiers = label.split('|');
                            k = 1;
                            while (k < identifiers.length) {
                                database = identifiers[k];
                                databaseID = identifiers[k + 1];
                                currentSeq.meta[database] = databaseID;
                                k += 2;
                            }
                            currentSeq.name = identifiers[identifiers.length - 1];
                        }
                    } else {
                        currentSeq.seq += line;
                    }
                }
                return seqs;
            };

            return Fasta;

        })(GenericReader);

    }, { './generic_reader': 5, './strings': 7, 'biojs-model': 10 }], 7: [function (require, module, exports) {
    // Generated by CoffeeScript 1.8.0
        var strings;

        strings = {
            contains: function (text, search) {
                return ''.indexOf.call(text, search, 0) !== -1;
            }
        };

        module.exports = strings;

    }, {}], 8: [function (require, module, exports) {
    // Generated by CoffeeScript 1.8.0
        var Utils;

        Utils = {};

        Utils.splitNChars = function (txt, num) {
            var i, result, _i, _ref;
            result = [];
            for (i = _i = 0, _ref = txt.length - 1; num > 0 ? _i <= _ref : _i >= _ref; i = _i += num) {
                result.push(txt.substr(i, num));
            }
            return result;
        };

        module.exports = Utils;

    }, {}], 9: [function (require, module, exports) {
    // Generated by CoffeeScript 1.8.0
        var FastaExporter, Utils;

        Utils = require('./utils');

        module.exports = FastaExporter = (function () {
            function FastaExporter() { }

            FastaExporter['export'] = function (seqs, access) {
                var seq, text, _i, _len;
                text = '';
                for (_i = 0, _len = seqs.length; _i < _len; _i++) {
                    seq = seqs[_i];
                    if (access != null) {
                        seq = access(seq);
                    }
                    text += '>' + seq.name + '\n';
                    text += (Utils.splitNChars(seq.seq, 80)).join('\n');
                    text += '\n';
                }
                return text;
            };

            return FastaExporter;

        })();

    }, { './utils': 8 }], 10: [function (require, module, exports) {
        module.exports.seq = require('./seq');

    }, { './seq': 11 }], 11: [function (require, module, exports) {
        module.exports = function (seq, name, id) {
            this.seq = seq;
            this.name = name;
            this.id = id;
            this.meta = {};
        };

    }, {}], 12: [function (require, module, exports) {
        var req = require('request');

        module.exports = Nets;

        function Nets(uri, opts, cb) {
            req(uri, opts, cb);
        }
    }, { 'request': 13 }], 13: [function (require, module, exports) {
        var window = require('global/window');
        var once = require('once');
        var parseHeaders = require('parse-headers');

        var messages = {
            '0': 'Internal XMLHttpRequest Error',
            '4': '4xx Client Error',
            '5': '5xx Server Error'
        };

        var XHR = window.XMLHttpRequest || noop;
        var XDR = 'withCredentials' in (new XHR()) ? XHR : window.XDomainRequest;

        module.exports = createXHR;

        function createXHR(options, callback) {
            if (typeof options === 'string') {
                options = { uri: options };
            }

            options = options || {};
            callback = once(callback);

            var xhr = options.xhr || null;

            if (!xhr) {
                if (options.cors || options.useXDR) {
                    xhr = new XDR();
                } else {
                    xhr = new XHR();
                }
            }

            var uri = xhr.url = options.uri || options.url;
            var method = xhr.method = options.method || 'GET';
            var body = options.body || options.data;
            var headers = xhr.headers = options.headers || {};
            var sync = !!options.sync;
            var isJson = false;
            var key;
            var load = options.response ? loadResponse : loadXhr;

            if ('json' in options) {
                isJson = true;
                headers['Accept'] = 'application/json';
                if (method !== 'GET' && method !== 'HEAD') {
                    headers['Content-Type'] = 'application/json';
                    body = JSON.stringify(options.json);
                }
            }

            xhr.onreadystatechange = readystatechange;
            xhr.onload = load;
            xhr.onerror = error;
            // IE9 must have onprogress be set to a unique function.
            xhr.onprogress = function () {
                // IE must die
            };
            // hate IE
            xhr.ontimeout = noop;
            xhr.open(method, uri, !sync);
            //backward compatibility
            if (options.withCredentials || (options.cors && options.withCredentials !== false)) {
                xhr.withCredentials = true;
            }

            // Cannot set timeout with sync request
            if (!sync) {
                xhr.timeout = 'timeout' in options ? options.timeout : 5000;
            }

            if (xhr.setRequestHeader) {
                for (key in headers) {
                    if (headers.hasOwnProperty(key)) {
                        xhr.setRequestHeader(key, headers[key]);
                    }
                }
            } else if (options.headers) {
                throw new Error('Headers cannot be set on an XDomainRequest object');
            }

            if ('responseType' in options) {
                xhr.responseType = options.responseType;
            }

            if ('beforeSend' in options &&
        typeof options.beforeSend === 'function'
            ) {
                options.beforeSend(xhr);
            }

            xhr.send(body);

            return xhr;

            function readystatechange() {
                if (xhr.readyState === 4) {
                    load();
                }
            }

            function getBody() {
                // Chrome with requestType=blob throws errors arround when even testing access to responseText
                var body = null;

                if (xhr.response) {
                    body = xhr.response;
                } else if (xhr.responseType === 'text' || !xhr.responseType) {
                    body = xhr.responseText || xhr.responseXML;
                }

                if (isJson) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) { }
                }

                return body;
            }

            function getStatusCode() {
                return xhr.status === 1223 ? 204 : xhr.status;
            }

            // if we're getting a none-ok statusCode, build & return an error
            function errorFromStatusCode(status, body) {
                var error = null;
                if (status === 0 || (status >= 400 && status < 600)) {
                    var message = (typeof body === 'string' ? body : false) ||
            messages[String(status).charAt(0)];
                    error = new Error(message);
                    error.statusCode = status;
                }

                return error;
            }

            // will load the data & process the response in a special response object
            function loadResponse() {
                var status = getStatusCode();
                var body = getBody();
                var error = errorFromStatusCode(status, body);
                var response = {
                    body: body,
                    statusCode: status,
                    statusText: xhr.statusText,
                    raw: xhr
                };
                if (xhr.getAllResponseHeaders) { //remember xhr can in fact be XDR for CORS in IE
                    response.headers = parseHeaders(xhr.getAllResponseHeaders());
                } else {
                    response.headers = {};
                }

                callback(error, response, response.body);
            }

            // will load the data and add some response properties to the source xhr
            // and then respond with that
            function loadXhr() {
                var status = getStatusCode();
                var error = errorFromStatusCode(status);

                xhr.status = xhr.statusCode = status;
                xhr.body = getBody();
                xhr.headers = parseHeaders(xhr.getAllResponseHeaders());

                callback(error, xhr, xhr.body);
            }

            function error(evt) {
                callback(evt, xhr);
            }
        }


        function noop() { }

    }, { 'global/window': 14, 'once': 15, 'parse-headers': 19 }], 14: [function (require, module, exports) {
        (function (global) {
            if (typeof window !== 'undefined') {
                module.exports = window;
            } else if (typeof global !== 'undefined') {
                module.exports = global;
            } else if (typeof self !== 'undefined') {
                module.exports = self;
            } else {
                module.exports = {};
            }

        }).call(this, typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {});

    }, {}], 15: [function (require, module, exports) {
        module.exports = once;

        once.proto = once(function () {
            Object.defineProperty(Function.prototype, 'once', {
                value: function () {
                    return once(this);
                },
                configurable: true
            });
        });

        function once(fn) {
            var called = false;
            return function () {
                if (called) return;
                called = true;
                return fn.apply(this, arguments);
            };
        }

    }, {}], 16: [function (require, module, exports) {
        var isFunction = require('is-function');

        module.exports = forEach;

        var toString = Object.prototype.toString;
        var hasOwnProperty = Object.prototype.hasOwnProperty;

        function forEach(list, iterator, context) {
            if (!isFunction(iterator)) {
                throw new TypeError('iterator must be a function');
            }

            if (arguments.length < 3) {
                context = this;
            }

            if (toString.call(list) === '[object Array]')
                forEachArray(list, iterator, context);
            else if (typeof list === 'string')
                forEachString(list, iterator, context);
            else
                forEachObject(list, iterator, context);
        }

        function forEachArray(array, iterator, context) {
            for (var i = 0, len = array.length; i < len; i++) {
                if (hasOwnProperty.call(array, i)) {
                    iterator.call(context, array[i], i, array);
                }
            }
        }

        function forEachString(string, iterator, context) {
            for (var i = 0, len = string.length; i < len; i++) {
                // no such thing as a sparse string.
                iterator.call(context, string.charAt(i), i, string);
            }
        }

        function forEachObject(object, iterator, context) {
            for (var k in object) {
                if (hasOwnProperty.call(object, k)) {
                    iterator.call(context, object[k], k, object);
                }
            }
        }

    }, { 'is-function': 17 }], 17: [function (require, module, exports) {
        module.exports = isFunction;

        var toString = Object.prototype.toString;

        function isFunction(fn) {
            var string = toString.call(fn);
            return string === '[object Function]' ||
        (typeof fn === 'function' && string !== '[object RegExp]') ||
        (typeof window !== 'undefined' &&
          // IE8 and below
          (fn === window.setTimeout ||
            fn === window.alert ||
            fn === window.confirm ||
            fn === window.prompt));
        }

    }, {}], 18: [function (require, module, exports) {

        exports = module.exports = trim;

        function trim(str) {
            return str.replace(/^\s*|\s*$/g, '');
        }

        exports.left = function (str) {
            return str.replace(/^\s*/, '');
        };

        exports.right = function (str) {
            return str.replace(/\s*$/, '');
        };

    }, {}], 19: [function (require, module, exports) {
        var trim = require('trim')
            , forEach = require('for-each')
            , isArray = function (arg) {
                return Object.prototype.toString.call(arg) === '[object Array]';
            };

        module.exports = function (headers) {
            if (!headers)
                return {};

            var result = {};

            forEach(
                trim(headers).split('\n')
                , function (row) {
                    var index = row.indexOf(':')
                        , key = trim(row.slice(0, index)).toLowerCase()
                        , value = trim(row.slice(index + 1));

                    if (typeof (result[key]) === 'undefined') {
                        result[key] = value;
                    } else if (isArray(result[key])) {
                        result[key].push(value);
                    } else {
                        result[key] = [result[key], value];
                    }
                }
            );

            return result;
        };
    }, { 'for-each': 16, 'trim': 18 }], 20: [function (require, module, exports) {
        module.exports = require('./jquery.browser');

    }, { './jquery.browser': 21 }], 21: [function (require, module, exports) {
    /*!
     * jQuery Browser Plugin v0.0.6
     * https://github.com/gabceb/jquery-browser-plugin
     *
     * Original jquery-browser code Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
     * http://jquery.org/license
     *
     * Modifications Copyright 2013 Gabriel Cebrian
     * https://github.com/gabceb
     *
     * Released under the MIT license
     *
     * Date: 2013-07-29T17:23:27-07:00
     */


        var matched, browser;

        var uaMatch = function (ua) {
            ua = ua.toLowerCase();

            var match = /(opr)[\/]([\w.]+)/.exec(ua) ||
        /(chrome)[ \/]([\w.]+)/.exec(ua) ||
        /(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua) ||
        /(webkit)[ \/]([\w.]+)/.exec(ua) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
        /(msie) ([\w.]+)/.exec(ua) ||
        ua.indexOf('trident') >= 0 && /(rv)(?::| )([\w.]+)/.exec(ua) ||
        ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
        [];

            var platform_match = /(ipad)/.exec(ua) ||
        /(iphone)/.exec(ua) ||
        /(android)/.exec(ua) ||
        /(windows phone)/.exec(ua) ||
        /(win)/.exec(ua) ||
        /(mac)/.exec(ua) ||
        /(linux)/.exec(ua) ||
        /(cros)/i.exec(ua) ||
        [];

            return {
                browser: match[3] || match[1] || '',
                version: match[2] || '0',
                platform: platform_match[0] || ''
            };
        };

        matched = uaMatch(window.navigator.userAgent);
        browser = {};
        browser.uaMatch = uaMatch;

        if (matched.browser) {
            browser[matched.browser] = true;
            browser.version = matched.version;
            browser.versionNumber = parseInt(matched.version);
        }

        if (matched.platform) {
            browser[matched.platform] = true;
        }

        // These are all considered mobile platforms, meaning they run a mobile browser
        if (browser.android || browser.ipad || browser.iphone || browser['windows phone']) {
            browser.mobile = true;
        }

        // These are all considered desktop platforms, meaning they run a desktop browser
        if (browser.cros || browser.mac || browser.linux || browser.win) {
            browser.desktop = true;
        }

        // Chrome, Opera 15+ and Safari are webkit based browsers
        if (browser.chrome || browser.opr || browser.safari) {
            browser.webkit = true;
        }

        // IE11 has a new token so we will assign it msie to avoid breaking changes
        if (browser.rv) {
            var ie = 'msie';

            matched.browser = ie;
            browser[ie] = true;
        }

        // Opera 15+ are identified as opr
        if (browser.opr) {
            var opera = 'opera';

            matched.browser = opera;
            browser[opera] = true;
        }

        // Stock Android browsers are marked as Safari on Android.
        if (browser.safari && browser.android) {
            var android = 'android';

            matched.browser = android;
            browser[android] = true;
        }

        // Assign the name and platform variable
        browser.name = matched.browser;
        browser.platform = matched.platform;


        module.exports = browser;

    }, {}], 22: [function (require, module, exports) {
        (function (global) {
            /** @preserve http://github.com/easeway/js-class */

            // Class Definition using ECMA5 prototype chain

            function inherit(dest, src, noParent) {
                while (src && src !== Object.prototype) {
                    Object.getOwnPropertyNames(src).forEach(function (name) {
                        if (name != '.class' && !dest.hasOwnProperty(name)) {
                            var desc = Object.getOwnPropertyDescriptor(src, name);
                            Object.defineProperty(dest, name, desc);
                        }
                    });
                    if (noParent) {
                        break;
                    }
                    src = src.__proto__;
                }
                return dest;
            }

            var Class = function (base, proto, options) {
                if (typeof (base) != 'function') {
                    options = proto;
                    proto = base;
                    base = Object;
                }
                if (!proto) {
                    proto = {};
                }
                if (!options) {
                    options = {};
                }

                var meta = {
                    name: options.name,
                    base: base,
                    implements: []
                };
                var classProto = Class.clone(proto);
                if (options.implements) {
                    (Array.isArray(options.implements) ? options.implements : [options.implements])
                        .forEach(function (implementedType) {
                            if (typeof (implementedType) == 'function' && implementedType.prototype) {
                                meta.implements.push(implementedType);
                                Class.extend(classProto, implementedType.prototype);
                            }
                        });
                }
                classProto.__proto__ = base.prototype;
                var theClass = function () {
                    if (typeof (this.constructor) == 'function') {
                        this.constructor.apply(this, arguments);
                    }
                };
                meta.type = theClass;
                theClass.prototype = classProto;
                Object.defineProperty(theClass, '.class.meta', { value: meta, enumerable: false, configurable: false, writable: false });
                Object.defineProperty(classProto, '.class', { value: theClass, enumerable: false, configurable: false, writable: false });
                if (options.statics) {
                    Class.extend(theClass, options.statics);
                }
                return theClass;
            };

            Class.extend = inherit;

            Class.clone = function (object) {
                return inherit({}, object);
            };

            function findType(meta, type) {
                while (meta) {
                    if (meta.type.prototype === type.prototype) {
                        return true;
                    }
                    for (var i in meta.implements) {
                        var implType = meta.implements[i];
                        var implMeta = implType['.class.meta'];
                        if (implMeta) {
                            if (findType(implMeta, type)) {
                                return true;
                            }
                        } else {
                            for (var proto = implType.prototype; proto; proto = proto.__proto__) {
                                if (proto === type.prototype) {
                                    return true;
                                }
                            }
                        }
                    }
                    meta = meta.base ? meta.base['.class.meta'] : undefined;
                }
                return false;
            }

            var Checker = Class({
                constructor: function (object) {
                    this.object = object;
                },

                typeOf: function (type) {
                    if (this.object instanceof type) {
                        return true;
                    }
                    var meta = Class.typeInfo(this.object);
                    return meta && findType(meta, type);
                }
            });

            // aliases
            Checker.prototype.a = Checker.prototype.typeOf;
            Checker.prototype.an = Checker.prototype.typeOf;

            Class.is = function (object) {
                return new Checker(object);
            };

            Class.typeInfo = function (object) {
                var theClass = object.__proto__['.class'];
                return theClass ? theClass['.class.meta'] : undefined;
            };

            Class.VERSION = [0, 0, 2];

            if (module) {
                module.exports = Class;
            } else {
                global.Class = Class;   // for browser
            }
        }).call(this, typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {});

    }, {}], 'biojs-io-fasta': [function (require, module, exports) {
    // Generated by CoffeeScript 1.8.0
        module.exports.parse = require('./parser');

        module.exports.writer = require('./writer');

    }, { './parser': 6, './writer': 9 }], 'biojs-vis-sequence': [function (require, module, exports) {
        module.exports = require('./lib/index');

    }, { './lib/index': 1 }]
}, {}, ['biojs-vis-sequence']);
