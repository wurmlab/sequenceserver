import "./jquery_world";
import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import { DnD } from "./dnd";
import { Form } from "./form";
/**
 * Load necessary polyfills.
 */
$.webshims.setOptions(
  "basePath",
  "/vendor/npm/webshim@1.15.8/js-webshim/minified/shims/"
);
$.webshims.polyfill("forms");

/**
 * Clear sessionStorage on reload.
 */
if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
  sessionStorage.clear();
  history.replaceState(null, "", location.href.split("?")[0]);
}

class Page extends Component {
  componentDidMount() {
    this.refs.dnd.setState({ query: this.refs.form.refs.query });
  }
  render() {
    return (
      <div>
        <DnD ref="dnd" />
        <Form ref="form" />
      </div>
    );
  }
}

const root = createRoot(document.getElementById("view"));
root.render(<Page />);
