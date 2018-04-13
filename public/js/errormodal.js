import React from 'react';

/**
 * Takes errorData object with title, message, and more_info keys as props. The
 * component displays a bootstrap modal when mounted. errorData.title is used
 * to set modal title. errorData.message is inserted as HTML text in modal
 * body. And errorData.more_info is shown using a pre tag in modal body.
 *
 * The component is stateless. The displayed modal dialog cannot be dismissed.
 * The user must close the tab or press back button to go back to search form.
 */
class ErrorModal extends React.Component {

    constructor(props) {
        super(props);
    }

    // HTML for Bootstrap modal.
    render() {
        return (
            <div
                id="error" ref="errorModal" className="modal fade"
                data-keyboard="false" data-backdrop="static">
                <div
                    className="modal-dialog modal-lg">
                    <div
                        className="modal-content">
                        <div
                            className="modal-header">
                            <h3>{this.props.errorData.title}</h3>
                        </div>

                        <div
                            className="modal-body">
                            <p dangerouslySetInnerHTML={{ __html: this.props.errorData.message}}></p>

                            {
                                this.props.errorData.more_info &&
                                    <pre className="pre-scrollable">
                                        {this.props.errorData.more_info}
                                    </pre>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show the modal once the component is mounted.
    componentDidMount() {
        // Caller can specify an amount of time to wait for before showing the
        // modal. This is helpful if the caller wants to finish some work
        // before showing error modal.
        setTimeout(function () {
            $(React.findDOMNode(this.refs.errorModal)).modal('show');
        }.bind(this), this.props.beforeShow || 0);
    }
}

/**
 * Renders ErrorModal.
 */
export default function showErrorModal (errorData, beforeShow) {
    React.render(<ErrorModal errorData={errorData}
        beforeShow={beforeShow}/>, document.getElementById('view'));
}
