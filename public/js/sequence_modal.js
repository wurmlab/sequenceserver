import "./sequence";
import React, { createRef } from "react";
import _ from "underscore";

/**
 * Takes sequence accession as props, fetches the sequence from the server, and
 * displays it in a modal.
 */
export default class SequenceModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error_msgs: [],
      sequences: [],
      requestCompleted: false,
      isModalVisible: false,
    };
    this.modalRef = createRef();
  }

  // Lifecycle methods. //

  render() {
    const { isModalVisible, requestCompleted } = this.state;

    return (
      <div>
        <dialog ref={this.modalRef} className="sequence-viewer relative w-full p-4 max-w-2xl bg-transparent focus:outline-none overflow-visible">
          <div className="relative flex flex-col rounded-lg bg-white shadow dark:bg-gray-700">
            <div className="flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                View sequence
              </h3>
              <button className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" onClick={this.hide}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            {(requestCompleted && this.resultsJSX()) || this.loadingJSX()}
          </div>
        </dialog>
      </div>
    );
  }

  /**
   * Shows sequence viewer.
   */
  show = (url) => {
    this.modalRef.current?.showModal();
    this.setState({ requestCompleted: false });
    this.loadJSON(url);
  }

  /**
   * Hide sequence viewer.
   */
  hide = () => {
    this.modalRef.current?.close();
  }

  /**
   * Loads sequence using AJAX and updates modal state.
   */
  async loadJSON(url) {
    // Fetch sequence and update state.
    try {
      const response = await fetch(url);
      const data = await response.json();
      this.setState({
        sequences: data.sequences,
        error_msgs: data.error_msgs,
        requestCompleted: true,
      });
    } catch (error) {
      console.log('Error fetching sequence:', error);
      this.hide();
      this.props.showErrorModal(error);
    }
  }

  resultsJSX() {
    return (
      <div className="pt-2 px-6 pb-6 mt-2">
        {this.state.error_msgs.map((error_msg, index) => (
          <div key={`error-message-${index}`} className="fastan">
            <div className="section-header border-b border-seqorange pl-px table mb-0 w-full md:max-w-xl pb-2">
              <h4 className="text-sm table-cell">{error_msg[0]}</h4>
            </div>
            <div className="pt-0 px-0 pb-px">
              <pre className="m-0 p-0 rounded-none border-0 bg-inherit whitespace-pre-wrap break-keep">{error_msg[1]}</pre>
            </div>
          </div>
        ))}
        {this.state.sequences.map((sequence, index) => (
          <SequenceViewer key={`sequence-viewer-${index}`} sequence={sequence} />
        ))}
      </div>
    );
  }

  loadingJSX() {
    return (
      <div className="my-4 text-center">
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
  static widgetClass() {
    return "biojs-vis-sequence";
  }

  render() {
    this.widgetID = this.widgetClass + "-" + new Date().getUTCMilliseconds();

    return (
      <div className="fastan">
        <div className="section-header border-b border-seqorange pl-px table mb-0 w-full md:max-w-xl pb-2">
          <h4 className="text-sm table-cell">
            {this.props.sequence.id}
            <small className="text-inherit">&nbsp; {this.props.sequence.title}</small>
          </h4>
        </div>
        <div className="pt-0 px-0 pb-px">
          <div className={this.widgetClass} id={this.widgetID}></div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    // attach BioJS sequence viewer
    var widget = new Sequence({
      sequence: this.props.sequence.value,
      target: this.widgetID,
      format: "PRIDE",
      columns: {
        size: 40,
        spacedEach: 0,
      },
      formatOptions: {
        title: false,
        footer: false,
      },
    });
    setTimeout(function() {
      requestAnimationFrame(() => { widget.hideFormatSelector() }); // ensure React is done painting the DOM of the element before calling a function on it.
    });
  }
}
