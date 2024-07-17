import './jquery_world';
import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { DnD } from './dnd';
import { Form } from './form';
import { SearchHeaderPlugin } from 'search_header_plugin';

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
    this.dnd = creteRef();
    this.form = createRef();
  }

  componentDidMount() {
    this.dnd.current.setState({ query: this.form.current.query.current })
  }

  render() {
    return (
      <div>
        <SearchHeaderPlugin />
        <DnD ref={this.dnd} />
        <Form ref={this.form} />
      </div>
    );
  }
}

const root = createRoot(document.getElementById('view'));
root.render(<Page />);

document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.querySelector('.js--close-help');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            document.querySelector('[data-help-modal]').classList.add('hidden');
        });
    }
