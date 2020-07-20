import './sequence';
import React from 'react';
import _ from 'underscore';

/**
 * Takes sequence accession as props, fetches the sequence from the server, and
 * displays it in a modal.
 */
export default class SequenceModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            error_msgs: [],
            sequences:  [],
            requestCompleted: false
        };
    }

    // Lifecycle methods. //

    render () {
        return (
            <div className="modal sequence-viewer" ref="modal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>View sequence</h3>
                        </div>

                        { this.state.requestCompleted &&
                            this.resultsJSX() || this.loadingJSX() }
                    </div>
                </div>
            </div>
        );
    }

    /*
    * Returns jQuery reference to the main modal container.
    */
    modal () {
        return $(React.findDOMNode(this.refs.modal));
    }

    /**
     * Shows sequence viewer.
     */
    show (url) {
        this.setState({requestCompleted: false}, () => {
            this.modal().modal('show');
            this.loadJSON(url);
        });
    }

    /**
     * Hide sequence viewer.
     */
    hide () {
        this.modal().modal('hide');
    }

    /**
     * Loads sequence using AJAX and updates modal state.
     */
    loadJSON (url) {
        // Fetch sequence and update state.
        $.getJSON(url)
            .done(_.bind(function (response) {
                this.setState({
                    sequences: response.sequences,
                    error_msgs: response.error_msgs,
                    requestCompleted: true
                });
            }, this))
            .fail((jqXHR, status, error) => {
                this.hide();
                this.props.showErrorModal(jqXHR.responseJSON);
            });

    }

    resultsJSX () {
        return (
            <div className="modal-body">
                {
                    _.map(this.state.error_msgs, _.bind(function (error_msg) {
                        return (
                            <div className="fastan">
                                <div className="section-header">
                                    <h4>
                                        {error_msg[0]}
                                    </h4>
                                </div>
                                <div className="section-content">
                                    <pre className="pre-reset">
                                        {error_msg[1]}
                                    </pre>
                                </div>
                            </div>
                        );
                    }, this))
                }
                {
                    _.map(this.state.sequences, _.bind(function (sequence) {
                        return (<SequenceViewer sequence={sequence}/>);
                    }, this))
                }
            </div>
        );
    }

    loadingJSX () {
        return (
            <div className="modal-body text-center">
                <i className="fa fa-spinner fa-3x fa-spin"></i>
            </div>
        );
    }
}

class SequenceViewer extends React.Component {

    /**
     * The CSS class name that will be assigned to the widget container. ID
     * assigned to the widget container is derived from the same.
     */
    static widgetClass () {
        return 'biojs-vis-sequence';
    }

    render () {
        this.widgetID =
            this.widgetClass + '-' + (new Date().getUTCMilliseconds());

        return (
            <div className="fastan">
                <div className="section-header">
                    <h4>
                        {this.props.sequence.id}
                        <small>
                            &nbsp; {this.props.sequence.title}
                        </small>
                    </h4>
                </div>
                <div className="section-content">
                    <div
                        className={this.widgetClass} id={this.widgetID}>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount () {
        // attach BioJS sequence viewer
        var widget = new Sequence({
            sequence: this.props.sequence.value,
            target: this.widgetID,
            format: 'PRIDE',
            columns: {
                size: 40,
                spacedEach: 0
            },
            formatOptions: {
                title: false,
                footer: false
            }
        });
        widget.hideFormatSelector();
    }
}