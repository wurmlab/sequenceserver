import React, { Component, createRef } from 'react';
import { SearchButton } from './search_button';
import { SearchQueryWidget } from './query';
import DatabasesTree from './databases_tree';
import { Databases } from './databases';
import _ from 'underscore';
import { Options } from 'options';
import QueryStats from 'query_stats';

/**
 * Search form.
 *
 * Top level component that initialises and holds all other components, and
 * facilitates communication between them.
 */
export class Form extends Component {
    constructor(props) {
        super(props);
        this.state = {
            databases: [],
            preSelectedDbs: [],
            currentlySelectedDbs: [],
            preDefinedOpts: {},
            tree: {},
            residuesInQuerySequence: 0,
            blastMethod: ''
        };
        this.useTreeWidget = this.useTreeWidget.bind(this);
        this.determineBlastMethods = this.determineBlastMethods.bind(this);
        this.handleSequenceTypeChanged = this.handleSequenceTypeChanged.bind(this);
        this.handleSequenceChanged = this.handleSequenceChanged.bind(this);
        this.handleDatabaseTypeChanged = this.handleDatabaseTypeChanged.bind(this);
        this.handleDatabaseSelectionChanged = this.handleDatabaseSelectionChanged.bind(this);
        this.handleAlgoChanged = this.handleAlgoChanged.bind(this);
        this.handleFormSubmission = this.handleFormSubmission.bind(this);
        this.formRef = createRef();
        this.query = createRef();
        this.button = createRef();
        this.setButtonState = this.setButtonState.bind(this);
    }

    componentDidMount() {
        /**
        * Fetch data to initialise the search interface from the server. These
        * include list of databases to search against, advanced options to
        * apply when an algorithm is selected, and a query sequence that
        * the user may want to search in the databases.
        */
        var search = location.search.split(/\?|&/).filter(Boolean);
        var job_id = sessionStorage.getItem('job_id');
        if (job_id) {
            search.unshift(`job_id=${job_id}`);
        }
        $.getJSON(`searchdata.json?${search.join('&')}`, function (data) {
            /* Update form state (i.e., list of databases and predefined
             * advanced options.
             */
            this.setState({
                tree: data['tree'],
                databases: data['database'],
                preSelectedDbs: data['preSelectedDbs'],
                preDefinedOpts: data['options'],
                blastTaskMap: data['blastTaskMap']
            });

            /* Pre-populate the form with server sent query sequences
             * (if any).
             */
            if (data['query']) {
                this.query.current.value(data['query']);
            }

            setTimeout(function () {
                $('.jstree_div').click();
            }, 1000);
        }.bind(this));

        /* Enable submitting form on Cmd+Enter */
        $(document).on('keydown', (e) => {
            var $button = $('#method');
            if (!$button.is(':disabled') &&
                e.ctrlKey && e.key === 'Enter') {
                $button.trigger('click');
            }
        });

        // show overlay to create visual feedback on button click
        $('#method').on('click', () => {
            $('#overlay').css('display', 'block');
        });
    }

    useTreeWidget() {
        return !_.isEmpty(this.state.tree);
    }

    handleFormSubmission(evt) {
        evt.preventDefault();
        const form = this.formRef.current;
        const formData = new FormData(form);
        formData.append('method', this.button.current.state.methods[0]);
        fetch(window.location.href, {
            method: 'POST',
            body: formData
        }).then(res => {
            //remove overlay when form is submitted
            $('#overlay').css('display', 'none');
            // redirect
            if (res.redirected && res.url) {
                // setTimeout is needed here as a workaround because safari doesnt allow async calling of window.open
                // so setTimeout makes the method get called on the main thread.
                setTimeout(() => {
                    window.open(res.url, $('#toggleNewTab').is(':checked') ? '_blank' : '_self');
                }, 0);
            }
        });
    }

