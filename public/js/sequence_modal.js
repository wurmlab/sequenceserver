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
    };
    this.modalRef = createRef();
  }

  // Lifecycle methods. //

  render() {
    return (
      <div className="relative modal z-10 hidden sequence-viewer" ref={this.modalRef} tabIndex="-1" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white pt-5">
                <div className="px-6 mb-4">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">View sequence</h3>
                  <span className="cursor-pointer" onClick={() => this.hide()}>
                    <i className="fa-solid fa-xmark align-bottom"></i>
                  </span>
                </div>

                {(this.state.requestCompleted && this.resultsJSX()) ||
                  this.loadingJSX()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Returns jQuery reference to the main modal container.
   */
  modal() {
    return $(this.modalRef.current);
  }

  /**
   * Shows sequence viewer.
   */
  show(url) {
    this.setState({ requestCompleted: false }, () => {
      this.modal().modal("show");
      this.loadJSON(url);
    });
  }

  /**
   * Hide sequence viewer.
   */
  hide() {
    this.modal().modal("hide");
  }

  /**
   * Loads sequence using AJAX and updates modal state.
   */
  async loadJSON(url) {
    // Fetch sequence and update state.
    try {
      const response = await $.getJSON(url);
      this.setState({
        sequences: response.sequences,
        error_msgs: response.error_msgs,
        requestCompleted: true,
      });
    } catch (error) {
      console.log('Error fetching sequence:', error);
      this.hide();
      this.props.showErrorModal(error.responseJSON);
    }
  }

  resultsJSX() {
    return (
      <div className="p-6 mt-2 text-sm">
        {this.state.error_msgs.map((error_msg, index) => (
          <div key={`error-message-${index}`} className="fastan">
            <div className="section-header border-b border-seqorange pl-px table w-full pb-2">
              <h4 className="text-sm">{error_msg[0]}</h4>
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
      <div className="mt-2 text-center">
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
        <div className="section-header border-b border-seqorange pl-px table w-full pb-2">
          <h4 className="text-sm">
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
