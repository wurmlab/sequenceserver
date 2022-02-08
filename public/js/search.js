import './jquery_world';
import React from 'react';
import _ from 'underscore';
import DatabasesTree from './databases_tree';

/**
 * Load necessary polyfills.
 */
$.webshims.setOptions('basePath', '/vendor/npm/webshim@1.15.8/js-webshim/minified/shims/');
$.webshims.polyfill('forms');

/**
 * Clear sessionStorage on reload.
*/
if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
    sessionStorage.clear();
    history.replaceState(null, '', location.href.split('?')[0]);
}

var Page = React.createClass({
    render: function () {
        return (
            <div>
                <DnD ref="dnd"/>
                <Form ref="form"/>
            </div>
        );
    },

    componentDidMount: function () {
        this.refs.dnd.setState({
            query: this.refs.form.refs.query
        });
    }
});

/** Drag n drop widget.
 */
var DnD = React.createClass({

    getInitialState: function () {
        return {
            query: null
        };
    },

    render: function () {
        return (
            <div
                className="dnd-overlay"
                style={{display: 'none'}}>
                <div
                    className="container dnd-overlay-container">
                    <div
                        className="row">
                        <div
                            className="col-md-offset-2 col-md-10">
                            <p
                                className="dnd-overlay-drop"
                                style={{display: 'none'}}>
                                <i className="fa fa-2x fa-file-o"></i>
                                Drop query sequence file here
                            </p>
                            <p
                                className="dnd-overlay-overwrite"
                                style={{display: 'none'}}>
                                <i className="fa fa-2x fa-file-o"></i>
                                <span style={{color: 'red'}}>Overwrite</span> query sequence file
                            </p>

                            <div
                                className="dnd-errors">
                                <div
                                    className="dnd-error row"
                                    id="dnd-multi-notification"
                                    style={{display: 'none'}}>
                                    <div
                                        className="col-md-6 col-md-offset-3">
                                        One file at a time please.
                                    </div>
                                </div>

                                <div
                                    className="dnd-error row"
                                    id="dnd-large-file-notification"
                                    style={{display: 'none'}}>
                                    <div
                                        className="col-md-6 col-md-offset-3">
                                        Too big a file. Can only do less than 10 MB. &gt;_&lt;
                                    </div>
                                </div>

                                <div
                                    className="dnd-error row"
                                    id="dnd-format-notification"
                                    style={{display: 'none'}}>
                                    <div
                                        className="col-md-6 col-md-offset-3">
                                        Only FASTA files please.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    componentDidMount: function () {
        var self = this;
        var FASTA_FORMAT = /^>/;

        $(document).ready(function(){
            var tgtMarker = $('.dnd-overlay');

            var dndError = function (id) {
                $('.dnd-error').hide();
                $('#' + id + '-notification').show();
                tgtMarker.effect('fade', 2500);
            };

            $(document)
                .on('dragenter', function (evt) {
                // Do not activate DnD if a modal is active.
                    if ($.modalActive()) return;

                    // Based on http://stackoverflow.com/a/8494918/1205465.
                    // Contrary to what the above link says, the snippet below can't
                    // distinguish directories from files. We handle that on drop.
                    var dt = evt.originalEvent.dataTransfer;
                    var isFile = dt.types && ((dt.types.indexOf &&  // Chrome and Safari
                                           dt.types.indexOf('Files') != -1) ||
                                           (dt.types.contains && // Firefox
                                            dt.types.contains('application/x-moz-file')));

                    if (!isFile) { return; }

                    $('.dnd-error').hide();
                    tgtMarker.stop(true, true);
                    tgtMarker.show();
                    dt.effectAllowed = 'copy';
                    if (self.state.query.isEmpty()) {
                        $('.dnd-overlay-overwrite').hide();
                        $('.dnd-overlay-drop').show('drop', {direction: 'down'}, 'fast');
                    }
                    else {
                        $('.dnd-overlay-drop').hide();
                        $('.dnd-overlay-overwrite').show('drop', {direction: 'down'}, 'fast');
                    }
                })
                .on('dragleave', '.dnd-overlay', function (evt) {
                    tgtMarker.hide();
                    $('.dnd-overlay-drop').hide();
                    $('.dnd-overlay-overwrite').hide();
                })
                .on('dragover', '.dnd-overlay', function (evt) {
                    evt.originalEvent.dataTransfer.dropEffect = 'copy';
                    evt.preventDefault();
                })
                .on('drop', '.dnd-overlay', function (evt) {
                    evt.preventDefault();
                    evt.stopPropagation();

                    var indicator = $('#sequence-file');
                    self.state.query.focus();

                    var files = evt.originalEvent.dataTransfer.files;
                    if (files.length > 1) {
                        dndError('dnd-multi');
                        return;
                    }

                    var file = files[0];
                    if (file.size > 10 * 1048576) {
                        dndError('dnd-large-file');
                        return;
                    }

                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var content = e.target.result;
                        if (FASTA_FORMAT.test(content)) {
                            indicator.text(file.name + ' ');
                            self.state.query.value(content);
                            tgtMarker.hide();
                        } else {
                        // apparently not FASTA
                            dndError('dnd-format');
                        }
                    };
                    reader.onerror = function (e) {
                    // Couldn't read. Means dropped stuff wasn't FASTA file.
                        dndError('dnd-format');
                    };
                    reader.readAsText(file);
                });
        });
    }
});

/**
 * Search form.
 *
 * Top level component that initialises and holds all other components, and
 * facilitates communication between them.
 */
var Form = React.createClass({

    getInitialState: function () {
        return { databases: [], preDefinedOpts: {}, tree: {} };
    },

    componentDidMount: function () {
        /* Fetch data to initialise the search interface from the server. These
         * include list of databases to search against, advanced options to
         * apply when an algorithm is selected, and a query sequence that
         * the user may want to search in the databases.
         */
        var search = location.search.split(/\?|&/).filter(Boolean);
        var job_id = sessionStorage.getItem('job_id');
        if (job_id) {
            search.unshift(`job_id=${job_id}`);
        }
        $.getJSON(`searchdata.json?${search.join('&')}`, function(data) {
            /* Update form state (i.e., list of databases and predefined
             * advanced options.
             */
            this.setState({
                tree: data['tree'],
                databases: data['database'],
                preSelectedDbs: data['preSelectedDbs'],
                preDefinedOpts: data['options']
            });

            /* Pre-populate the form with server sent query sequences
             * (if any).
             */
            if (data['query']) {
                this.refs.query.value(data['query']);
            }

            setTimeout(function(){
                $('.jstree_div').click();
            }, 1000);
        }.bind(this));

        /* Enable submitting form on Cmd+Enter */
        $(document).on('keydown', (e)=> {
            var $button = $('#method');
            if (!$button.is(':disabled') &&
                e.ctrlKey && e.key === 'Enter') {
                $button.trigger('click');
            }
        });
    },

    useTreeWidget: function () {
        return !_.isEmpty(this.state.tree);
    },

    determineBlastMethod: function () {
        var database_type = this.databaseType;
        var sequence_type = this.sequenceType;

        if (this.refs.query.isEmpty()) {
            return [];
        }

        //database type is always known
        switch (database_type) {
        case 'protein':
            switch (sequence_type) {
            case undefined:
                return ['blastp', 'blastx'];
            case 'protein':
                return ['blastp'];
            case 'nucleotide':
                return ['blastx'];
            }
            break;
        case 'nucleotide':
            switch (sequence_type) {
            case undefined:
                return ['tblastn', 'blastn', 'tblastx'];
            case 'protein':
                return ['tblastn'];
            case 'nucleotide':
                return ['blastn', 'tblastx'];
            }
            break;
        }

        return [];
    },

    handleSequenceTypeChanged: function (type) {
        this.sequenceType = type;
        this.refs.button.setState({
            hasQuery: !this.refs.query.isEmpty(),
            hasDatabases: !!this.databaseType,
            methods: this.determineBlastMethod()
        });
    },

    handleDatabaseTypeChanaged: function (type) {
        this.databaseType = type;
        this.refs.button.setState({
            hasQuery: !this.refs.query.isEmpty(),
            hasDatabases: !!this.databaseType,
            methods: this.determineBlastMethod()
        });
    },

    handleAlgoChanged: function (algo) {
        if (this.state.preDefinedOpts.hasOwnProperty(algo)) {
            this.refs.opts.setState({
                preOpts: this.state.preDefinedOpts[algo],
                value: this.state.preDefinedOpts[algo].default.join(' ')
            });
        }
        else {
            this.refs.opts.setState({ preOpts: {}, value: '' });
        }
    },

    handleNewTabCheckbox: function () {
        setTimeout(() => {
            if ($('#toggleNewTab').is(':checked')) {
                $('#blast').attr('target', '_blank');
            }
            else {
                $('#blast').attr('target', '_self');
            }
        });
    },

    render: function () {
        return (
            <div className="container">
                <form id="blast" method="post" className="form-horizontal">
                    <div className="form-group query-container">
                        <Query ref="query" onSequenceTypeChanged={this.handleSequenceTypeChanged}/>
                    </div>
                    <div className="notifications" id="notifications">
                        <NucleotideNotification/>
                        <ProteinNotification/>
                        <MixedNotification/>
                    </div>
                    {this.useTreeWidget() ?
                    <DatabasesTree ref="databases"
                    databases={this.state.databases} tree={this.state.tree}
                    preSelectedDbs={this.state.preSelectedDbs}
                    onDatabaseTypeChanged={this.handleDatabaseTypeChanaged} />
                    :
                    <Databases ref="databases" databases={this.state.databases}
                        preSelectedDbs={this.state.preSelectedDbs}
                        onDatabaseTypeChanged={this.handleDatabaseTypeChanaged} />
                    }
                    <div className="form-group">
                        <Options ref="opts"/>
                        <div className="col-md-2">
                            <div className="form-group" style={{'textAlign': 'center', 'padding': '7px 0'}}>
                                <label>
                                    <input type="checkbox" id="toggleNewTab"
                                        onChange={()=> { this.handleNewTabCheckbox(); }}
                                    /> Open results in new tab
                                </label>
                            </div>
                        </div>
                        <SearchButton ref="button" onAlgoChanged={this.handleAlgoChanged}/>
                    </div>
                </form>
            </div>
        );
    }
});

/**
 * Query widget.
 */
var Query = React.createClass({

    // Kind of public API. //

    /**
     * Returns query sequence if no argument is provided (or null or undefined
     * is provided as argument). Otherwise, sets query sequenced to the given
     * value and returns `this`.
     *
     * Default/initial state of query sequence is an empty string. Caller must
     * explicitly provide empty string as argument to "reset" query sequence.
     */
    value: function (val) {
        if (val == null) {
            // i.e., val is null or undefined
            return this.state.value;
        }
        else {
            this.setState({
                value: val
            });
            return this;
        }
    },

    /**
     * Clears textarea. Returns `this`.
     *
     * Clearing textarea also causes it to be focussed.
     */
    clear: function () {
        return this.value('').focus();
    },

    /**
     * Focuses textarea. Returns `this`.
     */
    focus: function () {
        this.textarea().focus();
        return this;
    },

    /**
     * Returns true if query is absent ('', undefined, null), false otherwise.
     */
    isEmpty: function () {
        return !this.value();
    },


    // Internal helpers. //

    textarea: function () {
        return $(this.refs.textarea.getDOMNode());
    },

    controls: function () {
        return $(this.refs.controls.getDOMNode());
    },

    handleInput: function (evt) {
        this.value(evt.target.value);
    },

    /**
     * Hides or shows 'clear sequence' button.
     *
     * Rendering the 'clear sequence' button takes into account presence or
     * absence of a scrollbar.
     *
     * Called by `componentDidUpdate`.
     */
    hideShowButton: function () {
        if (!this.isEmpty()) {
            // Calculation below is based on -
            // http://chris-spittles.co.uk/jquery-calculate-scrollbar-width/
            // FIXME: can reflow be avoided here?
            var textareaNode = this.textarea()[0];
            var sequenceControlsRight = textareaNode.offsetWidth - textareaNode.clientWidth;
            this.controls().css('right', sequenceControlsRight + 17);
            this.controls().removeClass('hidden');
        }
        else {
            // FIXME: what are lines 1, 2, & 3 doing here?
            this.textarea().parent().removeClass('has-error');
            this.$sequenceFile = $('#sequence-file');
            this.$sequenceFile.empty();

            this.controls().addClass('hidden');
        }
    },

    /**
     * Put red border around textarea.
     */
    indicateError: function () {
        this.textarea().parent().addClass('has-error');
    },

    /**
     * Put normal blue border around textarea.
     */
    indicateNormal: function () {
        this.textarea().parent().removeClass('has-error');
    },

    /**
     * Returns type of the query sequence (nucleotide, protein, mixed).
     *
     * Query widget supports executing a callback when the query type changes.
     * Components interested in query type should register a callback instead
     * of directly calling this method.
     */
    type: function () {
        var sequences = this.value().split(/>.*/);

        var type, tmp;

        for (var i = 0; i < sequences.length; i++) {
            tmp = this.guessSequenceType(sequences[i]);

            // could not guess the sequence type; try the next sequence
            if (!tmp) { continue; }

            if (!type) {
                // successfully guessed the type of atleast one sequence
                type = tmp;
            }
            else if (tmp !== type) {
                // user has mixed different type of sequences
                return 'mixed';
            }
        }

        return type;
    },

    /**
     * Guesses and returns the type of the given sequence (nucleotide,
     * protein).
     */
    guessSequenceType: function (sequence) {
        // remove 'noisy' characters
        sequence = sequence.replace(/[^A-Z]/gi, ''); // non-letter characters
        sequence = sequence.replace(/[NX]/gi,   ''); // ambiguous  characters

        // can't determine the type of ultrashort queries
        if (sequence.length < 10) {
            return undefined;
        }

        // count the number of putative NA
        var putative_NA_count = 0;
        for (var i = 0; i < sequence.length; i++) {
            if (sequence[i].match(/[ACGTU]/i)) {
                putative_NA_count += 1;
            }
        }

        var threshold = 0.9 * sequence.length;
        return putative_NA_count > threshold ? 'nucleotide' : 'protein';
    },

    notify: function (type) {
        clearTimeout(this.notification_timeout);
        this.indicateNormal();
        $('.notifications .active').hide().removeClass('active');

        if (type) {
            $('#' + type + '-sequence-notification').show('drop', {direction: 'up'}).addClass('active');

            this.notification_timeout = setTimeout(function () {
                $('.notifications .active').hide('drop', {direction: 'up'}).removeClass('active');
            }, 5000);

            if (type === 'mixed') {
                this.indicateError();
            }
        }
    },


    // Lifecycle methods. //

    getInitialState: function () {
        var input_sequence = $('input#input_sequence').val() || '';
        return {
            value: input_sequence
        };
    },

    render: function ()
    {
        return (
            <div
                className="col-md-12">
                <div
                    className="sequence">
                    <textarea
                        id="sequence" ref="textarea"
                        className="form-control text-monospace"
                        name="sequence" value={this.state.value}
                        placeholder="Paste query sequence(s) or drag file
                        containing query sequence(s) in FASTA format here ..."
                        spellCheck="false" autoFocus="true"
                        onChange={this.handleInput}>
                    </textarea>
                </div>
                <div
                    className="hidden"
                    style={{ position: 'absolute', top: '4px', right: '19px' }}
                    ref="controls">
                    <button
                        type="button"
                        className="btn btn-sm btn-default" id="btn-sequence-clear"
                        title="Clear query sequence(s)."
                        onClick={this.clear}>
                        <span id="sequence-file"></span>
                        <i className="fa fa-times"></i>
                    </button>
                </div>
            </div>
        );
    },

    componentDidMount: function () {
        $('body').click(function () {
            $('.notifications .active').hide('drop', {direction: 'up'}).removeClass('active');
        });
    },

    componentDidUpdate: function () {
        this.hideShowButton();
        var type = this.type();
        if (!type || type !== this._type) {
            this._type = type;
            this.notify(type);
            this.props.onSequenceTypeChanged(type);
        }
    }
});

var ProteinNotification = React.createClass({
    render: function () {
        return (
            <div
                className="notification row"
                id="protein-sequence-notification"
                style={{ display: 'none' }}>
                <div
                    className="alert-info col-md-6 col-md-offset-3">
                    Detected: amino-acid sequence(s).
                </div>
            </div>
        );
    }
});

var NucleotideNotification = React.createClass({
    render: function () {
        return (
            <div
                className="notification row"
                id="nucleotide-sequence-notification"
                style={{ display: 'none' }}>
                <div
                    className="alert-info col-md-6 col-md-offset-3">
                    Detected: nucleotide sequence(s).
                </div>
            </div>
        );
    }
});

var MixedNotification = React.createClass({
    render: function () {
        return (
            <div
                className="notification row"
                id="mixed-sequence-notification"
                style={{ display: 'none' }}>
                <div
                    className="alert-danger col-md-10 col-md-offset-1">
                    Error: mixed nucleotide and amino-acid sequences detected.
                </div>
            </div>
        );
    }
});

var Databases = React.createClass({
    getInitialState: function () {
        return { type: '' };
    },

    databases: function (category) {
        var databases = this.props.databases;
        if (category) {
            databases = _.select(databases, database => database.type === category);
        }

        return _.sortBy(databases, 'title');
    },

    nselected: function () {
        return $('input[name="databases[]"]:checked').length;
    },

    categories: function () {
        return _.uniq(_.map(this.props.databases,
            _.iteratee('type'))).sort();
    },

    handleClick: function (database) {
        var type = this.nselected() ? database.type : '';
        if (type != this.state.type) this.setState({type: type});
    },

    handleToggle: function (toggleState, type) {
        switch (toggleState) {
        case '[Select all]':
            $(`.${type} .database input:not(:checked)`).click();
            break;
        case '[Deselect all]':
            $(`.${type} .database input:checked`).click();
            break;
        }
        this.forceUpdate();
    },

    render: function () {
        return (
            <div className="form-group databases-container">
                { _.map(this.categories(), this.renderDatabases) }
            </div>
        );
    },

    renderDatabases: function (category) {
        // Panel name and column width.
        var panelTitle = category[0].toUpperCase() +
            category.substring(1).toLowerCase() + ' databases';
        var columnClass = this.categories().length === 1 ?  'col-md-12' :
            'col-md-6';

        // Toggle button.
        var toggleState = '[Select all]';
        var toggleClass = 'btn-link';
        var toggleShown = this.databases(category).length > 1 ;
        var toggleDisabled = this.state.type && this.state.type !== category;
        if (toggleShown && toggleDisabled) toggleClass += ' disabled';
        if (!toggleShown) toggleClass += ' hidden';
        if (this.nselected() === this.databases(category).length) {
            toggleState = '[Deselect all]';
        }

        // JSX.
        return (
            <div className={columnClass} key={'DB_'+category}>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h4 style={{display: 'inline'}}>{panelTitle}</h4> &nbsp;&nbsp;
                        <button type="button" className={toggleClass} disabled={toggleDisabled}
                            onClick={ function () { this.handleToggle(toggleState, category); }.bind(this) }>
                            {toggleState}
                        </button>
                    </div>
                    <ul className={'list-group databases ' + category}>
                        {
                            _.map(this.databases(category), _.bind(function (database,index) {
                                return (
                                    <li className="list-group-item" key={'DB_'+category+index}>
                                        { this.renderDatabase(database) }
                                    </li>
                                );
                            }, this))
                        }
                    </ul>
                </div>
            </div>
        );
    },

    renderDatabase: function (database) {
        var disabled = this.state.type && this.state.type !== database.type;

        return (
            <label
                className={disabled && 'disabled database' || 'database'}>
                <input
                    type="checkbox" name="databases[]" value={database.id}
                    data-type={database.type} disabled={disabled}
                    onChange=
                        {
                            _.bind(function () {
                                this.handleClick(database);
                            }, this)
                        }/>
                {' ' + (database.title || database.name)}
            </label>
        );
    },

    componentDidUpdate: function () {
        if (this.databases() && this.databases().length === 1) {
            $('.databases').find('input').prop('checked',true);
            this.handleClick(this.databases()[0]);
        }

        if (this.props.preSelectedDbs) {
            var selectors = this.props.preSelectedDbs.map(db => `input[value=${db.id}]`);
            $(selectors.join(',')).prop('checked',true);
            this.handleClick(this.props.preSelectedDbs[0]);
            this.props.preSelectedDbs = null;
        }
        this.props.onDatabaseTypeChanged(this.state.type);
    }
});

// Component for the advanced params input field.
var Options = React.createClass({
    // State of this component is the advanced params text.
    getInitialState: function () {
        return { preOpts: {}, value: '' };
    },

    updateBox: function (value) {
        this.setState({ value: value });
    },

    render: function () {
        var classNames = 'form-control';
        console.log(this.state.preOpts);
        if (this.state.value.trim()) {
            classNames += ' yellow-background';
        }
        return (
            <div className="col-md-7">
                <div className="form-group">
                    <div className="col-md-12">
                        <div className="input-group">
                            <label className="control-label" htmlFor="advanced">
                                Advanced parameters:
                                <sup style={{marginLeft: '2px'}}>
                                    <a href=''
                                        data-toggle="modal" data-target="#help">
                                        <i className="fa fa-question-circle"></i>
                                    </a>
                                </sup>
                            </label>
                            <input type="text" className={classNames}
                                onChange={e => this.updateBox(e.target.value)}
                                id="advanced" name="advanced" value={this.state.value}
                                placeholder="eg: -evalue 1.0e-5 -num_alignments 100"
                                title="View, and enter advanced parameters."
                            />
                            { Object.keys(this.state.preOpts).length > 1 && this.optionsJSX() }
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    optionsJSX: function () {
        return <span className="input-group-btn dropdown">
            <button className="btn bnt-sm btn-default dropdown-toggle"
                data-toggle="dropdown">
                <i className="fa fa-caret-down"></i>
            </button>
            <ul id='advanced-params-dropdown'
                className="dropdown-menu dropdown-menu-right">
            {
                Object.entries(this.state.preOpts).map(
                    ([key, value], index) => {
                        value = value.join(' ');
                        if (value.trim() === this.state.value.trim())
                            var className = 'yellow-background';
                        return <li key={index} className={className}
                            onClick={() => this.updateBox(value)}>
                            <strong>{key}:</strong>&nbsp;{value}
                        </li>;
                    }
                )
            }
            </ul>
        </span>;
    } 
});

/**
 * SearchButton widget.
 */
var SearchButton = React.createClass({

    // Internal helpers. //

    /**
     * Returns jquery wrapped input group.
     */
    inputGroup: function () {
        return $(React.findDOMNode(this.refs.inputGroup));
    },

    /**
     * Returns jquery wrapped submit button.
     */
    submitButton: function () {
        return $(React.findDOMNode(this.refs.submitButton));
    },

    /**
     * Initialise tooltip on input group and submit button.
     */
    initTooltip: function () {
        this.inputGroup().tooltip({
            trigger: 'manual',
            title: _.bind(function () {
                if (!this.state.hasQuery && !this.state.hasDatabases) {
                    return 'You must enter a query sequence and select one or more databases above before you can run a search!';
                }
                else if (this.state.hasQuery && !this.state.hasDatabases) {
                    return 'You must select one or more databases above before you can run a search!';
                }
                else if (!this.state.hasQuery && this.state.hasDatabases) {
                    return 'You must enter a query sequence above before you can run a search!';
                }
            }, this)
        });

        this.submitButton().tooltip({
            title: _.bind(function () {
                var title = 'Click to BLAST or press Ctrl+Enter.';
                if (this.state.methods.length > 1) {
                    title += ' Click dropdown button on the right for other' +
                        ' BLAST algorithms that can be used.';
                }
                return title;
            }, this)
        });
    },

    /**
     * Show tooltip on input group.
     */
    showTooltip: function () {
        this.inputGroup()._tooltip('show');
    },

    /**
     * Hide tooltip on input group.
     */
    hideTooltip: function () {
        this.inputGroup()._tooltip('hide');
    },

    /**
     * Change selected algorithm.
     *
     * NOTE: Called on click on dropdown menu items.
     */
    changeAlgorithm: function (method) {
        var methods = this.state.methods.slice();
        methods.splice(methods.indexOf(method), 1);
        methods.unshift(method);
        this.setState({
            methods: methods
        });
    },

    /**
     * Given, for example 'blastp', returns blast<strong>p</strong>.
     */
    decorate: function(name) {
        return name.match(/(.?)(blast)(.?)/).slice(1).map(function (token, _) {
            if (token) {
                if (token !== 'blast'){
                    return (<strong key={token}>{token}</strong>);
                }
                else {
                    return token;
                }
            }
        });
    },


    // Lifecycle methods. //

    getInitialState: function () {
        return {
            methods: [],
            hasQuery: false,
            hasDatabases: false
        };
    },

    render: function () {
        var methods = this.state.methods;
        var method = methods[0];
        var multi = methods.length > 1;

        return (
            <div className="col-md-3">
                <div className="form-group">
                    <div className="col-md-12">
                        <div
                            className={multi && 'input-group'} id="methods" ref="inputGroup"
                            onMouseOver={this.showTooltip} onMouseOut={this.hideTooltip}>
                            <button
                                type="submit" className="btn btn-primary form-control text-uppercase"
                                id="method" ref="submitButton" name="method" value={method} disabled={!method}>
                                {this.decorate(method || 'blast')}
                            </button>
                            {
                                multi && <div
                                    className="input-group-btn">
                                    <button
                                        className="btn btn-primary dropdown-toggle"
                                        data-toggle="dropdown">
                                        <span className="caret"></span>
                                    </button>
                                    <ul
                                        className="dropdown-menu dropdown-menu-right">
                                        {
                                            _.map(methods.slice(1), _.bind(function (method) {
                                                return (
                                                    <li key={method} className="text-uppercase"
                                                        onClick={
                                                            _.bind(function () {
                                                                this.changeAlgorithm(method);
                                                            }, this)
                                                        }>
                                                        {method}
                                                    </li>
                                                );
                                            }, this))
                                        }
                                    </ul>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    componentDidMount: function () {
        this.initTooltip();
    },

    shouldComponentUpdate: function (props , state) {
        return !(_.isEqual(state.methods, this.state.methods));
    },

    componentDidUpdate: function () {
        if (this.state.methods.length > 0) {
            this.inputGroup().wiggle();
            this.props.onAlgoChanged(this.state.methods[0]);
        }
        else {
            this.props.onAlgoChanged('');
        }
    }
});

React.render(<Page/>, document.getElementById('view'));
