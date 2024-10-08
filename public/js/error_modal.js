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
        this.state = {
            errorData: {},
            isModalVisible: false
        };
        this.modal = createRef();
    }

    render() {
        const { isModalVisible, errorData } = this.state;

        return (
            <div>
                <dialog ref={this.modal} className="relative w-full max-w-2xl bg-transparent focus:outline-none overflow-y-auto">
                    <div className="relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow dark:bg-gray-700">
                        <div className="flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600">
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                {errorData.title}
                            </h3>
                            <button className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 focus:outline-none" onClick={this.hide}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="pt-2 px-6 pb-6 mt-2 text-sm">
                            <p dangerouslySetInnerHTML={{ __html: errorData.message }} className="mb-4"></p>
                            {
                                errorData.more_info &&
                                    <pre className="p-2 bg-slate-200 overflow-auto max-h-56">{errorData.more_info}</pre>
                            }
                        </div>
                    </div>
                </dialog>
            </div>
        );
    }

    /**
     * Shows error viewer.
     */
    show = (errorData, beforeShow) => {
        this.setState({ errorData: errorData });

        // Caller can specify an amount of time to wait for before showing the
        // modal. This is helpful if the caller wants to finish some work
        // before showing error modal.
        setTimeout(() => {
            this.modal.current?.showModal();
        }, beforeShow || 0);
    }

    /**
     * Hide dialogue.
     */
    hide = () => {
        this.modal.current?.close();
    }
}