    determineBlastMethods() {
        var database_type = this.databaseType;
        var sequence_type = this.sequenceType;

        if (this.query.current.isEmpty()) {
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
    }

    handleSequenceChanged(residuesInQuerySequence) {
        if(residuesInQuerySequence !== this.state.residuesInQuerySequence)
            this.setState({ residuesInQuerySequence: residuesInQuerySequence});
    }

    handleSequenceTypeChanged(type) {
        this.sequenceType = type;
        this.setButtonState();
    }

    handleDatabaseTypeChanged(type) {
        this.databaseType = type;
        this.setButtonState();
    }

    setButtonState() {
        this.button.current.setState({
            hasQuery: !this.query.current.isEmpty(),
            hasDatabases: !!this.databaseType,
            methods: this.determineBlastMethods()
        });
    }

    handleDatabaseSelectionChanged(selectedDbs) {
        if (!_.isEqual(selectedDbs, this.state.currentlySelectedDbs))
            this.setState({ currentlySelectedDbs: selectedDbs });
    }

    handleAlgoChanged(algo) {
        if (algo in this.state.preDefinedOpts) {
            this.setState({ blastMethod: algo });
        }
        else {
            this.setState({ blastMethod: ''});
        }
    }

    residuesInSelectedDbs() {
        return this.state.currentlySelectedDbs.reduce((sum, db) => sum + parseInt(db.ncharacters, 10), 0);
    }

    render() {
        return (
            <div>
                <div id="overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vw', background: 'rgba(0, 0, 0, 0.2)', display: 'none', zIndex: 99 }} />

                <div className="fixed top-0 left-0 w-full max-h-8 px-8" data-notifications id="notifications">
                    <FastqNotification />
                    <NucleotideNotification />
                    <ProteinNotification />
                    <MixedNotification />
                </div>

                <form id="blast" ref={this.formRef} onSubmit={this.handleFormSubmission}>
                    <input type="hidden" name="_csrf" value={document.querySelector('meta[name="_csrf"]').content} />
                    <div className="px-4">
                        <SearchQueryWidget ref={this.query} onSequenceTypeChanged={this.handleSequenceTypeChanged} onSequenceChanged={this.handleSequenceChanged}/>

                        {this.useTreeWidget() ?
                            <DatabasesTree
                                databases={this.state.databases} tree={this.state.tree}
                                preSelectedDbs={this.state.preSelectedDbs}
                                onDatabaseTypeChanged={this.handleDatabaseTypeChanged}
                                onDatabaseSelectionChanged={this.handleDatabaseSelectionChanged} />
                            :
                            <Databases databases={this.state.databases}
                                preSelectedDbs={this.state.preSelectedDbs}
                                onDatabaseTypeChanged={this.handleDatabaseTypeChanged}
                                onDatabaseSelectionChanged={this.handleDatabaseSelectionChanged} />
                        }

                        <Options blastMethod={this.state.blastMethod} predefinedOptions={this.state.preDefinedOpts[this.state.blastMethod] || {}} blastTasks={(this.state.blastTaskMap || {})[this.state.blastMethod]} />
                    </div>

                    <div className="py-6"></div> {/* add a spacer so that the sticky action bar does not hide any contents */}

                    <div className="pb-4 pt-2 px-4 sticky bottom-0 md:flex flex-row md:space-x-4 items-center justify-end bg-gradient-to-t to-gray-100/90 from-white/90">
                        <QueryStats
                            residuesInQuerySequence={this.state.residuesInQuerySequence} numberOfDatabasesSelected={this.state.currentlySelectedDbs.length} residuesInSelectedDbs={this.residuesInSelectedDbs()}
                            currentBlastMethod={this.state.blastMethod}
                        />

                        <label className="block my-4 md:my-2">
                            <input type="checkbox" id="toggleNewTab" /> Open results in new tab
                        </label>
                        <SearchButton ref={this.button} onAlgoChanged={this.handleAlgoChanged} />
                    </div>

                </form>
            </div>
        );
    }

}


class ProteinNotification extends Component {
    render() {
        return (
            <div
                data-role="notification"
                id="protein-sequence-notification"
                style={{ display: 'none' }}>
                <div
                    className="bg-blue-100 border rounded border-blue-800 px-4 py-2 my-2">
                    Detected: amino-acid sequence(s).
                </div>
            </div>
        );
    }
}

class NucleotideNotification extends Component {
    render() {
        return (<div
            data-role="notification"
            id="nucleotide-sequence-notification"
            style={{ display: 'none' }}>
            <div
                className="bg-blue-100 border rounded border-blue-800 px-4 py-2 my-2">
                Detected: nucleotide sequence(s).
            </div>
        </div>
        );
    }
}

class FastqNotification extends Component {
    render() {
        return (<div
            data-role="notification"
            id="fastq-sequence-notification"
            style={{ display: 'none' }}>
            <div
                className="bg-blue-100 border rounded border-blue-800 px-4 py-2 my-2">
                Detected FASTQ and automatically converted to FASTA.
            </div>
        </div>
        );
    }
}

class MixedNotification extends Component {
    render() {
        return (
            <div
                data-role="notification"
                id="mixed-sequence-notification"
                style={{ display: 'none' }}>
                <div
                    className="alert-danger col-md-10 col-md-offset-1">
                    Error: mixed nucleotide and amino-acid sequences detected.
                </div>
            </div>
        );
    }
}
