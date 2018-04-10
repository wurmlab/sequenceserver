import React from 'react';

export default class ErrorModal extends React.Component {

    getInitialState() {
        return {
        }
    }

    title() {
        return {
            404: 'Job not found',
            400: 'Input error',
            500: 'Job failed'
        }[this.props.status]
    }

    details() {
        return {
            404: "The requested job couldn't be found.",

            400: `This could be due to query sequence containing too many non-sensical characters,
            or because the given program name, database ids, or advanced search options are
            incorrect. It could also be that the search program crashed because it was not
            compiled correctly, or because the system is out of memory or disk space, or
            because the databases searched are corrupt or inconsistent.`,

            500: `There was a problem running BLAST. Could be BLAST crashed because it is not
            compiled correctly, or the system is out of memory or disk space. Or may be
            the databases files are corrupt or have duplicated ids.`
        }[this.props.status]
    }

    render() {
        return (
            <div
                id="error"
                className="modal fade" tabindex="-1">
                <div
                    className="modal-dialog modal-lg">
                    <div
                        className="modal-content">
                        <div
                            className="modal-header">
                            <h3>title()</h3>
                        </div>

                        <div
                            className="modal-body">
                            <p>details()</p>

                            <pre>pre()</pre>
                        </div>

                        <div
                            className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-default btn-danger"
                                data-dismiss="modal">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


                        //'gist': 'No response',
                        //'desc': 'Could be a temporary network issue, or the service might be configured to "time out" long requests. Please try again later.'

      //APIError.new('Something went wonky', <<DESC, info).to_json
//Looks like you have encountered a bug in SequenceServer. Could you please
//report this incident to your admin or to <a
//href="https://groups.google.com/forum/?fromgroups#!forum/sequenceserver">
//SequenceServer Google Group</a> (if you are the admin), quoting the error
//message below?
//DESC
