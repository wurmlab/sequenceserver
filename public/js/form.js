import React, { Component, createRef } from 'react';
import { SearchButton } from './search_button';
import { SearchQueryWidget } from './query';
import DatabasesTree from './databases_tree';
import { Databases } from './databases';
import _ from 'underscore';
import { Options } from './options';

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
            databases: [], preDefinedOpts: {}, tree: {}
        };
        this.useTreeWidget = this.useTreeWidget.bind(this);
        this.determineBlastMethod = this.determineBlastMethod.bind(this);
        this.handleSequenceTypeChanged = this.handleSequenceTypeChanged.bind(this);
        this.handleDatabaseTypeChanged = this.handleDatabaseTypeChanged.bind(this);
        this.handleAlgoChanged = this.handleAlgoChanged.bind(this);
        this.handleFormSubmission = this.handleFormSubmission.bind(this);
        this.formRef = createRef();
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

        const currentUrl = window.location.href;
        const segments = currentUrl.split('/');

        // Extract the segments you need
        const segment1 = segments[4]; // Adjust the index based on your URL structure
        const segment2 = segments[5];
        $.getJSON(`/blast/${segment1}/${segment2}/searchdata.json?${search.join('&')}`, function (data) {
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
        formData.append('method', this.refs.button.state.methods[0]);
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

    determineBlastMethod() {
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
    }

    handleSequenceTypeChanged(type) {
        this.sequenceType = type;
        this.refs.button.setState({
            hasQuery: !this.refs.query.isEmpty(),
            hasDatabases: !!this.databaseType,
            methods: this.determineBlastMethod()
        });
    }

    handleDatabaseTypeChanged(type) {
        this.databaseType = type;
        this.refs.button.setState({
            hasQuery: !this.refs.query.isEmpty(),
            hasDatabases: !!this.databaseType,
            methods: this.determineBlastMethod()
        });
    }

    handleAlgoChanged(algo) {
        if (algo in this.state.preDefinedOpts) {
            var preDefinedOpts = this.state.preDefinedOpts[algo];
            this.refs.opts.setState({
                method: algo,
                preOpts: preDefinedOpts,
                value: (preDefinedOpts['last search'] ||
                    preDefinedOpts['default']).join(' ')
            });
        }
        else {
            this.refs.opts.setState({ preOpts: {}, value: '', method: '' });
        }
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
                    <SearchQueryWidget ref="query" onSequenceTypeChanged={this.handleSequenceTypeChanged} />

                    {this.useTreeWidget() ?
                        <DatabasesTree ref="databases"
                            databases={this.state.databases} tree={this.state.tree}
                            preSelectedDbs={this.state.preSelectedDbs}
                            onDatabaseTypeChanged={this.handleDatabaseTypeChanged} />
                        :
                        <Databases ref="databases" databases={this.state.databases}
                            preSelectedDbs={this.state.preSelectedDbs}
                            onDatabaseTypeChanged={this.handleDatabaseTypeChanged} />
                    }

                    <div className="md:flex flex-row md:space-x-4 items-center my-6">
                        <Options ref="opts" />
                        <label className="block my-4 md:my-0">
                            <input type="checkbox" id="toggleNewTab" /> Open results in new tab
                        </label>
                        <SearchButton ref="button" onAlgoChanged={this.handleAlgoChanged} />
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
