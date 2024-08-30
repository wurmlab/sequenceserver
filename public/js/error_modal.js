import React, { createRef } from 'react';

/**
 * Takes errorData object with title, message, and more_info keys as props. The
 * component displays a tailwind modal when mounted. errorData.title is used
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
        this.modal = createRef();
    }

    render() {
        return (
            <div id="error" ref={this.modal} className="relative modal z-10 hidden" role="dialog" aria-modal="true">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full md:max-w-3xl">
                            <div className="bg-white pt-5">
                                <div className="flex justify-between px-6 mb-4">
                                    <h3 className="text-base font-semibold leading-6 text-gray-900">{this.state.errorData.title}</h3>
                                    <span className="cursor-pointer" onClick={() => this.hide()}>
                                        <i className="fa-solid fa-xmark align-bottom"></i>
                                    </span>
                                </div>
                                <div className="pt-2 px-6 pb-6 mt-2 text-sm">
                                    <p dangerouslySetInnerHTML={{ __html: this.state.errorData.message}} className="mb-4"></p>

                                    {
                                        this.state.errorData.more_info &&
                                            <pre className="p-2 bg-slate-200 overflow-auto max-h-56">
                                                {this.state.errorData.more_info}
                                            </pre>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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
            $(this.modal.current).modal('show');
        }, beforeShow || 0);
    }

   /**
    * Hide dialogue.
    */
   hide() {
    $(this.modal.current).modal('hide');
   }
}
