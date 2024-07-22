/* eslint-disable no-unused-vars */
import './jquery_world'; // for custom $.tooltip function
import React, { Component, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import Report from './report';
import SequenceModal from './sequence_modal';
import ErrorModal from './error_modal';

/**
 * Base component of report page. This component is later rendered into page's
 * '#view' element.
 */
class Page extends Component {
    constructor(props) {
        super(props);
        this.showSequenceModal = this.showSequenceModal.bind(this);
        this.showErrorModal = this.showErrorModal.bind(this);
        this.getCharacterWidth = this.getCharacterWidth.bind(this);
        this.hspChars = createRef();
    }
    componentDidMount() {
        var job_id = location.pathname.split('/').pop();
        sessionStorage.setItem('job_id', job_id);
    }

    showSequenceModal(url) {
        this.refs.sequenceModal.show(url);
    }

    showErrorModal(errorData, beforeShow) {
        this.refs.errorModal.show(errorData, beforeShow);
    }

    getCharacterWidth() {
        if (!this.characterWidth) {
            var $hspChars = $(this.hspChars.current);
            this.characterWidth = $hspChars.width() / 29;
        }
        return this.characterWidth;
    }
    render() {
        return (
            <div>
                {/* Provide bootstrap .container element inside the #view for
                    the Report component to render itself in. */}
                <div className="container">
                    <Report
                        showSequenceModal={(_) => this.showSequenceModal(_)}
                        getCharacterWidth={() => this.getCharacterWidth()}
                        showErrorModal={(...args) => this.showErrorModal(...args)}
                    />
                </div>

                {/* Add a hidden span tag containing chars used in HSPs */}
                <pre className="pre-reset hsp-lines" ref={this.hspChars} hidden>
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ +-
                </pre>

                {/* Required by Grapher for SVG and PNG download */}
                <canvas id="png-exporter" hidden></canvas>

                <SequenceModal
                    ref="sequenceModal"
                    showErrorModal={(...args) => this.showErrorModal(...args)}
                />

                <ErrorModal ref="errorModal" />
            </div>
        );
    }
}


const root = createRoot(document.getElementById('view'));
root.render(<Page />);
