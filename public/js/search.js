import _ from 'underscore';
import React from 'react';


/**
 * Load necessary polyfills.
 */
$.webshims.polyfill('forms');

/** Drag n drop widget.
 */
var DnD = React.createClass({

    getInitialState: function () {
        return {
            query: null
        }
    },

    render: function () {
        return (
            <div
                className="dnd-overlay"
                style={{display: "none"}}>
                <div
                    className="container dnd-overlay-container">
                    <div
                        className="row">
                        <div
                            className="col-md-offset-2 col-md-10">
                            <p
                                className="dnd-overlay-drop"
                                style={{display: "none"}}>
                                <i className="fa fa-2x fa-file-o"></i>
                                Drop query sequence file here
                            </p>
                            <p
                                className="dnd-overlay-overwrite"
                                style={{display: "none"}}>
                                <i className="fa fa-2x fa-file-o"></i>
                                <span style={{color: "red"}}>Overwrite</span> query sequence file
                            </p>

                            <div
                                className="dnd-errors">
                                <div
                                    className="dnd-error row"
                                    id="dnd-multi-notification"
                                    style={{display: "none"}}>
                                    <div
                                        className="col-md-6 col-md-offset-3">
                                        One file at a time please.
                                    </div>
                                </div>

                                <div
                                    className="dnd-error row"
                                    id="dnd-large-file-notification"
                                    style={{display: "none"}}>
                                    <div
                                        className="col-md-6 col-md-offset-3">
                                        Too big a file. Can only do less than 10 MB. &gt;_&lt;
                                    </div>
                                </div>

                                <div
                                    className="dnd-error row"
                                    id="dnd-format-notification"
                                    style={{display: "none"}}>
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
                    if (SequenceServer.FASTA_FORMAT.test(content)) {
                        self.state.query.value(content);
                        indicator.text(file.name);
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
 * Query widget.
 */
var Query = React.createClass({

    // Kind of public API. //

    /**
     * Sets query to given value or returns current value. Returns `this` when
     * used as a setter.
     */
    value: function (val) {
        if (val !== undefined) {
            this.setState({
                value: val
            })
            return this;
        }
        return this.state.value;
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
        return {
            value: ''
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
                        className="form-control text-monospace" id="sequence"
                        rows="10" spellCheck="false" autoFocus="true"
                        name="sequence"   value={this.state.value}
                        ref="textarea" onChange={this.handleInput}
                        placeholder="Paste query sequence(s) or drag file containing query sequence(s) in FASTA format here ..." >
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
                    Detected: protein sequence(s).
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
                    Detected: mixed nucleotide and protein sequences. We can't handle that'. Please try one sequence at a time.
                </div>
            </div>
        );
    }
});

var DatabaseList = React.createClass({
    getInitialState: function () {
        return {
            type:      '',
            databases: []
        }
    },

    databases: function (category) {
        if (!category) {
            return this.state.databases.slice();
        }

        return _.select(this.state.databases,
                        function (database) {
                            return database.type === category;
                        });
    },

    nselected: function () {
        return $('input[name="databases[]"]:checked').length;
    },

    categories: function () {
        return _.uniq(_.map(this.state.databases,
                            _.iteratee('type'))).sort();
    },

    handleClick: function (database) {
        var type = this.nselected() ? database.type : ''
        this.setState({type: type});
    },

    render: function () {
        return (
            <div
              className="form-group databases-container">
                {
                    _.map(this.categories(), _.bind(function (category) {
                        return (
                            <div
                                className={this.categories().length === 1 ? 'col-md-12' : 'col-md-6'}>
                                <div
                                    className="panel panel-default">
                                    <div
                                        className="panel-heading">
                                        <h4>{category[0].toUpperCase() + category.substring(1).toLowerCase() + " databases"}</h4>
                                    </div>
                                    <ul
                                        className={"list-group databases " + category}>
                                        {
                                            _.map(this.databases(category), _.bind(function (database) {
                                                return (
                                                    <li className="list-group-item">
                                                        <div
                                                            className="checkbox"
                                                            className={(this.state.type && this.state.type !== database.type) && "disabled"}>
                                                            <label>
                                                                <input
                                                                    type="checkbox" name="databases[]" value={database.id} data-type={database.type}
                                                                    disabled={this.state.type && this.state.type !== database.type}
                                                                    onChange=
                                                                    {
                                                                        _.bind(function () {
                                                                            this.handleClick(database)
                                                                        }, this)
                                                                    }/>
                                                                {" " + (database.title || database.name)}
                                                            </label>
                                                        </div>
                                                    </li>
                                                );
                                            }, this))
                                        }
                                    </ul>
                                </div>
                            </div>
                        )
                    }, this))
                }
            </div>
        );
    },

    componentDidMount: function () {
        $.getJSON('databases.json', _.bind(function (data) {
            this.setState({
                databases: _.sortBy(data, 'title')
            });
        }, this));
    },

    shouldComponentUpdate: function (props, state) {
        return !(state.type && state.type === this.state.type);
        //return (!(state.type && state.type === this.state.type) ||
                //!(state.filter && state.filter === this.state.filter));
    },

    componentDidUpdate: function () {
        if (this.databases() && this.databases().length === 1) {
            $('.databases').find('input').prop('checked',true);
            //$('.database').not('.active').click();
            this.handleClick(this.databases()[0]);
        }

        this.props.onDatabaseTypeChanged(this.state.type);
    }
});

/**
 * Database widget.
 *
 * Comprises four components: category selector, search bar, database listing,
 * and a root components to hold, manage, and facilitate communication between
 * them.
 *
 * The root components fetches a list of database from the server and updates
 * its state which in turn causes all its child components to be re-rendered.
 * At this stage the list of databases is passed down to `DatabasesList` via
 * props.
 *
 * Category selector and search bar change `DatabasesList`'s state based on
 * user input. Accordingly `DatabasesList` filters the list of databases it
 * has and re-renders.
 */
var Databases = (function () {

    /**
     * Search field for the database widget.
     */
    var Search = React.createClass({

        // Kind of public API. //

        /**
         * Sets search text to given value or returns current value. Returns
         * `this` when used as a setter.
         */
        text: function (text) {
            if (text !== undefined) {
                this.setState({
                    text: text
                })
                return this;
            }
            return this.state.text;
        },

        /**
         * Clears search text. Returns `this`.
         *
         * Clearing search text also causes the input field to be focussed.
         */
        clear: function () {
            return this.text('').focus();
        },

        /**
         * Focuses input field. Returns `this`.
         */
        focus: function () {
            this.input().focus();
            return this;
        },

        /**
         * Returns true if search text is absent ('', undefined, nil), false
         * otherwise.
         */
        isEmpty: function () {
            return !this.text();
        },


        // Internal helpers. //

        input: function () {
            return $(React.findDOMNode(this.refs.input));
        },

        handleInput: function (evt) {
            this.text(evt.target.value);
        },


        // Life cycle methods. //

        getInitialState: function () {
            return {
                text: ''
            }
        },

        componentDidUpdate: function () {
            this.props.onUserInput(this.text());
        },

        render: function () {
            return (
                <div>
                    <input
                        type="text" className="form-control"
                        value={this.state.text}
                        ref="input" onChange={this.handleInput}
                        placeholder="Enter species name, common name, or lineage ..."/>
                    <div
                        className={
                            !!this.text() ? '' : 'hidden'
                        }
                        style={{
                            position: 'absolute',
                            right: '21px',
                            top: '8px',
                        }}>
                        <a
                            href="#"
                            className="fa fa-lg fa-times"
                            style={{color: 'inherit'}}
                            title="Clear search text."
                            onClick={this.clear}>
                        </a>
                    </div>
                </div>
            );
        }
    });

    /**
     * Category selector for the database widget.
     */
    var CategoryList = React.createClass({

        handleChange: function (evt) {
            var button = $(evt.target).closest('.btn');
            var input  = button.children('input');

            if (input.attr('value') === this.selected) {
                button.removeClass('active');
                input.prop('checked', false);
                this.selected = '';
            }
            else {
                this.selected = input.attr('value');
            }

            this.props.handleChange(this.selected);
        },

        render: function () {
            return (
                <div className="btn-group-vertical btn-block" data-toggle="buttons">
                    {
                        _.map(this.props.categories, _.bind(function (category) {
                            return (
                                <div
                                    className="btn btn-default list-group-item"
                                    key={category} onClick={this.handleChange}>
                                    <input
                                        type="radio" name="category" value={category}/>
                                    <span
                                        className="text-capitalize">
                                        {category}
                                    </span>
                                </div>
                            );
                        }, this))
                    }
                </div>
            );
        }
    });

    var DatabaseList = React.createClass({
        getInitialState: function () {
            return {
                category: '',
                filter:   '',
                type:     ''
            }
        },

        databases: function () {
            return this.props.data;
        },

        filtered: function () {
            var category = this.state.category;
            var handleChange = this.handleChange;
            var filterText = this.state.filter;
            var type = this.state.type;
            return _.filter(this.databases(), function (database) {
                if (((database.title.toLowerCase().indexOf(filterText.toLowerCase()) != -1) ||
                    ((database.tags) && (database.tags.join("").toLowerCase().indexOf(filterText.toLowerCase())) != -1) ||
                    ((database.type) && (database.type.toLowerCase().indexOf(filterText.toLowerCase())) != -1)) &&
                    ((category == database.type) || (category == ''))) {
                    return true;
                }
            });
        },

        nselected: function () {
            return $('input[name="databases[]"]:checked').length;
        },

        handleClick: function (database) {
            var type = this.nselected() ? database.type : ''
            this.setState({type: type});
        },

        render: function () {
            return (
                <div
                    className="databaseholder btn-group-vertical btn-block"
                    data-toggle="buttons">
                    {
                        _.map(this.filtered(), _.bind(function (database) {
                            return (
                                <div
                                    key={database.id} className="btn btn-default database"
                                    onClick={
                                        _.bind(function () {
                                            this.handleClick(database);
                                        }, this)
                                    }
                                    disabled={this.state.type && this.state.type !== database.type}>
                                    <input
                                        type="checkbox"
                                        name="databases[]" value={database.id} />
                                    {database.title}
                                    <br/>
                                    <small>
                                        {database.type},
                                        sequences:   {database.nsequences},
                                        residues:   {database.ncharacters},
                                        updated: {database.updated_on}
                                    </small>
                                </div>
                            );
                        }, this))
                    }
                </div>
            );
        },

        shouldComponentUpdate: function (props, state) {
            return !(state.type && state.type === this.state.type);
            //return (!(state.type && state.type === this.state.type) ||
                    //!(state.filter && state.filter === this.state.filter));
        },

        componentDidUpdate: function () {
            if (this.databases() && this.databases().length === 1) {
                $('.database').not('.active').click();
                this.handleClick(this.databases()[0]);
            }

            this.props.onDatabaseTypeChanged(this.state.type);
        }
    });

    return React.createClass({
        getInitialState: function () {
            return {
                databases: []
            }
        },

        categories: function () {
            return _.compact(_.uniq(_.map(this.state.databases ,
                                          _.iteratee('type'))));
        },

        handleSearchInput: function (filterText) {
            this.refs.listing.setState({
                filter: filterText
            });
        },

        handleCategoryChange: function (category) {
            this.refs.listing.setState({
                category: category
            });
        },

        selectedType: function () {
            return this.refs.listing.state.type;
        },

        render: function () {
            return (
                <div
                    className="form-group databases-container">
                    <div className="col-md-3">
                        <CategoryList
                            handleChange={this.handleCategoryChange}
                            categories={this.categories()}/>
                    </div>
                    <div className="col-md-9">
                        <div>
                            <Search
                                onUserInput={this.handleSearchInput}/>
                            <br/>
                            <DatabaseList
                                ref="listing" data={this.state.databases}
                                onDatabaseTypeChanged={this.props.onDatabaseTypeChanged}/>
                        </div>
                    </div>
                </div>
            );
        },

        componentDidMount: function () {
            $.getJSON('databases.json', _.bind(function (data) {
                this.setState({
                    databases: _.sortBy(data, 'title')
                });
            }, this));
        }
    });
})();

var Options = React.createClass({
    render: function () {
        return (
            <div
                className="col-md-8">
                <div
                    className="form-group">
                    <div
                        className="col-md-12">
                        <div
                            className="input-group">
                            <label
                                className="control-label cursor-pointer"
                                htmlFor="advanced">
                                Advanced Parameters:
                            </label>
                            <input
                                type="text"
                                className="form-control" name="advanced" id="advanced"
                                title="View, and enter advanced parameters."
                                placeholder="eg: -evalue 1.0e-5 -num_alignments 100"/>
                            <div
                                className="input-group-addon cursor-pointer"
                                data-toggle="modal" data-target="#help">
                                <i className="fa fa-question"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

/**
 * SearchButton widget.
 */
var SearchButton = React.createClass({
    getInitialState: function () {
        return {
            methods: []
        }
    },

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

    orderMethodsArray: function (method) {
      var methods = this.state.methods.slice();
      methods.splice(methods.indexOf(method), 1);
      methods.unshift(method);
      return methods;
    },

    changeAlgorithm: function (method) {
        this.setState({
            methods: this.orderMethodsArray(method)
        });
    },

    render: function () {
        var methods = this.state.methods;
        var method = methods[0];
        var multi = methods.length > 1;
        // data-toggle="tooltip" data-placement="left"
        //     title="Click dropdown button on the right for other BLAST algorithms that can be used."

        return (
            <div className="col-md-4">
                <div className="form-group">
                    <div className="col-md-12">
                        <div
                            className={multi && 'input-group'} id="methods"
                            ref="buttons">
                            <button
                                type="submit" className="btn btn-primary form-control text-uppercase"
                                id="method" name="method" value={method} disabled={!method}>
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
        //title="Click dropdown button on the right for other BLAST algorithms that can be used.">
        // Show tooltip on BLAST button.
        // $(this.refs.buttons.getDOMNode()).tooltip({
        //     title: function () {
        //         var selected_databases = $(".databases input:checkbox:checked");
        //         if (selected_databases.length === 0) {
        //             return "You must select one or more databases above before" +
        //                 " you can run a search!";
        //         }
        //         else {
        //             return "Click dropdown button on the right for other BLAST algorithms that can be used."
        //         }
        //     }
        // });
    },

    shouldComponentUpdate: function (props , state) {
        return !(_.isEqual(state.methods,this.state.methods));
    },

    componentDidUpdate: function () {
        if (this.state.methods.length > 0) {
            $(this.refs.buttons.getDOMNode()).wiggle();
        }
    }
});

/**
 * Search form.
 *
 * Top level component that initialises and holds all other components, and
 * facilitates communication between them.
 */
var Form = React.createClass({

    tooltips: function () {
        return(
            {
                noInputAndDatabase: "Input a query sequence and select database to BLAST.",
                noInputEntered: "Please input a query sequence to enable BLAST.",
                noDatabaseSelected: "You must select one or more databases above before you can run a search!",
                manyAlgorithms: "Click dropdown button on right for other BLAST algorithms that can be used.",
                allSet: "Click to BLAST or press Ctrl+Enter."
            }
        );
    },

    setTooltips: function () {
        var selected_databases = $(".databases input:checkbox:checked");
        if (selected_databases.length === 0 && !(this.refs.query.value())) {
            return this.tooltips().noInputAndDatabase;
        }
        else if (selected_databases.length === 0 && this.refs.query.value()) {
            return this.tooltips().noDatabaseSelected;
        }
        else if (selected_databases.length !== 0 && !(this.refs.query.value())){
            return this.tooltips().noInputEntered;
        }
        else if (this.refs.button.state.methods.length > 1) {
            return this.tooltips().manyAlgorithms;
        }
        else {
            return this.tooltips().allSet;
        }
    },

    componentDidMount: function () {
        // Submit form when Ctrl+Enter is pressed anywhere on page.
        $(document).bind("keydown", _.bind(function (e) {
            if (e.ctrlKey && e.keyCode === 13 &&
                !$('#method').is(':disabled')) {
                $(this.getDOMNode()).trigger('submit');
            }
        }, this));

        $(React.findDOMNode((this.refs.button).refs.buttons)).tooltip({
            title: _.bind(function () {
                return this.setTooltips();
            }, this)
        });
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
            methods: this.determineBlastMethod()
        });
    },

    handleDatabaseTypeChanaged: function (type) {
        this.databaseType = type;
        this.refs.button.setState({
            methods: this.determineBlastMethod()
        });
    },

    render: function () {
        return (
            <div
                className="container">
            <form
                className="form-horizontal" id="blast"
                method="post" target="_blank">
                <div
                    className="form-group query-container">
                    <Query ref="query" onSequenceTypeChanged={this.handleSequenceTypeChanged}/>
                </div>
                <div
                    className="notifications" id="notifications">
                    <NucleotideNotification/>
                    <ProteinNotification/>
                    <MixedNotification/>
                </div>
                <DatabaseList ref="databases" onDatabaseTypeChanged={this.handleDatabaseTypeChanaged}/>
                <br/>
                <div
                    className="form-group">
                    <Options/>
                    <SearchButton ref="button"/>
                </div>
            </form>
            </div>
        );
    }
});

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
        })
    }
});

export {Page};
