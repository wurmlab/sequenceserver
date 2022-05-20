import $ from 'jquery';

require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// legacy!!
$.browser = require("jquery-browser-plugin");

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

var EVT_ON_SELECTION_CHANGE= "onSelectionChange";
var EVT_ON_SELECTION_CHANGED= "onSelectionChanged";
var EVT_ON_ANNOTATION_CLICKED= "onAnnotationClicked";

Sequence = Class(
/** @lends Sequence# */
{	
	constructor: function (options) {
		var self = this;

    this.opt = jQuery.extend(this.opt,options);

    this._container = jQuery(this.opt.target );
    
    // legacy support (target id without '#')
    if(this._container.length == 0){
      this._container = jQuery( "#" + this.opt.target )
    }

    if(this._container.length == 0){
      console.log("empty target container");
    }

    // legacy: copy target id
    this.opt.target = this._container[0].id;
		
		// Lazy initialization 
		this._container.ready(function() {
			self._initialize();
		});
	},
	
	/**
	 * Default values for the options
	 * @name Sequence-opt
	 */
	opt : {
		
		sequence : "",
		id : "",
		target : "",
		format : "FASTA",
		selection: { start: 0, end: 0 },
		columns: { size: 35, spacedEach: 10 },
		highlights : [],
		annotations: [],
		sequenceUrl: 'http://www.ebi.ac.uk/das-srv/uniprot/das/uniprot/sequence',
		
		// Styles 
		selectionColor : 'Yellow',
		selectionFontColor : 'black',
		highlightFontColor : 'red',
		highlightBackgroundColor : 'white',
		fontColor : 'inherit',
		backgroundColor : 'inherit',
		width: undefined,
		height: undefined,
		formatSelectorVisible: true
	},
	
	/**
	 * Array containing the supported event names
	 * @name Sequence-eventTypes
	 */
	eventTypes : [
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
		"onSelectionChanged",
		
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
		"onSelectionChange",
		
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
		"onAnnotationClicked"
	],

  getId : function () {
    return this.opt.id;
  },

	// internal members
	_headerDiv : null,
	_contentDiv : null,
	
	// Methods

	_initialize: function () {
		
		if ( this.opt.width !== undefined ) {
			this._container.width( this.opt.width );
		}
		
		if ( this.opt.height !== undefined ) {
			this._container.height( this.opt.height );
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
		var tooltip = "sequenceTip" + this.opt.target ;
		jQuery('<div id="' + tooltip + '"></div>') 
	        .css({	
	        	'position': "absolute",
	        	'z-index': "999999",
	        	'color': "#fff",
	        	'font-size': "12px",
	        	'width': "auto",
	        	'display': 'none'
	        })
	        .addClass("tooltip")
	        .appendTo("body")
	        .hide();
		this.opt._tooltip = document.getElementById(tooltip);

		if ( (this.opt.sequence) ) {
			this._redraw();
			
		} else if (  (this.opt.id) ) {
			this._requestSequence( this.opt.id );
			
		} else {
			this.clearSequence("No sequence available", "../biojs/css/images/warning_icon.png");
		}
		
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
    setSequence: function ( seq, identifier ) {

    	if ( seq.match(/^([A-N,R-Z][0-9][A-Z][A-Z, 0-9][A-Z, 0-9][0-9])|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?$/i) ) {
    		this._requestSequence( arguments[0] );
    		
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
    
    _requestSequence: function ( accession ) {
		var self = this;
    	
    	console.log("Requesting sequence for: " + accession );

		jQuery.ajax({ 
			url: self.opt.sequenceUrl,
			dataType: "xml",
			data: { segment: accession },
			success: function ( xml  ) {
				try {
					
					var sequenceNode = jQuery(xml).find('SEQUENCE:first');
					self.setSequence( sequenceNode.text(), sequenceNode.attr("id"), sequenceNode.attr("label") );
					
				} catch (e) {
					console.log("Error decoding response data: " + e.message );
					self.clearSequence("No sequence available", "../biojs/css/images/warning_icon.png");
				}

			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log("Error decoding response data: " + textStatus );
				self.clearSequence("Error requesting the sequence to the server " + this.url , "../biojs/css/images/warning_icon.png");
			}
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
    clearSequence: function ( showMessage, icon ) {
    	
    	var message = undefined;
    		
    	this.opt.sequence = "";
    	this.opt.id = ""; 
    	this._highlights = [];
		this._highlightsCount = 0;
		this.opt.selection = { start: 0, end: 0 };
		this._annotations = [];
		this._contentDiv.children().remove();
		
		this._headerDiv.hide();
		
		if ( undefined !== showMessage ) {
			message = jQuery('<div>' + showMessage + '</div>')
				.appendTo(this._contentDiv)
				.addClass("message");
			
			if ( undefined !== icon ) {
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
	setSelection : function(start, end) {
		if(start > end) {
			var aux = end;
			end = start;
			start = aux;

		}

		if(start != this.opt.selection.start || end != this.opt.selection.end) {
			this._setSelection(start, end);
			this.trigger(
					EVT_ON_SELECTION_CHANGED, 
					{ "start" : start, "end" : end }
			);
		}
	},
	
	_buildFormatSelector: function () {
		var self = this;
		
		this._headerDiv = jQuery('<div></div>').appendTo(this._container);
		this._headerDiv.append('Format: ');
		
		this._formatSelector = jQuery('<select> '+
				'<option value="FASTA">FASTA</option>'+
				'<option value="CODATA">CODATA</option>'+
				'<option value="PRIDE">PRIDE</option>'+
				'<option value="RAW">RAW</option></select>').appendTo(self._headerDiv);

		this._formatSelector.change(function(e) {
			self.opt.format = jQuery(this).val();
			self._redraw();
		});
		
		this._formatSelector.val(self.opt.format);	
		
		this.formatSelectorVisible( this.opt.formatSelectorVisible );
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
	addHighlight : function ( h ) {
		var id = '-1';
		var color = "";
		var background = "";
		var highlight = {};
		
		if ( h instanceof Object && h.start <= h.end ) {
			
			color = ( "string" == typeof h.color )? h.color : this.opt.highlightFontColor;
			background = ( "string" == typeof h.background )? h.background : this.opt.highlightBackgroundColor;
			id = ( "string" == typeof h.id )? h.id : (new Number(this._highlightsCount++)).toString();
			
			highlight = { "start": h.start, "end": h.end, "color": color, "background": background, "id": id };
			
			this._highlights.push(highlight);
			this._applyHighlight(highlight);
			this._restoreSelection(h.start,h.end);
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
	_applyHighlight: function ( highlight ) {		
		var seq = this._contentDiv.find('.sequence');
		for ( var i = highlight.start - 1; i < highlight.end; i++ ){
			zindex = jQuery(seq[i]).css("z-index");
			if (zindex=="auto"){
				 z = 1;
				 o = 1;
			 }
			 else{
				 z = 0;
				 o = 0.5;
			 }
			jQuery(seq[i])
				.css({ 
					"color": highlight.color,
					"background-color": highlight.background,
					"z-index": z,
					"opacity": o
					})
				.addClass("highlighted");
		}
	},
	/* 
     * Function: Sequence._applyHighlights
     * Purpose:  Apply the specified highlights.
     * Returns:  -
     * Inputs: highlights -> {Object[]} An array containing the highlights to be applied.
     */
	_applyHighlights: function ( highlights ) {
		for ( var i in highlights ) {
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
	_restoreHighlights: function ( start, end ) {
		var h = this._highlights;
		// paint the region using default blank settings
		this._applyHighlight({
			"start": start, 
			"end": end, 
			"color": this.opt.fontColor, 
			"background": this.opt.backgroundColor 
		});
		// restore highlights in that region
		for ( var i in h ) {
			// interval intersects with highlight i ?
			if ( !( h[i].start > end || h[i].end < start ) ) {
				a = ( h[i].start < start ) ? start : h[i].start;
				b = ( h[i].end > end ) ? end : h[i].end;
				this._applyHighlight({
					"start": a, 
					"end": b, 
					"color": h[i].color, 
					"background": h[i].background 
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
	_restoreSelection: function ( start, end ) {
		var sel = this.opt.selection;
		// interval intersects with current selection ?
		// restore selection
		if ( !( start > sel.end || end < sel.start ) ) {
			a = ( start < sel.start ) ? sel.start : start;
			b = ( end > sel.end ) ? sel.end : end;
			
			this._applyHighlight({
				"start": a, 
				"end": b, 
				"color": this.opt.selectionFontColor, 
				"background": this.opt.selectionColor,
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
	removeHighlight : function (id) {	
		var h = this._highlights;
		for ( i in h ) {
			if ( h[i].id == id ) {
				start = h[i].start;
				end = h[i].end;
				h.splice(i,1);
				
				this._restoreHighlights(start,end);
				this._restoreSelection(start,end);
				
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
	removeAllHighlights : function () {
		this._highlights = [];
		this._restoreHighlights(1,this.opt.sequence.length);
		this._restoreSelection(1,this.opt.sequence.length);
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
	setFormat : function(format) {
		if ( this.opt.format != format.toUpperCase() ) {
			this.opt.format = format.toUpperCase();
			this._redraw();
		}

		var self = this;
		// Changes the option in the combo box
		this._headerDiv.find('option').each(function() {
			if(jQuery(this).val() == self.opt.format.toUpperCase()) {
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
	setNumCols : function(numCols) {
		this.opt.columns.size = numCols;
		this._redraw();
	},
	
	/**
    * Set the visibility of the drop-down list of formats.
    * 
    * @param {boolean} visible true: show; false: hide.
    */
	formatSelectorVisible : function (visible){
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
	showFormatSelector : function() {
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
	hideFormatSelector : function() {
		this._headerDiv.hide();
	},
	
	/**
    * Hides the whole component.
    * 
    */
	hide : function () {
		this._headerDiv.hide();
		this._contentDiv.hide();
	},

	/**
    * Shows the whole component.
    * 
    */
	show : function () {
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
	_setSelection : function(start, end) {
		//alert("adsas");
		
		var current = this.opt.selection;
		var change = {};
		
		// Which is the change on selection?
		if ( current.start == start ) {
			// forward?
			if ( current.end < end ) {
				change.start = current.end;
				change.end = end;
			} else {
				this._restoreHighlights(end+1, current.end);
			}
		} else if ( current.end == end ) {
			// forward?
			if ( current.start > start ) {
				change.start = start;
				change.end = current.start;				
			} else {
				this._restoreHighlights(current.start, start-1);
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
	_repaintSelection: function(){
		var s = this.opt.selection;
		this._setSelection(0,0);
		this._setSelection(s.start,s.end);
	},
	
	/* 
     * Function: Sequence._redraw
     * Purpose:  Repaint the current sequence. 
     * Returns:  -
     * Inputs: -
     */
	_redraw : function() {
		var i = 0;	
		var self = this;
		
		// Reset the content
		//this._contentDiv.text('');
		this._contentDiv.children().remove();
		
		// Rebuild the spans of the sequence 
		// according to format
		if(this.opt.format == 'RAW') {
			this._drawRaw();
		} else if(this.opt.format == 'CODATA') {
			this._drawCodata();
		} else if (this.opt.format == 'FASTA'){
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
	_drawFasta : function() {
		var self = this;
		var a = this.opt.sequence.toUpperCase().split('');
		var pre = jQuery('<pre></pre>').appendTo(this._contentDiv);

		var i = 1;
		var arr = [];
	    var str = '>' + this.opt.id + ' ' + a.length + ' bp<br/>';
		
		/* Correct column size in case the sequence is as small peptide */
		var numCols = this.opt.columns.size;
		if ( this.opt.sequence.length < this.opt.columns.size ) {
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
	_drawCodata : function() {
		var seq = this.opt.sequence.toUpperCase().split('');

		// Add header.
		if ( this.opt.formatOptions !== undefined ){
			if(this.opt.formatOptions.title !== undefined ){
				if (this.opt.formatOptions.title != false) {
					var header =
						$('<pre/>').addClass('header').appendTo(this._contentDiv);
					header.html('ENTRY           ' + this.opt.id +
								'<br/>SEQUENCE<br/>'); }			
			}
		}
		
		/* Correct column size in case the sequence is as small peptide */
		var numCols = this.opt.columns.size;
		if ( this.opt.sequence.length < this.opt.columns.size ) {
			numCols = this.opt.sequence.length;	
		}
		
		var opt = {
				numLeft: true,
				numLeftSize: 7,
				numLeftPad:' ',
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
    _drawAnnotations: function ( settings ){ 
    	
    	var self = this;
    	var a = this.opt.sequence.toLowerCase().split('');    	
    	var annotations = this._annotations;
    	var leftSpaces = '';
    	var row = '';
    	var annot = '';
    	
    	// Index at the left?
		if ( settings.numLeft ) {
			leftSpaces += this._formatIndex(' ', settings.numLeftSize+2, ' ');
		}

		for ( var i = 0; i < a.length; i += settings.numCols ){
			row = '';
			for ( var key in annotations ){
				annotations[key].id = this.getId() + "_" + key;
				annot = this._getHTMLRowAnnot(i+1, annotations[key], settings);				
				if (annot.length > 0) {
					row += '<br/>';
					row += leftSpaces;
					row += annot;
					row += '<br/>';
				} 
			}
			
			var numCols = settings.numCols;
			var charRemaining = a.length-i;
			if(charRemaining < numCols){
				numCols	= charRemaining;
			}
			
			if ( settings.numRight ) {
				jQuery(row).insertAfter('div#'+self.opt.target+' div pre span#numRight_' + this.getId() + '_' + (i + numCols) );
			} else {
				jQuery(row).insertAfter('div#'+self.opt.target+' div pre span#'+ this.getId() + '_' + (i + numCols) );
			}
		}
		
		// add tool tips and background' coloring effect
		jQuery(this._contentDiv).find('.annotation').each( function(){
			self._addToolTip( this, function() {
				return self._getAnnotationString( jQuery(this).attr("id") );
			});
			
			jQuery(this).mouseover(function(e) {
				jQuery('.annotation.'+jQuery(e.target).attr("id")).each(function(){
					jQuery(this).css("background-color", jQuery(this).attr("color") );
				});
		    }).mouseout(function() {
		    	jQuery('.annotation').css("background-color", "transparent"); 
		    	
		    }).click(function(e) {
		    		var name = undefined;
		    		var id = jQuery(e.target).attr("id");
		    		for(var i =0; i < self._annotations.length;i++){
              if(self._annotations[i].id == id){
                name = self._annotations[i].name;
                continue;
              }
            }
		    	self.trigger( EVT_ON_ANNOTATION_CLICKED, {
	    		"name": name,
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
    _getAnnotationString: function ( id ) {
		var annotation = this._annotations[id.substr(id.indexOf("_") + 1)];
		return annotation.name + "<br/>" + ((annotation.html)? annotation.html : '');
    },
    
    /* 
     * Function: Sequence._getHTMLRowAnnot
     * Purpose:  Build an annotation
     * Returns:  HTML of the annotation
     * Inputs:   currentPos -> {int}
     * 			 annotation -> {Object} 
     *  		 settings -> {Object}
     */
    _getHTMLRowAnnot : function (currentPos, annotation, settings) {
    	var styleBegin = 'border-left:1px solid; border-bottom:1px solid; border-color:';
    	var styleOn = 'border-bottom:1px solid; border-color:';
    	var styleEnd = 'border-bottom:1px solid; border-right:1px solid; border-color:';
		var styleBeginAndEnd = 'border-left:1px solid; border-right:1px solid; border-bottom:1px solid; border-color:';
    	
    	var row = [];
    	var end = (currentPos + settings.numCols);
    	var spaceBetweenChars = (settings.spaceBetweenChars)? ' ' : '';    	
    	var defaultColor = annotation.color;
    	var id = annotation.id;
    	for ( var pos=currentPos; pos < end ; pos++ ) {
			// regions
			for ( var r in annotation.regions ) {
				region = annotation.regions[r];
				
				spaceAfter = '';
				spaceAfter += (pos % settings.numColsForSpace == 0 )? ' ' : '';
				spaceAfter += spaceBetweenChars;
				
				color = ((region.color)? region.color : defaultColor);
				data = 'class="annotation '+id+'" id="'+id+'" color="'+color+'" pos="'+pos+'"';
				
				if ( pos == region.start && pos == region.end) {
					row[pos] = '<span style="'+styleBeginAndEnd+color+'" '+data+'> ';
					row[pos] += spaceAfter;
					row[pos] += '</span>';
				} else if ( pos == region.start ) {
					row[pos] = '<span style="'+styleBegin+color+'" '+data+'> ';
					row[pos] += spaceAfter;
					row[pos] += '</span>';
				} else if ( pos == region.end ) {
					row[pos] = '<span style="'+styleEnd+color+' " '+data+'> ';
					//row[pos] += spaceAfter;
					row[pos] += '</span>';
				} else if ( pos > region.start && pos < region.end ) {
					row[pos] = '<span style="'+styleOn+color+'" '+data+'> ';
					row[pos] += spaceAfter;
					row[pos] += '</span>';
				} else if (!row[pos]) {
					row[pos] = ' ';
					row[pos] += spaceAfter;
				}
			}
		}

       	var str = row.join("");
    	
    	return ( str.indexOf("span") == -1 )? "" : str;
    },
    /* 
     * Function: Sequence._drawRaw
     * Purpose:  Repaint the current sequence using RAW format.  
     * Returns:  -
     * Inputs: -
     */
	_drawRaw : function() {
		var self = this;
		var a = this.opt.sequence.toLowerCase().split('');
		var i = 0;
		var arr = [];
		var pre = jQuery('<pre></pre>').appendTo(this._contentDiv);
		
		/* Correct column size in case the sequence is as small peptide */
		var numCols = this.opt.columns.size;
		if ( this.opt.sequence.length < this.opt.columns.size ) {
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
	_drawPride : function() {
		var seq = this.opt.sequence.toUpperCase().split('');
		
		/* Correct column size in case the sequence is as small peptide */
		var numCols = this.opt.columns.size;
		if ( this.opt.sequence.length < this.opt.columns.size ) {
			numCols = this.opt.sequence.length;	
		}
	
		opt = {
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
	_drawSequence : function(a, opt) {
        var indL = '';
		var indT = '';
		var indR = '\n';
		var str  = '';

		// Index at top?
		if( opt.numTop )
		{
			indT += '<span class="numTop pos-marker">'
			var size = (opt.spaceBetweenChars)? opt.numTopEach*2: opt.numTopEach;
			
			if (opt.numLeft) {
				indT += this._formatIndex(' ', opt.numLeftSize, ' ');
			}
			
			indT += this._formatIndex(' ', size, ' ');
			
			for(var x = opt.numTopEach; x < opt.numCols; x += opt.numTopEach) {
				indT += this._formatIndex(x, size, ' ', true);
			}
			indT += '</span>'
		}
		
		
		// Index at the left?
		if (opt.numLeft) {
			indL += '<span id="numLeft_' + this.getId() + '_' + 0 + '"';
			indL += 'class="pos-marker">'
			indL += this._formatIndex(1, opt.numLeftSize, opt.numLeftPad);
			indL += '  ';
			indL += '</span>';
            indL += '\n';
		}

		var j=1;
		for (var i=1; i <= a.length; i++) {

			if( i % opt.numCols == 0) {	
				str += '<span class="sequence" id="' + this.getId() + '_' + i + '">' + a[i-1] + '</span>';
				
				if (opt.numRight) {
					indR += '<span id="numRight_' + this.getId() + '_' + i + '"';
					indR += 'class="pos-marker">'
					indR += '  ';
					indR += this._formatIndex(i, opt.numRightSize, opt.numRightPad);	
					indR += '</span>';
					indR += '\n';
				}
				
				str += '<br/>';
				
				var aaRemaining = a.length - i;
				if (opt.numLeft && aaRemaining > 0) {
					indL += '<span id="numLeft_' + this.getId() + '_' + i + '"';
					indL += 'class="pos-marker">'
					indL += this._formatIndex(i+1, opt.numLeftSize, opt.numLeftPad);
					indL += '  ';
					indL += '</span>';
                    indL += '\n';
                }
				
				j = 1;
				
			} else {
                str += '<span class="sequence" id="' + this.getId() + '_' + i + '"';
				str += (j % opt.numColsForSpace == 0)? ' style="letter-spacing: 1em;"' : '';
				str += (opt.spaceBetweenChars)? ' style="letter-spacing: 1em;"' : '';
				str += '">' + a[i-1];
				str += '</span>';
				j++;
			}
		}
		
		str += '<br/>'	
			
		if (jQuery.browser.msie) {
			str = "<pre>" + str + "</pre>";
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
			.addClass('indL')
			.css({
				color: '#aaa',
				display: 'inline-block'
			})
			.appendTo(this._contentDiv);
		}

		$('<pre/>')
		.html(str)
		.addClass('seqF')
		.css({
			display: 'inline-block'
		})
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
	_formatIndex : function( number, size, fillingChar, alignLeft) {
		var str = number.toString();
		var filling = '';
		var padding = size - str.length;	
		if ( padding > 0 ) {
			while ( padding-- > 0 ) {
				filling += ("<span>"+fillingChar+"</span>");
			}
			if (alignLeft){
				str = number+filling;
			} else {
				str = filling+number;
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
	_addSpanEvents : function() {
		var self = this;
		var isMouseDown = false;
		var clickPos;
		var currentPos;

		self._contentDiv.find('.sequence').each( function () {	
			
			// Register the starting position
			jQuery(this).mousedown(function() {
				var id = jQuery(this).attr('id');
				currentPos = parseInt(id.substr(id.indexOf("_") + 1));
				clickPos = currentPos;
				self._setSelection(clickPos,currentPos);
				isMouseDown = true;
				
				// Selection is happening, raise an event
				self.trigger(
					EVT_ON_SELECTION_CHANGE, 
					{ 
						"start" : self.opt.selection.start, 
						"end" : self.opt.selection.end 
					}
				);
			
			}).mouseover(function() {
				// Update selection
				// Show tooltip containing the position
				var id = jQuery(this).attr('id');
				currentPos = parseInt(id.substr(id.indexOf("_") + 1));
				
				if(isMouseDown) {
					if( currentPos > clickPos ) {
						self._setSelection(clickPos, currentPos);
					} else {
						self._setSelection(currentPos, clickPos);
					}
					
					// Selection is happening, raise an event
					self.trigger( EVT_ON_SELECTION_CHANGE, { 
						"start" : self.opt.selection.start, 
						"end" : self.opt.selection.end 
					});
				} 
				
			}).mouseup(function() {
				isMouseDown = false;
				// Selection is done, raise an event
				self.trigger( EVT_ON_SELECTION_CHANGED, { 
					"start" : self.opt.selection.start, 
					"end" : self.opt.selection.end 
				});
			});
			
			// Add a tooltip for this sequence base.
			self._addToolTip.call( self, this, function( ) {
				if (isMouseDown) {
	     			return "[" + self.opt.selection.start +", " + self.opt.selection.end + "]";
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
	_addToolTip : function ( target, cbGetMessageFunction ) {
		
 		var tipId = this.opt._tooltip;
		
		jQuery(target).mouseover(function(e) {
			
	 		var offset = jQuery(e.target).offset();

			if ( ! jQuery( tipId ).is(':visible') ) {
		        jQuery( tipId ) 
		        	.css({
		        		'background-color': "#000",
		        		'padding': "3px 10px 3px 10px",
		        		'top': offset.top + jQuery(e.target).height() + "px",
		        		'left': offset.left + jQuery(e.target).width() + "px"
		        	})
			        .animate( {opacity: '0.85'}, 10)
			        .html( cbGetMessageFunction.call( target ) )
			        .show();
			}

	    }).mouseout(function() {
	        //Remove the appended tooltip template
	        jQuery( tipId ).hide();	         
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
	addAnnotation: function ( annotation ) {
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
	removeAnnotation: function ( name ) {
		for (var i=0; i < this._annotations.length ; i++ ){
			if(name != this._annotations[i].name){
				this._annotations.splice(i,1);
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

require("biojs-events").mixin(Sequence.prototype);
module.exports = Sequence;

},{"biojs-events":2,"jquery-browser-plugin":20,"js-class":22}],2:[function(require,module,exports){
var events = require("backbone-events-standalone");

events.onAll = function(callback,context){
  this.on("all", callback,context);
  return this;
};

// Mixin utility
events.oldMixin = events.mixin;
events.mixin = function(proto) {
  events.oldMixin(proto);
  // add custom onAll
  var exports = ['onAll'];
  for(var i=0; i < exports.length;i++){
    var name = exports[i];
    proto[name] = this[name];
  }
  return proto;
};

module.exports = events;

},{"backbone-events-standalone":4}],3:[function(require,module,exports){
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
(function() {
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
        if (typeof obj !== "object" && typeof obj !== "function" || obj === null) {
          throw new TypeError("keys() called on a non-object");
        }
        var key, keys = [];
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            keys[keys.length] = key;
          }
        }
        return keys;
      },

      uniqueId: function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
      },

      has: function(obj, key) {
        return hasOwnProperty.call(obj, key);
      },

      each: function(obj, iterator, context) {
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

      once: function(func) {
        var ran = false, memo;
        return function() {
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
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
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
    off: function(name, callback, context) {
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
    trigger: function(name) {
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
    stopListening: function(obj, name, callback) {
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
  var eventsApi = function(obj, action, name, rest) {
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
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Mixin utility
  Events.mixin = function(proto) {
    var exports = ['on', 'once', 'off', 'trigger', 'stopListening', 'listenTo',
                   'listenToOnce', 'bind', 'unbind'];
    _.each(exports, function(name) {
      proto[name] = this[name];
    }, this);
    return proto;
  };

  // Export Events as BackboneEvents depending on current context
  if (typeof define === "function") {
    define(function() {
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

},{}],4:[function(require,module,exports){
module.exports = require('./backbone-events-standalone');

},{"./backbone-events-standalone":3}],5:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
var GenericReader, xhr;

xhr = require('nets');

module.exports = GenericReader = (function() {
  function GenericReader() {}

  GenericReader.read = function(url, callback) {
    var onret;
    onret = (function(_this) {
      return function(err, response, text) {
        return _this._onRetrieval(text, callback);
      };
    })(this);
    return xhr(url, onret);
  };

  GenericReader._onRetrieval = function(text, callback) {
    var rText;
    rText = this.parse(text);
    return callback(rText);
  };

  return GenericReader;

})();

},{"nets":12}],6:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
var Fasta, GenericReader, Seq, Str,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Str = require("./strings");

GenericReader = require("./generic_reader");

Seq = require("biojs-model").seq;

module.exports = Fasta = (function(_super) {
  __extends(Fasta, _super);

  function Fasta() {
    return Fasta.__super__.constructor.apply(this, arguments);
  }

  Fasta.parse = function(text) {
    var currentSeq, database, databaseID, identifiers, k, label, line, seqs, _i, _len;
    seqs = [];
    if (Object.prototype.toString.call(text) !== '[object Array]') {
      text = text.split("\n");
    }
    for (_i = 0, _len = text.length; _i < _len; _i++) {
      line = text[_i];
      if (line[0] === ">" || line[0] === ";") {
        label = line.slice(1);
        currentSeq = new Seq("", label, seqs.length);
        seqs.push(currentSeq);
        if (Str.contains("|", line)) {
          identifiers = label.split("|");
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

},{"./generic_reader":5,"./strings":7,"biojs-model":10}],7:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
var strings;

strings = {
  contains: function(text, search) {
    return ''.indexOf.call(text, search, 0) !== -1;
  }
};

module.exports = strings;

},{}],8:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
var Utils;

Utils = {};

Utils.splitNChars = function(txt, num) {
  var i, result, _i, _ref;
  result = [];
  for (i = _i = 0, _ref = txt.length - 1; num > 0 ? _i <= _ref : _i >= _ref; i = _i += num) {
    result.push(txt.substr(i, num));
  }
  return result;
};

module.exports = Utils;

},{}],9:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
var FastaExporter, Utils;

Utils = require("./utils");

module.exports = FastaExporter = (function() {
  function FastaExporter() {}

  FastaExporter["export"] = function(seqs, access) {
    var seq, text, _i, _len;
    text = "";
    for (_i = 0, _len = seqs.length; _i < _len; _i++) {
      seq = seqs[_i];
      if (access != null) {
        seq = access(seq);
      }
      text += ">" + seq.name + "\n";
      text += (Utils.splitNChars(seq.seq, 80)).join("\n");
      text += "\n";
    }
    return text;
  };

  return FastaExporter;

})();

},{"./utils":8}],10:[function(require,module,exports){
module.exports.seq = require("./seq");

},{"./seq":11}],11:[function(require,module,exports){
module.exports = function(seq, name, id) {
    this.seq = seq;
    this.name = name;
    this.id = id;
    this.meta = {};
};

},{}],12:[function(require,module,exports){
var req = require('request')

module.exports = Nets

function Nets(uri, opts, cb) {
  req(uri, opts, cb)
}
},{"request":13}],13:[function(require,module,exports){
var window = require("global/window")
var once = require("once")
var parseHeaders = require('parse-headers')

var messages = {
    "0": "Internal XMLHttpRequest Error",
    "4": "4xx Client Error",
    "5": "5xx Server Error"
}

var XHR = window.XMLHttpRequest || noop
var XDR = "withCredentials" in (new XHR()) ? XHR : window.XDomainRequest

module.exports = createXHR

function createXHR(options, callback) {
    if (typeof options === "string") {
        options = { uri: options }
    }

    options = options || {}
    callback = once(callback)

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new XDR()
        }else{
            xhr = new XHR()
        }
    }

    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var key
    var load = options.response ? loadResponse : loadXhr

    if ("json" in options) {
        isJson = true
        headers["Accept"] = "application/json"
        if (method !== "GET" && method !== "HEAD") {
            headers["Content-Type"] = "application/json"
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = load
    xhr.onerror = error
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    // hate IE
    xhr.ontimeout = noop
    xhr.open(method, uri, !sync)
                                    //backward compatibility
    if (options.withCredentials || (options.cors && options.withCredentials !== false)) {
        xhr.withCredentials = true
    }

    // Cannot set timeout with sync request
    if (!sync) {
        xhr.timeout = "timeout" in options ? options.timeout : 5000
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }
    
    if ("beforeSend" in options && 
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr

    function readystatechange() {
        if (xhr.readyState === 4) {
            load()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = null

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === 'text' || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    function getStatusCode() {
        return xhr.status === 1223 ? 204 : xhr.status
    }

    // if we're getting a none-ok statusCode, build & return an error
    function errorFromStatusCode(status, body) {
        var error = null
        if (status === 0 || (status >= 400 && status < 600)) {
            var message = (typeof body === "string" ? body : false) ||
                messages[String(status).charAt(0)]
            error = new Error(message)
            error.statusCode = status
        }

        return error
    }

    // will load the data & process the response in a special response object
    function loadResponse() {
        var status = getStatusCode()
        var body = getBody()
        var error = errorFromStatusCode(status, body)
        var response = {
            body: body,
            statusCode: status,
            statusText: xhr.statusText,
            raw: xhr
        }
        if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
            response.headers = parseHeaders(xhr.getAllResponseHeaders())
        } else {
            response.headers = {}
        }

        callback(error, response, response.body)
    }

    // will load the data and add some response properties to the source xhr
    // and then respond with that
    function loadXhr() {
        var status = getStatusCode()
        var error = errorFromStatusCode(status)

        xhr.status = xhr.statusCode = status
        xhr.body = getBody()
        xhr.headers = parseHeaders(xhr.getAllResponseHeaders())

        callback(error, xhr, xhr.body)
    }

    function error(evt) {
        callback(evt, xhr)
    }
}


function noop() {}

},{"global/window":14,"once":15,"parse-headers":19}],14:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],15:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],16:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":17}],17:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],18:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],19:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":16,"trim":18}],20:[function(require,module,exports){
module.exports = require('./jquery.browser');

},{"./jquery.browser":21}],21:[function(require,module,exports){
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

var uaMatch = function( ua ) {
  ua = ua.toLowerCase();

  var match = /(opr)[\/]([\w.]+)/.exec( ua ) ||
    /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
    /(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec( ua ) ||
    /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
    /(msie) ([\w.]+)/.exec( ua ) ||
    ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec( ua ) ||
    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
    [];

  var platform_match = /(ipad)/.exec( ua ) ||
    /(iphone)/.exec( ua ) ||
    /(android)/.exec( ua ) ||
    /(windows phone)/.exec( ua ) ||
    /(win)/.exec( ua ) ||
    /(mac)/.exec( ua ) ||
    /(linux)/.exec( ua ) ||
    /(cros)/i.exec( ua ) ||
    [];

  return {
    browser: match[ 3 ] || match[ 1 ] || "",
    version: match[ 2 ] || "0",
    platform: platform_match[ 0 ] || ""
  };
};

matched = uaMatch( window.navigator.userAgent );
browser = {};
browser.uaMatch = uaMatch;

if ( matched.browser ) {
  browser[ matched.browser ] = true;
  browser.version = matched.version;
  browser.versionNumber = parseInt(matched.version);
}

if ( matched.platform ) {
  browser[ matched.platform ] = true;
}

// These are all considered mobile platforms, meaning they run a mobile browser
if ( browser.android || browser.ipad || browser.iphone || browser[ "windows phone" ] ) {
  browser.mobile = true;
}

// These are all considered desktop platforms, meaning they run a desktop browser
if ( browser.cros || browser.mac || browser.linux || browser.win ) {
  browser.desktop = true;
}

// Chrome, Opera 15+ and Safari are webkit based browsers
if ( browser.chrome || browser.opr || browser.safari ) {
  browser.webkit = true;
}

// IE11 has a new token so we will assign it msie to avoid breaking changes
if ( browser.rv )
{
  var ie = "msie";

  matched.browser = ie;
  browser[ie] = true;
}

// Opera 15+ are identified as opr
if ( browser.opr )
{
  var opera = "opera";

  matched.browser = opera;
  browser[opera] = true;
}

// Stock Android browsers are marked as Safari on Android.
if ( browser.safari && browser.android )
{
  var android = "android";

  matched.browser = android;
  browser[android] = true;
}

// Assign the name and platform variable
browser.name = matched.browser;
browser.platform = matched.platform;


module.exports = browser;

},{}],22:[function(require,module,exports){
(function (global){
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
    if (typeof(base) != 'function') {
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
    }
    var classProto = Class.clone(proto);
    if (options.implements) {
        (Array.isArray(options.implements) ? options.implements : [options.implements])
            .forEach(function (implementedType) {
                if (typeof(implementedType) == 'function' && implementedType.prototype) {
                    meta.implements.push(implementedType);
                    Class.extend(classProto, implementedType.prototype);
                }
            });
    }
    classProto.__proto__ = base.prototype;
    var theClass = function () {
        if (typeof(this.constructor) == 'function') {
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"biojs-io-fasta":[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
module.exports.parse = require("./parser");

module.exports.writer = require("./writer");

},{"./parser":6,"./writer":9}],"biojs-vis-sequence":[function(require,module,exports){
module.exports = require("./lib/index");

},{"./lib/index":1}]},{},["biojs-vis-sequence"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcHJpeWFtL3NlcXVlbmNlc2VydmVyL25vZGVfbW9kdWxlcy9iaW9qcy12aXMtc2VxdWVuY2UvbGliL2luZGV4LmpzIiwiL1VzZXJzL3ByaXlhbS9zZXF1ZW5jZXNlcnZlci9ub2RlX21vZHVsZXMvYmlvanMtdmlzLXNlcXVlbmNlL25vZGVfbW9kdWxlcy9iaW9qcy1ldmVudHMvaW5kZXguanMiLCIvVXNlcnMvcHJpeWFtL3NlcXVlbmNlc2VydmVyL25vZGVfbW9kdWxlcy9iaW9qcy12aXMtc2VxdWVuY2Uvbm9kZV9tb2R1bGVzL2Jpb2pzLWV2ZW50cy9ub2RlX21vZHVsZXMvYmFja2JvbmUtZXZlbnRzLXN0YW5kYWxvbmUvYmFja2JvbmUtZXZlbnRzLXN0YW5kYWxvbmUuanMiLCIvVXNlcnMvcHJpeWFtL3NlcXVlbmNlc2VydmVyL25vZGVfbW9kdWxlcy9iaW9qcy12aXMtc2VxdWVuY2Uvbm9kZV9tb2R1bGVzL2Jpb2pzLWV2ZW50cy9ub2RlX21vZHVsZXMvYmFja2JvbmUtZXZlbnRzLXN0YW5kYWxvbmUvaW5kZXguanMiLCIvVXNlcnMvcHJpeWFtL3NlcXVlbmNlc2VydmVyL25vZGVfbW9kdWxlcy9iaW9qcy12aXMtc2VxdWVuY2Uvbm9kZV9tb2R1bGVzL2Jpb2pzLWlvLWZhc3RhL2xpYi9nZW5lcmljX3JlYWRlci5qcyIsIi9Vc2Vycy9wcml5YW0vc2VxdWVuY2VzZXJ2ZXIvbm9kZV9tb2R1bGVzL2Jpb2pzLXZpcy1zZXF1ZW5jZS9ub2RlX21vZHVsZXMvYmlvanMtaW8tZmFzdGEvbGliL3BhcnNlci5qcyIsIi9Vc2Vycy9wcml5YW0vc2VxdWVuY2VzZXJ2ZXIvbm9kZV9tb2R1bGVzL2Jpb2pzLXZpcy1zZXF1ZW5jZS9ub2RlX21vZHVsZXMvYmlvanMtaW8tZmFzdGEvbGliL3N0cmluZ3MuanMiLCIvVXNlcnMvcHJpeWFtL3NlcXVlbmNlc2VydmVyL25vZGVfbW9kdWxlcy9iaW9qcy12aXMtc2VxdWVuY2Uvbm9kZV9tb2R1bGVzL2Jpb2pzLWlvLWZhc3RhL2xpYi91dGlscy5qcyIsIi9Vc2Vycy9wcml5YW0vc2VxdWVuY2VzZXJ2ZXIvbm9kZV9tb2R1bGVzL2Jpb2pzLXZpcy1zZXF1ZW5jZS9ub2RlX21vZHVsZXMvYmlvanMtaW8tZmFzdGEvbGliL3dyaXRlci5qcyIsIi9Vc2Vycy9wcml5YW0vc2VxdWVuY2VzZXJ2ZXIvbm9kZV9tb2R1bGVzL2Jpb2pzLXZpcy1zZXF1ZW5jZS9ub2RlX21vZHVsZXMvYmlvanMtaW8tZmFzdGEvbm9kZV9tb2R1bGVzL2Jpb2pzLW1vZGVsL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9wcml5YW0vc2VxdWVuY2VzZXJ2ZXIvbm9kZV9tb2R1bGVzL2Jpb2pzLXZpcy1zZXF1ZW5jZS9ub2RlX21vZHVsZXMvYmlvanMtaW8tZmFzdGEvbm9kZV9tb2R1bGVzL2Jpb2pzLW1vZGVsL3NyYy9zZXEuanMiLCIvVXNlcnMvcHJpeWFtL3NlcXVlbmNlc2VydmVyL25vZGVfbW9kdWxlcy9iaW9qcy12aXMtc2VxdWVuY2Uvbm9kZV9tb2R1bGVzL2Jpb2pzLWlvLWZhc3RhL25vZGVfbW9kdWxlcy9uZXRzL2luZGV4LmpzIiwiL1VzZXJzL3ByaXlhbS9zZXF1ZW5jZXNlcnZlci9ub2RlX21vZHVsZXMvYmlvanMtdmlzLXNlcXVlbmNlL25vZGVfbW9kdWxlcy9iaW9qcy1pby1mYXN0YS9ub2RlX21vZHVsZXMvbmV0cy9ub2RlX21vZHVsZXMveGhyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jpb2pzLWlvLWZhc3RhL25vZGVfbW9kdWxlcy9uZXRzL25vZGVfbW9kdWxlcy94aHIvbm9kZV9tb2R1bGVzL2dsb2JhbC93aW5kb3cuanMiLCIvVXNlcnMvcHJpeWFtL3NlcXVlbmNlc2VydmVyL25vZGVfbW9kdWxlcy9iaW9qcy12aXMtc2VxdWVuY2Uvbm9kZV9tb2R1bGVzL2Jpb2pzLWlvLWZhc3RhL25vZGVfbW9kdWxlcy9uZXRzL25vZGVfbW9kdWxlcy94aHIvbm9kZV9tb2R1bGVzL29uY2Uvb25jZS5qcyIsIi9Vc2Vycy9wcml5YW0vc2VxdWVuY2VzZXJ2ZXIvbm9kZV9tb2R1bGVzL2Jpb2pzLXZpcy1zZXF1ZW5jZS9ub2RlX21vZHVsZXMvYmlvanMtaW8tZmFzdGEvbm9kZV9tb2R1bGVzL25ldHMvbm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9ub2RlX21vZHVsZXMvZm9yLWVhY2gvaW5kZXguanMiLCIvVXNlcnMvcHJpeWFtL3NlcXVlbmNlc2VydmVyL25vZGVfbW9kdWxlcy9iaW9qcy12aXMtc2VxdWVuY2Uvbm9kZV9tb2R1bGVzL2Jpb2pzLWlvLWZhc3RhL25vZGVfbW9kdWxlcy9uZXRzL25vZGVfbW9kdWxlcy94aHIvbm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvbm9kZV9tb2R1bGVzL2Zvci1lYWNoL25vZGVfbW9kdWxlcy9pcy1mdW5jdGlvbi9pbmRleC5qcyIsIi9Vc2Vycy9wcml5YW0vc2VxdWVuY2VzZXJ2ZXIvbm9kZV9tb2R1bGVzL2Jpb2pzLXZpcy1zZXF1ZW5jZS9ub2RlX21vZHVsZXMvYmlvanMtaW8tZmFzdGEvbm9kZV9tb2R1bGVzL25ldHMvbm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9ub2RlX21vZHVsZXMvdHJpbS9pbmRleC5qcyIsIi9Vc2Vycy9wcml5YW0vc2VxdWVuY2VzZXJ2ZXIvbm9kZV9tb2R1bGVzL2Jpb2pzLXZpcy1zZXF1ZW5jZS9ub2RlX21vZHVsZXMvYmlvanMtaW8tZmFzdGEvbm9kZV9tb2R1bGVzL25ldHMvbm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9wYXJzZS1oZWFkZXJzLmpzIiwiL1VzZXJzL3ByaXlhbS9zZXF1ZW5jZXNlcnZlci9ub2RlX21vZHVsZXMvYmlvanMtdmlzLXNlcXVlbmNlL25vZGVfbW9kdWxlcy9qcXVlcnktYnJvd3Nlci1wbHVnaW4vaW5kZXguanMiLCIvVXNlcnMvcHJpeWFtL3NlcXVlbmNlc2VydmVyL25vZGVfbW9kdWxlcy9iaW9qcy12aXMtc2VxdWVuY2Uvbm9kZV9tb2R1bGVzL2pxdWVyeS1icm93c2VyLXBsdWdpbi9qcXVlcnkuYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9qcy1jbGFzcy9jbGFzcy5qcyIsIi9Vc2Vycy9wcml5YW0vc2VxdWVuY2VzZXJ2ZXIvbm9kZV9tb2R1bGVzL2Jpb2pzLXZpcy1zZXF1ZW5jZS9ub2RlX21vZHVsZXMvYmlvanMtaW8tZmFzdGEvbGliL2luZGV4LmpzIiwiLi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzc1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclJBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gbGVnYWN5ISFcbiQuYnJvd3NlciA9IHJlcXVpcmUoXCJqcXVlcnktYnJvd3Nlci1wbHVnaW5cIik7XG5cbi8qKiBcbiAqIFNlcXVlbmNlIGNvbXBvbmVudCBcbiAqIFxuICogQGNsYXNzXG4gKiBAZXh0ZW5kcyBCaW9qc1xuICogXG4gKiBAYXV0aG9yIDxhIGhyZWY9XCJtYWlsdG86am9obmNhckBnbWFpbC5jb21cIj5Kb2huIEdvbWV6PC9hPiwgPGEgaHJlZj1cIm1haWx0bzpzZWNldmFsbGl2QGdtYWlsLmNvbVwiPkpvc2UgVmlsbGF2ZWNlczwvYT5cbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKiBAY2F0ZWdvcnkgM1xuICogXG4gKiBAcmVxdWlyZXMgPGEgaHJlZj0naHR0cDovL2Jsb2cuanF1ZXJ5LmNvbS8yMDExLzA5LzEyL2pxdWVyeS0xLTYtNC1yZWxlYXNlZC8nPmpRdWVyeSBDb3JlIDEuNi40PC9hPlxuICogQGRlcGVuZGVuY3kgPHNjcmlwdCBsYW5ndWFnZT1cIkphdmFTY3JpcHRcIiB0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCIgc3JjPVwiLi4vYmlvanMvZGVwZW5kZW5jaWVzL2pxdWVyeS9qcXVlcnktMS40LjIubWluLmpzXCI+PC9zY3JpcHQ+XG4gKiBcbiAqIEByZXF1aXJlcyA8YSBocmVmPSdodHRwOi8vanF1ZXJ5dWkuY29tL2Rvd25sb2FkJz5qUXVlcnkgVUkgMS44LjE2PC9hPlxuICogQGRlcGVuZGVuY3kgPHNjcmlwdCBsYW5ndWFnZT1cIkphdmFTY3JpcHRcIiB0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCIgc3JjPVwiLi4vYmlvanMvZGVwZW5kZW5jaWVzL2pxdWVyeS9qcXVlcnktdWktMS44LjIuY3VzdG9tLm1pbi5qc1wiPjwvc2NyaXB0PlxuICpcbiAqIEByZXF1aXJlcyA8YSBocmVmPSdCaW9qcy5Ub29sdGlwLmNzcyc+QmlvanMuVG9vbHRpcDwvYT5cbiAqIEBkZXBlbmRlbmN5IDxzY3JpcHQgbGFuZ3VhZ2U9XCJKYXZhU2NyaXB0XCIgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cInNyYy9CaW9qcy5Ub29sdGlwLmpzXCI+PC9zY3JpcHQ+XG4gKiBcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIEFuIG9iamVjdCB3aXRoIHRoZSBvcHRpb25zIGZvciBTZXF1ZW5jZSBjb21wb25lbnQuXG4gKiAgICBcbiAqIEBvcHRpb24ge3N0cmluZ30gdGFyZ2V0IFxuICogICAgSWRlbnRpZmllciBvZiB0aGUgRElWIHRhZyB3aGVyZSB0aGUgY29tcG9uZW50IHNob3VsZCBiZSBkaXNwbGF5ZWQuXG4gKiAgICBcbiAqIEBvcHRpb24ge3N0cmluZ30gc2VxdWVuY2UgXG4gKiAgICBUaGUgc2VxdWVuY2UgdG8gYmUgZGlzcGxheWVkLlxuICogICAgXG4gKiBAb3B0aW9uIHtzdHJpbmd9IFtpZF0gXG4gKiAgICBTZXF1ZW5jZSBpZGVudGlmaWVyIGlmIGFwcGx5LlxuICogICAgXG4gKiBAb3B0aW9uIHtzdHJpbmd9IFtmb3JtYXQ9XCJGQVNUQVwiXSBcbiAqICAgIFRoZSBkaXNwbGF5IGZvcm1hdCBmb3IgdGhlIHNlcXVlbmNlIHJlcHJlc2VudGF0aW9uLlxuICogICAgXG4gKiBAb3B0aW9uIHtPYmplY3RbXX0gW2hpZ2hsaWdodHNdIFxuICogXHQgIEZvciBoaWdobGlnaHRpbmcgbXVsdGlwbGUgcmVnaW9ucy4gXG4gKiAgICA8cHJlIGNsYXNzPVwiYnJ1c2g6IGpzXCIgdGl0bGU9XCJTeW50YXg6XCI+IFxuICogICAgW1xuICogICAgXHQvLyBIaWdobGlnaHQgYW1pbm9hY2lkcyBmcm9tICdzdGFydCcgdG8gJ2VuZCcgb2YgdGhlIGN1cnJlbnQgc3RyYW5kIHVzaW5nIHRoZSBzcGVjaWZpZWQgJ2NvbG9yJyAob3B0aW9uYWwpIGFuZCAnYmFja2dyb3VuZCcgKG9wdGlvbmFsKS5cbiAqICAgIFx0eyBzdGFydDogJmx0O3N0YXJ0VmFsMSZndDssIGVuZDogJmx0O2VuZFZhbDEmZ3Q7IFssIGlkOiZsdDtpZFZhbDEmZ3Q7XSBbLCBjb2xvcjogJmx0O0hUTUxDb2xvciZndDtdIFssIGJhY2tncm91bmQ6ICZsdDtIVE1MQ29sb3ImZ3Q7XX0sIFxuICogICAgXHQvL1xuICogICAgXHQvLyBBbnkgb3RoZXJzIGhpZ2hsaWdodHNcbiAqICAgIFx0Li4uLCAgXG4gKiAgICBcdC8vIFxuICogICAgXHR7IHN0YXJ0OiAmbHQ7c3RhcnRWYWxOJmd0OywgZW5kOiAmbHQ7ZW5kVmFsTiZndDsgWywgaWQ6Jmx0O2lkVmFsTiZndDtdIFssIGNvbG9yOiAmbHQ7SFRNTENvbG9yJmd0O10gWywgYmFja2dyb3VuZDogJmx0O0hUTUxDb2xvciZndDtdfVxuICogICAgXTwvcHJlPlxuICogXG4gKiA8cHJlIGNsYXNzPVwiYnJ1c2g6IGpzXCIgdGl0bGU9XCJFeGFtcGxlOlwiPiBcbiAqIGhpZ2hsaWdodHMgOiBbXG4gKiBcdFx0eyBzdGFydDozMCwgZW5kOjQyLCBjb2xvcjpcIndoaXRlXCIsIGJhY2tncm91bmQ6XCJncmVlblwiLCBpZDpcInNwaW4xXCIgfSxcbiAqXHRcdHsgc3RhcnQ6MTM5LCBlbmQ6MTQwIH0sIFxuICpcdFx0eyBzdGFydDo2MzEsIGVuZDo2MzMsIGNvbG9yOlwid2hpdGVcIiwgYmFja2dyb3VuZDpcImJsdWVcIiB9XG4gKlx0XVxuICogPC9wcmU+XG4gKiBcbiAqIEBvcHRpb24ge09iamVjdH0gW2NvbHVtbnM9e3NpemU6NDAsc3BhY2VkRWFjaDoxMH1dIFxuICogXHQgIE9wdGlvbnMgZm9yIGRpc3BsYXlpbmcgdGhlIGNvbHVtbnMuIFN5bnRheDogeyBzaXplOiAmbHQ7bnVtQ29scyZndDssIHNwYWNlZEVhY2g6ICZsdDtudW1Db2xzJmd0O31cbiAqIFxuICogQG9wdGlvbiB7T2JqZWN0fSBbc2VsZWN0aW9uXSBcbiAqIFx0ICBQb3NpdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGVkIHJlZ2lvbi4gU3ludGF4OiB7IHN0YXJ0OiAmbHQ7c3RhcnRWYWx1ZSZndDssIGVuZDogJmx0O2VuZFZhbHVlJmd0O31cbiAqIFxuICogQG9wdGlvbiB7T2JqZWN0W119IFthbm5vdGF0aW9uc10gXG4gKiAgICBTZXQgb2Ygb3ZlcmxhcHBpbmcgYW5ub3RhdGlvbnMuIE11c3QgYmUgYW4gYXJyYXkgb2Ygb2JqZWN0cyBmb2xsb3dpbmcgdGhlIHN5bnRheDpcbiAqICAgICBcdFx0PHByZSBjbGFzcz1cImJydXNoOiBqc1wiIHRpdGxlPVwiU3ludGF4OlwiPlxuICogICAgICAgICAgICBbIFxuICogICAgICAgICAgICAgIC8vIEFuIGFubm90YXRpb246XG4gKiAgICAgICAgICAgICAgeyBuYW1lOiAmbHQ7bmFtZSZndDssIFxuICogICAgICAgICAgICAgICAgaHRtbDogJmx0O21lc3NhZ2UmZ3Q7LCBcbiAqICAgICAgICAgICAgICAgIGNvbG9yOiAmbHQ7Y29sb3JfY29kZSZndDssIFxuICogICAgICAgICAgICAgICAgcmVnaW9uczogW3sgc3RhcnQ6ICZsdDtzdGFydFZhbDEmZ3Q7LCBlbmQ6ICZsdDtlbmRWYWwxJmd0OyBjb2xvcjogJmx0O0hUTUxDb2xvciZndDt9LCAuLi4seyBzdGFydDogJmx0O3N0YXJ0VmFsTiZndDssIGVuZDogJmx0O2VuZFZhbE4mZ3Q7LCBjb2xvcjogJmx0O0hUTUxDb2xvciZndDt9XSBcbiAqICAgICAgICAgICAgICB9LCBcbiAqICAgICAgICAgICAgICBcbiAqICAgICAgICAgICAgICAvLyAuLi5cbiAqICAgICAgICAgICAgICAvLyBtb3JlIGFubm90YXRpb25zIGhlcmUgXG4gKiAgICAgICAgICAgICAgLy8gLi4uXG4gKiAgICAgICAgICAgIF1cbiAqICAgIFx0XHQgPC9wcmU+XG4gKiAgICB3aGVyZTpcbiAqICAgICAgPHVsPlxuICogICAgICAgIDxsaT48Yj5uYW1lPC9iPiBpcyB0aGUgdW5pcXVlIG5hbWUgZm9yIHRoZSBhbm5vdGF0aW9uPC9saT5cbiAqICAgICAgICA8bGk+PGI+aHRtbDwvYj4gaXMgdGhlIG1lc3NhZ2UgKGNhbiBiZSBIVE1MKSB0byBiZSBkaXNwbGF5ZWQgaW4gdGhlIHRvb2wgdGlwLjwvbGk+XG4gKiAgICAgICAgPGxpPjxiPmNvbG9yPC9iPiBpcyB0aGUgZGVmYXVsdCBIVE1MIGNvbG9yIGNvZGUgZm9yIGFsbCB0aGUgcmVnaW9ucy48L2xpPlxuICogICAgICAgIDxsaT48Yj5yZWdpb25zPC9iPiBhcnJheSBvZiBvYmplY3RzIGRlZmluaW5nIHRoZSBpbnRlcnZhbHMgd2hpY2ggYmVsb25ncyB0byB0aGUgYW5ub3RhdGlvbi48L2xpPlxuICogICAgICAgIDxsaT48Yj5yZWdpb25zW2ldLnN0YXJ0PC9iPiBpcyB0aGUgc3RhcnRpbmcgY2hhcmFjdGVyIGZvciB0aGUgaS10aCBpbnRlcnZhbC48L2xpPlxuICogICAgICAgIDxsaT48Yj5yZWdpb25zW2ldLmVuZDwvYj4gaXMgdGhlIGVuZGluZyBjaGFyYWN0ZXIgZm9yIHRoZSBpLXRoIGludGVydmFsLjwvbGk+XG4gKiAgICAgICAgPGxpPjxiPnJlZ2lvbnNbaV0uY29sb3I8L2I+IGlzIGFuIG9wdGlvbmFsIGNvbG9yIGZvciB0aGUgaS10aCBpbnRlcnZhbC4gICBcbiAqICAgICAgPC91bD4gXG4gKiAgICAgIFxuICogQG9wdGlvbiB7T2JqZWN0fSBbZm9ybWF0T3B0aW9ucz17dGl0bGU6dHJ1ZSwgZm9vdGVyOnRydWV9XSBcbiAqIFx0ICBPcHRpb25zIGZvciBkaXNwbGF5aW5nIHRoZSB0aXRsZS4gYnkgbm93IGp1c3QgYWZmZWN0aW5nIHRoZSBDT0RBVEEgZm9ybWF0LlxuICogICAgPHByZSBjbGFzcz1cImJydXNoOiBqc1wiIHRpdGxlPVwiU3ludGF4OlwiPiBcbiAqIFx0XHRmb3JtYXRPcHRpb25zIDoge1xuICogXHRcdFx0dGl0bGU6ZmFsc2UsXG4gKiBcdFx0XHRmb290ZXI6ZmFsc2VcbiAqIFx0XHR9XG4gKiAgICA8L3ByZT5cbiAqICAgIFxuICogQGV4YW1wbGUgXG4gKiB2YXIgdGhlU2VxdWVuY2UgPSBcIk1FVExDUVJMTlZDUURLSUxUSFlFTkRTVERMUkRISURZV0tITVJMRUNBSVlZS0FSRU1HRktISU5IUVZWUFRMQVZTS05LQUxRQUlFTFFMVExFVElZTlNRWVNORUtXVExRRFZTTEVWWUxUQVBUR0NJS0tIR1lUVkVWUUZER0RJQ05UTUhZVE5XVEhJWUlDRUVBb2pzIFNWVFZWRUdRVkRZWUdMWVlWSEVHSVJUWUZWUUZLRERBRUtZU0tOS1ZXRVZIQUdHUVZJTENQVFNWRlNTTkVWU1NQRUlJUlFITEFOSFBBQVRIVEtBVkFMR1RFRVRRVFRJUVJQUlNFUERUR05QQ0hUVEtMTEhSRFNWRFNBUElMVEFGTlNTSEtHUklOQ05TTlRUUElWSExLR0RBTlRMS0NMUllSRktLSENUTFlUQVZTU1RXSFdUR0hOVktIS1NBSVZUTFRZRFNFV1FSRFFGTFNRVktJUEtUSVRWU1RHRk1TSVwiO1xuICogdmFyIG15U2VxdWVuY2UgPSBuZXcgU2VxdWVuY2Uoe1xuICogXHRcdHNlcXVlbmNlIDogdGhlU2VxdWVuY2UsXG4gKiBcdFx0dGFyZ2V0IDogXCJZb3VyT3duRGl2SWRcIixcbiAqIFx0XHRmb3JtYXQgOiAnQ09EQVRBJyxcbiAqIFx0XHRpZCA6ICdQOTE4MjgzJyxcbiAqIFx0XHRhbm5vdGF0aW9uczogW1xuICogICAgICAgIHsgbmFtZTpcIkNBVEhcIiwgXG4gKiBcdCAgXHRcdGNvbG9yOlwiI0YwRjAyMFwiLCBcbiAqIFx0ICBcdFx0aHRtbDogXCJVc2luZyBjb2xvciBjb2RlICNGMEYwMjAgXCIsIFxuICogXHQgIFx0XHRyZWdpb25zOiBbe3N0YXJ0OiAxMjIsIGVuZDogMTM1fV1cbiAqIFx0XHQgIH0sXG4gKiAgICAgICAgeyBuYW1lOlwiVEVTVFwiLCBcbiAqICAgICAgICAgIGh0bWw6XCImbHQ7YnImZ3Q7IEV4YW1wbGUgb2YgJmx0O2ImZ3Q7SFRNTCZsdDsvYiZndDtcIiwgXG4gKiAgICAgICAgICBjb2xvcjpcImdyZWVuXCIsIFxuICogICAgICAgICAgcmVnaW9uczogW1xuICogICAgICAgICAgICB7c3RhcnQ6IDI4NSwgZW5kOiAyOTJ9LFxuICogICAgICAgICAgICB7c3RhcnQ6IDI5MywgZW5kOiAzMTQsIGNvbG9yOiBcIiMyRTQ5ODhcIn1dXG4gKiAgICAgICAgfVxuICogICAgICBdLFxuICogICAgICBoaWdobGlnaHRzIDogW1xuICogICAgICBcdHsgc3RhcnQ6MzAsIGVuZDo0MiwgY29sb3I6XCJ3aGl0ZVwiLCBiYWNrZ3JvdW5kOlwiZ3JlZW5cIiwgaWQ6XCJzcGluMVwiIH0sXG4gKiAgICAgIFx0eyBzdGFydDoxMzksIGVuZDoxNDAgfSwgXG4gKiAgICAgIFx0eyBzdGFydDo2MzEsIGVuZDo2MzMsIGNvbG9yOlwid2hpdGVcIiwgYmFja2dyb3VuZDpcImJsdWVcIiB9XG4gKiAgICAgIF1cbiAqIH0pO1x0XG4gKiBcbiAqL1xuXG52YXIgQ2xhc3MgPSByZXF1aXJlKCdqcy1jbGFzcycpO1xuXG52YXIgRVZUX09OX1NFTEVDVElPTl9DSEFOR0U9IFwib25TZWxlY3Rpb25DaGFuZ2VcIjtcbnZhciBFVlRfT05fU0VMRUNUSU9OX0NIQU5HRUQ9IFwib25TZWxlY3Rpb25DaGFuZ2VkXCI7XG52YXIgRVZUX09OX0FOTk9UQVRJT05fQ0xJQ0tFRD0gXCJvbkFubm90YXRpb25DbGlja2VkXCI7XG5cblNlcXVlbmNlID0gQ2xhc3MoXG4vKiogQGxlbmRzIFNlcXVlbmNlIyAqL1xue1x0XG5cdGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMub3B0ID0galF1ZXJ5LmV4dGVuZCh0aGlzLm9wdCxvcHRpb25zKTtcblxuICAgIHRoaXMuX2NvbnRhaW5lciA9IGpRdWVyeSh0aGlzLm9wdC50YXJnZXQgKTtcbiAgICBcbiAgICAvLyBsZWdhY3kgc3VwcG9ydCAodGFyZ2V0IGlkIHdpdGhvdXQgJyMnKVxuICAgIGlmKHRoaXMuX2NvbnRhaW5lci5sZW5ndGggPT0gMCl7XG4gICAgICB0aGlzLl9jb250YWluZXIgPSBqUXVlcnkoIFwiI1wiICsgdGhpcy5vcHQudGFyZ2V0IClcbiAgICB9XG5cbiAgICBpZih0aGlzLl9jb250YWluZXIubGVuZ3RoID09IDApe1xuICAgICAgY29uc29sZS5sb2coXCJlbXB0eSB0YXJnZXQgY29udGFpbmVyXCIpO1xuICAgIH1cblxuICAgIC8vIGxlZ2FjeTogY29weSB0YXJnZXQgaWRcbiAgICB0aGlzLm9wdC50YXJnZXQgPSB0aGlzLl9jb250YWluZXJbMF0uaWQ7XG5cdFx0XG5cdFx0Ly8gTGF6eSBpbml0aWFsaXphdGlvbiBcblx0XHR0aGlzLl9jb250YWluZXIucmVhZHkoZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLl9pbml0aWFsaXplKCk7XG5cdFx0fSk7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogRGVmYXVsdCB2YWx1ZXMgZm9yIHRoZSBvcHRpb25zXG5cdCAqIEBuYW1lIFNlcXVlbmNlLW9wdFxuXHQgKi9cblx0b3B0IDoge1xuXHRcdFxuXHRcdHNlcXVlbmNlIDogXCJcIixcblx0XHRpZCA6IFwiXCIsXG5cdFx0dGFyZ2V0IDogXCJcIixcblx0XHRmb3JtYXQgOiBcIkZBU1RBXCIsXG5cdFx0c2VsZWN0aW9uOiB7IHN0YXJ0OiAwLCBlbmQ6IDAgfSxcblx0XHRjb2x1bW5zOiB7IHNpemU6IDM1LCBzcGFjZWRFYWNoOiAxMCB9LFxuXHRcdGhpZ2hsaWdodHMgOiBbXSxcblx0XHRhbm5vdGF0aW9uczogW10sXG5cdFx0c2VxdWVuY2VVcmw6ICdodHRwOi8vd3d3LmViaS5hYy51ay9kYXMtc3J2L3VuaXByb3QvZGFzL3VuaXByb3Qvc2VxdWVuY2UnLFxuXHRcdFxuXHRcdC8vIFN0eWxlcyBcblx0XHRzZWxlY3Rpb25Db2xvciA6ICdZZWxsb3cnLFxuXHRcdHNlbGVjdGlvbkZvbnRDb2xvciA6ICdibGFjaycsXG5cdFx0aGlnaGxpZ2h0Rm9udENvbG9yIDogJ3JlZCcsXG5cdFx0aGlnaGxpZ2h0QmFja2dyb3VuZENvbG9yIDogJ3doaXRlJyxcblx0XHRmb250RmFtaWx5OiAnXCJBbmRhbGUgbW9ub1wiLCBjb3VyaWVyLCBtb25vc3BhY2UnLFxuXHRcdGZvbnRTaXplOiAnMTJweCcsXG5cdFx0Zm9udENvbG9yIDogJ2luaGVyaXQnLFxuXHRcdGJhY2tncm91bmRDb2xvciA6ICdpbmhlcml0Jyxcblx0XHR3aWR0aDogdW5kZWZpbmVkLFxuXHRcdGhlaWdodDogdW5kZWZpbmVkLFxuXHRcdGZvcm1hdFNlbGVjdG9yVmlzaWJsZTogdHJ1ZVxuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEFycmF5IGNvbnRhaW5pbmcgdGhlIHN1cHBvcnRlZCBldmVudCBuYW1lc1xuXHQgKiBAbmFtZSBTZXF1ZW5jZS1ldmVudFR5cGVzXG5cdCAqL1xuXHRldmVudFR5cGVzIDogW1xuXHRcdC8qKlxuXHRcdCAqIEBuYW1lIFNlcXVlbmNlI29uU2VsZWN0aW9uQ2hhbmdlZFxuXHRcdCAqIEBldmVudFxuXHRcdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGFjdGlvblBlcmZvcm1lZCBBbiBmdW5jdGlvbiB3aGljaCByZWNlaXZlcyBhbiB7QGxpbmsgQmlvanMuRXZlbnR9IG9iamVjdCBhcyBhcmd1bWVudC5cblx0XHQgKiBAZXZlbnREYXRhIHtPYmplY3R9IHNvdXJjZSBUaGUgY29tcG9uZW50IHdoaWNoIGRpZCB0cmlnZ2VyZWQgdGhlIGV2ZW50LlxuXHRcdCAqIEBldmVudERhdGEge3N0cmluZ30gdHlwZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG5cdFx0ICogQGV2ZW50RGF0YSB7aW50fSBzdGFydCBBIG51bWJlciBpbmRpY2F0aW5nIHRoZSBzdGFydCBvZiB0aGUgc2VsZWN0aW9uLlxuXHRcdCAqIEBldmVudERhdGEge2ludH0gZW5kIEEgbnVtYmVyIGluZGljYXRpbmcgdGhlIGVuZGluZyBvZiBzZWxlY3Rpb24uXG5cdFx0ICogQGV4YW1wbGUgXG5cdFx0ICogbXlTZXF1ZW5jZS5vblNlbGVjdGlvbkNoYW5nZWQoXG5cdFx0ICogICAgZnVuY3Rpb24oIG9iakV2ZW50ICkge1xuXHRcdCAqICAgICAgIGFsZXJ0KFwiU2VsZWN0ZWQ6IFwiICsgb2JqRXZlbnQuc3RhcnQgKyBcIiwgXCIgKyBvYmpFdmVudC5lbmQgKTtcblx0XHQgKiAgICB9XG5cdFx0ICogKTsgXG5cdFx0ICogXG5cdFx0ICogKi9cblx0XHRcIm9uU2VsZWN0aW9uQ2hhbmdlZFwiLFxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIEBuYW1lIFNlcXVlbmNlI29uU2VsZWN0aW9uQ2hhbmdlXG5cdFx0ICogQGV2ZW50XG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbn0gYWN0aW9uUGVyZm9ybWVkIEFuIGZ1bmN0aW9uIHdoaWNoIHJlY2VpdmVzIGFuIHtAbGluayBCaW9qcy5FdmVudH0gb2JqZWN0IGFzIGFyZ3VtZW50LlxuXHRcdCAqIEBldmVudERhdGEge09iamVjdH0gc291cmNlIFRoZSBjb21wb25lbnQgd2hpY2ggZGlkIHRyaWdnZXJlZCB0aGUgZXZlbnQuXG5cdFx0ICogQGV2ZW50RGF0YSB7c3RyaW5nfSB0eXBlIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cblx0XHQgKiBAZXZlbnREYXRhIHtpbnR9IHN0YXJ0IEEgbnVtYmVyIGluZGljYXRpbmcgdGhlIHN0YXJ0IG9mIHRoZSBzZWxlY3Rpb24uXG5cdFx0ICogQGV2ZW50RGF0YSB7aW50fSBlbmQgQSBudW1iZXIgaW5kaWNhdGluZyB0aGUgZW5kaW5nIG9mIHNlbGVjdGlvbi5cblx0XHQgKiBAZXhhbXBsZSBcblx0XHQgKiBteVNlcXVlbmNlLm9uU2VsZWN0aW9uQ2hhbmdlKFxuXHRcdCAqICAgIGZ1bmN0aW9uKCBvYmpFdmVudCApIHtcblx0XHQgKiAgICAgICBhbGVydChcIlNlbGVjdGlvbiBpbiBwcm9ncmVzczogXCIgKyBvYmpFdmVudC5zdGFydCArIFwiLCBcIiArIG9iakV2ZW50LmVuZCApO1xuXHRcdCAqICAgIH1cblx0XHQgKiApOyAgXG5cdFx0ICogXG5cdFx0ICogXG5cdFx0ICogKi9cblx0XHRcIm9uU2VsZWN0aW9uQ2hhbmdlXCIsXG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogQG5hbWUgU2VxdWVuY2Ujb25Bbm5vdGF0aW9uQ2xpY2tlZFxuXHRcdCAqIEBldmVudFxuXHRcdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGFjdGlvblBlcmZvcm1lZCBBbiBmdW5jdGlvbiB3aGljaCByZWNlaXZlcyBhbiB7QGxpbmsgQmlvanMuRXZlbnR9IG9iamVjdCBhcyBhcmd1bWVudC5cblx0XHQgKiBAZXZlbnREYXRhIHtPYmplY3R9IHNvdXJjZSBUaGUgY29tcG9uZW50IHdoaWNoIGRpZCB0cmlnZ2VyZWQgdGhlIGV2ZW50LlxuXHRcdCAqIEBldmVudERhdGEge3N0cmluZ30gdHlwZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG5cdFx0ICogQGV2ZW50RGF0YSB7c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBzZWxlY3RlZCBhbm5vdGF0aW9uLlxuXHRcdCAqIEBldmVudERhdGEge2ludH0gcG9zIEEgbnVtYmVyIGluZGljYXRpbmcgdGhlIHBvc2l0aW9uIG9mIHRoZSBzZWxlY3RlZCBhbWlubyBhY2lkLlxuXHRcdCAqIEBleGFtcGxlIFxuXHRcdCAqIG15U2VxdWVuY2Uub25Bbm5vdGF0aW9uQ2xpY2tlZChcblx0XHQgKiAgICBmdW5jdGlvbiggb2JqRXZlbnQgKSB7XG5cdFx0ICogICAgICAgYWxlcnQoXCJDbGlja2VkIFwiICsgb2JqRXZlbnQubmFtZSArIFwiIG9uIHBvc2l0aW9uIFwiICsgb2JqRXZlbnQucG9zICk7XG5cdFx0ICogICAgfVxuXHRcdCAqICk7ICBcblx0XHQgKiBcblx0XHQgKiAqL1xuXHRcdFwib25Bbm5vdGF0aW9uQ2xpY2tlZFwiXG5cdF0sXG5cbiAgZ2V0SWQgOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0LmlkO1xuICB9LFxuXG5cdC8vIGludGVybmFsIG1lbWJlcnNcblx0X2hlYWRlckRpdiA6IG51bGwsXG5cdF9jb250ZW50RGl2IDogbnVsbCxcblx0XG5cdC8vIE1ldGhvZHNcblxuXHRfaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xuXHRcdFxuXHRcdGlmICggdGhpcy5vcHQud2lkdGggIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRoaXMuX2NvbnRhaW5lci53aWR0aCggdGhpcy5vcHQud2lkdGggKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKCB0aGlzLm9wdC5oZWlnaHQgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRoaXMuX2NvbnRhaW5lci5oZWlnaHQoIHRoaXMub3B0LmhlaWdodCApO1xuXHRcdH1cblx0XHRcblx0XHQvLyBEaXNhYmxlIHRleHQgc2VsZWN0aW9uXG5cdFx0XG5cdFx0dGhpcy5fY29udGFpbmVyLmNzcyh7XG5cdFx0XHQnLW1vei11c2VyLXNlbGVjdCc6J25vbmUnLFxuXHRcdFx0Jy13ZWJraXQtdXNlci1zZWxlY3QnOidub25lJyxcblx0XHRcdCd1c2VyLXNlbGVjdCc6J25vbmUnXG4gICAgICAgIH0pO1xuXHRcdFxuXHRcdC8vIERJViBmb3IgdGhlIGZvcm1hdCBzZWxlY3RvclxuXHRcdHRoaXMuX2J1aWxkRm9ybWF0U2VsZWN0b3IoKTtcblx0XHRcblx0XHQvLyBESVYgZm9yIHRoZSBzZXF1ZW5jZVxuXHRcdHRoaXMuX2NvbnRlbnREaXYgPSBqUXVlcnkoJzxkaXY+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5fY29udGFpbmVyKTtcblx0XHR0aGlzLl9jb250ZW50RGl2LmNzcyh7XG5cdFx0XHRcdCdmb250LWZhbWlseSc6IHRoaXMub3B0LmZvbnRGYW1pbHksXG5cdFx0XHRcdCdmb250LXNpemUnOiB0aGlzLm9wdC5mb250U2l6ZSxcblx0XHRcdFx0J3RleHQtYWxpZ24nOiAnbGVmdCdcblx0XHRcdH0pO1xuXHRcdFxuXHRcdC8vIEluaXRpYWxpemUgaGlnaGxpZ2h0aW5nIFxuXHRcdHRoaXMuX2hpZ2hsaWdodHMgPSB0aGlzLm9wdC5oaWdobGlnaHRzO1xuXHRcdFxuXHRcdC8vIEluaXRpYWxpemUgYW5ub3RhdGlvbnNcblx0XHR0aGlzLl9hbm5vdGF0aW9ucyA9IHRoaXMub3B0LmFubm90YXRpb25zO1xuXHRcdFxuXHRcdC8vSW5pdGlhbGl6ZSB0b29sdGlwXG5cdFx0dmFyIHRvb2x0aXAgPSBcInNlcXVlbmNlVGlwXCIgKyB0aGlzLm9wdC50YXJnZXQgO1xuXHRcdGpRdWVyeSgnPGRpdiBpZD1cIicgKyB0b29sdGlwICsgJ1wiPjwvZGl2PicpIFxuXHQgICAgICAgIC5jc3Moe1x0XG5cdCAgICAgICAgXHQncG9zaXRpb24nOiBcImFic29sdXRlXCIsXG5cdCAgICAgICAgXHQnei1pbmRleCc6IFwiOTk5OTk5XCIsXG5cdCAgICAgICAgXHQnY29sb3InOiBcIiNmZmZcIixcblx0ICAgICAgICBcdCdmb250LXNpemUnOiBcIjEycHhcIixcblx0ICAgICAgICBcdCd3aWR0aCc6IFwiYXV0b1wiLFxuXHQgICAgICAgIFx0J2Rpc3BsYXknOiAnbm9uZSdcblx0ICAgICAgICB9KVxuXHQgICAgICAgIC5hZGRDbGFzcyhcInRvb2x0aXBcIilcblx0ICAgICAgICAuYXBwZW5kVG8oXCJib2R5XCIpXG5cdCAgICAgICAgLmhpZGUoKTtcblx0XHR0aGlzLm9wdC5fdG9vbHRpcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRvb2x0aXApO1xuXG5cdFx0aWYgKCAodGhpcy5vcHQuc2VxdWVuY2UpICkge1xuXHRcdFx0dGhpcy5fcmVkcmF3KCk7XG5cdFx0XHRcblx0XHR9IGVsc2UgaWYgKCAgKHRoaXMub3B0LmlkKSApIHtcblx0XHRcdHRoaXMuX3JlcXVlc3RTZXF1ZW5jZSggdGhpcy5vcHQuaWQgKTtcblx0XHRcdFxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNsZWFyU2VxdWVuY2UoXCJObyBzZXF1ZW5jZSBhdmFpbGFibGVcIiwgXCIuLi9iaW9qcy9jc3MvaW1hZ2VzL3dhcm5pbmdfaWNvbi5wbmdcIik7XG5cdFx0fVxuXHRcdFxuXHR9LFxuXHRcblx0XG5cdC8qKlxuXHQgKiBTaG93cyB0aGUgY29sdW1ucyBpbmRpY2F0ZWQgYnkgdGhlIGluZGV4ZXMgYXJyYXkuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzZXEgVGhlIHNlcXVlbmNlIHN0cmFuZC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IFtpZGVudGlmaWVyXSBTZXF1ZW5jZSBpZGVudGlmaWVyLlxuXHQgKiBcblx0ICogQGV4YW1wbGUgXG5cdCAqIG15U2VxdWVuY2Uuc2V0U2VxdWVuY2UoXCJQOTk5OTlcIik7XG5cdCAqIFxuXHQgKi9cbiAgICBzZXRTZXF1ZW5jZTogZnVuY3Rpb24gKCBzZXEsIGlkZW50aWZpZXIgKSB7XG5cbiAgICBcdGlmICggc2VxLm1hdGNoKC9eKFtBLU4sUi1aXVswLTldW0EtWl1bQS1aLCAwLTldW0EtWiwgMC05XVswLTldKXwoW08sUCxRXVswLTldW0EtWiwgMC05XVtBLVosIDAtOV1bQS1aLCAwLTldWzAtOV0pKFxcLlxcZCspPyQvaSkgKSB7XG4gICAgXHRcdHRoaXMuX3JlcXVlc3RTZXF1ZW5jZSggYXJndW1lbnRzWzBdICk7XG4gICAgXHRcdFxuICAgIFx0fSBlbHNlIHtcbiAgICBcdFx0dGhpcy5vcHQuc2VxdWVuY2UgPSBzZXE7XG4gICAgICAgIFx0dGhpcy5vcHQuaWQgPSBpZGVudGlmaWVyOyBcbiAgICAgICAgXHR0aGlzLl9oaWdobGlnaHRzID0gW107XG4gICAgXHRcdHRoaXMuX2hpZ2hsaWdodHNDb3VudCA9IDA7XG4gICAgXHRcdHRoaXMub3B0LnNlbGVjdGlvbiA9IHsgc3RhcnQ6IDAsIGVuZDogMCB9O1xuICAgIFx0XHR0aGlzLl9hbm5vdGF0aW9ucyA9IFtdO1xuICAgIFx0XHRcbiAgICBcdFx0dGhpcy5fY29udGVudERpdi5jaGlsZHJlbigpLnJlbW92ZSgpO1xuICAgIFx0XHR0aGlzLl9yZWRyYXcoKTtcbiAgICBcdH1cbiAgICB9LFxuICAgIFxuICAgIF9yZXF1ZXN0U2VxdWVuY2U6IGZ1bmN0aW9uICggYWNjZXNzaW9uICkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcbiAgICBcdFxuICAgIFx0Y29uc29sZS5sb2coXCJSZXF1ZXN0aW5nIHNlcXVlbmNlIGZvcjogXCIgKyBhY2Nlc3Npb24gKTtcblxuXHRcdGpRdWVyeS5hamF4KHsgXG5cdFx0XHR1cmw6IHNlbGYub3B0LnNlcXVlbmNlVXJsLFxuXHRcdFx0ZGF0YVR5cGU6IFwieG1sXCIsXG5cdFx0XHRkYXRhOiB7IHNlZ21lbnQ6IGFjY2Vzc2lvbiB9LFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24gKCB4bWwgICkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHZhciBzZXF1ZW5jZU5vZGUgPSBqUXVlcnkoeG1sKS5maW5kKCdTRVFVRU5DRTpmaXJzdCcpO1xuXHRcdFx0XHRcdHNlbGYuc2V0U2VxdWVuY2UoIHNlcXVlbmNlTm9kZS50ZXh0KCksIHNlcXVlbmNlTm9kZS5hdHRyKFwiaWRcIiksIHNlcXVlbmNlTm9kZS5hdHRyKFwibGFiZWxcIikgKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiRXJyb3IgZGVjb2RpbmcgcmVzcG9uc2UgZGF0YTogXCIgKyBlLm1lc3NhZ2UgKTtcblx0XHRcdFx0XHRzZWxmLmNsZWFyU2VxdWVuY2UoXCJObyBzZXF1ZW5jZSBhdmFpbGFibGVcIiwgXCIuLi9iaW9qcy9jc3MvaW1hZ2VzL3dhcm5pbmdfaWNvbi5wbmdcIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSxcblx0XHRcdGVycm9yOiBmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiRXJyb3IgZGVjb2RpbmcgcmVzcG9uc2UgZGF0YTogXCIgKyB0ZXh0U3RhdHVzICk7XG5cdFx0XHRcdHNlbGYuY2xlYXJTZXF1ZW5jZShcIkVycm9yIHJlcXVlc3RpbmcgdGhlIHNlcXVlbmNlIHRvIHRoZSBzZXJ2ZXIgXCIgKyB0aGlzLnVybCAsIFwiLi4vYmlvanMvY3NzL2ltYWdlcy93YXJuaW5nX2ljb24ucG5nXCIpO1xuXHRcdFx0fVxuXHRcdH0pO1xuICAgIH0sXG5cdFxuICAgIC8qKlxuXHQgKiBTaG93cyB0aGUgY29sdW1ucyBpbmRpY2F0ZWQgYnkgdGhlIGluZGV4ZXMgYXJyYXkuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBbc2hvd01lc3NhZ2VdIE1lc3NhZ2UgdG8gYmUgc2hvd2VkLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW2ljb25dIEljb24gdG8gYmUgc2hvd2VkIGEgc2lkZSBvZiB0aGUgbWVzc2FnZVxuXHQgKiBcblx0ICogQGV4YW1wbGUgXG5cdCAqIG15U2VxdWVuY2UuY2xlYXJTZXF1ZW5jZShcIk5vIHNlcXVlbmNlIGF2YWlsYWJsZVwiLCBcIi4uL2Jpb2pzL2Nzcy9pbWFnZXMvd2FybmluZ19pY29uLnBuZ1wiKTtcblx0ICogXG5cdCAqL1xuICAgIGNsZWFyU2VxdWVuY2U6IGZ1bmN0aW9uICggc2hvd01lc3NhZ2UsIGljb24gKSB7XG4gICAgXHRcbiAgICBcdHZhciBtZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgIFx0XHRcbiAgICBcdHRoaXMub3B0LnNlcXVlbmNlID0gXCJcIjtcbiAgICBcdHRoaXMub3B0LmlkID0gXCJcIjsgXG4gICAgXHR0aGlzLl9oaWdobGlnaHRzID0gW107XG5cdFx0dGhpcy5faGlnaGxpZ2h0c0NvdW50ID0gMDtcblx0XHR0aGlzLm9wdC5zZWxlY3Rpb24gPSB7IHN0YXJ0OiAwLCBlbmQ6IDAgfTtcblx0XHR0aGlzLl9hbm5vdGF0aW9ucyA9IFtdO1xuXHRcdHRoaXMuX2NvbnRlbnREaXYuY2hpbGRyZW4oKS5yZW1vdmUoKTtcblx0XHRcblx0XHR0aGlzLl9oZWFkZXJEaXYuaGlkZSgpO1xuXHRcdFxuXHRcdGlmICggdW5kZWZpbmVkICE9PSBzaG93TWVzc2FnZSApIHtcblx0XHRcdG1lc3NhZ2UgPSBqUXVlcnkoJzxkaXY+JyArIHNob3dNZXNzYWdlICsgJzwvZGl2PicpXG5cdFx0XHRcdC5hcHBlbmRUbyh0aGlzLl9jb250ZW50RGl2KVxuXHRcdFx0XHQuYWRkQ2xhc3MoXCJtZXNzYWdlXCIpO1xuXHRcdFx0XG5cdFx0XHRpZiAoIHVuZGVmaW5lZCAhPT0gaWNvbiApIHtcblx0XHRcdFx0bWVzc2FnZS5jc3Moe1xuXHRcdFx0XHRcdCdiYWNrZ3JvdW5kJzogJ3RyYW5zcGFyZW50IHVybChcIicgKyBpY29uICsgJ1wiKSBuby1yZXBlYXQgY2VudGVyIGxlZnQnLFxuXHRcdFx0XHRcdCdwYWRkaW5nLWxlZnQnOiAnMjBweCdcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuICAgIH0sXG5cdFxuXHQvKipcbiAgICAqIFNldCB0aGUgY3VycmVudCBzZWxlY3Rpb24gaW4gdGhlIHNlcXVlbmNlIGNhdXNpbmcgdGhlIGV2ZW50IHtAbGluayBTZXF1ZW5jZSNvblNlbGVjdGlvbkNoYW5nZWR9XG4gICAgKlxuICAgICogQGV4YW1wbGVcbiAgICAqIC8vIHNldCBzZWxlY3Rpb24gZnJvbSB0aGUgcG9zaXRpb24gMTAwIHRvIDE1MCBcbiAgICAqIG15U2VxdWVuY2Uuc2V0U2VsZWN0aW9uKDEwMCwgMTUwKTtcbiAgICAqIFxuICAgICogQHBhcmFtIHtpbnR9IHN0YXJ0IFRoZSBzdGFydGluZyBjaGFyYWN0ZXIgb2YgdGhlIHNlbGVjdGlvbi5cbiAgICAqIEBwYXJhbSB7aW50fSBlbmQgVGhlIGVuZGluZyBjaGFyYWN0ZXIgb2YgdGhlIHNlbGVjdGlvblxuICAgICovXG5cdHNldFNlbGVjdGlvbiA6IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcblx0XHRpZihzdGFydCA+IGVuZCkge1xuXHRcdFx0dmFyIGF1eCA9IGVuZDtcblx0XHRcdGVuZCA9IHN0YXJ0O1xuXHRcdFx0c3RhcnQgPSBhdXg7XG5cblx0XHR9XG5cblx0XHRpZihzdGFydCAhPSB0aGlzLm9wdC5zZWxlY3Rpb24uc3RhcnQgfHwgZW5kICE9IHRoaXMub3B0LnNlbGVjdGlvbi5lbmQpIHtcblx0XHRcdHRoaXMuX3NldFNlbGVjdGlvbihzdGFydCwgZW5kKTtcblx0XHRcdHRoaXMudHJpZ2dlcihcblx0XHRcdFx0XHRFVlRfT05fU0VMRUNUSU9OX0NIQU5HRUQsIFxuXHRcdFx0XHRcdHsgXCJzdGFydFwiIDogc3RhcnQsIFwiZW5kXCIgOiBlbmQgfVxuXHRcdFx0KTtcblx0XHR9XG5cdH0sXG5cdFxuXHRfYnVpbGRGb3JtYXRTZWxlY3RvcjogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcblx0XHR0aGlzLl9oZWFkZXJEaXYgPSBqUXVlcnkoJzxkaXY+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5fY29udGFpbmVyKTtcblx0XHR0aGlzLl9oZWFkZXJEaXYuY3NzKHtcblx0XHRcdCdmb250LWZhbWlseSc6ICdcIkhldmVsdGljYSBOZXVlXCIsIEFyaWFsLCBcInNhbnMgc2VyaWZcIicsXG5cdFx0XHQnZm9udC1zaXplJzogJzE0cHgnXHRcblx0XHR9KS5hcHBlbmQoJ0Zvcm1hdDogJyk7XG5cdFx0XG5cdFx0dGhpcy5fZm9ybWF0U2VsZWN0b3IgPSBqUXVlcnkoJzxzZWxlY3Q+ICcrXG5cdFx0XHRcdCc8b3B0aW9uIHZhbHVlPVwiRkFTVEFcIj5GQVNUQTwvb3B0aW9uPicrXG5cdFx0XHRcdCc8b3B0aW9uIHZhbHVlPVwiQ09EQVRBXCI+Q09EQVRBPC9vcHRpb24+Jytcblx0XHRcdFx0JzxvcHRpb24gdmFsdWU9XCJQUklERVwiPlBSSURFPC9vcHRpb24+Jytcblx0XHRcdFx0JzxvcHRpb24gdmFsdWU9XCJSQVdcIj5SQVc8L29wdGlvbj48L3NlbGVjdD4nKS5hcHBlbmRUbyhzZWxmLl9oZWFkZXJEaXYpO1xuXG5cdFx0dGhpcy5fZm9ybWF0U2VsZWN0b3IuY2hhbmdlKGZ1bmN0aW9uKGUpIHtcblx0XHRcdHNlbGYub3B0LmZvcm1hdCA9IGpRdWVyeSh0aGlzKS52YWwoKTtcblx0XHRcdHNlbGYuX3JlZHJhdygpO1xuXHRcdH0pO1xuXHRcdFxuXHRcdHRoaXMuX2Zvcm1hdFNlbGVjdG9yLnZhbChzZWxmLm9wdC5mb3JtYXQpO1x0XG5cdFx0XG5cdFx0dGhpcy5mb3JtYXRTZWxlY3RvclZpc2libGUoIHRoaXMub3B0LmZvcm1hdFNlbGVjdG9yVmlzaWJsZSApO1xuXHR9LFxuXHRcblx0LyoqXG4gICAgKiBIaWdobGlnaHRzIGEgcmVnaW9uIHVzaW5nIHRoZSBmb250IGNvbG9yIGRlZmluZWQgaW4ge0Jpb2pzLlByb3RlaW4zRCNoaWdobGlnaHRGb250Q29sb3J9IGJ5IGRlZmF1bHQgaXMgcmVkLlxuICAgICpcbiAgICAqIEBkZXByZWNhdGVkIHVzZSBhZGRIaWdobGlnaHQgaW5zdGVhZC5cbiAgICAqIFxuICAgICogQHBhcmFtIHtpbnR9IHN0YXJ0IFRoZSBzdGFydGluZyBjaGFyYWN0ZXIgb2YgdGhlIGhpZ2hsaWdodGluZy5cbiAgICAqIEBwYXJhbSB7aW50fSBlbmQgVGhlIGVuZGluZyBjaGFyYWN0ZXIgb2YgdGhlIGhpZ2hsaWdodGluZy5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBbY29sb3JdIEhUTUwgY29sb3IgY29kZS5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBbYmFja2dyb3VuZF0gSFRNTCBjb2xvciBjb2RlLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IFtpZF0gQ3VzdG9tIGlkZW50aWZpZXIuXG4gICAgKiBcbiAgICAqIEByZXR1cm4ge2ludH0gcmVwcmVzZW50aW5nIHRoZSBpZCBvZiB0aGUgaGlnaGxpZ2h0IG9uIHRoZSBpbnRlcm5hbCBhcnJheS4gUmV0dXJucyAtMSBvbiBmYWlsdXJlICBcbiAgICAqL1xuXHRoaWdobGlnaHQgOiBmdW5jdGlvbiAoc3RhcnQsIGVuZCwgY29sb3IsIGJhY2tncm91bmQsIGlkICkge1xuXHRcdHJldHVybiB0aGlzLmFkZEhpZ2hsaWdodCh7IFwic3RhcnRcIjogc3RhcnQsIFwiZW5kXCI6IGVuZCwgXCJjb2xvclwiOiBjb2xvciwgXCJiYWNrZ3JvdW5kXCI6IGJhY2tncm91bmQsIFwiaWRcIjogaWQgfSk7XG5cdH0sXG5cdFxuXHQvKipcbiAgICAqIEhpZ2hsaWdodHMgYSByZWdpb24gdXNpbmcgdGhlIGZvbnQgY29sb3IgZGVmaW5lZCBpbiB7U2VxdWVuY2UjaGlnaGxpZ2h0Rm9udENvbG9yfSBieSBkZWZhdWx0IGlzIHJlZC5cbiAgICAqXG4gICAgKiBAZXhhbXBsZVxuICAgICogLy8gaGlnaGxpZ2h0IHRoZSBjaGFyYWN0ZXJzIHdpdGhpbiB0aGUgcG9zaXRpb24gMTAwIHRvIDE1MCwgaW5jbHVkZWQuXG4gICAgKiBteVNlcXVlbmNlLmFkZEhpZ2hsaWdodCggeyBcInN0YXJ0XCI6IDEwMCwgXCJlbmRcIjogMTUwLCBcImNvbG9yXCI6IFwid2hpdGVcIiwgXCJiYWNrZ3JvdW5kXCI6IFwicmVkXCIsIFwiaWRcIjogXCJhYWFcIiB9ICk7XG4gICAgKiBcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBoIFRoZSBoaWdobGlnaHQgZGVmaW5lZCBhcyBmb2xsb3dzOlxuICAgICogXHRcbiAgICAqIFxuICAgICogQHJldHVybiB7aW50fSByZXByZXNlbnRpbmcgdGhlIGlkIG9mIHRoZSBoaWdobGlnaHQgb24gdGhlIGludGVybmFsIGFycmF5LiBSZXR1cm5zIC0xIG9uIGZhaWx1cmUgIFxuICAgICovXG5cdGFkZEhpZ2hsaWdodCA6IGZ1bmN0aW9uICggaCApIHtcblx0XHR2YXIgaWQgPSAnLTEnO1xuXHRcdHZhciBjb2xvciA9IFwiXCI7XG5cdFx0dmFyIGJhY2tncm91bmQgPSBcIlwiO1xuXHRcdHZhciBoaWdobGlnaHQgPSB7fTtcblx0XHRcblx0XHRpZiAoIGggaW5zdGFuY2VvZiBPYmplY3QgJiYgaC5zdGFydCA8PSBoLmVuZCApIHtcblx0XHRcdFxuXHRcdFx0Y29sb3IgPSAoIFwic3RyaW5nXCIgPT0gdHlwZW9mIGguY29sb3IgKT8gaC5jb2xvciA6IHRoaXMub3B0LmhpZ2hsaWdodEZvbnRDb2xvcjtcblx0XHRcdGJhY2tncm91bmQgPSAoIFwic3RyaW5nXCIgPT0gdHlwZW9mIGguYmFja2dyb3VuZCApPyBoLmJhY2tncm91bmQgOiB0aGlzLm9wdC5oaWdobGlnaHRCYWNrZ3JvdW5kQ29sb3I7XG5cdFx0XHRpZCA9ICggXCJzdHJpbmdcIiA9PSB0eXBlb2YgaC5pZCApPyBoLmlkIDogKG5ldyBOdW1iZXIodGhpcy5faGlnaGxpZ2h0c0NvdW50KyspKS50b1N0cmluZygpO1xuXHRcdFx0XG5cdFx0XHRoaWdobGlnaHQgPSB7IFwic3RhcnRcIjogaC5zdGFydCwgXCJlbmRcIjogaC5lbmQsIFwiY29sb3JcIjogY29sb3IsIFwiYmFja2dyb3VuZFwiOiBiYWNrZ3JvdW5kLCBcImlkXCI6IGlkIH07XG5cdFx0XHRcblx0XHRcdHRoaXMuX2hpZ2hsaWdodHMucHVzaChoaWdobGlnaHQpO1xuXHRcdFx0dGhpcy5fYXBwbHlIaWdobGlnaHQoaGlnaGxpZ2h0KTtcblx0XHRcdHRoaXMuX3Jlc3RvcmVTZWxlY3Rpb24oaC5zdGFydCxoLmVuZCk7XG5cdFx0fSBcblx0XHRcblx0XHRyZXR1cm4gaWQ7XG5cdH0sXG5cdC8qIFxuICAgICAqIEZ1bmN0aW9uOiBTZXF1ZW5jZS5fYXBwbHlIaWdobGlnaHRcbiAgICAgKiBQdXJwb3NlOiAgQXBwbHkgdGhlIHNwZWNpZmllZCBjb2xvciBhbmQgYmFja2dyb3VuZCB0byBhIHJlZ2lvbiBiZXR3ZWVuICdzdGFydCcgYW5kICdlbmQnLlxuICAgICAqIFJldHVybnM6ICAtXG4gICAgICogSW5wdXRzOiBoaWdobGlnaHQgLT4ge09iamVjdH0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGZpZWxkcyBzdGFydCAoaW50KSwgZW5kIChpbnQpLCBcbiAgICAgKiBcdFx0XHRcdFx0XHRjb2xvciAoSFRNTCBjb2xvciBzdHJpbmcpIGFuZCBiYWNrZ3JvdW5kIChIVE1MIGNvbG9yIHN0cmluZykuXG4gICAgICovXG5cdF9hcHBseUhpZ2hsaWdodDogZnVuY3Rpb24gKCBoaWdobGlnaHQgKSB7XHRcdFxuXHRcdHZhciBzZXEgPSB0aGlzLl9jb250ZW50RGl2LmZpbmQoJy5zZXF1ZW5jZScpO1xuXHRcdGZvciAoIHZhciBpID0gaGlnaGxpZ2h0LnN0YXJ0IC0gMTsgaSA8IGhpZ2hsaWdodC5lbmQ7IGkrKyApe1xuXHRcdFx0emluZGV4ID0galF1ZXJ5KHNlcVtpXSkuY3NzKFwiei1pbmRleFwiKTtcblx0XHRcdGlmICh6aW5kZXg9PVwiYXV0b1wiKXtcblx0XHRcdFx0IHogPSAxO1xuXHRcdFx0XHQgbyA9IDE7XG5cdFx0XHQgfVxuXHRcdFx0IGVsc2V7XG5cdFx0XHRcdCB6ID0gMDtcblx0XHRcdFx0IG8gPSAwLjU7XG5cdFx0XHQgfVxuXHRcdFx0alF1ZXJ5KHNlcVtpXSlcblx0XHRcdFx0LmNzcyh7IFxuXHRcdFx0XHRcdFwiY29sb3JcIjogaGlnaGxpZ2h0LmNvbG9yLFxuXHRcdFx0XHRcdFwiYmFja2dyb3VuZC1jb2xvclwiOiBoaWdobGlnaHQuYmFja2dyb3VuZCxcblx0XHRcdFx0XHRcInotaW5kZXhcIjogeixcblx0XHRcdFx0XHRcIm9wYWNpdHlcIjogb1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdC5hZGRDbGFzcyhcImhpZ2hsaWdodGVkXCIpO1xuXHRcdH1cblx0fSxcblx0LyogXG4gICAgICogRnVuY3Rpb246IFNlcXVlbmNlLl9hcHBseUhpZ2hsaWdodHNcbiAgICAgKiBQdXJwb3NlOiAgQXBwbHkgdGhlIHNwZWNpZmllZCBoaWdobGlnaHRzLlxuICAgICAqIFJldHVybnM6ICAtXG4gICAgICogSW5wdXRzOiBoaWdobGlnaHRzIC0+IHtPYmplY3RbXX0gQW4gYXJyYXkgY29udGFpbmluZyB0aGUgaGlnaGxpZ2h0cyB0byBiZSBhcHBsaWVkLlxuICAgICAqL1xuXHRfYXBwbHlIaWdobGlnaHRzOiBmdW5jdGlvbiAoIGhpZ2hsaWdodHMgKSB7XG5cdFx0Zm9yICggdmFyIGkgaW4gaGlnaGxpZ2h0cyApIHtcblx0XHRcdHRoaXMuX2FwcGx5SGlnaGxpZ2h0KGhpZ2hsaWdodHNbaV0pO1xuXHRcdH1cblx0fSxcblx0LyogXG4gICAgICogRnVuY3Rpb246IFNlcXVlbmNlLl9yZXN0b3JlSGlnaGxpZ2h0c1xuICAgICAqIFB1cnBvc2U6ICBSZXBhaW50IHRoZSBoaWdobGlnaHRzIGluIHRoZSBzcGVjaWZpZWQgcmVnaW9uLlxuICAgICAqIFJldHVybnM6ICAtXG4gICAgICogSW5wdXRzOiBzdGFydCAtPiB7aW50fSBTdGFydCBvZiB0aGUgcmVnaW9uIHRvIGJlIHJlc3RvcmVkLlxuICAgICAqIFx0XHQgICBlbmQgLT4ge2ludH0gRW5kIG9mIHRoZSByZWdpb24gdG8gYmUgcmVzdG9yZWQuXG4gICAgICovXG5cdF9yZXN0b3JlSGlnaGxpZ2h0czogZnVuY3Rpb24gKCBzdGFydCwgZW5kICkge1xuXHRcdHZhciBoID0gdGhpcy5faGlnaGxpZ2h0cztcblx0XHQvLyBwYWludCB0aGUgcmVnaW9uIHVzaW5nIGRlZmF1bHQgYmxhbmsgc2V0dGluZ3Ncblx0XHR0aGlzLl9hcHBseUhpZ2hsaWdodCh7XG5cdFx0XHRcInN0YXJ0XCI6IHN0YXJ0LCBcblx0XHRcdFwiZW5kXCI6IGVuZCwgXG5cdFx0XHRcImNvbG9yXCI6IHRoaXMub3B0LmZvbnRDb2xvciwgXG5cdFx0XHRcImJhY2tncm91bmRcIjogdGhpcy5vcHQuYmFja2dyb3VuZENvbG9yIFxuXHRcdH0pO1xuXHRcdC8vIHJlc3RvcmUgaGlnaGxpZ2h0cyBpbiB0aGF0IHJlZ2lvblxuXHRcdGZvciAoIHZhciBpIGluIGggKSB7XG5cdFx0XHQvLyBpbnRlcnZhbCBpbnRlcnNlY3RzIHdpdGggaGlnaGxpZ2h0IGkgP1xuXHRcdFx0aWYgKCAhKCBoW2ldLnN0YXJ0ID4gZW5kIHx8IGhbaV0uZW5kIDwgc3RhcnQgKSApIHtcblx0XHRcdFx0YSA9ICggaFtpXS5zdGFydCA8IHN0YXJ0ICkgPyBzdGFydCA6IGhbaV0uc3RhcnQ7XG5cdFx0XHRcdGIgPSAoIGhbaV0uZW5kID4gZW5kICkgPyBlbmQgOiBoW2ldLmVuZDtcblx0XHRcdFx0dGhpcy5fYXBwbHlIaWdobGlnaHQoe1xuXHRcdFx0XHRcdFwic3RhcnRcIjogYSwgXG5cdFx0XHRcdFx0XCJlbmRcIjogYiwgXG5cdFx0XHRcdFx0XCJjb2xvclwiOiBoW2ldLmNvbG9yLCBcblx0XHRcdFx0XHRcImJhY2tncm91bmRcIjogaFtpXS5iYWNrZ3JvdW5kIFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdC8qIFxuICAgICAqIEZ1bmN0aW9uOiBTZXF1ZW5jZS5fcmVzdG9yZVNlbGVjdGlvblxuICAgICAqIFB1cnBvc2U6ICBSZXBhaW50IHRoZSBjdXJyZW50IHNlbGVjdGlvbiBpbiB0aGUgc3BlY2lmaWVkIHJlZ2lvbi4gXG4gICAgICogXHRcdFx0IEl0IGlzIHVzZWQgaW4gdGhlIGNhc2Ugb2YgYW55IGhpZ2hsaWdodCBkbyBvdmVycmlkaW5nIG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvbi4gXG4gICAgICogUmV0dXJuczogIC1cbiAgICAgKiBJbnB1dHM6IHN0YXJ0IC0+IHtpbnR9IFN0YXJ0IG9mIHRoZSByZWdpb24gdG8gYmUgcmVzdG9yZWQuXG4gICAgICogXHRcdCAgIGVuZCAtPiB7aW50fSBFbmQgb2YgdGhlIHJlZ2lvbiB0byBiZSByZXN0b3JlZC5cbiAgICAgKi9cblx0X3Jlc3RvcmVTZWxlY3Rpb246IGZ1bmN0aW9uICggc3RhcnQsIGVuZCApIHtcblx0XHR2YXIgc2VsID0gdGhpcy5vcHQuc2VsZWN0aW9uO1xuXHRcdC8vIGludGVydmFsIGludGVyc2VjdHMgd2l0aCBjdXJyZW50IHNlbGVjdGlvbiA/XG5cdFx0Ly8gcmVzdG9yZSBzZWxlY3Rpb25cblx0XHRpZiAoICEoIHN0YXJ0ID4gc2VsLmVuZCB8fCBlbmQgPCBzZWwuc3RhcnQgKSApIHtcblx0XHRcdGEgPSAoIHN0YXJ0IDwgc2VsLnN0YXJ0ICkgPyBzZWwuc3RhcnQgOiBzdGFydDtcblx0XHRcdGIgPSAoIGVuZCA+IHNlbC5lbmQgKSA/IHNlbC5lbmQgOiBlbmQ7XG5cdFx0XHRcblx0XHRcdHRoaXMuX2FwcGx5SGlnaGxpZ2h0KHtcblx0XHRcdFx0XCJzdGFydFwiOiBhLCBcblx0XHRcdFx0XCJlbmRcIjogYiwgXG5cdFx0XHRcdFwiY29sb3JcIjogdGhpcy5vcHQuc2VsZWN0aW9uRm9udENvbG9yLCBcblx0XHRcdFx0XCJiYWNrZ3JvdW5kXCI6IHRoaXMub3B0LnNlbGVjdGlvbkNvbG9yLFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRcblx0LyoqXG4gICAgKiBDbGVhciBhIGhpZ2hsaWdodGVkIHJlZ2lvbiB1c2luZy5cbiAgICAqXG4gICAgKiBAZGVwcmVjYXRlZCB1c2UgcmVtb3ZlSGlnaGxpZ2h0IGluc3RlYWQuXG4gICAgKiBcbiAgICAqIEBwYXJhbSB7aW50fSBpZCBUaGUgaWQgb2YgdGhlIGhpZ2hsaWdodCBvbiB0aGUgaW50ZXJuYWwgYXJyYXkuIFRoaXMgdmFsdWUgaXMgcmV0dXJuZWQgYnkgbWV0aG9kIGhpZ2hsaWdodC5cbiAgICAqL1xuXHR1bkhpZ2hsaWdodCA6IGZ1bmN0aW9uIChpZCkge1x0XG5cdFx0dGhpcy5yZW1vdmVIaWdobGlnaHQoaWQpO1xuXHR9LFxuXHRcblx0LyoqXG4gICAgKiBSZW1vdmUgYSBoaWdobGlnaHQuXG4gICAgKlxuICAgICogQGV4YW1wbGVcbiAgICAqIC8vIENsZWFyIHRoZSBoaWdobGlnaHRlZCBjaGFyYWN0ZXJzIHdpdGhpbiB0aGUgcG9zaXRpb24gMTAwIHRvIDE1MCwgaW5jbHVkZWQuXG4gICAgKiBteVNlcXVlbmNlLnJlbW92ZUhpZ2hsaWdodChcInNwaW4xXCIpO1xuICAgICogXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgVGhlIGlkIG9mIHRoZSBoaWdobGlnaHQgb24gdGhlIGludGVybmFsIGFycmF5LiBUaGlzIHZhbHVlIGlzIHJldHVybmVkIGJ5IG1ldGhvZCBoaWdobGlnaHQuXG4gICAgKi9cblx0cmVtb3ZlSGlnaGxpZ2h0IDogZnVuY3Rpb24gKGlkKSB7XHRcblx0XHR2YXIgaCA9IHRoaXMuX2hpZ2hsaWdodHM7XG5cdFx0Zm9yICggaSBpbiBoICkge1xuXHRcdFx0aWYgKCBoW2ldLmlkID09IGlkICkge1xuXHRcdFx0XHRzdGFydCA9IGhbaV0uc3RhcnQ7XG5cdFx0XHRcdGVuZCA9IGhbaV0uZW5kO1xuXHRcdFx0XHRoLnNwbGljZShpLDEpO1xuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5fcmVzdG9yZUhpZ2hsaWdodHMoc3RhcnQsZW5kKTtcblx0XHRcdFx0dGhpcy5fcmVzdG9yZVNlbGVjdGlvbihzdGFydCxlbmQpO1xuXHRcdFx0XHRcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcblx0LyoqXG4gICAgKiBDbGVhciB0aGUgaGlnaGxpZ2h0cyBvZiB3aG9sZSBzZXF1ZW5jZS5cbiAgICAqIEBkZXByZWNhdGVkIHVzZSByZW1vdmVBbGxIaWdobGlnaHRzIGluc3RlYWQuXG4gICAgKi9cblx0dW5IaWdobGlnaHRBbGwgOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5yZW1vdmVBbGxIaWdobGlnaHRzKCk7XG5cdH0sXG5cdFxuXHQvKipcbiAgICAqIFJlbW92ZSBhbGwgdGhlIGhpZ2hsaWdodHMgb2Ygd2hvbGUgc2VxdWVuY2UuXG4gICAgKlxuICAgICogQGV4YW1wbGVcbiAgICAqIG15U2VxdWVuY2UucmVtb3ZlQWxsSGlnaGxpZ2h0cygpO1xuICAgICovXG5cdHJlbW92ZUFsbEhpZ2hsaWdodHMgOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5faGlnaGxpZ2h0cyA9IFtdO1xuXHRcdHRoaXMuX3Jlc3RvcmVIaWdobGlnaHRzKDEsdGhpcy5vcHQuc2VxdWVuY2UubGVuZ3RoKTtcblx0XHR0aGlzLl9yZXN0b3JlU2VsZWN0aW9uKDEsdGhpcy5vcHQuc2VxdWVuY2UubGVuZ3RoKTtcblx0fSxcblx0XG5cdC8qKlxuICAgICogQ2hhbmdlcyB0aGUgY3VycmVudCBkaXNwbGF5aW5nIGZvcm1hdCBvZiB0aGUgc2VxdWVuY2UuXG4gICAgKlxuICAgICogQGV4YW1wbGVcbiAgICAqIC8vIFNldCBmb3JtYXQgdG8gJ0ZBU1RBJy5cbiAgICAqIG15U2VxdWVuY2Uuc2V0Rm9ybWF0KCdGQVNUQScpO1xuICAgICogXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IFRoZSBmb3JtYXQgZm9yIHRoZSBzZXF1ZW5jZSB0byBiZSBkaXNwbGF5ZWQuXG4gICAgKi9cblx0c2V0Rm9ybWF0IDogZnVuY3Rpb24oZm9ybWF0KSB7XG5cdFx0aWYgKCB0aGlzLm9wdC5mb3JtYXQgIT0gZm9ybWF0LnRvVXBwZXJDYXNlKCkgKSB7XG5cdFx0XHR0aGlzLm9wdC5mb3JtYXQgPSBmb3JtYXQudG9VcHBlckNhc2UoKTtcblx0XHRcdHRoaXMuX3JlZHJhdygpO1xuXHRcdH1cblxuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHQvLyBDaGFuZ2VzIHRoZSBvcHRpb24gaW4gdGhlIGNvbWJvIGJveFxuXHRcdHRoaXMuX2hlYWRlckRpdi5maW5kKCdvcHRpb24nKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoalF1ZXJ5KHRoaXMpLnZhbCgpID09IHNlbGYub3B0LmZvcm1hdC50b1VwcGVyQ2FzZSgpKSB7XG5cdFx0XHRcdGpRdWVyeSh0aGlzKS5hdHRyKCdzZWxlY3RlZCcsICdzZWxlY3RlZCcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRcblx0LyoqXG4gICAgKiBDaGFuZ2VzIHRoZSBjdXJyZW50IG51bWJlciBvZiBjb2x1bW5zIGluIHRoZSBkaXNwbGF5ZWQgc2VxdWVuY2UuXG4gICAgKlxuICAgICogQGV4YW1wbGVcbiAgICAqIC8vIFNldCB0aGUgbnVtYmVyIG9mIGNvbHVtbnMgdG8gNzAuXG4gICAgKiBteVNlcXVlbmNlLnNldE51bUNvbHMoNzApO1xuICAgICogXG4gICAgKiBAcGFyYW0ge2ludH0gbnVtQ29scyBUaGUgbnVtYmVyIG9mIGNvbHVtbnMuXG4gICAgKi9cblx0c2V0TnVtQ29scyA6IGZ1bmN0aW9uKG51bUNvbHMpIHtcblx0XHR0aGlzLm9wdC5jb2x1bW5zLnNpemUgPSBudW1Db2xzO1xuXHRcdHRoaXMuX3JlZHJhdygpO1xuXHR9LFxuXHRcblx0LyoqXG4gICAgKiBTZXQgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGRyb3AtZG93biBsaXN0IG9mIGZvcm1hdHMuXG4gICAgKiBcbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmlzaWJsZSB0cnVlOiBzaG93OyBmYWxzZTogaGlkZS5cbiAgICAqL1xuXHRmb3JtYXRTZWxlY3RvclZpc2libGUgOiBmdW5jdGlvbiAodmlzaWJsZSl7XG5cdFx0aWYgKHZpc2libGUpIHtcblx0XHRcdHRoaXMuX2hlYWRlckRpdi5zaG93KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2hlYWRlckRpdi5oaWRlKCk7XG5cdFx0fVxuXHR9LFxuXHRcblx0LyoqXG4gICAgKiBUaGlzIGlzIHNpbWlsYXIgdG8gYSB7QmlvanMuUHJvdGVpbjNEI2Zvcm1hdFNlbGVjdG9yVmlzaWJsZX0gd2l0aCB0aGUgJ3RydWUnIGFyZ3VtZW50LlxuICAgICpcbiAgICAqIEBleGFtcGxlXG4gICAgKiAvLyBTaG93cyB0aGUgZm9ybWF0IHNlbGVjdG9yLlxuICAgICogbXlTZXF1ZW5jZS5zaG93Rm9ybWF0U2VsZWN0b3IoKTtcbiAgICAqIFxuICAgICovXG5cdHNob3dGb3JtYXRTZWxlY3RvciA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX2hlYWRlckRpdi5zaG93KCk7XG5cdH0sXG5cdFxuXHQvKipcbiAgICAqIFRoaXMgaXMgc2ltaWxhciB0byBhIHtCaW9qcy5Qcm90ZWluM0QjZm9ybWF0U2VsZWN0b3JWaXNpYmxlfSB3aXRoIHRoZSAnZmFsc2UnIGFyZ3VtZW50LlxuICAgICogXG4gICAgKiBAZXhhbXBsZVxuICAgICogLy8gSGlkZXMgdGhlIGZvcm1hdCBzZWxlY3Rvci5cbiAgICAqIG15U2VxdWVuY2UuaGlkZUZvcm1hdFNlbGVjdG9yKCk7XG4gICAgKiBcbiAgICAqL1xuXHRoaWRlRm9ybWF0U2VsZWN0b3IgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl9oZWFkZXJEaXYuaGlkZSgpO1xuXHR9LFxuXHRcblx0LyoqXG4gICAgKiBIaWRlcyB0aGUgd2hvbGUgY29tcG9uZW50LlxuICAgICogXG4gICAgKi9cblx0aGlkZSA6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9oZWFkZXJEaXYuaGlkZSgpO1xuXHRcdHRoaXMuX2NvbnRlbnREaXYuaGlkZSgpO1xuXHR9LFxuXG5cdC8qKlxuICAgICogU2hvd3MgdGhlIHdob2xlIGNvbXBvbmVudC5cbiAgICAqIFxuICAgICovXG5cdHNob3cgOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5faGVhZGVyRGl2LnNob3coKTtcblx0XHR0aGlzLl9jb250ZW50RGl2LnNob3coKTtcblx0fSxcblx0LyogXG4gICAgICogRnVuY3Rpb246IFNlcXVlbmNlLl9zZXRTZWxlY3Rpb25cbiAgICAgKiBQdXJwb3NlOiAgVXBkYXRlIHRoZSBjdXJyZW50IHNlbGVjdGlvbi4gXG4gICAgICogUmV0dXJuczogIC1cbiAgICAgKiBJbnB1dHM6IHN0YXJ0IC0+IHtpbnR9IFN0YXJ0IG9mIHRoZSByZWdpb24gdG8gYmUgc2VsZWN0ZWQuXG4gICAgICogXHRcdCAgIGVuZCAtPiB7aW50fSBFbmQgb2YgdGhlIHJlZ2lvbiB0byBiZSBzZWxlY3RlZC5cbiAgICAgKi9cblx0X3NldFNlbGVjdGlvbiA6IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcblx0XHQvL2FsZXJ0KFwiYWRzYXNcIik7XG5cdFx0XG5cdFx0dmFyIGN1cnJlbnQgPSB0aGlzLm9wdC5zZWxlY3Rpb247XG5cdFx0dmFyIGNoYW5nZSA9IHt9O1xuXHRcdFxuXHRcdC8vIFdoaWNoIGlzIHRoZSBjaGFuZ2Ugb24gc2VsZWN0aW9uP1xuXHRcdGlmICggY3VycmVudC5zdGFydCA9PSBzdGFydCApIHtcblx0XHRcdC8vIGZvcndhcmQ/XG5cdFx0XHRpZiAoIGN1cnJlbnQuZW5kIDwgZW5kICkge1xuXHRcdFx0XHRjaGFuZ2Uuc3RhcnQgPSBjdXJyZW50LmVuZDtcblx0XHRcdFx0Y2hhbmdlLmVuZCA9IGVuZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX3Jlc3RvcmVIaWdobGlnaHRzKGVuZCsxLCBjdXJyZW50LmVuZCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICggY3VycmVudC5lbmQgPT0gZW5kICkge1xuXHRcdFx0Ly8gZm9yd2FyZD9cblx0XHRcdGlmICggY3VycmVudC5zdGFydCA+IHN0YXJ0ICkge1xuXHRcdFx0XHRjaGFuZ2Uuc3RhcnQgPSBzdGFydDtcblx0XHRcdFx0Y2hhbmdlLmVuZCA9IGN1cnJlbnQuc3RhcnQ7XHRcdFx0XHRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX3Jlc3RvcmVIaWdobGlnaHRzKGN1cnJlbnQuc3RhcnQsIHN0YXJ0LTEpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9yZXN0b3JlSGlnaGxpZ2h0cyhjdXJyZW50LnN0YXJ0LCBjdXJyZW50LmVuZCk7XG5cdFx0XHRjaGFuZ2Uuc3RhcnQgPSBzdGFydDtcblx0XHRcdGNoYW5nZS5lbmQgPSBlbmQ7XG5cdFx0fVxuXG5cdFx0Y3VycmVudC5zdGFydCA9IHN0YXJ0O1xuXHRcdGN1cnJlbnQuZW5kID0gZW5kO1xuXG5cdFx0aWYgKCBjaGFuZ2Uuc3RhcnQgIT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhpcy5fYXBwbHlIaWdobGlnaHQoe1xuXHRcdFx0XHRcInN0YXJ0XCI6IGNoYW5nZS5zdGFydCwgXG5cdFx0XHRcdFwiZW5kXCI6IGNoYW5nZS5lbmQsIFxuXHRcdFx0XHRcImNvbG9yXCI6IHRoaXMub3B0LnNlbGVjdGlvbkZvbnRDb2xvciwgXG5cdFx0XHRcdFwiYmFja2dyb3VuZFwiOiB0aGlzLm9wdC5zZWxlY3Rpb25Db2xvciBcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0fSxcblx0XG5cdC8qIFxuICAgICAqIEZ1bmN0aW9uOiBTZXF1ZW5jZS5fcmVwYWludFNlbGVjdGlvblxuICAgICAqIFB1cnBvc2U6ICBSZXBhaW50IHRoZSB3aG9sZSBjdXJyZW50IHNlbGVjdGlvbi4gXG4gICAgICogUmV0dXJuczogIC1cbiAgICAgKiBJbnB1dHM6IC1cbiAgICAgKi9cblx0X3JlcGFpbnRTZWxlY3Rpb246IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHMgPSB0aGlzLm9wdC5zZWxlY3Rpb247XG5cdFx0dGhpcy5fc2V0U2VsZWN0aW9uKDAsMCk7XG5cdFx0dGhpcy5fc2V0U2VsZWN0aW9uKHMuc3RhcnQscy5lbmQpO1xuXHR9LFxuXHRcblx0LyogXG4gICAgICogRnVuY3Rpb246IFNlcXVlbmNlLl9yZWRyYXdcbiAgICAgKiBQdXJwb3NlOiAgUmVwYWludCB0aGUgY3VycmVudCBzZXF1ZW5jZS4gXG4gICAgICogUmV0dXJuczogIC1cbiAgICAgKiBJbnB1dHM6IC1cbiAgICAgKi9cblx0X3JlZHJhdyA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBpID0gMDtcdFxuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcblx0XHQvLyBSZXNldCB0aGUgY29udGVudFxuXHRcdC8vdGhpcy5fY29udGVudERpdi50ZXh0KCcnKTtcblx0XHR0aGlzLl9jb250ZW50RGl2LmNoaWxkcmVuKCkucmVtb3ZlKCk7XG5cdFx0XG5cdFx0Ly8gUmVidWlsZCB0aGUgc3BhbnMgb2YgdGhlIHNlcXVlbmNlIFxuXHRcdC8vIGFjY29yZGluZyB0byBmb3JtYXRcblx0XHRpZih0aGlzLm9wdC5mb3JtYXQgPT0gJ1JBVycpIHtcblx0XHRcdHRoaXMuX2RyYXdSYXcoKTtcblx0XHR9IGVsc2UgaWYodGhpcy5vcHQuZm9ybWF0ID09ICdDT0RBVEEnKSB7XG5cdFx0XHR0aGlzLl9kcmF3Q29kYXRhKCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLm9wdC5mb3JtYXQgPT0gJ0ZBU1RBJyl7XG5cdFx0XHR0aGlzLl9kcmF3RmFzdGEoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5vcHQuZm9ybWF0ID0gJ1BSSURFJztcblx0XHRcdHRoaXMuX2RyYXdQcmlkZSgpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBSZXN0b3JlIHRoZSBoaWdobGlnaHRlZCByZWdpb25zXG5cdFx0dGhpcy5fYXBwbHlIaWdobGlnaHRzKHRoaXMuX2hpZ2hsaWdodHMpO1xuXHRcdHRoaXMuX3JlcGFpbnRTZWxlY3Rpb24oKTtcblx0XHR0aGlzLl9hZGRTcGFuRXZlbnRzKCk7XG5cdH0sXG5cdC8qIFxuICAgICAqIEZ1bmN0aW9uOiBTZXF1ZW5jZS5fZHJhd0Zhc3RhXG4gICAgICogUHVycG9zZTogIFJlcGFpbnQgdGhlIGN1cnJlbnQgc2VxdWVuY2UgdXNpbmcgRkFTVEEgZm9ybWF0LiAgXG4gICAgICogUmV0dXJuczogIC1cbiAgICAgKiBJbnB1dHM6IC1cbiAgICAgKi9cblx0X2RyYXdGYXN0YSA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgYSA9IHRoaXMub3B0LnNlcXVlbmNlLnRvVXBwZXJDYXNlKCkuc3BsaXQoJycpO1xuXHRcdHZhciBwcmUgPSBqUXVlcnkoJzxwcmU+PC9wcmU+JykuYXBwZW5kVG8odGhpcy5fY29udGVudERpdik7XG5cblx0XHR2YXIgaSA9IDE7XG5cdFx0dmFyIGFyciA9IFtdO1xuXHQgICAgdmFyIHN0ciA9ICc+JyArIHRoaXMub3B0LmlkICsgJyAnICsgYS5sZW5ndGggKyAnIGJwPGJyLz4nO1xuXHRcdFxuXHRcdC8qIENvcnJlY3QgY29sdW1uIHNpemUgaW4gY2FzZSB0aGUgc2VxdWVuY2UgaXMgYXMgc21hbGwgcGVwdGlkZSAqL1xuXHRcdHZhciBudW1Db2xzID0gdGhpcy5vcHQuY29sdW1ucy5zaXplO1xuXHRcdGlmICggdGhpcy5vcHQuc2VxdWVuY2UubGVuZ3RoIDwgdGhpcy5vcHQuY29sdW1ucy5zaXplICkge1xuXHRcdFx0bnVtQ29scyA9IHRoaXMub3B0LnNlcXVlbmNlLmxlbmd0aDtcdFxuXHRcdH1cblx0XHRcblx0ICAgIHZhciBvcHQgPSB7XG5cdFx0XHRudW1Db2xzOiBudW1Db2xzLFxuXHRcdCAgICBudW1Db2xzRm9yU3BhY2U6IDBcblx0XHR9O1xuXG5cdFx0c3RyICs9IHRoaXMuX2RyYXdTZXF1ZW5jZShhLCBvcHQpO1xuXHRcdHByZS5odG1sKHN0cik7XG5cdFx0XG5cdFx0dGhpcy5fZHJhd0Fubm90YXRpb25zKG9wdCk7XG5cdH0sXG5cdC8qIFxuICAgICAqIEZ1bmN0aW9uOiBTZXF1ZW5jZS5fZHJhd0NvZGF0YVxuICAgICAqIFB1cnBvc2U6ICBSZXBhaW50IHRoZSBjdXJyZW50IHNlcXVlbmNlIHVzaW5nIENPREFUQSBmb3JtYXQuICBcbiAgICAgKiBSZXR1cm5zOiAgLVxuICAgICAqIElucHV0czogLVxuICAgICAqL1xuXHRfZHJhd0NvZGF0YSA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgYSA9IHRoaXMub3B0LnNlcXVlbmNlLnRvVXBwZXJDYXNlKCkuc3BsaXQoJycpO1xuXHRcdHZhciBwcmUgPSBqUXVlcnkoJzxwcmUgc3R5bGU9XCJ3aGl0ZS1zcGFjZTpwcmVcIj48L3ByZT4nKS5hcHBlbmRUbyh0aGlzLl9jb250ZW50RGl2KTtcblxuXHRcdHZhciBpID0gMDtcblx0XHR2YXIgc3RyID0gJ0VOVFJZICAgICAgICAgICAnICsgdGhpcy5vcHQuaWQgKyAnPGJyLz4nO1xuXHRcdHN0ciArPSAnU0VRVUVOQ0U8YnIvPic7XG5cdFx0aWYgKCB0aGlzLm9wdC5mb3JtYXRPcHRpb25zICE9PSB1bmRlZmluZWQgKXtcblx0XHRcdGlmKHRoaXMub3B0LmZvcm1hdE9wdGlvbnMudGl0bGUgIT09IHVuZGVmaW5lZCApe1xuXHRcdFx0XHRpZiAodGhpcy5vcHQuZm9ybWF0T3B0aW9ucy50aXRsZSA9PSBmYWxzZSkge1xuXHRcdFx0XHRcdHN0ciA9ICcnO1xuXHRcdFx0XHR9XHRcdFx0XG5cdFx0XHR9XG5cdFx0fSBcblx0XHRcblx0XHQvKiBDb3JyZWN0IGNvbHVtbiBzaXplIGluIGNhc2UgdGhlIHNlcXVlbmNlIGlzIGFzIHNtYWxsIHBlcHRpZGUgKi9cblx0XHR2YXIgbnVtQ29scyA9IHRoaXMub3B0LmNvbHVtbnMuc2l6ZTtcblx0XHRpZiAoIHRoaXMub3B0LnNlcXVlbmNlLmxlbmd0aCA8IHRoaXMub3B0LmNvbHVtbnMuc2l6ZSApIHtcblx0XHRcdG51bUNvbHMgPSB0aGlzLm9wdC5zZXF1ZW5jZS5sZW5ndGg7XHRcblx0XHR9XG5cdFx0XG5cdFx0dmFyIG9wdCA9IHtcblx0XHRcdFx0bnVtTGVmdDogdHJ1ZSxcblx0XHRcdFx0bnVtTGVmdFNpemU6IDcsXG5cdFx0XHRcdG51bUxlZnRQYWQ6JyAnLFxuXHRcdFx0XHRudW1Ub3A6IHRydWUsXG5cdFx0XHRcdG51bVRvcEVhY2g6IDUsXG5cdFx0XHRcdG51bUNvbHM6IG51bUNvbHMsXG5cdFx0XHQgICAgbnVtQ29sc0ZvclNwYWNlOiAwLFxuXHRcdFx0ICAgIHNwYWNlQmV0d2VlbkNoYXJzOiB0cnVlXG5cdFx0fTtcblx0XHRcblx0XHRzdHIgKz0gdGhpcy5fZHJhd1NlcXVlbmNlKGEsIG9wdCk7XG5cdFx0XG5cdFx0dmFyIGZvb3RlciA9ICc8YnIvPi8vLyc7XG5cdFx0aWYgKHRoaXMub3B0LmZvcm1hdE9wdGlvbnMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKHRoaXMub3B0LmZvcm1hdE9wdGlvbnMuZm9vdGVyICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0aWYgKHRoaXMub3B0LmZvcm1hdE9wdGlvbnMuZm9vdGVyID09IGZhbHNlKSB7XG5cdFx0XHRcdFx0Zm9vdGVyID0gJyc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0c3RyICs9IGZvb3Rlcjtcblx0XHRwcmUuaHRtbChzdHIpO1xuXHRcdFxuXHRcdHRoaXMuX2RyYXdBbm5vdGF0aW9ucyhvcHQpO1xuXHR9LFxuXHQvKiBcbiAgICAgKiBGdW5jdGlvbjogU2VxdWVuY2UuX2RyYXdBbm5vdGF0aW9uc1xuICAgICAqIFB1cnBvc2U6ICBQYWludCB0aGUgYW5ub3RhdGlvbnMgb24gdGhlIHNlcXVlbmNlLiAgXG4gICAgICogUmV0dXJuczogIC1cbiAgICAgKiBJbnB1dHM6IHNldHRpbmdzIC0+IHtvYmplY3R9IFxuICAgICAqL1xuICAgIF9kcmF3QW5ub3RhdGlvbnM6IGZ1bmN0aW9uICggc2V0dGluZ3MgKXsgXG4gICAgXHRcbiAgICBcdHZhciBzZWxmID0gdGhpcztcbiAgICBcdHZhciBhID0gdGhpcy5vcHQuc2VxdWVuY2UudG9Mb3dlckNhc2UoKS5zcGxpdCgnJyk7ICAgIFx0XG4gICAgXHR2YXIgYW5ub3RhdGlvbnMgPSB0aGlzLl9hbm5vdGF0aW9ucztcbiAgICBcdHZhciBsZWZ0U3BhY2VzID0gJyc7XG4gICAgXHR2YXIgcm93ID0gJyc7XG4gICAgXHR2YXIgYW5ub3QgPSAnJztcbiAgICBcdFxuICAgIFx0Ly8gSW5kZXggYXQgdGhlIGxlZnQ/XG5cdFx0aWYgKCBzZXR0aW5ncy5udW1MZWZ0ICkge1xuXHRcdFx0bGVmdFNwYWNlcyArPSB0aGlzLl9mb3JtYXRJbmRleCgnICcsIHNldHRpbmdzLm51bUxlZnRTaXplKzIsICcgJyk7XG5cdFx0fVxuXG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkgKz0gc2V0dGluZ3MubnVtQ29scyApe1xuXHRcdFx0cm93ID0gJyc7XG5cdFx0XHRmb3IgKCB2YXIga2V5IGluIGFubm90YXRpb25zICl7XG5cdFx0XHRcdGFubm90YXRpb25zW2tleV0uaWQgPSB0aGlzLmdldElkKCkgKyBcIl9cIiArIGtleTtcblx0XHRcdFx0YW5ub3QgPSB0aGlzLl9nZXRIVE1MUm93QW5ub3QoaSsxLCBhbm5vdGF0aW9uc1trZXldLCBzZXR0aW5ncyk7XHRcdFx0XHRcblx0XHRcdFx0aWYgKGFubm90Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRyb3cgKz0gJzxici8+Jztcblx0XHRcdFx0XHRyb3cgKz0gbGVmdFNwYWNlcztcblx0XHRcdFx0XHRyb3cgKz0gYW5ub3Q7XG5cdFx0XHRcdFx0cm93ICs9ICc8YnIvPic7XG5cdFx0XHRcdH0gXG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHZhciBudW1Db2xzID0gc2V0dGluZ3MubnVtQ29scztcblx0XHRcdHZhciBjaGFyUmVtYWluaW5nID0gYS5sZW5ndGgtaTtcblx0XHRcdGlmKGNoYXJSZW1haW5pbmcgPCBudW1Db2xzKXtcblx0XHRcdFx0bnVtQ29sc1x0PSBjaGFyUmVtYWluaW5nO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoIHNldHRpbmdzLm51bVJpZ2h0ICkge1xuXHRcdFx0XHRqUXVlcnkocm93KS5pbnNlcnRBZnRlcignZGl2Iycrc2VsZi5vcHQudGFyZ2V0KycgZGl2IHByZSBzcGFuI251bVJpZ2h0XycgKyB0aGlzLmdldElkKCkgKyAnXycgKyAoaSArIG51bUNvbHMpICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRqUXVlcnkocm93KS5pbnNlcnRBZnRlcignZGl2Iycrc2VsZi5vcHQudGFyZ2V0KycgZGl2IHByZSBzcGFuIycrIHRoaXMuZ2V0SWQoKSArICdfJyArIChpICsgbnVtQ29scykgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gYWRkIHRvb2wgdGlwcyBhbmQgYmFja2dyb3VuZCcgY29sb3JpbmcgZWZmZWN0XG5cdFx0alF1ZXJ5KHRoaXMuX2NvbnRlbnREaXYpLmZpbmQoJy5hbm5vdGF0aW9uJykuZWFjaCggZnVuY3Rpb24oKXtcblx0XHRcdHNlbGYuX2FkZFRvb2xUaXAoIHRoaXMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gc2VsZi5fZ2V0QW5ub3RhdGlvblN0cmluZyggalF1ZXJ5KHRoaXMpLmF0dHIoXCJpZFwiKSApO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdGpRdWVyeSh0aGlzKS5tb3VzZW92ZXIoZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRqUXVlcnkoJy5hbm5vdGF0aW9uLicralF1ZXJ5KGUudGFyZ2V0KS5hdHRyKFwiaWRcIikpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRqUXVlcnkodGhpcykuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBqUXVlcnkodGhpcykuYXR0cihcImNvbG9yXCIpICk7XG5cdFx0XHRcdH0pO1xuXHRcdCAgICB9KS5tb3VzZW91dChmdW5jdGlvbigpIHtcblx0XHQgICAgXHRqUXVlcnkoJy5hbm5vdGF0aW9uJykuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBcInRyYW5zcGFyZW50XCIpOyBcblx0XHQgICAgXHRcblx0XHQgICAgfSkuY2xpY2soZnVuY3Rpb24oZSkge1xuXHRcdCAgICBcdFx0dmFyIG5hbWUgPSB1bmRlZmluZWQ7XG5cdFx0ICAgIFx0XHR2YXIgaWQgPSBqUXVlcnkoZS50YXJnZXQpLmF0dHIoXCJpZFwiKTtcblx0XHQgICAgXHRcdGZvcih2YXIgaSA9MDsgaSA8IHNlbGYuX2Fubm90YXRpb25zLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICBpZihzZWxmLl9hbm5vdGF0aW9uc1tpXS5pZCA9PSBpZCl7XG4gICAgICAgICAgICAgICAgbmFtZSA9IHNlbGYuX2Fubm90YXRpb25zW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblx0XHQgICAgXHRzZWxmLnRyaWdnZXIoIEVWVF9PTl9BTk5PVEFUSU9OX0NMSUNLRUQsIHtcblx0ICAgIFx0XHRcIm5hbWVcIjogbmFtZSxcblx0XHQgICAgXHRcdC8vXCJwb3NcIjogcGFyc2VJbnQoIGpRdWVyeShlLnRhcmdldCkuYXR0cihcInBvc1wiKSApXG5cdFx0ICAgIFx0fSk7XG5cdFx0ICAgIH0pO1xuXHRcdFx0XG5cdFx0fSk7XG5cbiAgICB9LFxuICAgIC8qIFxuICAgICAqIEZ1bmN0aW9uOiBTZXF1ZW5jZS5fZ2V0QW5ub3RhdGlvblN0cmluZ1xuICAgICAqIFB1cnBvc2U6ICBHZXQgdGhlIGFubm90YXRpb24gdGV4dCBtZXNzYWdlIGZvciB0aGUgdG9vbHRpcCBcbiAgICAgKiBSZXR1cm5zOiAge3N0cmluZ30gQW5ub3RhdGlvbiB0ZXh0IGZvciB0aGUgYW5ub3RhdGlvblxuICAgICAqIElucHV0czogICBpZCAtPiB7aW50fSBpbmRleCBvZiB0aGUgaW50ZXJuYWwgYW5ub3RhdGlvbiBhcnJheVxuICAgICAqL1xuICAgIF9nZXRBbm5vdGF0aW9uU3RyaW5nOiBmdW5jdGlvbiAoIGlkICkge1xuXHRcdHZhciBhbm5vdGF0aW9uID0gdGhpcy5fYW5ub3RhdGlvbnNbaWQuc3Vic3RyKGlkLmluZGV4T2YoXCJfXCIpICsgMSldO1xuXHRcdHJldHVybiBhbm5vdGF0aW9uLm5hbWUgKyBcIjxici8+XCIgKyAoKGFubm90YXRpb24uaHRtbCk/IGFubm90YXRpb24uaHRtbCA6ICcnKTtcbiAgICB9LFxuICAgIFxuICAgIC8qIFxuICAgICAqIEZ1bmN0aW9uOiBTZXF1ZW5jZS5fZ2V0SFRNTFJvd0Fubm90XG4gICAgICogUHVycG9zZTogIEJ1aWxkIGFuIGFubm90YXRpb25cbiAgICAgKiBSZXR1cm5zOiAgSFRNTCBvZiB0aGUgYW5ub3RhdGlvblxuICAgICAqIElucHV0czogICBjdXJyZW50UG9zIC0+IHtpbnR9XG4gICAgICogXHRcdFx0IGFubm90YXRpb24gLT4ge09iamVjdH0gXG4gICAgICogIFx0XHQgc2V0dGluZ3MgLT4ge09iamVjdH1cbiAgICAgKi9cbiAgICBfZ2V0SFRNTFJvd0Fubm90IDogZnVuY3Rpb24gKGN1cnJlbnRQb3MsIGFubm90YXRpb24sIHNldHRpbmdzKSB7XG4gICAgXHR2YXIgc3R5bGVCZWdpbiA9ICdib3JkZXItbGVmdDoxcHggc29saWQ7IGJvcmRlci1ib3R0b206MXB4IHNvbGlkOyBib3JkZXItY29sb3I6JztcbiAgICBcdHZhciBzdHlsZU9uID0gJ2JvcmRlci1ib3R0b206MXB4IHNvbGlkOyBib3JkZXItY29sb3I6JztcbiAgICBcdHZhciBzdHlsZUVuZCA9ICdib3JkZXItYm90dG9tOjFweCBzb2xpZDsgYm9yZGVyLXJpZ2h0OjFweCBzb2xpZDsgYm9yZGVyLWNvbG9yOic7XG5cdFx0dmFyIHN0eWxlQmVnaW5BbmRFbmQgPSAnYm9yZGVyLWxlZnQ6MXB4IHNvbGlkOyBib3JkZXItcmlnaHQ6MXB4IHNvbGlkOyBib3JkZXItYm90dG9tOjFweCBzb2xpZDsgYm9yZGVyLWNvbG9yOic7XG4gICAgXHRcbiAgICBcdHZhciByb3cgPSBbXTtcbiAgICBcdHZhciBlbmQgPSAoY3VycmVudFBvcyArIHNldHRpbmdzLm51bUNvbHMpO1xuICAgIFx0dmFyIHNwYWNlQmV0d2VlbkNoYXJzID0gKHNldHRpbmdzLnNwYWNlQmV0d2VlbkNoYXJzKT8gJyAnIDogJyc7ICAgIFx0XG4gICAgXHR2YXIgZGVmYXVsdENvbG9yID0gYW5ub3RhdGlvbi5jb2xvcjtcbiAgICBcdHZhciBpZCA9IGFubm90YXRpb24uaWQ7XG4gICAgXHRmb3IgKCB2YXIgcG9zPWN1cnJlbnRQb3M7IHBvcyA8IGVuZCA7IHBvcysrICkge1xuXHRcdFx0Ly8gcmVnaW9uc1xuXHRcdFx0Zm9yICggdmFyIHIgaW4gYW5ub3RhdGlvbi5yZWdpb25zICkge1xuXHRcdFx0XHRyZWdpb24gPSBhbm5vdGF0aW9uLnJlZ2lvbnNbcl07XG5cdFx0XHRcdFxuXHRcdFx0XHRzcGFjZUFmdGVyID0gJyc7XG5cdFx0XHRcdHNwYWNlQWZ0ZXIgKz0gKHBvcyAlIHNldHRpbmdzLm51bUNvbHNGb3JTcGFjZSA9PSAwICk/ICcgJyA6ICcnO1xuXHRcdFx0XHRzcGFjZUFmdGVyICs9IHNwYWNlQmV0d2VlbkNoYXJzO1xuXHRcdFx0XHRcblx0XHRcdFx0Y29sb3IgPSAoKHJlZ2lvbi5jb2xvcik/IHJlZ2lvbi5jb2xvciA6IGRlZmF1bHRDb2xvcik7XG5cdFx0XHRcdGRhdGEgPSAnY2xhc3M9XCJhbm5vdGF0aW9uICcraWQrJ1wiIGlkPVwiJytpZCsnXCIgY29sb3I9XCInK2NvbG9yKydcIiBwb3M9XCInK3BvcysnXCInO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKCBwb3MgPT0gcmVnaW9uLnN0YXJ0ICYmIHBvcyA9PSByZWdpb24uZW5kKSB7XG5cdFx0XHRcdFx0cm93W3Bvc10gPSAnPHNwYW4gc3R5bGU9XCInK3N0eWxlQmVnaW5BbmRFbmQrY29sb3IrJ1wiICcrZGF0YSsnPiAnO1xuXHRcdFx0XHRcdHJvd1twb3NdICs9IHNwYWNlQWZ0ZXI7XG5cdFx0XHRcdFx0cm93W3Bvc10gKz0gJzwvc3Bhbj4nO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBwb3MgPT0gcmVnaW9uLnN0YXJ0ICkge1xuXHRcdFx0XHRcdHJvd1twb3NdID0gJzxzcGFuIHN0eWxlPVwiJytzdHlsZUJlZ2luK2NvbG9yKydcIiAnK2RhdGErJz4gJztcblx0XHRcdFx0XHRyb3dbcG9zXSArPSBzcGFjZUFmdGVyO1xuXHRcdFx0XHRcdHJvd1twb3NdICs9ICc8L3NwYW4+Jztcblx0XHRcdFx0fSBlbHNlIGlmICggcG9zID09IHJlZ2lvbi5lbmQgKSB7XG5cdFx0XHRcdFx0cm93W3Bvc10gPSAnPHNwYW4gc3R5bGU9XCInK3N0eWxlRW5kK2NvbG9yKycgXCIgJytkYXRhKyc+ICc7XG5cdFx0XHRcdFx0Ly9yb3dbcG9zXSArPSBzcGFjZUFmdGVyO1xuXHRcdFx0XHRcdHJvd1twb3NdICs9ICc8L3NwYW4+Jztcblx0XHRcdFx0fSBlbHNlIGlmICggcG9zID4gcmVnaW9uLnN0YXJ0ICYmIHBvcyA8IHJlZ2lvbi5lbmQgKSB7XG5cdFx0XHRcdFx0cm93W3Bvc10gPSAnPHNwYW4gc3R5bGU9XCInK3N0eWxlT24rY29sb3IrJ1wiICcrZGF0YSsnPiAnO1xuXHRcdFx0XHRcdHJvd1twb3NdICs9IHNwYWNlQWZ0ZXI7XG5cdFx0XHRcdFx0cm93W3Bvc10gKz0gJzwvc3Bhbj4nO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCFyb3dbcG9zXSkge1xuXHRcdFx0XHRcdHJvd1twb3NdID0gJyAnO1xuXHRcdFx0XHRcdHJvd1twb3NdICs9IHNwYWNlQWZ0ZXI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cbiAgICAgICBcdHZhciBzdHIgPSByb3cuam9pbihcIlwiKTtcbiAgICBcdFxuICAgIFx0cmV0dXJuICggc3RyLmluZGV4T2YoXCJzcGFuXCIpID09IC0xICk/IFwiXCIgOiBzdHI7XG4gICAgfSxcbiAgICAvKiBcbiAgICAgKiBGdW5jdGlvbjogU2VxdWVuY2UuX2RyYXdSYXdcbiAgICAgKiBQdXJwb3NlOiAgUmVwYWludCB0aGUgY3VycmVudCBzZXF1ZW5jZSB1c2luZyBSQVcgZm9ybWF0LiAgXG4gICAgICogUmV0dXJuczogIC1cbiAgICAgKiBJbnB1dHM6IC1cbiAgICAgKi9cblx0X2RyYXdSYXcgOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dmFyIGEgPSB0aGlzLm9wdC5zZXF1ZW5jZS50b0xvd2VyQ2FzZSgpLnNwbGl0KCcnKTtcblx0XHR2YXIgaSA9IDA7XG5cdFx0dmFyIGFyciA9IFtdO1xuXHRcdHZhciBwcmUgPSBqUXVlcnkoJzxwcmU+PC9wcmU+JykuYXBwZW5kVG8odGhpcy5fY29udGVudERpdik7XG5cdFx0XG5cdFx0LyogQ29ycmVjdCBjb2x1bW4gc2l6ZSBpbiBjYXNlIHRoZSBzZXF1ZW5jZSBpcyBhcyBzbWFsbCBwZXB0aWRlICovXG5cdFx0dmFyIG51bUNvbHMgPSB0aGlzLm9wdC5jb2x1bW5zLnNpemU7XG5cdFx0aWYgKCB0aGlzLm9wdC5zZXF1ZW5jZS5sZW5ndGggPCB0aGlzLm9wdC5jb2x1bW5zLnNpemUgKSB7XG5cdFx0XHRudW1Db2xzID0gdGhpcy5vcHQuc2VxdWVuY2UubGVuZ3RoO1x0XG5cdFx0fVxuXG5cdFx0dmFyIG9wdCA9IHtcblx0XHRcdG51bUNvbHM6IG51bUNvbHNcblx0XHR9O1xuXHRcdFxuXHRcdHByZS5odG1sKFxuXHRcdFx0dGhpcy5fZHJhd1NlcXVlbmNlKGEsIG9wdClcblx0XHQpO1xuXHRcdFxuXHRcdHRoaXMuX2RyYXdBbm5vdGF0aW9ucyhvcHQpO1xuXHR9LFxuXHQvKiBcbiAgICAgKiBGdW5jdGlvbjogU2VxdWVuY2UuX2RyYXdQcmlkZVxuICAgICAqIFB1cnBvc2U6ICBSZXBhaW50IHRoZSBjdXJyZW50IHNlcXVlbmNlIHVzaW5nIFBSSURFIGZvcm1hdC4gIFxuICAgICAqIFJldHVybnM6ICAtXG4gICAgICogSW5wdXRzOiAtXG4gICAgICovXG5cdF9kcmF3UHJpZGUgOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dmFyIGEgPSB0aGlzLm9wdC5zZXF1ZW5jZS50b1VwcGVyQ2FzZSgpLnNwbGl0KCcnKTtcblx0XHR2YXIgcHJlID0galF1ZXJ5KCc8cHJlPjwvcHJlPicpLmFwcGVuZFRvKHRoaXMuX2NvbnRlbnREaXYpO1xuXHRcdFxuXHRcdC8qIENvcnJlY3QgY29sdW1uIHNpemUgaW4gY2FzZSB0aGUgc2VxdWVuY2UgaXMgYXMgc21hbGwgcGVwdGlkZSAqL1xuXHRcdHZhciBudW1Db2xzID0gdGhpcy5vcHQuY29sdW1ucy5zaXplO1xuXHRcdGlmICggdGhpcy5vcHQuc2VxdWVuY2UubGVuZ3RoIDwgdGhpcy5vcHQuY29sdW1ucy5zaXplICkge1xuXHRcdFx0bnVtQ29scyA9IHRoaXMub3B0LnNlcXVlbmNlLmxlbmd0aDtcdFxuXHRcdH1cblx0XG5cdFx0b3B0ID0ge1xuXHRcdFx0bnVtTGVmdDogdHJ1ZSxcblx0XHRcdG51bUxlZnRTaXplOiA1LFxuXHRcdFx0bnVtTGVmdFBhZDonMCcsXG5cdFx0XHRudW1SaWdodDogdHJ1ZSxcblx0XHRcdG51bVJpZ2h0U2l6ZTogNSxcblx0XHRcdG51bVJpZ2h0UGFkOiAnMCcsXG5cdFx0XHRudW1Db2xzOiBudW1Db2xzLFxuXHRcdCAgICBudW1Db2xzRm9yU3BhY2U6IHNlbGYub3B0LmNvbHVtbnMuc3BhY2VkRWFjaFxuXHRcdH07XG5cdFx0XG5cdFx0cHJlLmh0bWwoXG5cdFx0XHR0aGlzLl9kcmF3U2VxdWVuY2UoYSwgb3B0KVxuXHRcdCk7XG5cdFx0XG5cdFx0dGhpcy5fZHJhd0Fubm90YXRpb25zKG9wdCk7XG5cdH0sXG5cdC8qIFxuICAgICAqIEZ1bmN0aW9uOiBTZXF1ZW5jZS5fZHJhd1NlcXVlbmNlXG4gICAgICogUHVycG9zZTogIFJlcGFpbnQgdGhlIGN1cnJlbnQgc2VxdWVuY2UgdXNpbmcgQ1VTVE9NIGZvcm1hdC4gIFxuICAgICAqIFJldHVybnM6ICAtXG4gICAgICogSW5wdXRzOiAgIGEgLT4ge2NoYXJbXX0gYSBUaGUgc2VxdWVuY2Ugc3RyYW5kLlxuICAgICAqIFx0XHRcdCBvcHQgLT4ge09iamVjdH0gb3B0IFRoZSBDVVNUT00gZm9ybWF0LlxuICAgICAqL1xuXHRfZHJhd1NlcXVlbmNlIDogZnVuY3Rpb24oYSwgb3B0KSB7XG5cdFx0dmFyIHN0ciA9ICcnO1xuXG5cdFx0dmFyIHNwYWNlU3R5bGUgPSAgXCJ3aGl0ZS1zcGFjZTogcHJlO1wiO1xuXHRcdFxuXHRcdC8vIEluZGV4IGF0IHRvcD9cblx0XHRpZiggb3B0Lm51bVRvcCApXG5cdFx0e1xuXHRcdFx0c3RyICs9ICc8c3BhbiBzdHlsZT1cIicrc3BhY2VTdHlsZSsnXCIgY2xhc3M9XCJudW1Ub3BcIj4nXG5cdFx0XHR2YXIgc2l6ZSA9IChvcHQuc3BhY2VCZXR3ZWVuQ2hhcnMpPyBvcHQubnVtVG9wRWFjaCoyOiBvcHQubnVtVG9wRWFjaDtcblx0XHRcdFxuXHRcdFx0aWYgKG9wdC5udW1MZWZ0KSB7XG5cdFx0XHRcdHN0ciArPSB0aGlzLl9mb3JtYXRJbmRleCgnICcsIG9wdC5udW1MZWZ0U2l6ZSwgJyAnKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0c3RyICs9IHRoaXMuX2Zvcm1hdEluZGV4KCcgJywgc2l6ZSwgJyAnKTtcblx0XHRcdFxuXHRcdFx0Zm9yKHZhciB4ID0gb3B0Lm51bVRvcEVhY2g7IHggPCBvcHQubnVtQ29sczsgeCArPSBvcHQubnVtVG9wRWFjaCkge1xuXHRcdFx0XHRzdHIgKz0gdGhpcy5fZm9ybWF0SW5kZXgoeCwgc2l6ZSwgJyAnLCB0cnVlKTtcblx0XHRcdH1cblx0XHRcdHN0ciArPSAnPC9zcGFuPjxici8+J1xuXHRcdH1cblx0XHRcblx0XHRcblx0XHQvLyBJbmRleCBhdCB0aGUgbGVmdD9cblx0XHRpZiAob3B0Lm51bUxlZnQpIHtcblx0XHRcdHN0ciArPSB0aGlzLl9mb3JtYXRJbmRleCgxLCBvcHQubnVtTGVmdFNpemUsIG9wdC5udW1MZWZ0UGFkKTtcblx0XHRcdHN0ciArPSAnICAnO1xuXHRcdH1cblxuXHRcdHZhciBqPTE7XG5cdFx0Zm9yICh2YXIgaT0xOyBpIDw9IGEubGVuZ3RoOyBpKyspIHtcblxuXHRcdFx0aWYoIGkgJSBvcHQubnVtQ29scyA9PSAwKSB7XHRcblx0XHRcdFx0c3RyICs9ICc8c3BhbiBjbGFzcz1cInNlcXVlbmNlXCIgaWQ9XCInICsgdGhpcy5nZXRJZCgpICsgJ18nICsgaSArICdcIj4nICsgYVtpLTFdICsgJzwvc3Bhbj4nO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKG9wdC5udW1SaWdodCkge1xuXHRcdFx0XHRcdHN0ciArPSAnPHNwYW4gc3R5bGU9XCInK3NwYWNlU3R5bGUrJ1wiIGlkPVwibnVtUmlnaHRfJyArIHRoaXMuZ2V0SWQoKSArICdfJyArIGkgKyAnXCI+Jztcblx0XHRcdFx0XHRzdHIgKz0gJyAgJztcblx0XHRcdFx0XHRzdHIgKz0gdGhpcy5fZm9ybWF0SW5kZXgoaSwgb3B0Lm51bVJpZ2h0U2l6ZSwgb3B0Lm51bVJpZ2h0UGFkKTtcdFxuXHRcdFx0XHRcdHN0ciArPSAnPC9zcGFuPic7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdHN0ciArPSAnPGJyLz4nO1xuXHRcdFx0XHRcblx0XHRcdFx0dmFyIGFhUmVtYWluaW5nID0gYS5sZW5ndGggLSBpO1xuXHRcdFx0XHRpZiAob3B0Lm51bUxlZnQgJiYgYWFSZW1haW5pbmcgPiAwKSB7XG5cdFx0XHRcdFx0c3RyICs9ICc8c3BhbiBpZD1cIm51bUxlZnRfJyArIHRoaXMuZ2V0SWQoKSArICdfJyArIGkgKyAnXCI+Jztcblx0XHRcdFx0XHRzdHIgKz0gdGhpcy5fZm9ybWF0SW5kZXgoaSsxLCBvcHQubnVtTGVmdFNpemUsIG9wdC5udW1MZWZ0UGFkKTtcblx0XHRcdFx0XHRzdHIgKz0gJyAgJztcblx0XHRcdFx0XHRzdHIgKz0gJzwvc3Bhbj4nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRqID0gMTtcblx0XHRcdFx0XG5cdFx0XHR9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0ciArPSAnPHNwYW4gY2xhc3M9XCJzZXF1ZW5jZVwiIHN0eWxlPVwiJytzcGFjZVN0eWxlKydcIiBpZD1cIicgKyB0aGlzLmdldElkKCkgKyAnXycgKyBpICsgJ1wiPicgKyBhW2ktMV07XG5cdFx0XHRcdHN0ciArPSAoIGogJSBvcHQubnVtQ29sc0ZvclNwYWNlID09IDApPyAnICcgOiAnJztcblx0XHRcdFx0c3RyICs9IChvcHQuc3BhY2VCZXR3ZWVuQ2hhcnMpPyAnICcgOiAnJztcblx0XHRcdFx0c3RyICs9ICc8L3NwYW4+Jztcblx0XHRcdFx0aisrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRzdHIgKz0gJzxici8+J1x0XG5cdFx0XHRcblx0XHRpZiAoalF1ZXJ5LmJyb3dzZXIubXNpZSkge1xuXHRcdFx0c3RyID0gXCI8cHJlPlwiICsgc3RyICsgXCI8L3ByZT5cIjtcblx0XHR9XHRcblx0XHRcdFxuXHRcdHJldHVybiBzdHI7XG5cdH0sXG5cdC8qIFxuICAgICAqIEZ1bmN0aW9uOiBTZXF1ZW5jZS5fZm9ybWF0SW5kZXhcbiAgICAgKiBQdXJwb3NlOiAgQnVpbGQgdGhlIEhUTUwgY29ycmVzcG9uZGluZyB0byBjb3VudGluZyBudW1iZXJzICh0b3AsIGxlZnQsIHJpZ2h0KSBpbiB0aGUgc3RyYW5kLlxuICAgICAqIFJldHVybnM6ICAtXG4gICAgICogSW5wdXRzOiAgIG51bWJlciAtPiB7aW50fSBUaGUgbnVtYmVyIFxuICAgICAqIFx0XHRcdCBzaXplIC0+IHtpbnR9IE51bWJlciBvZiBiaW5zIHRvIHN1aXQgdGhlIG51bWJlci5cbiAgICAgKiBcdFx0XHQgZmlsbGluZ0NoYXIgLT4ge2NoYXJ9IENoYXJhY3RlciB0byBiZSB1c2VkIGZvciBmaWxsaW5nIG91dCBibGFuayBiaW5zLlxuICAgICAqIFx0XHRcdCBhbGlnbkxlZnQgLT4ge2Jvb2x9IFRlbGwgaWYgYWxpZ25lZCB0byB0aGUgbGVmdC5cbiAgICAgKi9cblx0X2Zvcm1hdEluZGV4IDogZnVuY3Rpb24oIG51bWJlciwgc2l6ZSwgZmlsbGluZ0NoYXIsIGFsaWduTGVmdCkge1xuXHRcdHZhciBzdHIgPSBudW1iZXIudG9TdHJpbmcoKTtcblx0XHR2YXIgZmlsbGluZyA9ICcnO1xuXHRcdHZhciBwYWRkaW5nID0gc2l6ZSAtIHN0ci5sZW5ndGg7XHRcblx0XHRpZiAoIHBhZGRpbmcgPiAwICkge1xuXHRcdFx0d2hpbGUgKCBwYWRkaW5nLS0gPiAwICkge1xuXHRcdFx0XHRmaWxsaW5nICs9IChcIjxzcGFuPlwiK2ZpbGxpbmdDaGFyK1wiPC9zcGFuPlwiKTtcblx0XHRcdH1cblx0XHRcdGlmIChhbGlnbkxlZnQpe1xuXHRcdFx0XHRzdHIgPSBudW1iZXIrZmlsbGluZztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHN0ciA9IGZpbGxpbmcrbnVtYmVyO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc3RyO1xuXHR9LFxuXHQvKiBcbiAgICAgKiBGdW5jdGlvbjogU2VxdWVuY2UuX2FkZFNwYW5FdmVudHNcbiAgICAgKiBQdXJwb3NlOiAgQWRkIHRoZSBldmVudCBoYW5kbGVycyB0byB0aGUgc3RyYW5kLlxuICAgICAqIFJldHVybnM6ICAtXG4gICAgICogSW5wdXRzOiAgIC1cbiAgICAgKi9cblx0X2FkZFNwYW5FdmVudHMgOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dmFyIGlzTW91c2VEb3duID0gZmFsc2U7XG5cdFx0dmFyIGN1cnJlbnRQb3M7XG5cblx0XHRzZWxmLl9jb250ZW50RGl2LmZpbmQoJy5zZXF1ZW5jZScpLmVhY2goIGZ1bmN0aW9uICgpIHtcdFxuXHRcdFx0XG5cdFx0XHQvLyBSZWdpc3RlciB0aGUgc3RhcnRpbmcgcG9zaXRpb25cblx0XHRcdGpRdWVyeSh0aGlzKS5tb3VzZWRvd24oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBpZCA9IGpRdWVyeSh0aGlzKS5hdHRyKCdpZCcpO1xuXHRcdFx0XHRjdXJyZW50UG9zID0gcGFyc2VJbnQoaWQuc3Vic3RyKGlkLmluZGV4T2YoXCJfXCIpICsgMSkpO1xuXHRcdFx0XHRjbGlja1BvcyA9IGN1cnJlbnRQb3M7XG5cdFx0XHRcdHNlbGYuX3NldFNlbGVjdGlvbihjbGlja1BvcyxjdXJyZW50UG9zKTtcblx0XHRcdFx0aXNNb3VzZURvd24gPSB0cnVlO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gU2VsZWN0aW9uIGlzIGhhcHBlbmluZywgcmFpc2UgYW4gZXZlbnRcblx0XHRcdFx0c2VsZi50cmlnZ2VyKFxuXHRcdFx0XHRcdEVWVF9PTl9TRUxFQ1RJT05fQ0hBTkdFLCBcblx0XHRcdFx0XHR7IFxuXHRcdFx0XHRcdFx0XCJzdGFydFwiIDogc2VsZi5vcHQuc2VsZWN0aW9uLnN0YXJ0LCBcblx0XHRcdFx0XHRcdFwiZW5kXCIgOiBzZWxmLm9wdC5zZWxlY3Rpb24uZW5kIFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0KTtcblx0XHRcdFxuXHRcdFx0fSkubW91c2VvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQvLyBVcGRhdGUgc2VsZWN0aW9uXG5cdFx0XHRcdC8vIFNob3cgdG9vbHRpcCBjb250YWluaW5nIHRoZSBwb3NpdGlvblxuXHRcdFx0XHR2YXIgaWQgPSBqUXVlcnkodGhpcykuYXR0cignaWQnKTtcblx0XHRcdFx0Y3VycmVudFBvcyA9IHBhcnNlSW50KGlkLnN1YnN0cihpZC5pbmRleE9mKFwiX1wiKSArIDEpKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmKGlzTW91c2VEb3duKSB7XG5cdFx0XHRcdFx0aWYoIGN1cnJlbnRQb3MgPiBjbGlja1BvcyApIHtcblx0XHRcdFx0XHRcdHNlbGYuX3NldFNlbGVjdGlvbihjbGlja1BvcywgY3VycmVudFBvcyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNlbGYuX3NldFNlbGVjdGlvbihjdXJyZW50UG9zLCBjbGlja1Bvcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIFNlbGVjdGlvbiBpcyBoYXBwZW5pbmcsIHJhaXNlIGFuIGV2ZW50XG5cdFx0XHRcdFx0c2VsZi50cmlnZ2VyKCBFVlRfT05fU0VMRUNUSU9OX0NIQU5HRSwgeyBcblx0XHRcdFx0XHRcdFwic3RhcnRcIiA6IHNlbGYub3B0LnNlbGVjdGlvbi5zdGFydCwgXG5cdFx0XHRcdFx0XHRcImVuZFwiIDogc2VsZi5vcHQuc2VsZWN0aW9uLmVuZCBcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBcblx0XHRcdFx0XG5cdFx0XHR9KS5tb3VzZXVwKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpc01vdXNlRG93biA9IGZhbHNlO1xuXHRcdFx0XHQvLyBTZWxlY3Rpb24gaXMgZG9uZSwgcmFpc2UgYW4gZXZlbnRcblx0XHRcdFx0c2VsZi50cmlnZ2VyKCBFVlRfT05fU0VMRUNUSU9OX0NIQU5HRUQsIHsgXG5cdFx0XHRcdFx0XCJzdGFydFwiIDogc2VsZi5vcHQuc2VsZWN0aW9uLnN0YXJ0LCBcblx0XHRcdFx0XHRcImVuZFwiIDogc2VsZi5vcHQuc2VsZWN0aW9uLmVuZCBcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0Ly8gQWRkIGEgdG9vbHRpcCBmb3IgdGhpcyBzZXF1ZW5jZSBiYXNlLlxuXHRcdFx0c2VsZi5fYWRkVG9vbFRpcC5jYWxsKCBzZWxmLCB0aGlzLCBmdW5jdGlvbiggKSB7XG5cdFx0XHRcdGlmIChpc01vdXNlRG93bikge1xuXHQgICAgIFx0XHRcdHJldHVybiBcIltcIiArIHNlbGYub3B0LnNlbGVjdGlvbi5zdGFydCArXCIsIFwiICsgc2VsZi5vcHQuc2VsZWN0aW9uLmVuZCArIFwiXVwiO1xuXHQgICAgIFx0XHR9IGVsc2Uge1xuXHQgICAgIFx0XHRcdHJldHVybiBjdXJyZW50UG9zO1xuXHQgICAgIFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdH0pXG5cdFx0LmNzcygnY3Vyc29yJywgJ3BvaW50ZXInKTtcblx0fSxcblx0LyogXG4gICAgICogRnVuY3Rpb246IFNlcXVlbmNlLl9hZGRUb29sdGlwXG4gICAgICogUHVycG9zZTogIEFkZCBhIHRvb2x0aXAgYXJvdW5kIHRoZSB0YXJnZXQgRE9NIGVsZW1lbnQgcHJvdmlkZWQgYXMgYXJndW1lbnRcbiAgICAgKiBSZXR1cm5zOiAgLVxuICAgICAqIElucHV0czogICB0YXJnZXQgLT4ge0VsZW1lbnR9IERPTSBlbGVtZW50IHdpY2ggaXMgdGhlIHRhcmdldGVkIGZvY3VzIGZvciB0aGUgdG9vbHRpcC5cbiAgICAgKiBcdFx0XHQgY2JHZXRNZXNzYWdlRnVuY3Rpb24gLT4ge2Z1bmN0aW9ufSBBIGNhbGxiYWNrIGZ1bmN0aW9uIHdpY2ggcmV0dXJucyB0aGUgbWVzc2FnZSB0byBiZSBkaXNwbGF5ZWQgaW4gdGhlIHRpcC5cbiAgICAgKi9cblx0X2FkZFRvb2xUaXAgOiBmdW5jdGlvbiAoIHRhcmdldCwgY2JHZXRNZXNzYWdlRnVuY3Rpb24gKSB7XG5cdFx0XG4gXHRcdHZhciB0aXBJZCA9IHRoaXMub3B0Ll90b29sdGlwO1xuXHRcdFxuXHRcdGpRdWVyeSh0YXJnZXQpLm1vdXNlb3ZlcihmdW5jdGlvbihlKSB7XG5cdFx0XHRcblx0IFx0XHR2YXIgb2Zmc2V0ID0galF1ZXJ5KGUudGFyZ2V0KS5vZmZzZXQoKTtcblxuXHRcdFx0aWYgKCAhIGpRdWVyeSggdGlwSWQgKS5pcygnOnZpc2libGUnKSApIHtcblx0XHQgICAgICAgIGpRdWVyeSggdGlwSWQgKSBcblx0XHQgICAgICAgIFx0LmNzcyh7XG5cdFx0ICAgICAgICBcdFx0J2JhY2tncm91bmQtY29sb3InOiBcIiMwMDBcIixcblx0XHQgICAgICAgIFx0XHQncGFkZGluZyc6IFwiM3B4IDEwcHggM3B4IDEwcHhcIixcblx0XHQgICAgICAgIFx0XHQndG9wJzogb2Zmc2V0LnRvcCArIGpRdWVyeShlLnRhcmdldCkuaGVpZ2h0KCkgKyBcInB4XCIsXG5cdFx0ICAgICAgICBcdFx0J2xlZnQnOiBvZmZzZXQubGVmdCArIGpRdWVyeShlLnRhcmdldCkud2lkdGgoKSArIFwicHhcIlxuXHRcdCAgICAgICAgXHR9KVxuXHRcdFx0ICAgICAgICAuYW5pbWF0ZSgge29wYWNpdHk6ICcwLjg1J30sIDEwKVxuXHRcdFx0ICAgICAgICAuaHRtbCggY2JHZXRNZXNzYWdlRnVuY3Rpb24uY2FsbCggdGFyZ2V0ICkgKVxuXHRcdFx0ICAgICAgICAuc2hvdygpO1xuXHRcdFx0fVxuXG5cdCAgICB9KS5tb3VzZW91dChmdW5jdGlvbigpIHtcblx0ICAgICAgICAvL1JlbW92ZSB0aGUgYXBwZW5kZWQgdG9vbHRpcCB0ZW1wbGF0ZVxuXHQgICAgICAgIGpRdWVyeSggdGlwSWQgKS5oaWRlKCk7XHQgICAgICAgICBcblx0ICAgIH0pO1xuXHR9LFxuXHRcbiAgIC8qKlxuICAgICogQW5ub3RhdGUgYSBzZXQgb2YgaW50ZXJ2YWxzIHByb3ZpZGVkIGluIHRoZSBhcmd1bWVudC5cblx0KiBcblx0KiBAZGVwcmVjYXRlZCBVc2UgYWRkQW5ub3RhdGlvbigpIGluc3RlYWQuXG4gICAgKiBcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBhbm5vdGF0aW9uIFRoZSBpbnRlcnZhbHMgYmVsb25naW5nIHRvIHRoZSBzYW1lIGFubm90YXRpb24uIFxuICAgICogU3ludGF4OiB7IG5hbWU6ICZsdDt2YWx1ZSZndDssIGNvbG9yOiAmbHQ7SFRNTENvbG9yQ29kZSZndDssIGh0bWw6ICZsdDtIVE1MU3RyaW5nJmd0OywgcmVnaW9uczogW3sgc3RhcnQ6ICZsdDtzdGFydFZhbDEmZ3Q7LCBlbmQ6ICZsdDtlbmRWYWwxJmd0O30sIC4uLiwgIHsgc3RhcnQ6ICZsdDtzdGFydFZhbE4mZ3Q7LCBlbmQ6ICZsdDtlbmRWYWxOJmd0O31dIH1cbiAgICAqL1xuXHRzZXRBbm5vdGF0aW9uOiBmdW5jdGlvbiAoIGFubm90YXRpb24gKSB7XG5cdFx0dGhpcy5hZGRBbm5vdGF0aW9uKGFubm90YXRpb24pO1xuXHR9LFxuXHRcblx0LyoqXG4gICAgKiBBbm5vdGF0ZSBhIHNldCBvZiBpbnRlcnZhbHMgcHJvdmlkZWQgaW4gdGhlIGFyZ3VtZW50LlxuICAgICogXG4gICAgKiBAZXhhbXBsZVxuICAgICogLy8gQW5ub3RhdGlvbnMgdXNpbmcgcmVnaW9ucyB3aXRoIGRpZmZlcmVudCBjb2xvcnMuXG4gICAgKiBteVNlcXVlbmNlLmFkZEFubm90YXRpb24oe1xuXHQqICAgIG5hbWU6XCJVTklQUk9UXCIsIFxuXHQqICAgIGh0bWw6XCImbHQ7YnImZ3Q7IEV4YW1wbGUgb2YgJmx0O2ImZ3Q7SFRNTCZsdDsvYiZndDtcIiwgXG5cdCogICAgY29sb3I6XCJncmVlblwiLCBcblx0KiAgICByZWdpb25zOiBbXG5cdCogICAgICAge3N0YXJ0OiA1NDAsIGVuZDogNTYwfSxcblx0KiAgICAgICB7c3RhcnQ6IDU2MSwgZW5kOjU4MCwgY29sb3I6IFwiI0ZGQTAxMFwifSwgXG5cdCogICAgICAge3N0YXJ0OiA1ODEsIGVuZDo1OTAsIGNvbG9yOiBcInJlZFwifSwgXG5cdCogICAgICAge3N0YXJ0OiA2OTAsIGVuZDo3MTB9XVxuXHQqIH0pO1xuXHQqIFxuICAgICogXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYW5ub3RhdGlvbiBUaGUgaW50ZXJ2YWxzIGJlbG9uZ2luZyB0byB0aGUgc2FtZSBhbm5vdGF0aW9uLiBcbiAgICAqIFN5bnRheDogeyBuYW1lOiAmbHQ7dmFsdWUmZ3Q7LCBjb2xvcjogJmx0O0hUTUxDb2xvckNvZGUmZ3Q7LCBodG1sOiAmbHQ7SFRNTFN0cmluZyZndDssIHJlZ2lvbnM6IFt7IHN0YXJ0OiAmbHQ7c3RhcnRWYWwxJmd0OywgZW5kOiAmbHQ7ZW5kVmFsMSZndDt9LCAuLi4sICB7IHN0YXJ0OiAmbHQ7c3RhcnRWYWxOJmd0OywgZW5kOiAmbHQ7ZW5kVmFsTiZndDt9XSB9XG4gICAgKi9cblx0YWRkQW5ub3RhdGlvbjogZnVuY3Rpb24gKCBhbm5vdGF0aW9uICkge1xuXHRcdHRoaXMuX2Fubm90YXRpb25zLnB1c2goYW5ub3RhdGlvbik7XG5cdFx0dGhpcy5fcmVkcmF3KCk7XG5cdH0sXG5cdFxuXHQvKipcbiAgICAqIFJlbW92ZXMgYW4gYW5ub3RhdGlvbiBieSBtZWFucyBvZiBpdHMgbmFtZS5cbiAgICAqIFxuICAgICogQGV4YW1wbGUgXG4gICAgKiAvLyBSZW1vdmUgdGhlIFVOSVBST1QgYW5ub3RhdGlvbi5cbiAgICAqIG15U2VxdWVuY2UucmVtb3ZlQW5ub3RhdGlvbignVU5JUFJPVCcpOyBcbiAgICAqIFxuICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGFubm90YXRpb24gdG8gYmUgcmVtb3ZlZC5cbiAgICAqIFxuICAgICovXG5cdHJlbW92ZUFubm90YXRpb246IGZ1bmN0aW9uICggbmFtZSApIHtcblx0XHRmb3IgKHZhciBpPTA7IGkgPCB0aGlzLl9hbm5vdGF0aW9ucy5sZW5ndGggOyBpKysgKXtcblx0XHRcdGlmKG5hbWUgIT0gdGhpcy5fYW5ub3RhdGlvbnNbaV0ubmFtZSl7XG5cdFx0XHRcdHRoaXMuX2Fubm90YXRpb25zLnNwbGljZShpLDEpO1xuXHRcdFx0XHR0aGlzLl9yZWRyYXcoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQvKipcbiAgICAqIFJlbW92ZXMgYWxsIHRoZSBjdXJyZW50IGFubm90YXRpb25zLlxuICAgICogXG4gICAgKiBAZXhhbXBsZSBcbiAgICAqIG15U2VxdWVuY2UucmVtb3ZlQWxsQW5ub3RhdGlvbnMoKTsgXG4gICAgKiBcbiAgICAqL1xuXHRyZW1vdmVBbGxBbm5vdGF0aW9uczogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX2Fubm90YXRpb25zID0gW107XG5cdFx0dGhpcy5fcmVkcmF3KCk7XG5cdH0sXG5cblx0XG59KTtcblxucmVxdWlyZShcImJpb2pzLWV2ZW50c1wiKS5taXhpbihTZXF1ZW5jZS5wcm90b3R5cGUpO1xubW9kdWxlLmV4cG9ydHMgPSBTZXF1ZW5jZTtcbiIsInZhciBldmVudHMgPSByZXF1aXJlKFwiYmFja2JvbmUtZXZlbnRzLXN0YW5kYWxvbmVcIik7XG5cbmV2ZW50cy5vbkFsbCA9IGZ1bmN0aW9uKGNhbGxiYWNrLGNvbnRleHQpe1xuICB0aGlzLm9uKFwiYWxsXCIsIGNhbGxiYWNrLGNvbnRleHQpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIE1peGluIHV0aWxpdHlcbmV2ZW50cy5vbGRNaXhpbiA9IGV2ZW50cy5taXhpbjtcbmV2ZW50cy5taXhpbiA9IGZ1bmN0aW9uKHByb3RvKSB7XG4gIGV2ZW50cy5vbGRNaXhpbihwcm90byk7XG4gIC8vIGFkZCBjdXN0b20gb25BbGxcbiAgdmFyIGV4cG9ydHMgPSBbJ29uQWxsJ107XG4gIGZvcih2YXIgaT0wOyBpIDwgZXhwb3J0cy5sZW5ndGg7aSsrKXtcbiAgICB2YXIgbmFtZSA9IGV4cG9ydHNbaV07XG4gICAgcHJvdG9bbmFtZV0gPSB0aGlzW25hbWVdO1xuICB9XG4gIHJldHVybiBwcm90bztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXZlbnRzO1xuIiwiLyoqXG4gKiBTdGFuZGFsb25lIGV4dHJhY3Rpb24gb2YgQmFja2JvbmUuRXZlbnRzLCBubyBleHRlcm5hbCBkZXBlbmRlbmN5IHJlcXVpcmVkLlxuICogRGVncmFkZXMgbmljZWx5IHdoZW4gQmFja29uZS91bmRlcnNjb3JlIGFyZSBhbHJlYWR5IGF2YWlsYWJsZSBpbiB0aGUgY3VycmVudFxuICogZ2xvYmFsIGNvbnRleHQuXG4gKlxuICogTm90ZSB0aGF0IGRvY3Mgc3VnZ2VzdCB0byB1c2UgdW5kZXJzY29yZSdzIGBfLmV4dGVuZCgpYCBtZXRob2QgdG8gYWRkIEV2ZW50c1xuICogc3VwcG9ydCB0byBzb21lIGdpdmVuIG9iamVjdC4gQSBgbWl4aW4oKWAgbWV0aG9kIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBFdmVudHNcbiAqIHByb3RvdHlwZSB0byBhdm9pZCB1c2luZyB1bmRlcnNjb3JlIGZvciB0aGF0IHNvbGUgcHVycG9zZTpcbiAqXG4gKiAgICAgdmFyIG15RXZlbnRFbWl0dGVyID0gQmFja2JvbmVFdmVudHMubWl4aW4oe30pO1xuICpcbiAqIE9yIGZvciBhIGZ1bmN0aW9uIGNvbnN0cnVjdG9yOlxuICpcbiAqICAgICBmdW5jdGlvbiBNeUNvbnN0cnVjdG9yKCl7fVxuICogICAgIE15Q29uc3RydWN0b3IucHJvdG90eXBlLmZvbyA9IGZ1bmN0aW9uKCl7fVxuICogICAgIEJhY2tib25lRXZlbnRzLm1peGluKE15Q29uc3RydWN0b3IucHJvdG90eXBlKTtcbiAqXG4gKiAoYykgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBJbmMuXG4gKiAoYykgMjAxMyBOaWNvbGFzIFBlcnJpYXVsdFxuICovXG4vKiBnbG9iYWwgZXhwb3J0czp0cnVlLCBkZWZpbmUsIG1vZHVsZSAqL1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgcm9vdCA9IHRoaXMsXG4gICAgICBicmVha2VyID0ge30sXG4gICAgICBuYXRpdmVGb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2gsXG4gICAgICBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG4gICAgICBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZSxcbiAgICAgIGlkQ291bnRlciA9IDA7XG5cbiAgLy8gUmV0dXJucyBhIHBhcnRpYWwgaW1wbGVtZW50YXRpb24gbWF0Y2hpbmcgdGhlIG1pbmltYWwgQVBJIHN1YnNldCByZXF1aXJlZFxuICAvLyBieSBCYWNrYm9uZS5FdmVudHNcbiAgZnVuY3Rpb24gbWluaXNjb3JlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBrZXlzOiBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBvYmogIT09IFwiZnVuY3Rpb25cIiB8fCBvYmogPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwia2V5cygpIGNhbGxlZCBvbiBhIG5vbi1vYmplY3RcIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGtleSwga2V5cyA9IFtdO1xuICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIGtleXNba2V5cy5sZW5ndGhdID0ga2V5O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5cztcbiAgICAgIH0sXG5cbiAgICAgIHVuaXF1ZUlkOiBmdW5jdGlvbihwcmVmaXgpIHtcbiAgICAgICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICAgICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gICAgICB9LFxuXG4gICAgICBoYXM6IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgICAgIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgICAgIH0sXG5cbiAgICAgIGVhY2g6IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm47XG4gICAgICAgIGlmIChuYXRpdmVGb3JFYWNoICYmIG9iai5mb3JFYWNoID09PSBuYXRpdmVGb3JFYWNoKSB7XG4gICAgICAgICAgb2JqLmZvckVhY2goaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgICAgICB9IGVsc2UgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaikgPT09IGJyZWFrZXIpIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzKG9iaiwga2V5KSkge1xuICAgICAgICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpba2V5XSwga2V5LCBvYmopID09PSBicmVha2VyKSByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBvbmNlOiBmdW5jdGlvbihmdW5jKSB7XG4gICAgICAgIHZhciByYW4gPSBmYWxzZSwgbWVtbztcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChyYW4pIHJldHVybiBtZW1vO1xuICAgICAgICAgIHJhbiA9IHRydWU7XG4gICAgICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICBmdW5jID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgdmFyIF8gPSBtaW5pc2NvcmUoKSwgRXZlbnRzO1xuXG4gIC8vIEJhY2tib25lLkV2ZW50c1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBBIG1vZHVsZSB0aGF0IGNhbiBiZSBtaXhlZCBpbiB0byAqYW55IG9iamVjdCogaW4gb3JkZXIgdG8gcHJvdmlkZSBpdCB3aXRoXG4gIC8vIGN1c3RvbSBldmVudHMuIFlvdSBtYXkgYmluZCB3aXRoIGBvbmAgb3IgcmVtb3ZlIHdpdGggYG9mZmAgY2FsbGJhY2tcbiAgLy8gZnVuY3Rpb25zIHRvIGFuIGV2ZW50OyBgdHJpZ2dlcmAtaW5nIGFuIGV2ZW50IGZpcmVzIGFsbCBjYWxsYmFja3MgaW5cbiAgLy8gc3VjY2Vzc2lvbi5cbiAgLy9cbiAgLy8gICAgIHZhciBvYmplY3QgPSB7fTtcbiAgLy8gICAgIF8uZXh0ZW5kKG9iamVjdCwgQmFja2JvbmUuRXZlbnRzKTtcbiAgLy8gICAgIG9iamVjdC5vbignZXhwYW5kJywgZnVuY3Rpb24oKXsgYWxlcnQoJ2V4cGFuZGVkJyk7IH0pO1xuICAvLyAgICAgb2JqZWN0LnRyaWdnZXIoJ2V4cGFuZCcpO1xuICAvL1xuICBFdmVudHMgPSB7XG5cbiAgICAvLyBCaW5kIGFuIGV2ZW50IHRvIGEgYGNhbGxiYWNrYCBmdW5jdGlvbi4gUGFzc2luZyBgXCJhbGxcImAgd2lsbCBiaW5kXG4gICAgLy8gdGhlIGNhbGxiYWNrIHRvIGFsbCBldmVudHMgZmlyZWQuXG4gICAgb246IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAnb24nLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSB8fCAhY2FsbGJhY2spIHJldHVybiB0aGlzO1xuICAgICAgdGhpcy5fZXZlbnRzIHx8ICh0aGlzLl9ldmVudHMgPSB7fSk7XG4gICAgICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdIHx8ICh0aGlzLl9ldmVudHNbbmFtZV0gPSBbXSk7XG4gICAgICBldmVudHMucHVzaCh7Y2FsbGJhY2s6IGNhbGxiYWNrLCBjb250ZXh0OiBjb250ZXh0LCBjdHg6IGNvbnRleHQgfHwgdGhpc30pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEJpbmQgYW4gZXZlbnQgdG8gb25seSBiZSB0cmlnZ2VyZWQgYSBzaW5nbGUgdGltZS4gQWZ0ZXIgdGhlIGZpcnN0IHRpbWVcbiAgICAvLyB0aGUgY2FsbGJhY2sgaXMgaW52b2tlZCwgaXQgd2lsbCBiZSByZW1vdmVkLlxuICAgIG9uY2U6IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAnb25jZScsIG5hbWUsIFtjYWxsYmFjaywgY29udGV4dF0pIHx8ICFjYWxsYmFjaykgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgb25jZSA9IF8ub25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5vZmYobmFtZSwgb25jZSk7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9KTtcbiAgICAgIG9uY2UuX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICByZXR1cm4gdGhpcy5vbihuYW1lLCBvbmNlLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIG9uZSBvciBtYW55IGNhbGxiYWNrcy4gSWYgYGNvbnRleHRgIGlzIG51bGwsIHJlbW92ZXMgYWxsXG4gICAgLy8gY2FsbGJhY2tzIHdpdGggdGhhdCBmdW5jdGlvbi4gSWYgYGNhbGxiYWNrYCBpcyBudWxsLCByZW1vdmVzIGFsbFxuICAgIC8vIGNhbGxiYWNrcyBmb3IgdGhlIGV2ZW50LiBJZiBgbmFtZWAgaXMgbnVsbCwgcmVtb3ZlcyBhbGwgYm91bmRcbiAgICAvLyBjYWxsYmFja3MgZm9yIGFsbCBldmVudHMuXG4gICAgb2ZmOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIHJldGFpbiwgZXYsIGV2ZW50cywgbmFtZXMsIGksIGwsIGosIGs7XG4gICAgICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhZXZlbnRzQXBpKHRoaXMsICdvZmYnLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSkgcmV0dXJuIHRoaXM7XG4gICAgICBpZiAoIW5hbWUgJiYgIWNhbGxiYWNrICYmICFjb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgbmFtZXMgPSBuYW1lID8gW25hbWVdIDogXy5rZXlzKHRoaXMuX2V2ZW50cyk7XG4gICAgICBmb3IgKGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgICAgaWYgKGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50c1tuYW1lXSA9IHJldGFpbiA9IFtdO1xuICAgICAgICAgIGlmIChjYWxsYmFjayB8fCBjb250ZXh0KSB7XG4gICAgICAgICAgICBmb3IgKGogPSAwLCBrID0gZXZlbnRzLmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgICBldiA9IGV2ZW50c1tqXTtcbiAgICAgICAgICAgICAgaWYgKChjYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2sgJiYgY2FsbGJhY2sgIT09IGV2LmNhbGxiYWNrLl9jYWxsYmFjaykgfHxcbiAgICAgICAgICAgICAgICAgIChjb250ZXh0ICYmIGNvbnRleHQgIT09IGV2LmNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0YWluLnB1c2goZXYpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghcmV0YWluLmxlbmd0aCkgZGVsZXRlIHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gVHJpZ2dlciBvbmUgb3IgbWFueSBldmVudHMsIGZpcmluZyBhbGwgYm91bmQgY2FsbGJhY2tzLiBDYWxsYmFja3MgYXJlXG4gICAgLy8gcGFzc2VkIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyBgdHJpZ2dlcmAgaXMsIGFwYXJ0IGZyb20gdGhlIGV2ZW50IG5hbWVcbiAgICAvLyAodW5sZXNzIHlvdSdyZSBsaXN0ZW5pbmcgb24gYFwiYWxsXCJgLCB3aGljaCB3aWxsIGNhdXNlIHlvdXIgY2FsbGJhY2sgdG9cbiAgICAvLyByZWNlaXZlIHRoZSB0cnVlIG5hbWUgb2YgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBhcmd1bWVudCkuXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24obmFtZSkge1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAndHJpZ2dlcicsIG5hbWUsIGFyZ3MpKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV07XG4gICAgICB2YXIgYWxsRXZlbnRzID0gdGhpcy5fZXZlbnRzLmFsbDtcbiAgICAgIGlmIChldmVudHMpIHRyaWdnZXJFdmVudHMoZXZlbnRzLCBhcmdzKTtcbiAgICAgIGlmIChhbGxFdmVudHMpIHRyaWdnZXJFdmVudHMoYWxsRXZlbnRzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIFRlbGwgdGhpcyBvYmplY3QgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gZWl0aGVyIHNwZWNpZmljIGV2ZW50cyAuLi4gb3JcbiAgICAvLyB0byBldmVyeSBvYmplY3QgaXQncyBjdXJyZW50bHkgbGlzdGVuaW5nIHRvLlxuICAgIHN0b3BMaXN0ZW5pbmc6IGZ1bmN0aW9uKG9iaiwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgICBpZiAoIWxpc3RlbmVycykgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgZGVsZXRlTGlzdGVuZXIgPSAhbmFtZSAmJiAhY2FsbGJhY2s7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSBjYWxsYmFjayA9IHRoaXM7XG4gICAgICBpZiAob2JqKSAobGlzdGVuZXJzID0ge30pW29iai5fbGlzdGVuZXJJZF0gPSBvYmo7XG4gICAgICBmb3IgKHZhciBpZCBpbiBsaXN0ZW5lcnMpIHtcbiAgICAgICAgbGlzdGVuZXJzW2lkXS5vZmYobmFtZSwgY2FsbGJhY2ssIHRoaXMpO1xuICAgICAgICBpZiAoZGVsZXRlTGlzdGVuZXIpIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbaWRdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gIH07XG5cbiAgLy8gUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gc3BsaXQgZXZlbnQgc3RyaW5ncy5cbiAgdmFyIGV2ZW50U3BsaXR0ZXIgPSAvXFxzKy87XG5cbiAgLy8gSW1wbGVtZW50IGZhbmN5IGZlYXR1cmVzIG9mIHRoZSBFdmVudHMgQVBJIHN1Y2ggYXMgbXVsdGlwbGUgZXZlbnRcbiAgLy8gbmFtZXMgYFwiY2hhbmdlIGJsdXJcImAgYW5kIGpRdWVyeS1zdHlsZSBldmVudCBtYXBzIGB7Y2hhbmdlOiBhY3Rpb259YFxuICAvLyBpbiB0ZXJtcyBvZiB0aGUgZXhpc3RpbmcgQVBJLlxuICB2YXIgZXZlbnRzQXBpID0gZnVuY3Rpb24ob2JqLCBhY3Rpb24sIG5hbWUsIHJlc3QpIHtcbiAgICBpZiAoIW5hbWUpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gSGFuZGxlIGV2ZW50IG1hcHMuXG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIga2V5IGluIG5hbWUpIHtcbiAgICAgICAgb2JqW2FjdGlvbl0uYXBwbHkob2JqLCBba2V5LCBuYW1lW2tleV1dLmNvbmNhdChyZXN0KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHNwYWNlIHNlcGFyYXRlZCBldmVudCBuYW1lcy5cbiAgICBpZiAoZXZlbnRTcGxpdHRlci50ZXN0KG5hbWUpKSB7XG4gICAgICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KGV2ZW50U3BsaXR0ZXIpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgb2JqW2FjdGlvbl0uYXBwbHkob2JqLCBbbmFtZXNbaV1dLmNvbmNhdChyZXN0KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gQSBkaWZmaWN1bHQtdG8tYmVsaWV2ZSwgYnV0IG9wdGltaXplZCBpbnRlcm5hbCBkaXNwYXRjaCBmdW5jdGlvbiBmb3JcbiAgLy8gdHJpZ2dlcmluZyBldmVudHMuIFRyaWVzIHRvIGtlZXAgdGhlIHVzdWFsIGNhc2VzIHNwZWVkeSAobW9zdCBpbnRlcm5hbFxuICAvLyBCYWNrYm9uZSBldmVudHMgaGF2ZSAzIGFyZ3VtZW50cykuXG4gIHZhciB0cmlnZ2VyRXZlbnRzID0gZnVuY3Rpb24oZXZlbnRzLCBhcmdzKSB7XG4gICAgdmFyIGV2LCBpID0gLTEsIGwgPSBldmVudHMubGVuZ3RoLCBhMSA9IGFyZ3NbMF0sIGEyID0gYXJnc1sxXSwgYTMgPSBhcmdzWzJdO1xuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgpOyByZXR1cm47XG4gICAgICBjYXNlIDE6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSk7IHJldHVybjtcbiAgICAgIGNhc2UgMjogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMik7IHJldHVybjtcbiAgICAgIGNhc2UgMzogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMiwgYTMpOyByZXR1cm47XG4gICAgICBkZWZhdWx0OiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5hcHBseShldi5jdHgsIGFyZ3MpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbGlzdGVuTWV0aG9kcyA9IHtsaXN0ZW5UbzogJ29uJywgbGlzdGVuVG9PbmNlOiAnb25jZSd9O1xuXG4gIC8vIEludmVyc2lvbi1vZi1jb250cm9sIHZlcnNpb25zIG9mIGBvbmAgYW5kIGBvbmNlYC4gVGVsbCAqdGhpcyogb2JqZWN0IHRvXG4gIC8vIGxpc3RlbiB0byBhbiBldmVudCBpbiBhbm90aGVyIG9iamVjdCAuLi4ga2VlcGluZyB0cmFjayBvZiB3aGF0IGl0J3NcbiAgLy8gbGlzdGVuaW5nIHRvLlxuICBfLmVhY2gobGlzdGVuTWV0aG9kcywgZnVuY3Rpb24oaW1wbGVtZW50YXRpb24sIG1ldGhvZCkge1xuICAgIEV2ZW50c1ttZXRob2RdID0gZnVuY3Rpb24ob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycyB8fCAodGhpcy5fbGlzdGVuZXJzID0ge30pO1xuICAgICAgdmFyIGlkID0gb2JqLl9saXN0ZW5lcklkIHx8IChvYmouX2xpc3RlbmVySWQgPSBfLnVuaXF1ZUlkKCdsJykpO1xuICAgICAgbGlzdGVuZXJzW2lkXSA9IG9iajtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIGNhbGxiYWNrID0gdGhpcztcbiAgICAgIG9ialtpbXBsZW1lbnRhdGlvbl0obmFtZSwgY2FsbGJhY2ssIHRoaXMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWxpYXNlcyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG4gIEV2ZW50cy5iaW5kICAgPSBFdmVudHMub247XG4gIEV2ZW50cy51bmJpbmQgPSBFdmVudHMub2ZmO1xuXG4gIC8vIE1peGluIHV0aWxpdHlcbiAgRXZlbnRzLm1peGluID0gZnVuY3Rpb24ocHJvdG8pIHtcbiAgICB2YXIgZXhwb3J0cyA9IFsnb24nLCAnb25jZScsICdvZmYnLCAndHJpZ2dlcicsICdzdG9wTGlzdGVuaW5nJywgJ2xpc3RlblRvJyxcbiAgICAgICAgICAgICAgICAgICAnbGlzdGVuVG9PbmNlJywgJ2JpbmQnLCAndW5iaW5kJ107XG4gICAgXy5lYWNoKGV4cG9ydHMsIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHByb3RvW25hbWVdID0gdGhpc1tuYW1lXTtcbiAgICB9LCB0aGlzKTtcbiAgICByZXR1cm4gcHJvdG87XG4gIH07XG5cbiAgLy8gRXhwb3J0IEV2ZW50cyBhcyBCYWNrYm9uZUV2ZW50cyBkZXBlbmRpbmcgb24gY3VycmVudCBjb250ZXh0XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRXZlbnRzO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gRXZlbnRzO1xuICAgIH1cbiAgICBleHBvcnRzLkJhY2tib25lRXZlbnRzID0gRXZlbnRzO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuQmFja2JvbmVFdmVudHMgPSBFdmVudHM7XG4gIH1cbn0pKHRoaXMpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2JhY2tib25lLWV2ZW50cy1zdGFuZGFsb25lJyk7XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOC4wXG52YXIgR2VuZXJpY1JlYWRlciwgeGhyO1xuXG54aHIgPSByZXF1aXJlKCduZXRzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gR2VuZXJpY1JlYWRlciA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gR2VuZXJpY1JlYWRlcigpIHt9XG5cbiAgR2VuZXJpY1JlYWRlci5yZWFkID0gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICAgIHZhciBvbnJldDtcbiAgICBvbnJldCA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVyciwgcmVzcG9uc2UsIHRleHQpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLl9vblJldHJpZXZhbCh0ZXh0LCBjYWxsYmFjayk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpO1xuICAgIHJldHVybiB4aHIodXJsLCBvbnJldCk7XG4gIH07XG5cbiAgR2VuZXJpY1JlYWRlci5fb25SZXRyaWV2YWwgPSBmdW5jdGlvbih0ZXh0LCBjYWxsYmFjaykge1xuICAgIHZhciByVGV4dDtcbiAgICByVGV4dCA9IHRoaXMucGFyc2UodGV4dCk7XG4gICAgcmV0dXJuIGNhbGxiYWNrKHJUZXh0KTtcbiAgfTtcblxuICByZXR1cm4gR2VuZXJpY1JlYWRlcjtcblxufSkoKTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS44LjBcbnZhciBGYXN0YSwgR2VuZXJpY1JlYWRlciwgU2VxLCBTdHIsXG4gIF9faGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5LFxuICBfX2V4dGVuZHMgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKF9faGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfTtcblxuU3RyID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcblxuR2VuZXJpY1JlYWRlciA9IHJlcXVpcmUoXCIuL2dlbmVyaWNfcmVhZGVyXCIpO1xuXG5TZXEgPSByZXF1aXJlKFwiYmlvanMtbW9kZWxcIikuc2VxO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZhc3RhID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICBfX2V4dGVuZHMoRmFzdGEsIF9zdXBlcik7XG5cbiAgZnVuY3Rpb24gRmFzdGEoKSB7XG4gICAgcmV0dXJuIEZhc3RhLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgRmFzdGEucGFyc2UgPSBmdW5jdGlvbih0ZXh0KSB7XG4gICAgdmFyIGN1cnJlbnRTZXEsIGRhdGFiYXNlLCBkYXRhYmFzZUlELCBpZGVudGlmaWVycywgaywgbGFiZWwsIGxpbmUsIHNlcXMsIF9pLCBfbGVuO1xuICAgIHNlcXMgPSBbXTtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRleHQpICE9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICB0ZXh0ID0gdGV4dC5zcGxpdChcIlxcblwiKTtcbiAgICB9XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSB0ZXh0Lmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBsaW5lID0gdGV4dFtfaV07XG4gICAgICBpZiAobGluZVswXSA9PT0gXCI+XCIgfHwgbGluZVswXSA9PT0gXCI7XCIpIHtcbiAgICAgICAgbGFiZWwgPSBsaW5lLnNsaWNlKDEpO1xuICAgICAgICBjdXJyZW50U2VxID0gbmV3IFNlcShcIlwiLCBsYWJlbCwgc2Vxcy5sZW5ndGgpO1xuICAgICAgICBzZXFzLnB1c2goY3VycmVudFNlcSk7XG4gICAgICAgIGlmIChTdHIuY29udGFpbnMoXCJ8XCIsIGxpbmUpKSB7XG4gICAgICAgICAgaWRlbnRpZmllcnMgPSBsYWJlbC5zcGxpdChcInxcIik7XG4gICAgICAgICAgayA9IDE7XG4gICAgICAgICAgd2hpbGUgKGsgPCBpZGVudGlmaWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRhdGFiYXNlID0gaWRlbnRpZmllcnNba107XG4gICAgICAgICAgICBkYXRhYmFzZUlEID0gaWRlbnRpZmllcnNbayArIDFdO1xuICAgICAgICAgICAgY3VycmVudFNlcS5tZXRhW2RhdGFiYXNlXSA9IGRhdGFiYXNlSUQ7XG4gICAgICAgICAgICBrICs9IDI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGN1cnJlbnRTZXEubmFtZSA9IGlkZW50aWZpZXJzW2lkZW50aWZpZXJzLmxlbmd0aCAtIDFdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50U2VxLnNlcSArPSBsaW5lO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2VxcztcbiAgfTtcblxuICByZXR1cm4gRmFzdGE7XG5cbn0pKEdlbmVyaWNSZWFkZXIpO1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjguMFxudmFyIHN0cmluZ3M7XG5cbnN0cmluZ3MgPSB7XG4gIGNvbnRhaW5zOiBmdW5jdGlvbih0ZXh0LCBzZWFyY2gpIHtcbiAgICByZXR1cm4gJycuaW5kZXhPZi5jYWxsKHRleHQsIHNlYXJjaCwgMCkgIT09IC0xO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0cmluZ3M7XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOC4wXG52YXIgVXRpbHM7XG5cblV0aWxzID0ge307XG5cblV0aWxzLnNwbGl0TkNoYXJzID0gZnVuY3Rpb24odHh0LCBudW0pIHtcbiAgdmFyIGksIHJlc3VsdCwgX2ksIF9yZWY7XG4gIHJlc3VsdCA9IFtdO1xuICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0eHQubGVuZ3RoIC0gMTsgbnVtID4gMCA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gX2kgKz0gbnVtKSB7XG4gICAgcmVzdWx0LnB1c2godHh0LnN1YnN0cihpLCBudW0pKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlscztcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS44LjBcbnZhciBGYXN0YUV4cG9ydGVyLCBVdGlscztcblxuVXRpbHMgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGYXN0YUV4cG9ydGVyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBGYXN0YUV4cG9ydGVyKCkge31cblxuICBGYXN0YUV4cG9ydGVyW1wiZXhwb3J0XCJdID0gZnVuY3Rpb24oc2VxcywgYWNjZXNzKSB7XG4gICAgdmFyIHNlcSwgdGV4dCwgX2ksIF9sZW47XG4gICAgdGV4dCA9IFwiXCI7XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBzZXFzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBzZXEgPSBzZXFzW19pXTtcbiAgICAgIGlmIChhY2Nlc3MgIT0gbnVsbCkge1xuICAgICAgICBzZXEgPSBhY2Nlc3Moc2VxKTtcbiAgICAgIH1cbiAgICAgIHRleHQgKz0gXCI+XCIgKyBzZXEubmFtZSArIFwiXFxuXCI7XG4gICAgICB0ZXh0ICs9IChVdGlscy5zcGxpdE5DaGFycyhzZXEuc2VxLCA4MCkpLmpvaW4oXCJcXG5cIik7XG4gICAgICB0ZXh0ICs9IFwiXFxuXCI7XG4gICAgfVxuICAgIHJldHVybiB0ZXh0O1xuICB9O1xuXG4gIHJldHVybiBGYXN0YUV4cG9ydGVyO1xuXG59KSgpO1xuIiwibW9kdWxlLmV4cG9ydHMuc2VxID0gcmVxdWlyZShcIi4vc2VxXCIpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZXEsIG5hbWUsIGlkKSB7XG4gICAgdGhpcy5zZXEgPSBzZXE7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5tZXRhID0ge307XG59O1xuIiwidmFyIHJlcSA9IHJlcXVpcmUoJ3JlcXVlc3QnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5ldHNcblxuZnVuY3Rpb24gTmV0cyh1cmksIG9wdHMsIGNiKSB7XG4gIHJlcSh1cmksIG9wdHMsIGNiKVxufSIsInZhciB3aW5kb3cgPSByZXF1aXJlKFwiZ2xvYmFsL3dpbmRvd1wiKVxudmFyIG9uY2UgPSByZXF1aXJlKFwib25jZVwiKVxudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJ3BhcnNlLWhlYWRlcnMnKVxuXG52YXIgbWVzc2FnZXMgPSB7XG4gICAgXCIwXCI6IFwiSW50ZXJuYWwgWE1MSHR0cFJlcXVlc3QgRXJyb3JcIixcbiAgICBcIjRcIjogXCI0eHggQ2xpZW50IEVycm9yXCIsXG4gICAgXCI1XCI6IFwiNXh4IFNlcnZlciBFcnJvclwiXG59XG5cbnZhciBYSFIgPSB3aW5kb3cuWE1MSHR0cFJlcXVlc3QgfHwgbm9vcFxudmFyIFhEUiA9IFwid2l0aENyZWRlbnRpYWxzXCIgaW4gKG5ldyBYSFIoKSkgPyBYSFIgOiB3aW5kb3cuWERvbWFpblJlcXVlc3RcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVYSFJcblxuZnVuY3Rpb24gY3JlYXRlWEhSKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7IHVyaTogb3B0aW9ucyB9XG4gICAgfVxuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICBjYWxsYmFjayA9IG9uY2UoY2FsbGJhY2spXG5cbiAgICB2YXIgeGhyID0gb3B0aW9ucy54aHIgfHwgbnVsbFxuXG4gICAgaWYgKCF4aHIpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuY29ycyB8fCBvcHRpb25zLnVzZVhEUikge1xuICAgICAgICAgICAgeGhyID0gbmV3IFhEUigpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgeGhyID0gbmV3IFhIUigpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdXJpID0geGhyLnVybCA9IG9wdGlvbnMudXJpIHx8IG9wdGlvbnMudXJsXG4gICAgdmFyIG1ldGhvZCA9IHhoci5tZXRob2QgPSBvcHRpb25zLm1ldGhvZCB8fCBcIkdFVFwiXG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHkgfHwgb3B0aW9ucy5kYXRhXG4gICAgdmFyIGhlYWRlcnMgPSB4aHIuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyB8fCB7fVxuICAgIHZhciBzeW5jID0gISFvcHRpb25zLnN5bmNcbiAgICB2YXIgaXNKc29uID0gZmFsc2VcbiAgICB2YXIga2V5XG4gICAgdmFyIGxvYWQgPSBvcHRpb25zLnJlc3BvbnNlID8gbG9hZFJlc3BvbnNlIDogbG9hZFhoclxuXG4gICAgaWYgKFwianNvblwiIGluIG9wdGlvbnMpIHtcbiAgICAgICAgaXNKc29uID0gdHJ1ZVxuICAgICAgICBoZWFkZXJzW1wiQWNjZXB0XCJdID0gXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgICAgaWYgKG1ldGhvZCAhPT0gXCJHRVRcIiAmJiBtZXRob2QgIT09IFwiSEVBRFwiKSB7XG4gICAgICAgICAgICBoZWFkZXJzW1wiQ29udGVudC1UeXBlXCJdID0gXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmpzb24pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gcmVhZHlzdGF0ZWNoYW5nZVxuICAgIHhoci5vbmxvYWQgPSBsb2FkXG4gICAgeGhyLm9uZXJyb3IgPSBlcnJvclxuICAgIC8vIElFOSBtdXN0IGhhdmUgb25wcm9ncmVzcyBiZSBzZXQgdG8gYSB1bmlxdWUgZnVuY3Rpb24uXG4gICAgeGhyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIElFIG11c3QgZGllXG4gICAgfVxuICAgIC8vIGhhdGUgSUVcbiAgICB4aHIub250aW1lb3V0ID0gbm9vcFxuICAgIHhoci5vcGVuKG1ldGhvZCwgdXJpLCAhc3luYylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgIGlmIChvcHRpb25zLndpdGhDcmVkZW50aWFscyB8fCAob3B0aW9ucy5jb3JzICYmIG9wdGlvbnMud2l0aENyZWRlbnRpYWxzICE9PSBmYWxzZSkpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICB9XG5cbiAgICAvLyBDYW5ub3Qgc2V0IHRpbWVvdXQgd2l0aCBzeW5jIHJlcXVlc3RcbiAgICBpZiAoIXN5bmMpIHtcbiAgICAgICAgeGhyLnRpbWVvdXQgPSBcInRpbWVvdXRcIiBpbiBvcHRpb25zID8gb3B0aW9ucy50aW1lb3V0IDogNTAwMFxuICAgIH1cblxuICAgIGlmICh4aHIuc2V0UmVxdWVzdEhlYWRlcikge1xuICAgICAgICBmb3Ioa2V5IGluIGhlYWRlcnMpe1xuICAgICAgICAgICAgaWYoaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihrZXksIGhlYWRlcnNba2V5XSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkhlYWRlcnMgY2Fubm90IGJlIHNldCBvbiBhbiBYRG9tYWluUmVxdWVzdCBvYmplY3RcIilcbiAgICB9XG5cbiAgICBpZiAoXCJyZXNwb25zZVR5cGVcIiBpbiBvcHRpb25zKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSBvcHRpb25zLnJlc3BvbnNlVHlwZVxuICAgIH1cbiAgICBcbiAgICBpZiAoXCJiZWZvcmVTZW5kXCIgaW4gb3B0aW9ucyAmJiBcbiAgICAgICAgdHlwZW9mIG9wdGlvbnMuYmVmb3JlU2VuZCA9PT0gXCJmdW5jdGlvblwiXG4gICAgKSB7XG4gICAgICAgIG9wdGlvbnMuYmVmb3JlU2VuZCh4aHIpXG4gICAgfVxuXG4gICAgeGhyLnNlbmQoYm9keSlcblxuICAgIHJldHVybiB4aHJcblxuICAgIGZ1bmN0aW9uIHJlYWR5c3RhdGVjaGFuZ2UoKSB7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgbG9hZCgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCb2R5KCkge1xuICAgICAgICAvLyBDaHJvbWUgd2l0aCByZXF1ZXN0VHlwZT1ibG9iIHRocm93cyBlcnJvcnMgYXJyb3VuZCB3aGVuIGV2ZW4gdGVzdGluZyBhY2Nlc3MgdG8gcmVzcG9uc2VUZXh0XG4gICAgICAgIHZhciBib2R5ID0gbnVsbFxuXG4gICAgICAgIGlmICh4aHIucmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGJvZHkgPSB4aHIucmVzcG9uc2VcbiAgICAgICAgfSBlbHNlIGlmICh4aHIucmVzcG9uc2VUeXBlID09PSAndGV4dCcgfHwgIXhoci5yZXNwb25zZVR5cGUpIHtcbiAgICAgICAgICAgIGJvZHkgPSB4aHIucmVzcG9uc2VUZXh0IHx8IHhoci5yZXNwb25zZVhNTFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzSnNvbikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5wYXJzZShib2R5KVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBib2R5XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U3RhdHVzQ29kZSgpIHtcbiAgICAgICAgcmV0dXJuIHhoci5zdGF0dXMgPT09IDEyMjMgPyAyMDQgOiB4aHIuc3RhdHVzXG4gICAgfVxuXG4gICAgLy8gaWYgd2UncmUgZ2V0dGluZyBhIG5vbmUtb2sgc3RhdHVzQ29kZSwgYnVpbGQgJiByZXR1cm4gYW4gZXJyb3JcbiAgICBmdW5jdGlvbiBlcnJvckZyb21TdGF0dXNDb2RlKHN0YXR1cywgYm9keSkge1xuICAgICAgICB2YXIgZXJyb3IgPSBudWxsXG4gICAgICAgIGlmIChzdGF0dXMgPT09IDAgfHwgKHN0YXR1cyA+PSA0MDAgJiYgc3RhdHVzIDwgNjAwKSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSAodHlwZW9mIGJvZHkgPT09IFwic3RyaW5nXCIgPyBib2R5IDogZmFsc2UpIHx8XG4gICAgICAgICAgICAgICAgbWVzc2FnZXNbU3RyaW5nKHN0YXR1cykuY2hhckF0KDApXVxuICAgICAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSlcbiAgICAgICAgICAgIGVycm9yLnN0YXR1c0NvZGUgPSBzdGF0dXNcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlcnJvclxuICAgIH1cblxuICAgIC8vIHdpbGwgbG9hZCB0aGUgZGF0YSAmIHByb2Nlc3MgdGhlIHJlc3BvbnNlIGluIGEgc3BlY2lhbCByZXNwb25zZSBvYmplY3RcbiAgICBmdW5jdGlvbiBsb2FkUmVzcG9uc2UoKSB7XG4gICAgICAgIHZhciBzdGF0dXMgPSBnZXRTdGF0dXNDb2RlKClcbiAgICAgICAgdmFyIGJvZHkgPSBnZXRCb2R5KClcbiAgICAgICAgdmFyIGVycm9yID0gZXJyb3JGcm9tU3RhdHVzQ29kZShzdGF0dXMsIGJvZHkpXG4gICAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgICAgIGJvZHk6IGJvZHksXG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBzdGF0dXMsXG4gICAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICAgIHJhdzogeGhyXG4gICAgICAgIH1cbiAgICAgICAgaWYoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycyl7IC8vcmVtZW1iZXIgeGhyIGNhbiBpbiBmYWN0IGJlIFhEUiBmb3IgQ09SUyBpbiBJRVxuICAgICAgICAgICAgcmVzcG9uc2UuaGVhZGVycyA9IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZS5oZWFkZXJzID0ge31cbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCByZXNwb25zZSwgcmVzcG9uc2UuYm9keSlcbiAgICB9XG5cbiAgICAvLyB3aWxsIGxvYWQgdGhlIGRhdGEgYW5kIGFkZCBzb21lIHJlc3BvbnNlIHByb3BlcnRpZXMgdG8gdGhlIHNvdXJjZSB4aHJcbiAgICAvLyBhbmQgdGhlbiByZXNwb25kIHdpdGggdGhhdFxuICAgIGZ1bmN0aW9uIGxvYWRYaHIoKSB7XG4gICAgICAgIHZhciBzdGF0dXMgPSBnZXRTdGF0dXNDb2RlKClcbiAgICAgICAgdmFyIGVycm9yID0gZXJyb3JGcm9tU3RhdHVzQ29kZShzdGF0dXMpXG5cbiAgICAgICAgeGhyLnN0YXR1cyA9IHhoci5zdGF0dXNDb2RlID0gc3RhdHVzXG4gICAgICAgIHhoci5ib2R5ID0gZ2V0Qm9keSgpXG4gICAgICAgIHhoci5oZWFkZXJzID0gcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSlcblxuICAgICAgICBjYWxsYmFjayhlcnJvciwgeGhyLCB4aHIuYm9keSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlcnJvcihldnQpIHtcbiAgICAgICAgY2FsbGJhY2soZXZ0LCB4aHIpXG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuIiwiaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzZWxmO1xufSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHt9O1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBvbmNlXG5cbm9uY2UucHJvdG8gPSBvbmNlKGZ1bmN0aW9uICgpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZ1bmN0aW9uLnByb3RvdHlwZSwgJ29uY2UnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBvbmNlKHRoaXMpXG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSlcbn0pXG5cbmZ1bmN0aW9uIG9uY2UgKGZuKSB7XG4gIHZhciBjYWxsZWQgPSBmYWxzZVxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGlmIChjYWxsZWQpIHJldHVyblxuICAgIGNhbGxlZCA9IHRydWVcbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9XG59XG4iLCJ2YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJ2lzLWZ1bmN0aW9uJylcblxubW9kdWxlLmV4cG9ydHMgPSBmb3JFYWNoXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcblxuZnVuY3Rpb24gZm9yRWFjaChsaXN0LCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXNGdW5jdGlvbihpdGVyYXRvcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaXRlcmF0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICB9XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgY29udGV4dCA9IHRoaXNcbiAgICB9XG4gICAgXG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobGlzdCkgPT09ICdbb2JqZWN0IEFycmF5XScpXG4gICAgICAgIGZvckVhY2hBcnJheShsaXN0LCBpdGVyYXRvciwgY29udGV4dClcbiAgICBlbHNlIGlmICh0eXBlb2YgbGlzdCA9PT0gJ3N0cmluZycpXG4gICAgICAgIGZvckVhY2hTdHJpbmcobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpXG4gICAgZWxzZVxuICAgICAgICBmb3JFYWNoT2JqZWN0KGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoQXJyYXkoYXJyYXksIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGFycmF5LCBpKSkge1xuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZvckVhY2hTdHJpbmcoc3RyaW5nLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzdHJpbmcubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgLy8gbm8gc3VjaCB0aGluZyBhcyBhIHNwYXJzZSBzdHJpbmcuXG4gICAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgc3RyaW5nLmNoYXJBdChpKSwgaSwgc3RyaW5nKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZm9yRWFjaE9iamVjdChvYmplY3QsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXIgayBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrKSkge1xuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmplY3Rba10sIGssIG9iamVjdClcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvblxuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24gKGZuKSB7XG4gIHZhciBzdHJpbmcgPSB0b1N0cmluZy5jYWxsKGZuKVxuICByZXR1cm4gc3RyaW5nID09PSAnW29iamVjdCBGdW5jdGlvbl0nIHx8XG4gICAgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyAmJiBzdHJpbmcgIT09ICdbb2JqZWN0IFJlZ0V4cF0nKSB8fFxuICAgICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAvLyBJRTggYW5kIGJlbG93XG4gICAgIChmbiA9PT0gd2luZG93LnNldFRpbWVvdXQgfHxcbiAgICAgIGZuID09PSB3aW5kb3cuYWxlcnQgfHxcbiAgICAgIGZuID09PSB3aW5kb3cuY29uZmlybSB8fFxuICAgICAgZm4gPT09IHdpbmRvdy5wcm9tcHQpKVxufTtcbiIsIlxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHJpbTtcblxuZnVuY3Rpb24gdHJpbShzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqfFxccyokL2csICcnKTtcbn1cblxuZXhwb3J0cy5sZWZ0ID0gZnVuY3Rpb24oc3RyKXtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKTtcbn07XG5cbmV4cG9ydHMucmlnaHQgPSBmdW5jdGlvbihzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xccyokLywgJycpO1xufTtcbiIsInZhciB0cmltID0gcmVxdWlyZSgndHJpbScpXG4gICwgZm9yRWFjaCA9IHJlcXVpcmUoJ2Zvci1lYWNoJylcbiAgLCBpc0FycmF5ID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChoZWFkZXJzKSB7XG4gIGlmICghaGVhZGVycylcbiAgICByZXR1cm4ge31cblxuICB2YXIgcmVzdWx0ID0ge31cblxuICBmb3JFYWNoKFxuICAgICAgdHJpbShoZWFkZXJzKS5zcGxpdCgnXFxuJylcbiAgICAsIGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gcm93LmluZGV4T2YoJzonKVxuICAgICAgICAgICwga2V5ID0gdHJpbShyb3cuc2xpY2UoMCwgaW5kZXgpKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgLCB2YWx1ZSA9IHRyaW0ocm93LnNsaWNlKGluZGV4ICsgMSkpXG5cbiAgICAgICAgaWYgKHR5cGVvZihyZXN1bHRba2V5XSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZVxuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkocmVzdWx0W2tleV0pKSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IFsgcmVzdWx0W2tleV0sIHZhbHVlIF1cbiAgICAgICAgfVxuICAgICAgfVxuICApXG5cbiAgcmV0dXJuIHJlc3VsdFxufSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9qcXVlcnkuYnJvd3NlcicpO1xuIiwiLyohXG4gKiBqUXVlcnkgQnJvd3NlciBQbHVnaW4gdjAuMC42XG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ2FiY2ViL2pxdWVyeS1icm93c2VyLXBsdWdpblxuICpcbiAqIE9yaWdpbmFsIGpxdWVyeS1icm93c2VyIGNvZGUgQ29weXJpZ2h0IDIwMDUsIDIwMTMgalF1ZXJ5IEZvdW5kYXRpb24sIEluYy4gYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuICogaHR0cDovL2pxdWVyeS5vcmcvbGljZW5zZVxuICpcbiAqIE1vZGlmaWNhdGlvbnMgQ29weXJpZ2h0IDIwMTMgR2FicmllbCBDZWJyaWFuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ2FiY2ViXG4gKlxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKlxuICogRGF0ZTogMjAxMy0wNy0yOVQxNzoyMzoyNy0wNzowMFxuICovXG5cblxudmFyIG1hdGNoZWQsIGJyb3dzZXI7XG5cbnZhciB1YU1hdGNoID0gZnVuY3Rpb24oIHVhICkge1xuICB1YSA9IHVhLnRvTG93ZXJDYXNlKCk7XG5cbiAgdmFyIG1hdGNoID0gLyhvcHIpW1xcL10oW1xcdy5dKykvLmV4ZWMoIHVhICkgfHxcbiAgICAvKGNocm9tZSlbIFxcL10oW1xcdy5dKykvLmV4ZWMoIHVhICkgfHxcbiAgICAvKHZlcnNpb24pWyBcXC9dKFtcXHcuXSspLiooc2FmYXJpKVsgXFwvXShbXFx3Ll0rKS8uZXhlYyggdWEgKSB8fFxuICAgIC8od2Via2l0KVsgXFwvXShbXFx3Ll0rKS8uZXhlYyggdWEgKSB8fFxuICAgIC8ob3BlcmEpKD86Lip2ZXJzaW9ufClbIFxcL10oW1xcdy5dKykvLmV4ZWMoIHVhICkgfHxcbiAgICAvKG1zaWUpIChbXFx3Ll0rKS8uZXhlYyggdWEgKSB8fFxuICAgIHVhLmluZGV4T2YoXCJ0cmlkZW50XCIpID49IDAgJiYgLyhydikoPzo6fCApKFtcXHcuXSspLy5leGVjKCB1YSApIHx8XG4gICAgdWEuaW5kZXhPZihcImNvbXBhdGlibGVcIikgPCAwICYmIC8obW96aWxsYSkoPzouKj8gcnY6KFtcXHcuXSspfCkvLmV4ZWMoIHVhICkgfHxcbiAgICBbXTtcblxuICB2YXIgcGxhdGZvcm1fbWF0Y2ggPSAvKGlwYWQpLy5leGVjKCB1YSApIHx8XG4gICAgLyhpcGhvbmUpLy5leGVjKCB1YSApIHx8XG4gICAgLyhhbmRyb2lkKS8uZXhlYyggdWEgKSB8fFxuICAgIC8od2luZG93cyBwaG9uZSkvLmV4ZWMoIHVhICkgfHxcbiAgICAvKHdpbikvLmV4ZWMoIHVhICkgfHxcbiAgICAvKG1hYykvLmV4ZWMoIHVhICkgfHxcbiAgICAvKGxpbnV4KS8uZXhlYyggdWEgKSB8fFxuICAgIC8oY3JvcykvaS5leGVjKCB1YSApIHx8XG4gICAgW107XG5cbiAgcmV0dXJuIHtcbiAgICBicm93c2VyOiBtYXRjaFsgMyBdIHx8IG1hdGNoWyAxIF0gfHwgXCJcIixcbiAgICB2ZXJzaW9uOiBtYXRjaFsgMiBdIHx8IFwiMFwiLFxuICAgIHBsYXRmb3JtOiBwbGF0Zm9ybV9tYXRjaFsgMCBdIHx8IFwiXCJcbiAgfTtcbn07XG5cbm1hdGNoZWQgPSB1YU1hdGNoKCB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCApO1xuYnJvd3NlciA9IHt9O1xuYnJvd3Nlci51YU1hdGNoID0gdWFNYXRjaDtcblxuaWYgKCBtYXRjaGVkLmJyb3dzZXIgKSB7XG4gIGJyb3dzZXJbIG1hdGNoZWQuYnJvd3NlciBdID0gdHJ1ZTtcbiAgYnJvd3Nlci52ZXJzaW9uID0gbWF0Y2hlZC52ZXJzaW9uO1xuICBicm93c2VyLnZlcnNpb25OdW1iZXIgPSBwYXJzZUludChtYXRjaGVkLnZlcnNpb24pO1xufVxuXG5pZiAoIG1hdGNoZWQucGxhdGZvcm0gKSB7XG4gIGJyb3dzZXJbIG1hdGNoZWQucGxhdGZvcm0gXSA9IHRydWU7XG59XG5cbi8vIFRoZXNlIGFyZSBhbGwgY29uc2lkZXJlZCBtb2JpbGUgcGxhdGZvcm1zLCBtZWFuaW5nIHRoZXkgcnVuIGEgbW9iaWxlIGJyb3dzZXJcbmlmICggYnJvd3Nlci5hbmRyb2lkIHx8IGJyb3dzZXIuaXBhZCB8fCBicm93c2VyLmlwaG9uZSB8fCBicm93c2VyWyBcIndpbmRvd3MgcGhvbmVcIiBdICkge1xuICBicm93c2VyLm1vYmlsZSA9IHRydWU7XG59XG5cbi8vIFRoZXNlIGFyZSBhbGwgY29uc2lkZXJlZCBkZXNrdG9wIHBsYXRmb3JtcywgbWVhbmluZyB0aGV5IHJ1biBhIGRlc2t0b3AgYnJvd3NlclxuaWYgKCBicm93c2VyLmNyb3MgfHwgYnJvd3Nlci5tYWMgfHwgYnJvd3Nlci5saW51eCB8fCBicm93c2VyLndpbiApIHtcbiAgYnJvd3Nlci5kZXNrdG9wID0gdHJ1ZTtcbn1cblxuLy8gQ2hyb21lLCBPcGVyYSAxNSsgYW5kIFNhZmFyaSBhcmUgd2Via2l0IGJhc2VkIGJyb3dzZXJzXG5pZiAoIGJyb3dzZXIuY2hyb21lIHx8IGJyb3dzZXIub3ByIHx8IGJyb3dzZXIuc2FmYXJpICkge1xuICBicm93c2VyLndlYmtpdCA9IHRydWU7XG59XG5cbi8vIElFMTEgaGFzIGEgbmV3IHRva2VuIHNvIHdlIHdpbGwgYXNzaWduIGl0IG1zaWUgdG8gYXZvaWQgYnJlYWtpbmcgY2hhbmdlc1xuaWYgKCBicm93c2VyLnJ2IClcbntcbiAgdmFyIGllID0gXCJtc2llXCI7XG5cbiAgbWF0Y2hlZC5icm93c2VyID0gaWU7XG4gIGJyb3dzZXJbaWVdID0gdHJ1ZTtcbn1cblxuLy8gT3BlcmEgMTUrIGFyZSBpZGVudGlmaWVkIGFzIG9wclxuaWYgKCBicm93c2VyLm9wciApXG57XG4gIHZhciBvcGVyYSA9IFwib3BlcmFcIjtcblxuICBtYXRjaGVkLmJyb3dzZXIgPSBvcGVyYTtcbiAgYnJvd3NlcltvcGVyYV0gPSB0cnVlO1xufVxuXG4vLyBTdG9jayBBbmRyb2lkIGJyb3dzZXJzIGFyZSBtYXJrZWQgYXMgU2FmYXJpIG9uIEFuZHJvaWQuXG5pZiAoIGJyb3dzZXIuc2FmYXJpICYmIGJyb3dzZXIuYW5kcm9pZCApXG57XG4gIHZhciBhbmRyb2lkID0gXCJhbmRyb2lkXCI7XG5cbiAgbWF0Y2hlZC5icm93c2VyID0gYW5kcm9pZDtcbiAgYnJvd3NlclthbmRyb2lkXSA9IHRydWU7XG59XG5cbi8vIEFzc2lnbiB0aGUgbmFtZSBhbmQgcGxhdGZvcm0gdmFyaWFibGVcbmJyb3dzZXIubmFtZSA9IG1hdGNoZWQuYnJvd3NlcjtcbmJyb3dzZXIucGxhdGZvcm0gPSBtYXRjaGVkLnBsYXRmb3JtO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gYnJvd3NlcjtcbiIsIi8qKiBAcHJlc2VydmUgaHR0cDovL2dpdGh1Yi5jb20vZWFzZXdheS9qcy1jbGFzcyAqL1xuXG4vLyBDbGFzcyBEZWZpbml0aW9uIHVzaW5nIEVDTUE1IHByb3RvdHlwZSBjaGFpblxuXG5mdW5jdGlvbiBpbmhlcml0KGRlc3QsIHNyYywgbm9QYXJlbnQpIHtcbiAgICB3aGlsZSAoc3JjICYmIHNyYyAhPT0gT2JqZWN0LnByb3RvdHlwZSkge1xuICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzcmMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIGlmIChuYW1lICE9ICcuY2xhc3MnICYmICFkZXN0Lmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNyYywgbmFtZSk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRlc3QsIG5hbWUsIGRlc2MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG5vUGFyZW50KSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzcmMgPSBzcmMuX19wcm90b19fO1xuICAgIH1cbiAgICByZXR1cm4gZGVzdDtcbn1cblxudmFyIENsYXNzID0gZnVuY3Rpb24gKGJhc2UsIHByb3RvLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZihiYXNlKSAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG9wdGlvbnMgPSBwcm90bztcbiAgICAgICAgcHJvdG8gPSBiYXNlO1xuICAgICAgICBiYXNlID0gT2JqZWN0O1xuICAgIH1cbiAgICBpZiAoIXByb3RvKSB7XG4gICAgICAgIHByb3RvID0ge307XG4gICAgfVxuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIFxuICAgIHZhciBtZXRhID0ge1xuICAgICAgICBuYW1lOiBvcHRpb25zLm5hbWUsXG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIGltcGxlbWVudHM6IFtdXG4gICAgfVxuICAgIHZhciBjbGFzc1Byb3RvID0gQ2xhc3MuY2xvbmUocHJvdG8pO1xuICAgIGlmIChvcHRpb25zLmltcGxlbWVudHMpIHtcbiAgICAgICAgKEFycmF5LmlzQXJyYXkob3B0aW9ucy5pbXBsZW1lbnRzKSA/IG9wdGlvbnMuaW1wbGVtZW50cyA6IFtvcHRpb25zLmltcGxlbWVudHNdKVxuICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKGltcGxlbWVudGVkVHlwZSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YoaW1wbGVtZW50ZWRUeXBlKSA9PSAnZnVuY3Rpb24nICYmIGltcGxlbWVudGVkVHlwZS5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0YS5pbXBsZW1lbnRzLnB1c2goaW1wbGVtZW50ZWRUeXBlKTtcbiAgICAgICAgICAgICAgICAgICAgQ2xhc3MuZXh0ZW5kKGNsYXNzUHJvdG8sIGltcGxlbWVudGVkVHlwZS5wcm90b3R5cGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICBjbGFzc1Byb3RvLl9fcHJvdG9fXyA9IGJhc2UucHJvdG90eXBlO1xuICAgIHZhciB0aGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHR5cGVvZih0aGlzLmNvbnN0cnVjdG9yKSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIG1ldGEudHlwZSA9IHRoZUNsYXNzO1xuICAgIHRoZUNsYXNzLnByb3RvdHlwZSA9IGNsYXNzUHJvdG87XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoZUNsYXNzLCAnLmNsYXNzLm1ldGEnLCB7IHZhbHVlOiBtZXRhLCBlbnVtZXJhYmxlOiBmYWxzZSwgY29uZmlndXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IGZhbHNlIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGFzc1Byb3RvLCAnLmNsYXNzJywgeyB2YWx1ZTogdGhlQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCBjb25maWd1cmFibGU6IGZhbHNlLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gICAgaWYgKG9wdGlvbnMuc3RhdGljcykge1xuICAgICAgICBDbGFzcy5leHRlbmQodGhlQ2xhc3MsIG9wdGlvbnMuc3RhdGljcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGVDbGFzcztcbn07XG5cbkNsYXNzLmV4dGVuZCA9IGluaGVyaXQ7XG5cbkNsYXNzLmNsb25lID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBpbmhlcml0KHt9LCBvYmplY3QpO1xufTtcblxuZnVuY3Rpb24gZmluZFR5cGUobWV0YSwgdHlwZSkge1xuICAgIHdoaWxlIChtZXRhKSB7XG4gICAgICAgIGlmIChtZXRhLnR5cGUucHJvdG90eXBlID09PSB0eXBlLnByb3RvdHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSBpbiBtZXRhLmltcGxlbWVudHMpIHtcbiAgICAgICAgICAgIHZhciBpbXBsVHlwZSA9IG1ldGEuaW1wbGVtZW50c1tpXTtcbiAgICAgICAgICAgIHZhciBpbXBsTWV0YSA9IGltcGxUeXBlWycuY2xhc3MubWV0YSddO1xuICAgICAgICAgICAgaWYgKGltcGxNZXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbmRUeXBlKGltcGxNZXRhLCB0eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3RvID0gaW1wbFR5cGUucHJvdG90eXBlOyBwcm90bzsgcHJvdG8gPSBwcm90by5fX3Byb3RvX18pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3RvID09PSB0eXBlLnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbWV0YSA9IG1ldGEuYmFzZSA/IG1ldGEuYmFzZVsnLmNsYXNzLm1ldGEnXSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG52YXIgQ2hlY2tlciA9IENsYXNzKHtcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgICB0aGlzLm9iamVjdCA9IG9iamVjdDtcbiAgICB9LFxuICAgIFxuICAgIHR5cGVPZjogZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgaWYgKHRoaXMub2JqZWN0IGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1ldGEgPSBDbGFzcy50eXBlSW5mbyh0aGlzLm9iamVjdCk7XG4gICAgICAgIHJldHVybiBtZXRhICYmIGZpbmRUeXBlKG1ldGEsIHR5cGUpO1xuICAgIH1cbn0pO1xuXG4vLyBhbGlhc2VzXG5DaGVja2VyLnByb3RvdHlwZS5hID0gQ2hlY2tlci5wcm90b3R5cGUudHlwZU9mO1xuQ2hlY2tlci5wcm90b3R5cGUuYW4gPSBDaGVja2VyLnByb3RvdHlwZS50eXBlT2Y7XG5cbkNsYXNzLmlzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBuZXcgQ2hlY2tlcihvYmplY3QpO1xufTtcblxuQ2xhc3MudHlwZUluZm8gPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgdmFyIHRoZUNsYXNzID0gb2JqZWN0Ll9fcHJvdG9fX1snLmNsYXNzJ107XG4gICAgcmV0dXJuIHRoZUNsYXNzID8gdGhlQ2xhc3NbJy5jbGFzcy5tZXRhJ10gOiB1bmRlZmluZWQ7XG59O1xuXG5DbGFzcy5WRVJTSU9OID0gWzAsIDAsIDJdO1xuXG5pZiAobW9kdWxlKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDbGFzcztcbn0gZWxzZSB7XG4gICAgZ2xvYmFsLkNsYXNzID0gQ2xhc3M7ICAgLy8gZm9yIGJyb3dzZXJcbn0iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOC4wXG5tb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHJlcXVpcmUoXCIuL3BhcnNlclwiKTtcblxubW9kdWxlLmV4cG9ydHMud3JpdGVyID0gcmVxdWlyZShcIi4vd3JpdGVyXCIpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9saWIvaW5kZXhcIik7XG4iXX0=
