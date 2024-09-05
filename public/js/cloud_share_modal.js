import React, { createRef } from "react";
import ShareURLComponent from "./share_url";
import _ from "underscore";

/**
 * Takes sequence accession as props, fetches the sequence from the server, and
 * displays it in a modal.
 */
export default class CloudShareModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: 'input', // Possible values: 'input', 'loading', 'results', 'error'
      errorMessages: [],
      email: '',
      agreeToTos: false,
      shareableurl: '',
      isModalVisible: false,
    };
    this.modalRef = createRef();
  }

  // Lifecycle methods. //

  handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    this.setState({ [name]: inputValue });
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const { email } = this.state;
    const jobId = this.getJobIdFromPath();

    this.setState({ formState: 'loading' });

    const requestData = {
      job_id: jobId,
      sender_email: email
    };

    try {
      const response = await fetch('/cloud_share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.shareable_url) {
        this.setState({ formState: 'results', shareableurl: data.shareable_url });
      } else if (data.errors) {
        this.setState({ formState: 'error', errorMessages: data.errors });
      } else {
        throw new Error('Unknown error submitting form');
      }
    } catch (error) {
      this.setState({
        formState: 'error',
        errorMessages: [error.message]
      });
    }
  }

  getJobIdFromPath = () => {
    const regex = /\/([^/]+)(?:\/|#|\?|$)/;
    const match = window.location.pathname.match(regex);
    return match ? match[1] : match;
  }

  renderLoading() {
    return (
      <div className="text-center">
        <i className="fa fa-spinner fa-3x fa-spin"></i>
        <p className="my-3">Uploading the job to SequenceServer Cloud, please wait...</p>
      </div>
    );
  }

  renderResults() {
    const { shareableurl } = this.state;

    return <ShareURLComponent url={shareableurl} querydb={this.props.querydb} program={this.props.program} queryLength={this.props.queryLength} />;
  }

  renderError() {
    const { errorMessages } = this.state;

    return (
      <>
        {
          errorMessages.map((errorMessage, index) => (
            <div key={`fastan-${index}`} className="fastan">
              <div className="pt-0 px-0 pb-px">
                <div className="text-danger text-lg border border-danger p-2 my-2">{errorMessage}</div>
              </div>
            </div>
          ))
        }
        {this.renderForm()}
      </>
    );
  }

  renderForm() {
    const { email, agreeToTos } = this.state;
    const isSubmitDisabled = !agreeToTos;

    return(
      <form onSubmit={this.handleSubmit}>
        <div className="px-6 mb-3">
          <label htmlFor="emailInput" className="text-seqblue hover:text-orange cursor-pointer mb-0">Your Email Address</label>
          <input
            type="email"
            id="emailInput"
            className="block w-full rounded-md border-0 py-1.5 px-3 mb-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-seqblue sm:text-sm sm:leading-6"
            placeholder="person@example.com"
            name="email"
            value={email}
            required="required"
            onChange={this.handleChange}
          />
          <p>
            By submitting this form you agree to upload this SequenceServer result set to <a href="https://sequenceserver.com/cloud/" target="_bank" className="text-seqblue hover:text-seqorange">SenquenceServer Cloud</a>
            , where it will become available on the internet to everyone with the link. You also agree that your email address will be stored on SequenceServer databases as proof of authentication for support and similar purposes.
          </p>
        </div>
        <div className="form-check px-6 mb-3">
          <input
            type="checkbox"
            id="tosCheckbox"
            className="form-check-input"
            name="agreeToTos"
            checked={agreeToTos}
            onChange={this.handleChange}
          />
          <label htmlFor="tosCheckbox" className="pl-2">
            &nbsp;I agree to the <b><a href="https://sequenceserver.com/cloud/terms_and_conditions" target="_blank" className="text-seqblue hover:text-seqorange">Terms and Conditions of Service</a></b>
          </label>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
        <button
            type="submit"
            style={{ backgroundColor: isSubmitDisabled ? '#C74F13' : '#1B557A' }}
            className='border-seqblue py-2 px-3 rounded-md text-white'
            disabled={isSubmitDisabled}
        >
            Submit
        </button>
        </div>
      </form>
    )
  }

  render() {
    const { formState, isModalVisible } = this.state;

    let content;
    switch (formState) {
      case 'loading':
        content = this.renderLoading();
        break;
      case 'results':
        content = this.renderResults();
        break;
      case 'error':
        content = this.renderError();
        break;
      case 'input':
      default:
        content = this.renderForm();
        break;
    }

    return (
      <div className={`relative modal z-10 ${isModalVisible ? '' : 'hidden'}`} ref={this.modalRef} tabIndex="-1" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full md:max-w-lg">
              <div className="bg-white pt-5">
                <div className="flex justify-between px-6 mb-4">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">Share to SequenceServer Cloud</h3>
                  <span className="cursor-pointer" onClick={() => this.hide()}>
                    <i className="fa-solid fa-xmark align-bottom"></i>
                  </span>
                </div>
                <div className="pt-6 mt-2 text-sm">
                  {content}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * show modal
   */
  show() {
    this.setState({ isModalVisible: true });
  }

  /**
   * Hide modal.
   */
  hide() {
    this.setState({ isModalVisible: false });
  }
}
