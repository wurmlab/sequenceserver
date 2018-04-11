import React from 'react';

class ErrorModal extends React.Component {

    constructor(props) {
        super(props);
    }

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
                            <p>{this.props.errorData.message}</p>

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

    componentDidMount() {
        $(React.findDOMNode(this.refs.errorModal)).modal('show');
    }
}

export default function showErrorModal (errorData, beforeShow) {
    if (!beforeShow) {
        beforeShow = function () {};
    }

    setTimeout(function () {
        beforeShow();
        React.render(<ErrorModal errorData={errorData}/>,
            document.getElementById('view'));
    }, 500);
}
