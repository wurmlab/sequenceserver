import React, { Component, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

const DnD = React.lazy(() => import(/* webpackChunkName: "dnd" */ './dnd').then(mod => ({ default: mod.DnD })));
const Form = React.lazy(() => import(/* webpackChunkName: "form" */ './form').then(mod => ({ default: mod.Form })));
const SearchHeaderPlugin = React.lazy(() => import(/* webpackChunkName: "search_header_plugin" */ 'search_header_plugin').then(mod => ({ default: mod.SearchHeaderPlugin })));
/**
  * Clear sessionStorage on reload.
  */
const navigationEntry = performance.getEntriesByType('navigation')[0];
if (navigationEntry && navigationEntry.type === 'reload') {
    sessionStorage.clear();
    history.replaceState(null, "", location.href.split("?")[0]);
}

class Page extends Component {
    constructor(props) {
        super(props);
        this.dnd = React.createRef();
        this.form = React.createRef();
    }

    handleDndRef = (node) => {
        this.dnd.current = node;
        this.handleBothRefs();
    }

    handleFormRef = (node) => {
        this.form.current = node;
        this.handleBothRefs();
    }

    handleBothRefs = () => {
        this.dnd.current?.setState?.({ query: this.form.current?.query?.current });
    }

    render() {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <SearchHeaderPlugin />
                    <DnD ref={this.handleDndRef} />
                    <Form ref={this.handleFormRef} />
                </div>
            </Suspense>
        );
    }
}

(async () => {
  // Ensure jQuery world is loaded first
  await import(/* webpackChunkName: "jquery_world" */ './jquery_world');

  // React root rendering
  const root = createRoot(document.getElementById('view'));
  root.render(<Page />);

  // DOM interaction logic
  document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.querySelector('button.advanced-modal-close');
    const modal = document.querySelector('dialog.advanced-modal');

    modal?.addEventListener('close', () => {
      document.body.classList.remove("overflow-hidden");
    });

    closeButton?.addEventListener('click', () => {
      modal?.close();
    });
  });
})();
