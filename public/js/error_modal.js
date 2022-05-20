import React from 'react';

/**
 * Takes errorData object with title, message, and more_info keys as props. The
 * component displays a bootstrap modal when mounted. errorData.title is used
 * to set modal title. errorData.message is inserted as HTML text in modal
 * body. And errorData.more_info is shown using a pre tag in modal body.
 *
 * The displayed modal dialog cannot be dismissed.
 * The user must close the tab or press back button to go back to search form.
 */
export default class ErrorModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = { errorData: {} };
    }

    // HTML for Bootstrap modal.
    render() {
        return (
            <div id="error" ref="modal" className="modal fade"
                data-keyboard="false" data-backdrop="static">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{this.state.errorData.title}</h3>
                        </div>

                        <div className="modal-body">
                            <p dangerouslySetInnerHTML={{ __html: this.state.errorData.message}}></p>

                            {
                                this.state.errorData.more_info &&
                                    <pre className="pre-scrollable">
                                        {this.state.errorData.more_info}
                                    </pre>
                            }
                        </div>
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
     * Shows error viewer.
     */
    show (errorData, beforeShow) {
        this.setState({errorData: errorData});
        // Caller can specify an amount of time to wait for before showing the
        // modal. This is helpful if the caller wants to finish some work
        // before showing error modal.
        setTimeout(() => {
            this.modal().modal('show');
        }, beforeShow || 0);
    }
}
