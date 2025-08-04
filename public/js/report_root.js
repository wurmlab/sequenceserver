/* eslint-disable no-unused-vars */
import React, { Component, createRef, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

const Report = React.lazy(() => import(/* webpackChunkName: "report_page" */ './components/report'));
const SequenceModal = React.lazy(() => import(/* webpackChunkName: "sequence_modal" */ './components/modal/sequence_modal'));
const ErrorModal = React.lazy(() => import(/* webpackChunkName: "error_modal" */ './components/modal/error_modal'));

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
        this.sequenceModal = createRef();
        this.errorModal = createRef();
    }

    componentDidMount() {
        var job_id = location.pathname.split('/').pop();
        sessionStorage.setItem('job_id', job_id);
    }

    showSequenceModal(url) {
        this.sequenceModal.current.show(url);
    }

    showErrorModal(errorData, beforeShow) {
        this.errorModal.current.show(errorData, beforeShow);
    }

    getCharacterWidth() {
        if (!this.characterWidth) {
            var $hspChars = $(this.hspChars.current);
            this.characterWidth = $hspChars.width() / 29;
        }
        return this.characterWidth;
    }

    handleSequenceModalRef = (node) => this.sequenceModal.current = node;
    handleErrorModalRef = (node) => this.errorModal.current = node;

    render() {
        return (
            <div>
                <Suspense fallback={<div>Loading...</div>}>
                    {/* Provide tailwind element inside the #view for
                        the Report component to render itself in. */}
                    <div className="mx-auto">
                        <Report
                            showSequenceModal={(_) => this.showSequenceModal(_)}
                            getCharacterWidth={() => this.getCharacterWidth()}
                            showErrorModal={(...args) => this.showErrorModal(...args)}
                        />
                    </div>

                    {/* Add a hidden span tag containing chars used in HSPs */}
                    <pre className="m-0 p-0 rounded-none border-0 bg-inherit whitespace-pre-wrap break-keep mt-1 pre-text tracking-wider" ref={this.hspChars} hidden>
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ +-
                    </pre>

                    {/* Required by Grapher for SVG and PNG download */}
                    <canvas id="png-exporter" hidden></canvas>

                    <SequenceModal
                        ref={this.handleSequenceModalRef}
                        showErrorModal={(...args) => this.showErrorModal(...args)}
                    />

                    <ErrorModal ref={this.handleErrorModalRef} />
                </Suspense>
            </div>
        );
    }
}


(async () => {
  // Ensure jQuery world is loaded first
  await import(/* webpackChunkName: "jquery_world" */ './jquery_world');

  // React root rendering
  const root = createRoot(document.getElementById('view'));
  root.render(<Page />);
})();
