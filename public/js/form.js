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
        this.handleDatabaseTypeChanaged = this.handleDatabaseTypeChanaged.bind(this);
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
        $.getJSON(`searchdata.json?${search.join('&')}`, function (data) {
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

    handleDatabaseTypeChanaged(type) {
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
            <div className="container">
                <div id="overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vw', background: 'rgba(0, 0, 0, 0.2)', display: 'none', zIndex: 99 }} />
                <form id="blast" ref={this.formRef} onSubmit={this.handleFormSubmission} className="form-horizontal">
                    <div className="form-group query-container">
                        <SearchQueryWidget ref="query" onSequenceTypeChanged={this.handleSequenceTypeChanged} />
                    </div>
                    <div className="notifications" id="notifications">
                        <NucleotideNotification />
                        <ProteinNotification />
                        <MixedNotification />
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
                        <Options ref="opts" />
                        <div className="col-md-2">
                            <div className="form-group" style={{ 'textAlign': 'center', 'padding': '7px 0' }}>
                                <label>
                                    <input type="checkbox" id="toggleNewTab" /> Open results in new tab
                                </label>
                            </div>
                        </div>
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
}

class NucleotideNotification extends Component {
    render() {
        return (<div
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
}

class MixedNotification extends Component {
    render() {
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
}