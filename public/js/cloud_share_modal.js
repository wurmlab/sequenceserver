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
        <p>Uploading the job to SequenceServer Cloud, please wait...</p>
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
              <div className="section-content">
                <div className="modal-error">{errorMessage}</div>
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
        <div className="form-group">
          <label htmlFor="emailInput">Your Email Address</label>
          <input
            type="email"
            id="emailInput"
            className="form-control"
            placeholder="person@example.com"
            name="email"
            value={email}
            required="required"
            onChange={this.handleChange}
          />
        </div>
        <p>
          By submitting this form you agree to upload this SequenceServer result set to <a href="https://sequenceserver.com/cloud/" target="_bank">SenquenceServer Cloud</a>
          , where it will become available on the internet to everyone with the link. You also agree that your email address will be stored on SequenceServer databases as proof of authentication for support and similar purposes.
        </p>

        <div className="form-group form-check">
          <input
            type="checkbox"
            id="tosCheckbox"
            className="form-check-input"
            name="agreeToTos"
            checked={agreeToTos}
            onChange={this.handleChange}
          />
          <label htmlFor="tosCheckbox" className="form-check-label">
            &nbsp;I agree to the <b><a href="https://sequenceserver.com/cloud/terms_and_conditions" target="_blank">Terms and Conditions of Service</a></b>
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitDisabled}>
          Submit
        </button>
      </form>
    )
  }

  render() {
    const { formState } = this.state;

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
      <div className="modal cloud-share" ref={this.modalRef} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Share to SequenceServer Cloud</h3>
            </div>
            <div className="modal-body">
              {content}
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
   * Shows share dialogue.
   */
  show() {
    this.setState({ requestCompleted: false }, () => {
      this.modal().modal("show");
    });
  }

  /**
   * Hide share dialogue.
   */
  hide() {
    this.modal().modal("hide");
  }
}
